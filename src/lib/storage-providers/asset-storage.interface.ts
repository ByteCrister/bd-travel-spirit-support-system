// src/lib/storage-providers/asset-storage.interface.ts

import { AssetType } from "@/constants/asset.const";
import { CloudinaryApiResource } from "../cloudinary/cloudinary.types";

/**
 * Represents the normalized metadata returned by any asset storage provider
 * after a successful upload or update.
 */
export type UploadedAsset = {
    /** Publicly accessible URL (CDN-optimized if supported). */
    url: string;

    /** Provider-specific unique identifier (Cloudinary: public_id, S3: Key, etc.). */
    providerId: string;

    /** MIME type of the stored file (e.g., image/jpeg, application/pdf). */
    contentType?: AssetType;

    /** Original file name (without path). */
    fileName?: string;

    /** File size in bytes. */
    fileSize?: number;

    /** Optional checksum (sha256) for deduplication. */
    checksum?: string;
};

/**
 * Defines the contract that all asset storage providers must fulfill.
 */
export interface AssetStorageProvider {
    /**
     * Uploads a new asset to the storage backend.
     */
    create(base64: string, options?: {
        checksum?: string;
        fileName?: string;
        publicId?: string; // Optional explicit public_id
    }): Promise<UploadedAsset>;

    getAssetByChecksum(checksum: string): Promise<CloudinaryApiResource>;
    
    /**
     * Replaces an existing asset in the storage backend.
     */
    update(oldProviderId: string, newBase64: string, newFileName?: string): Promise<UploadedAsset>;

    /**
     * Deletes an asset from the storage backend.
     */
    delete(providerId: string): Promise<boolean>;
}
