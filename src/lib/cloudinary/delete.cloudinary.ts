// lib/cloudinary/delete.cloudinary.ts
import mongoose from "mongoose";
import AssetModel from "@/models/asset.model";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER } from "@/constants/asset.const";

/**
 * Soft-delete assets in the database and remove their files from the configured storage provider.
 *
 * Behavior
 * - Loads assets that are not already soft-deleted.
 * - Attempts to delete each asset file from the storage provider. Storage failures are logged but do not abort the process.
 * - Performs a soft-delete of the asset documents using the provided session so the caller can include this operation in a transaction.
 *
 * @param {mongoose.Types.ObjectId[]} assetIds - Array of Asset document IDs to clean up. If empty the function returns immediately.
 *
 * @example
 * const ids = [new mongoose.Types.ObjectId("..."), new mongoose.Types.ObjectId("...")];
 * await cleanupAssets(ids, session);
 *
 * @param {mongoose.ClientSession} session - Mongoose client session used for DB operations. Pass a valid session to include the soft-delete in a transaction.
 *
 * @returns {Promise<void>} Resolves when all storage delete attempts and the DB soft-delete operation complete.
 *
 * @throws {Error} Re-throws unexpected errors from Mongoose operations. Storage provider errors are caught and logged.
 *
 * Notes
 * - The function intentionally swallows and logs storage provider delete errors to avoid leaving the DB in an inconsistent state when storage is temporarily unavailable.
 * - If you want storage failures to abort the DB soft-delete, move the soft-delete call inside the try/catch and rethrow on storage failure.
 * - Ensure AssetModel.softDeleteMany accepts the same session signature used here.
 */
export async function cleanupAssets(
    assetIds: mongoose.Types.ObjectId[],
    session: mongoose.ClientSession
): Promise<void> {
    if (!assetIds?.length) return;

    // 1. Load assets that are not already soft-deleted
    const assets = await AssetModel.find({ _id: { $in: assetIds }, deletedAt: null }).session(session);

    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);

    // 2. Delete files from the storage provider. Failures are logged but do not stop the cleanup.
    for (const asset of assets) {
        try {
            await storage.delete(asset.objectKey);
        } catch (err) {
            // Log the error for later investigation but continue processing other assets
            console.error("Cloudinary delete failed for objectKey", asset.objectKey, err);
        }
    }

    // 3. Soft-delete documents in DB using the provided session so the caller can control transactions
    await AssetModel.softDeleteMany({ _id: { $in: assetIds } }, session);

    // Note for maintainers
    // Git actions or other background jobs may permanently remove the documents later.
}