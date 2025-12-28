// src/lib/cloudinary/asset-provider.cloudinary.ts

import cloudinary from "@/config/cloudinary";
import { AssetStorageProvider, UploadedAsset } from "../storage-providers/asset-storage.interface";
import { ASSET_TYPE, AssetType } from "@/constants/asset.const";
import { v4 as uuidv4 } from "uuid";

export class CloudinaryAssetProvider implements AssetStorageProvider {

    /**
     * Uploads a new asset to Cloudinary (root folder).
     */
    async create(base64: string): Promise<UploadedAsset> {
        const publicId = uuidv4();

        const res = await cloudinary.uploader.upload(base64, {
            public_id: publicId,
            resource_type: "auto",
            overwrite: false,
        });

        const assetType = this.mapAssetType(res.resource_type, res.format);

        return {
            url: res.secure_url,
            providerId: res.public_id, // ROOT public_id only
            contentType: assetType,
            fileName: res.original_filename,
            fileSize: res.bytes,
        };
    }

    /**
     * Replace an asset (delete + create)
     */
    async update(oldProviderId: string, newBase64: string): Promise<UploadedAsset> {
        await this.delete(oldProviderId);
        return this.create(newBase64);
    }

    /**
     * Delete an asset safely
     */
    async delete(providerId: string): Promise<boolean> {
        const res = await cloudinary.uploader.destroy(providerId, {
            resource_type: "auto",
        });

        return res.result === "ok" || res.result === "not found";
    }

    /**
     * Internal helper
     */
    private mapAssetType(resourceType: string, format?: string): AssetType {
        switch (resourceType) {
            case "image":
                return ASSET_TYPE.IMAGE;
            case "video":
                return ASSET_TYPE.VIDEO;
            case "raw":
                if (format === "pdf") return ASSET_TYPE.PDF;
                if (["mp3", "wav", "aac", "ogg"].includes(format ?? "")) {
                    return ASSET_TYPE.AUDIO;
                }
                return ASSET_TYPE.DOCUMENT;
            default:
                return ASSET_TYPE.OTHER;
        }
    }
}