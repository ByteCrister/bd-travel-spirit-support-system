// src/lib/storage-providers/documents/document-storage.interface.ts

/**
 * Represents the normalized metadata returned by any document storage provider
 * after a successful upload or update.
 *
 * This abstraction ensures that regardless of the underlying provider
 * (Cloudinary, S3, GCS, local storage, etc.), the rest of the application
 * can work with a consistent shape.
 */
export type UploadedFile = {
    /**
     * Fully qualified, publicly accessible URL to the stored file.
     * This should be CDN-optimized if the provider supports it.
     */
    url: string;

    /**
     * Unique identifier for the stored file in the provider's backend.
     * - Cloudinary: `public_id`
     * - S3: `Key`
     * - GCS: `name`
     *
     * Required for updates, deletions, or generating signed URLs.
     */
    public_id: string;

    /**
     * Optional MIME type of the stored file (e.g., `application/pdf`, `text/plain`).
     * Useful for validation, rendering decisions, and analytics.
     */
    fileType?: string;

    /**
     * Optional original file name (without path).
     * Can be used for display purposes or download naming.
     */
    fileName?: string;
};

/**
 * Defines the contract that all document storage providers must fulfill.
 *
 * This interface enforces a consistent API for:
 * - Creating (uploading) new documents
 * - Updating existing documents
 * - Deleting documents
 *
 * By coding against this interface, the application can switch providers
 * without changing business logic.
 */
export interface DocumentStorageProvider {
    /**
     * Uploads a new document to the storage backend.
     *
     * @param base64 - Base64-encoded file data (may include MIME prefix or be raw).
     * @param fileName - Optional logical file name for display or storage purposes.
     * @returns A promise resolving to the normalized UploadedFile metadata.
     *
     * Implementations should:
     * - Validate the Base64 input
     * - Handle provider-specific upload APIs
     * - Map the provider's response to the UploadedFile type
     */
    create(base64: string, fileName?: string): Promise<UploadedFile>;

    /**
     * Replaces an existing document in the storage backend with a new file.
     *
     * @param oldPublicId - The provider-specific identifier of the file to replace.
     * @param newBase64 - Base64-encoded data for the new file.
     * @param newFileName - Optional new file name for the replacement file.
     * @returns A promise resolving to the normalized UploadedFile metadata for the new file.
     *
     * Implementations should:
     * - Delete or overwrite the old file as per provider capabilities
     * - Upload the new file
     * - Return updated metadata
     */
    update(oldPublicId: string, newBase64: string, newFileName?: string): Promise<UploadedFile>;

    /**
     * Deletes a document from the storage backend.
     *
     * @param publicId - The provider-specific identifier of the file to delete.
     * @returns A promise resolving to `true` if deletion succeeded, `false` otherwise.
     *
     * Implementations should:
     * - Ensure idempotency (deleting a non-existent file should not throw)
     * - Handle provider-specific deletion APIs
     */
    delete(publicId: string): Promise<boolean>;
}
