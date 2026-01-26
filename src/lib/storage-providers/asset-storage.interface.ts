// src/lib/storage-providers/asset-storage.interface.ts

import { AssetType } from "@/constants/asset.const";
import { CloudinaryApiResource } from "../cloudinary/cloudinary.types";

/**
 * Normalized representation of an asset returned by any storage provider.
 *
 * This type abstracts provider-specific response shapes (Cloudinary, S3, etc.)
 * into a consistent structure used across the application.
 */
export type UploadedAsset = {
  /**
   * Fully qualified, publicly accessible URL for the uploaded asset.
   * Should point to a CDN-backed URL when the provider supports CDN delivery.
   */
  url: string;

  /**
   * Provider-specific unique identifier for the asset.
   *
   * Examples:
   * - Cloudinary: `public_id`
   * - AWS S3: object `Key`
   * - GCS: object name
   *
   * This value is used for subsequent update/delete operations.
   */
  providerId: string;

  /**
   * Logical content type of the stored asset.
   *
   * Use the AssetType enum to represent common categories (image, video, document, etc.)
   * or the MIME type when more precision is required.
   */
  contentType?: AssetType;

  /**
   * Original filename supplied by the client (no path).
   *
   * This is informational only and may be omitted by some providers.
   */
  fileName?: string;

  /**
   * Size of the stored file in bytes.
   *
   * Providers should populate this when available to allow client-side validation
   * and analytics (e.g., billing, quota checks).
   */
  fileSize?: number;

  /**
   * Optional checksum (e.g., SHA-256) computed for the file content.
   *
   * Useful for deduplication, integrity checks, and idempotent uploads.
   */
  checksum?: string;
};

/**
 * Contract that all asset storage providers must implement.
 *
 * Implementations adapt provider-specific SDKs (Cloudinary, S3, GCS, etc.)
 * to this interface so the rest of the application can interact with storage
 * in a provider-agnostic way.
 */
export interface AssetStorageProvider {
  /**
   * Upload a new asset.
   *
   * @param base64 - File content encoded as a base64 string (data portion only).
   * @param options - Optional upload hints and controls:
   *   - checksum: optional SHA-256 (or other) checksum for deduplication/idempotency.
   *   - fileName: original filename to persist or use for metadata.
   *   - timeout: milliseconds to wait before aborting the upload.
   *   - maxRetries: number of retry attempts for transient failures.
   *
   * @returns A promise that resolves to an UploadedAsset describing the stored file.
   *
   * Implementations should:
   * - Validate input and throw on invalid data.
   * - Honor timeout and retry hints where possible.
   * - Return a providerId that can be used for update/delete operations.
   */
  create(
    base64: string,
    options?: { checksum?: string; fileName?: string; timeout?: number; maxRetries?: number }
  ): Promise<UploadedAsset>;

  /**
   * Retrieve provider metadata for an asset by checksum.
   *
   * This is primarily used to detect existing uploads (deduplication) before
   * performing a new upload. The return type is provider-specific; callers
   * should handle the provider's resource shape.
   *
   * @param checksum - Checksum value to search for (e.g., SHA-256).
   * @returns A promise resolving to the provider's resource representation.
   */
  getAssetByChecksum(checksum: string): Promise<CloudinaryApiResource>;

  /**
   * Replace an existing asset with new content.
   *
   * @param oldProviderId - The providerId of the asset to replace.
   * @param newBase64 - New file content encoded as base64.
   * @param checksum - Checksum for the new content (used for integrity/dedup).
   * @param newFileName - Optional new filename to associate with the asset.
   *
   * @returns A promise that resolves to the updated UploadedAsset.
   *
   * Implementations should:
   * - Attempt an in-place replacement when supported by the provider.
   * - Preserve or update metadata as appropriate.
   * - Return the new providerId if it changes after replacement.
   */
  update(
    oldProviderId: string,
    newBase64: string,
    checksum: string,
    newFileName?: string
  ): Promise<UploadedAsset>;

  /**
   * Delete an asset from the storage backend.
   *
   * @param providerId - Provider-specific identifier of the asset to delete.
   * @returns A promise resolving to `true` when deletion is confirmed, `false`
   *          when the asset was not found or deletion failed non-exceptionally.
   *
   * Implementations should:
   * - Throw on unrecoverable errors (permission issues, network failures).
   * - Return `false` when the asset does not exist (idempotent delete).
   */
  delete(providerId: string): Promise<boolean>;
}