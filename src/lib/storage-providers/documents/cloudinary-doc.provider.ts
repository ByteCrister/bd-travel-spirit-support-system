// src/lib/storage-providers/documents/cloudinary-doc.provider.ts

import cloudinary from "@/config/cloudinary";
import { DocumentStorageProvider, UploadedFile } from "./document-storage.interface";

/**
 * Cloudinary-backed implementation of the DocumentStorageProvider contract.
 *
 * This class encapsulates all Cloudinary-specific logic for:
 * - Uploading Base64-encoded documents
 * - Updating (replacing) existing documents
 * - Deleting documents by their unique Cloudinary public ID
 *
 * Key design notes:
 * - Defaults to storing files in the `organizer_docs` folder unless overridden.
 * - Uses `resource_type: "auto"` so Cloudinary automatically detects and supports
 *   multiple file types (images, PDFs, DOCX, etc.).
 * - All Cloudinary API calls are normalized to the `UploadedFile` shape so the
 *   rest of the application can remain provider-agnostic.
 */
export class CloudinaryDocProvider implements DocumentStorageProvider {
    private folder: string;

    /**
     * @param folder - Optional Cloudinary folder name for logical grouping of documents.
     *                 Defaults to `"organizer_docs"`.
     */
    constructor(folder = "organizer_docs") {
        this.folder = folder;
    }

    /**
     * Uploads a new document to Cloudinary.
     *
     * @param base64 - Base64-encoded file data (may include MIME prefix or be raw).
     * @param fileName - Optional file name (without path). If provided, the name
     *                   (minus extension) will be used as the Cloudinary `public_id`.
     * @returns A promise resolving to an `UploadedFile` object containing:
     *          - `url`: Secure HTTPS URL to the uploaded file
     *          - `public_id`: Cloudinary's unique identifier for the file
     *          - `fileType`: Detected resource type (e.g., `"image"`, `"pdf"`)
     *          - `fileName`: Original file name without path
     *
     * Implementation details:
     * - `resource_type: "auto"` allows Cloudinary to handle multiple file formats.
     * - If `fileName` is provided, the extension is stripped before setting `public_id`.
     */
    async create(base64: string, fileName?: string): Promise<UploadedFile> {
        const res = await cloudinary.uploader.upload(base64, {
            folder: this.folder,
            public_id: fileName ? fileName.split(".")[0] : undefined,
            resource_type: "auto", // supports image, pdf, docx, etc.
        });

        return {
            url: res.secure_url,
            public_id: res.public_id,
            fileType: res.resource_type,
            fileName: res.original_filename,
        };
    }

    /**
     * Replaces an existing document in Cloudinary with a new file.
     *
     * @param oldPublicId - The Cloudinary `public_id` of the file to replace.
     * @param newBase64 - Base64-encoded data for the new file.
     * @param newFileName - Optional new file name for the replacement file.
     * @returns A promise resolving to the `UploadedFile` metadata for the new file.
     *
     * Implementation details:
     * - Deletes the old file before uploading the new one to avoid orphaned files.
     * - Calls `create()` internally to ensure consistent upload handling.
     */
    async update(oldPublicId: string, newBase64: string, newFileName?: string): Promise<UploadedFile> {
        await this.delete(oldPublicId);
        return this.create(newBase64, newFileName);
    }

    /**
     * Deletes a document from Cloudinary by its `public_id`.
     *
     * @param publicId - The Cloudinary `public_id` of the file to delete.
     * @returns A promise resolving to:
     *          - `true` if deletion succeeded
     *          - `false` if deletion failed
     *
     * Implementation details:
     * - Uses `cloudinary.uploader.destroy` without specifying `resource_type`
     *   since Cloudinary infers it from the stored asset.
     */
    async delete(publicId: string): Promise<boolean> {
        const res = await cloudinary.uploader.destroy(publicId);
        return res.result === "ok";
    }
}
