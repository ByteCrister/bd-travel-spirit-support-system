// lib/cloudinary/upload.cloudinary.ts
import { Types, ClientSession } from "mongoose";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel, { IAssetFile } from "@/models/assets/asset-file.model";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER, ASSET_TYPE, VISIBILITY } from "@/constants/asset.const";
import { assertValidDataUrl, base64ToBuffer, sha256 } from "@/lib/helpers/document-conversions";
import pLimit from "p-limit";
import { isCloudinary409Error, isMongoDuplicateKeyError } from "../helpers/asset-checksum-error";
import { HydratedDocument } from "mongoose";

/**
 * Base64 asset interface
 */
export interface Base64Asset {
    base64: string;
    name?: string;
    assetType?: string;
}

/**
 * Production-grade, race-condition-proof upload of multiple assets
 */
export async function uploadAssets(
    assets: Base64Asset[],
    session: ClientSession,
    concurrency = 5
): Promise<Types.ObjectId[]> {
    if (!assets?.length) return [];

    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
    const limit = pLimit(concurrency);

    // Wrap everything in a transaction
    const assetIds: Types.ObjectId[] = [];

    await session.withTransaction(async () => {
        const results = await Promise.all(
            assets.map((asset) =>
                limit(() => processSingleAsset(asset, session, storage))
            )
        );

        assetIds.push(...results);
    });

    return assetIds;
}

/**
 * Upload single asset with full refCount & race-condition safety
 */
async function processSingleAsset(
    asset: Base64Asset,
    session: ClientSession,
    storage: ReturnType<typeof getDocumentStorageProvider>
): Promise<Types.ObjectId> {
    const dataUrl = assertValidDataUrl(asset.base64);
    const buffer = base64ToBuffer(dataUrl);
    const checksum = sha256(buffer);
    const title = asset.name?.trim() || "Uploaded Asset";

    let assetFile: HydratedDocument<IAssetFile> | null = null;
    let isNewUpload = false;

    // -----------------------------
    // 1️⃣ Atomic upsert with retry
    // -----------------------------
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            assetFile = await AssetFileModel.findOneAndUpdate(
                { checksum },
                { $inc: { refCount: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true, session }
            );

            if (!assetFile) throw new Error("AssetFile upsert returned null");

            isNewUpload = assetFile.refCount === 1;
            break;
        } catch (err) {
            if (isMongoDuplicateKeyError(err)) {
                // Race condition → wait a bit and retry
                retries++;
                await new Promise((r) => setTimeout(r, 50 * retries));
                continue;
            }
            throw err;
        }
    }

    if (!assetFile) throw new Error("Failed to create or fetch AssetFile");

    // -----------------------------
    // 2️⃣ Upload to Cloudinary if new
    // -----------------------------
    if (isNewUpload) {
        try {
            const uploaded = await storage.create(dataUrl, { checksum, fileName: asset.name });

            // Save Cloudinary metadata
            assetFile.storageProvider = STORAGE_PROVIDER.CLOUDINARY;
            assetFile.objectKey = uploaded.providerId;
            assetFile.publicUrl = uploaded.url;
            assetFile.contentType = uploaded.contentType || "application/octet-stream";
            assetFile.fileSize = uploaded.fileSize || 0;

            await assetFile.save({ session });
        } catch (uploadError) {
            // Rollback refCount on failure
            await AssetFileModel.updateOne(
                { _id: assetFile._id },
                { $inc: { refCount: -1 } },
                { session }
            );

            // Cloudinary 409 → another request already uploaded
            if (isCloudinary409Error(uploadError)) {
                const existing = await AssetFileModel.findOneAndUpdate(
                    { checksum },
                    { $inc: { refCount: 1 } },
                    { new: true, session }
                );

                if (!existing) throw new Error("Failed to fetch existing AssetFile after 409");

                assetFile = existing;
                isNewUpload = false;
            } else {
                throw uploadError;
            }
        }
    }

    // -----------------------------
    // 3️⃣ Create Asset document
    // -----------------------------
    const [assetDoc] = await AssetModel.create(
        [
            {
                file: assetFile._id,
                assetType: asset.assetType ?? ASSET_TYPE.DOCUMENT,
                title,
                visibility: VISIBILITY.PUBLIC,
            },
        ],
        { session }
    );

    return assetDoc._id;
}
