// src/lib/cloudinary/asset-provider.cloudinary.ts

import cloudinary from "@/config/cloudinary";
import { AssetStorageProvider, UploadedAsset } from "../storage-providers/asset-storage.interface";
import { ASSET_TYPE, AssetType } from "@/constants/asset.const";

// helper 
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
            // Cloudinary uses `raw` for pdf, docx, xlsx, zip, etc.
            if (format === "pdf") return ASSET_TYPE.OTHER;
            if (["mp3", "wav", "aac"].includes(format ?? ""))
                return ASSET_TYPE.AUDIO;

            return ASSET_TYPE.DOCUMENT;

        default:
            return ASSET_TYPE.DOCUMENT;
    }
}

export class CloudinaryAssetProvider implements AssetStorageProvider {
    private folder: string;

    constructor(folder = "assets") {
        this.folder = folder;
    }

    async create(base64: string, fileName?: string): Promise<UploadedAsset> {
        const res = await cloudinary.uploader.upload(base64, {
            folder: this.folder,
            public_id: fileName ? fileName.split(".")[0] : undefined,
            resource_type: "auto",
        });

        return {
            url: res.secure_url,
            providerId: res.public_id,          // maps to objectKey in AssetModel
            contentType: mapCloudinaryAssetType(res.resource_type, res.format),
            fileName: res.original_filename,
            fileSize: res.bytes,
            // checksum: must be computed separately if needed
        };
    }

    async update(oldProviderId: string, newBase64: string, newFileName?: string): Promise<UploadedAsset> {
        await this.delete(oldProviderId);
        return this.create(newBase64, newFileName);
    }

    async delete(providerId: string): Promise<boolean> {
        const res = await cloudinary.uploader.destroy(providerId);
        return res.result === "ok";
    }
}
