import { ImageModel } from "@/models/image.model";
import { getImageStorageProvider } from "@/lib/storage-providers/images";

interface UpdateImageInput {
    imageId: string;
    newBase64: string;
    altText?: string;
    caption?: string;
    tags?: string[];
}
/**
 * Updates multiple existing images by replacing their stored files and optionally
 * updating associated metadata.
 *
 * @param updates - Array of image update requests, where each item contains:
 *   - `imageId`: The MongoDB ObjectId (as a string) of the image document to update.
 *   - `newBase64`: Base64-encoded data for the new image file (may include MIME prefix or be raw).
 *   - `altText` (optional): New alternative text for accessibility and SEO.
 *   - `caption` (optional): New caption for display contexts.
 *   - `tags` (optional): Array of keyword tags for categorization or search.
 *
 * @returns Promise resolving to an array of updated ImageModel documents after
 *          the new files are uploaded and metadata changes are saved.
 */
export async function updateMultipleImages(updates: UpdateImageInput[]) {
    const tasks = updates.map(async ({ imageId, newBase64, altText, caption, tags }) => {
        const image = await ImageModel.findById(imageId);
        if (!image) throw new Error(`Image not found: ${imageId}`);

        const provider = getImageStorageProvider(image.storageProvider);

        // Delete old file from storage
        await provider.deleteFile(image.objectKey);

        // Upload new file
        const uploaded = await provider.uploadBase64(newBase64);

        // Update DB fields
        Object.assign(image, uploaded);
        if (altText) image.altText = altText;
        if (caption) image.caption = caption;
        if (tags) image.tags = tags;

        await image.save();
        return image;
    });

    return Promise.all(tasks);
}
