// src/lib/storage-providers/images/cloudinary-image.provider.ts

import cloudinary from "@/config/cloudinary";
import { ImageStorageProvider, UploadedImage } from "./image-storage.interface";

/**
 * Cloudinary-backed implementation of the ImageStorageProvider contract.
 *
 * This class encapsulates all Cloudinary-specific logic for:
 * - Uploading Base64-encoded images
 * - Deleting images by their unique Cloudinary public ID
 *
 * Key design notes:
 * - `resource_type` is explicitly set to `"image"` to prevent accidental uploads
 *   of non-image files (Cloudinary supports other resource types like video/raw).
 * - All Cloudinary API calls are wrapped to return the normalized `UploadedImage`
 *   shape defined in `image-storage.interface.ts`, ensuring provider-agnostic usage
 *   in the rest of the application.
 */
export class CloudinaryImageProvider implements ImageStorageProvider {
    /**
     * Uploads a Base64-encoded image to Cloudinary.
     *
     * @param base64 - The Base64-encoded image data. Can include a MIME prefix
     *                 (e.g., `data:image/png;base64,...`) or be raw Base64.
     * @param folder - Optional Cloudinary folder path for logical grouping.
     *                 Example: `"user-avatars"` or `"blog/posts"`.
     * @returns A promise resolving to an `UploadedImage` object containing:
     *          - `objectKey`: Cloudinary's `public_id` (used for future deletes/updates)
     *          - `publicUrl`: Secure HTTPS URL to the uploaded image
     *          - `contentType`: File format (Cloudinary returns `format`, e.g., `"jpg"`)
     *          - `fileSize`: File size in bytes
     *          - `width` / `height`: Image dimensions in pixels
     *
     * Implementation details:
     * - Uses `cloudinary.uploader.upload` with `resource_type: "image"` to ensure
     *   only image uploads are processed.
     * - Maps Cloudinary's response fields to the provider-agnostic `UploadedImage` interface.
     */
    async uploadBase64(base64: string, folder?: string): Promise<UploadedImage> {
        const res = await cloudinary.uploader.upload(base64, {
            folder,
            resource_type: "image", // enforce image-only uploads
        });

        return {
            objectKey: res.public_id,
            publicUrl: res.secure_url,
            contentType: res.format, // Cloudinary returns format without MIME prefix
            fileSize: res.bytes,
            width: res.width,
            height: res.height,
        };
    }

    /**
     * Deletes an image from Cloudinary by its `public_id`.
     *
     * @param objectKey - The Cloudinary `public_id` of the image to delete.
     * @returns A promise resolving to:
     *          - `true` if deletion succeeded or the file was not found
     *          - `false` if deletion failed for another reason
     *
     * Implementation details:
     * - Uses `cloudinary.uploader.destroy` with `resource_type: "image"`.
     * - Treats `"not_found"` as a successful outcome to keep deletion idempotent.
     */
    async deleteFile(objectKey: string): Promise<boolean> {
        const res = await cloudinary.uploader.destroy(objectKey, {
            resource_type: "image",
        });
        return res.result === "ok" || res.result === "not_found";
    }
}
