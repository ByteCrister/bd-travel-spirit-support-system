// src/lib/cloudinary/asset-provider.cloudinary.ts

import cloudinary from "@/config/cloudinary";
import { AssetStorageProvider, UploadedAsset } from "../storage-providers/asset-storage.interface";
import { ASSET_TYPE, AssetType } from "@/constants/asset.const";
import { v4 as uuidv4 } from "uuid";
import { CloudinaryApiResource, CloudinaryUploadError, CloudinaryUploadResult } from "./cloudinary.types";

export class CloudinaryAssetProvider implements AssetStorageProvider {

    /**
     * Uploads a new asset to Cloudinary with robust retry, deduplication, and timeout handling
     */
    async create(
        base64: string,
        options?: { checksum?: string; fileName?: string; timeout?: number; maxRetries?: number }
    ): Promise<UploadedAsset> {
        const publicId = options?.checksum ?? uuidv4();
        const timeout = options?.timeout ?? 30000;
        const maxRetries = options?.maxRetries ?? 3;

        // Abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            // 1️⃣ Pre-check if asset already exists (only if checksum is provided)
            if (options?.checksum) {
                try {
                    const existing = await this.getAssetByChecksum(options.checksum);
                    return this.mapUploadResult(existing);
                } catch (err) {
                    const error = err as CloudinaryUploadError;
                    if (error.error?.http_code !== 404) throw err;
                    // 404 → asset does not exist, proceed to upload
                }
            }

            // 2️⃣ Upload with retry + exponential backoff + jitter
            let attempt = 0;
            while (attempt < maxRetries) {
                try {
                    const res = await cloudinary.uploader.upload(base64, {
                        public_id: publicId,
                        resource_type: "auto",
                        overwrite: false,
                        timeout: Math.floor(timeout / 1000),
                        // Optional: use `folder` here if you want organized storage
                    }) as CloudinaryUploadResult;

                    clearTimeout(timeoutId);
                    return this.mapUploadResult(res);
                } catch (err) {
                    attempt++;
                    const error = err as CloudinaryUploadError;

                    // Handle Cloudinary 409 / already exists race
                    if (error.error?.http_code === 409 || error.error?.message?.includes("already exists")) {
                        try {
                            const existing = await this.getAssetByChecksum(publicId);
                            clearTimeout(timeoutId);
                            return this.mapUploadResult(existing);
                        } catch {
                            // If fetch fails, retry
                        }
                    }

                    if (attempt >= maxRetries) throw err;

                    // Exponential backoff with jitter
                    const delay = 500 * Math.pow(2, attempt) + Math.random() * 200;
                    await new Promise(r => setTimeout(r, delay));
                }
            }

            throw new Error("Cloudinary upload failed after max retries");
        } catch (err) {
            const error = err as CloudinaryUploadError;
            clearTimeout(timeoutId);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((error as any).message === "AbortError" || error.error?.message === "AbortError") {
                throw new Error(`Cloudinary upload timed out after ${timeout}ms`);
            }

            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
    * Get asset by checksum (public_id)
    */
    async getAssetByChecksum(checksum: string): Promise<CloudinaryApiResource> {
        try {
            return await cloudinary.api.resource(checksum, {
                resource_type: "auto"
            }) as CloudinaryApiResource;
        } catch (error) {
            throw error as CloudinaryUploadError;
        }
    }

    /**
     * Replace an asset (delete + create) with transaction safety
     */
    async update(oldProviderId: string, newBase64: string): Promise<UploadedAsset> {
        try {
            const newAsset = await this.create(newBase64);

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
        try {
            const res = await cloudinary.uploader.destroy(providerId, {
                resource_type: "auto",
            });

            return res.result === "ok" || res.result === "not found";
        } catch (error) {
            console.error(`Failed to delete Cloudinary asset ${providerId}:`, error);
            return false;
        }
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