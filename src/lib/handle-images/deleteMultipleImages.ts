import { ImageModel } from "@/models/image.model";
import { getImageStorageProvider } from "../storage-providers/images";
/**
 * Deletes multiple images by removing their files from the configured storage provider
 * and marking them as soft-deleted in the database.
 *
 * @param imageIds - Array of MongoDB ObjectId strings representing the images to delete.
 *                   Each ID should correspond to an existing ImageModel document.
 *                   If an ID does not match any document, the function will throw an error.
 *
 * @returns Promise resolving to an array of ImageModel documents after they have been
 *          soft-deleted (with `deletedAt` set) and their files removed from storage.
 */
export async function deleteMultipleImages(imageIds: string[]) {
    const tasks = imageIds.map(async (imageId) => {
        const image = await ImageModel.findById(imageId);
        if (!image) throw new Error(`Image not found: ${imageId}`);

        const provider = getImageStorageProvider(image.storageProvider);

        // Delete from storage
        await provider.deleteFile(image.objectKey);

        // Soft delete in DB
        image.deletedAt = new Date();
        await image.save();

        return image;
    });

    return Promise.all(tasks);
}
