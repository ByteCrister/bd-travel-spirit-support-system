import crypto from "crypto";
import { Types } from "mongoose";
import {
    ImageModel,
    STORAGE_PROVIDER,
    MODERATION_STATUS,
    VISIBILITY,
} from "@/models/image.model";
import { getImageStorageProvider } from "@/lib/storage-providers/images";

interface UploadImageInput {
    base64: string;
    altText: string;
    caption?: string;
    tags?: string[];
    folder?: string;
    storageProvider: STORAGE_PROVIDER;
}

/**
 * Upload multiple images in parallel to their respective storage providers
 * and persist their metadata in the ImageModel collection.
 *
 * @param images - Array of image upload requests, where each item contains:
 *   - `base64`: Base64-encoded image data (may include MIME prefix or be raw).
 *   - `altText`: Descriptive alternative text for accessibility and SEO.
 *   - `caption` (optional): Short descriptive caption for display contexts.
 *   - `tags` (optional): Array of keyword tags for categorization or search.
 *   - `folder` (optional): Logical folder/path within the storage provider.
 *   - `storageProvider`: Enum value indicating which storage backend to use.
 *
 * @param uploadedBy - MongoDB ObjectId of the user who is uploading the images.
 *                     Used for ownership tracking and audit purposes.
 *
 * @returns Promise resolving to an array of ImageModel documents representing
 *          the successfully uploaded and stored images.
 */
export async function uploadMultipleImagesParallel(
    images: UploadImageInput[],
    uploadedBy: Types.ObjectId
) {
    // Map each image to an async upload+save task
    const uploadTasks = images.map(async (img) => {
        const { base64, altText, caption, tags, folder, storageProvider } = img;

        // 1. Generate checksum for deduplication
        const checksum = crypto.createHash("sha256").update(base64).digest("hex");

        // 2. Check if already exists
        const existing = await ImageModel.findOne({ checksum, deletedAt: null });
        if (existing) return existing;

        // 3. Get correct provider dynamically
        const provider = getImageStorageProvider(storageProvider);

        // 4. Upload to storage
        const uploaded = await provider.uploadBase64(base64, folder);

        // 5. Save in MongoDB
        return ImageModel.create({
            storageProvider,
            ...uploaded,
            checksum,
            altText,
            caption,
            tags,
            uploadedBy,
            aspectRatio:
                uploaded.width && uploaded.height
                    ? uploaded.width / uploaded.height
                    : null,
            exifStripped: true,
            moderationStatus: MODERATION_STATUS.PENDING,
            visibility: VISIBILITY.PUBLIC,
        });
    });

    // Run all uploads in parallel
    const results = await Promise.all(uploadTasks);

    return results;
}
