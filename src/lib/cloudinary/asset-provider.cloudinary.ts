// src/lib/cloudinary/asset-provider.cloudinary.ts

/**
 * Cloudinary asset storage provider
 * ---------------------------------
 * Responsibilities:
 *  - Upload assets to Cloudinary
 *  - Classify uploaded assets into internal ASSET_TYPEs
 *  - Place assets into type-based folders (images, videos, pdf, etc.)
 *  - Provide a consistent interface compatible with other providers (S3, GCS)
 *
 * Design notes:
 *  - We upload first with `resource_type: "auto"` because the exact type may be unknown
 *  - After upload, we infer the ASSET_TYPE from Cloudinary metadata
 *  - Assets are then moved (renamed) into their final folder
 */

import cloudinary from "@/config/cloudinary";
import { AssetStorageProvider, UploadedAsset } from "../storage-providers/asset-storage.interface";
import { ASSET_TYPE, AssetType } from "@/constants/asset.const";
import { v4 as uuidv4 } from "uuid";

/* -------------------------------------------------------------------------- */
/*                               Helper functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Maps an internal ASSET_TYPE to a Cloudinary folder path.
 *
 * Example result structure:
 *  assets/
 *   ├─ images/
 *   ├─ videos/
 *   ├─ audio/
 *   ├─ pdf/
 *   ├─ documents/
 *   └─ other/
 */
export function getCloudinaryFolder(assetType: AssetType): string {
    switch (assetType) {
        case ASSET_TYPE.IMAGE:
            return "assets/images";

        case ASSET_TYPE.VIDEO:
            return "assets/videos";

        case ASSET_TYPE.AUDIO:
            return "assets/audio";

        case ASSET_TYPE.PDF:
            return "assets/pdf";

        case ASSET_TYPE.DOCUMENT:
            return "assets/documents";

        default:
            return "assets/other";
    }
}

/**
 * Converts Cloudinary's resource_type + format into an internal ASSET_TYPE.
 *
 * Cloudinary resource types:
 *  - image  → jpg, png, webp, etc.
 *  - video  → mp4, webm, mov, etc.
 *  - raw    → pdf, docx, xlsx, mp3, zip, etc.
 */
export function mapCloudinaryAssetType(
    resourceType: string,
    format?: string
): AssetType {
    switch (resourceType) {
        case "image":
            return ASSET_TYPE.IMAGE;

        case "video":
            return ASSET_TYPE.VIDEO;

        case "raw":
            // PDFs are treated as a first-class asset type
            if (format === ASSET_TYPE.PDF) return ASSET_TYPE.PDF;

            // Audio files are also delivered via `raw`
            if (["mp3", "wav", "aac", "ogg"].includes(format ?? "")) {
                return ASSET_TYPE.AUDIO;
            }

            // Everything else (docx, xlsx, zip, etc.)
            return ASSET_TYPE.DOCUMENT;

        default:
            // Fallback for unknown or unexpected cases
            return ASSET_TYPE.OTHER;
    }
}

/* -------------------------------------------------------------------------- */
/*                         CloudinaryAssetProvider class                       */
/* -------------------------------------------------------------------------- */

export class CloudinaryAssetProvider implements AssetStorageProvider {
    /**
     * Temporary root folder used during initial upload.
     * Assets are later moved into a type-specific folder.
     */
    private folder: string;

    constructor(folder = "assets") {
        this.folder = folder;
    }

    /**
     * Uploads a new asset to Cloudinary.
     *
     * Flow:
     *  1. Upload with `resource_type: auto`
     *  2. Detect the ASSET_TYPE from Cloudinary response
     *  3. Move the asset into its final folder (rename)
     *  4. Return normalized metadata for persistence
     */
    async create(base64: string): Promise<UploadedAsset> {
        const uniqueName = uuidv4();

        // Upload ONCE, directly to final folder
        const res = await cloudinary.uploader.upload(base64, {
            folder: "assets", // temporary, overridden by public_id
            public_id: uniqueName,
            resource_type: "auto",
            overwrite: false, // DB controls duplicates
        });

        const assetType = mapCloudinaryAssetType(
            res.resource_type,
            res.format
        );

        const targetFolder = getCloudinaryFolder(assetType);
        const finalPublicId = `${targetFolder}/${uniqueName}`;

        // MOVE (rename) — this is metadata-only, no re-upload
        await cloudinary.uploader.rename(res.public_id, finalPublicId);

        return {
            url: cloudinary.url(finalPublicId, {
                secure: true,
                resource_type: res.resource_type,
            }),
            providerId: finalPublicId,
            contentType: assetType,
            fileName: res.original_filename,
            fileSize: res.bytes,
        };
    }

    /**
     * Replaces an existing asset by deleting the old one
     * and creating a brand new upload.
     */
    async update(
        oldProviderId: string,
        newBase64: string,
    ): Promise<UploadedAsset> {
        await this.delete(oldProviderId);
        return this.create(newBase64);
    }

    /**
     * Deletes an asset from Cloudinary.
     *
     * NOTE:
     *  - Images default to resource_type = image
     *  - Videos and raw files may require explicit resource_type handling
     *    if deletion ever becomes unreliable.
     */
    async delete(providerId: string): Promise<boolean> {
        const res = await cloudinary.uploader.destroy(providerId);
        return res.result === "ok";
    }
}