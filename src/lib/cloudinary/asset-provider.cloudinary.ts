// src/lib/cloudinary/asset-provider.cloudinary.ts

import cloudinary from "@/config/cloudinary";
import { AssetStorageProvider, UploadedAsset } from "../storage-providers/asset-storage.interface";
import { ASSET_TYPE, AssetType } from "@/constants/asset.const";
// import { v4 as uuidv4 } from "uuid";
import { CloudinaryApiResource, CloudinaryUploadError, CloudinaryUploadResult } from "./cloudinary.types";

export class CloudinaryAssetProvider implements AssetStorageProvider {

    /**
     * Uploads a new asset to Cloudinary with robust retry, deduplication, and timeout handling
     */
    async create(
        base64: string,
        options: { checksum: string; fileName?: string; timeout?: number; maxRetries?: number }
    ): Promise<UploadedAsset> {
        const publicId = options.checksum; // 🔒 checksum REQUIRED
        const timeout = options.timeout ?? 120000;
        const retries = options.maxRetries ?? 2;

        // 1️⃣ Strong deduplication check
        try {
            const existing = await this.getAssetByChecksum(publicId);
            return this.mapUploadResult(existing);
        } catch (err) {
            if ((err as CloudinaryUploadError).error?.http_code !== 404) {
                throw err;
            }
        }

        // 2️⃣ Upload with retry (race-safe)
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const res = await cloudinary.uploader.upload(base64, {
                    public_id: publicId,
                    resource_type: "auto",
                    overwrite: false,
                    timeout
                });

                return this.mapUploadResult(res);
            } catch (err) {
                const error = err as CloudinaryUploadError;
                const status = error.error?.http_code;

                // Another request already uploaded it
                if (
                    error.error?.http_code === 409 ||
                    error.error?.message?.includes("already exists")
                ) {
                    const existing = await this.getAssetByChecksum(publicId);
                    return this.mapUploadResult(existing);
                }

                // Retry only on transient errors
                if (
                    attempt < retries &&
                    (status === 499 || (typeof status === "number" && status >= 500))
                ) {
                    await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
                    continue;
                }

                throw err;
            }
        }

        throw new Error("Cloudinary upload failed");
    }


    /**
    * Get asset by checksum (public_id)
    */
    async getAssetByChecksum(checksum: string): Promise<CloudinaryApiResource> {
        const resourceTypes = ["image", "video", "raw"] as const;

        // Try each resource type until we find the asset
        for (const resourceType of resourceTypes) {
            try {
                return await cloudinary.api.resource(checksum, {
                    resource_type: resourceType
                }) as CloudinaryApiResource;
            } catch (error) {
                const cloudinaryError = error as CloudinaryUploadError;
                // If 404, try next resource type
                if (cloudinaryError.error?.http_code === 404) {
                    continue;
                }
                // If other error, throw it
                throw error;
            }
        }

        // If we tried all resource types and got 404 for all, throw the last error
        throw {
            error: {
                message: "Asset not found in any resource type",
                http_code: 404
            }
        } as CloudinaryUploadError;
    }

    /**
     * Replace an asset (delete + create) with transaction safety
     */
    async update(oldProviderId: string, newBase64: string, checksum: string): Promise<UploadedAsset> {
        try {
            const newAsset = await this.create(newBase64, { checksum });

            // Only delete old asset if new upload succeeded
            await this.delete(oldProviderId);

            return newAsset;
        } catch (error) {
            // If new upload fails, keep old asset
            throw new Error(`Failed to update asset: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Delete an asset safely
     */
    async delete(providerId: string): Promise<boolean> {
        const resourceTypes = ["image", "video", "raw"] as const;

        for (const resourceType of resourceTypes) {
            try {
                const res = await cloudinary.uploader.destroy(providerId, {
                    resource_type: resourceType,
                });

                return res.result === "ok" || res.result === "not found";
            } catch (error) {
                const cloudinaryError = error as CloudinaryUploadError;
                // If 404, try next resource type
                if (cloudinaryError.error?.http_code === 404) {
                    continue;
                }
                // For other errors, log and continue trying other resource types
                console.warn(`Failed to delete Cloudinary asset ${providerId} with resource_type ${resourceType}:`, cloudinaryError.error?.message);
            }
        }

        // If we tried all resource types and still failed
        console.error(`Failed to delete Cloudinary asset ${providerId} with any resource type`);
        return false;
    }
    /**
     * Batch delete assets
     */
    async deleteMany(providerIds: string[]): Promise<{ success: string[]; failed: string[] }> {
        const success: string[] = [];
        const failed: string[] = [];

        // Process in batches to avoid rate limiting
        const batchSize = 10;
        for (let i = 0; i < providerIds.length; i += batchSize) {
            const batch = providerIds.slice(i, i + batchSize);
            const promises = batch.map(async (id) => {
                try {
                    const result = await this.delete(id);
                    if (result) {
                        success.push(id);
                    } else {
                        failed.push(id);
                    }
                } catch {
                    failed.push(id);
                }
            });

            await Promise.all(promises);

            // Rate limiting delay
            if (i + batchSize < providerIds.length) {
                await new Promise(r => setTimeout(r, 100));
            }
        }

        return { success, failed };
    }

    /**
     * Internal helper to map asset types
     */
    private mapAssetType(resourceType: string, format?: string): AssetType {
        switch (resourceType) {
            case "image":
                return ASSET_TYPE.IMAGE;
            case "video":
                return ASSET_TYPE.VIDEO;
            case "raw":
                if (format === "pdf") return ASSET_TYPE.PDF;
                if (["mp3", "wav", "aac", "ogg", "m4a"].includes(format?.toLowerCase() ?? "")) {
                    return ASSET_TYPE.AUDIO;
                }
                if (["doc", "docx", "txt", "rtf"].includes(format?.toLowerCase() ?? "")) {
                    return ASSET_TYPE.DOCUMENT;
                }
                return ASSET_TYPE.DOCUMENT;
            default:
                return ASSET_TYPE.OTHER;
        }
    }

    private mapUploadResult(
        res: CloudinaryUploadResult | CloudinaryApiResource
    ): UploadedAsset {
        const assetType = this.mapAssetType(res.resource_type, res.format);

        return {
            url: res.secure_url,
            providerId: res.public_id,
            contentType: assetType,
            // Fallback to public_id if original_filename is undefined
            fileName: res.original_filename ?? res.public_id,
            fileSize: res.bytes,
        };
    }
}