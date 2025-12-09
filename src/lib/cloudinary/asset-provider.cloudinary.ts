// src/lib/cloudinary/asset-provider.cloudinary.ts

import cloudinary from "@/config/cloudinary";
import { AssetStorageProvider, UploadedAsset } from "../storage-providers/asset-storage.interface";

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
            contentType: res.format             // Cloudinary gives format (e.g., "jpg", "pdf")
                ? `${res.resource_type}/${res.format}`
                : res.resource_type,
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
