// lib/cloudinary/upload.cloudinary.ts
import { Types, ClientSession } from "mongoose";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel, { IAssetFile } from "@/models/assets/asset-file.model";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER, ASSET_TYPE, VISIBILITY } from "@/constants/asset.const";
import { assertValidDataUrl, base64ToBuffer, sha256 } from "@/lib/helpers/document-conversions";
import pLimit from "p-limit";
import { isMongoDuplicateKeyError } from "../helpers/asset-checksum-error";
import { HydratedDocument } from "mongoose";

/**
 * Minimal representation of an incoming base64-encoded asset.
 *
 * - `base64`: required data URL or base64 payload (data portion accepted).
 * - `name`: optional original filename (used for metadata).
 * - `assetType`: optional logical type (image, document, etc.).
 */
export interface Base64Asset {
    base64: string;
    name?: string;
    assetType?: string;
}

/**
 * Upload multiple base64 assets in a production-ready, race-condition-safe way.
 *
 * Key behaviors:
 * - Uses a short-lived MongoDB transaction session for DB operations that must be atomic.
 * - Deduplicates by checksum: increments a shared AssetFile.refCount and only uploads
 *   to Cloudinary when the checksum is new (refCount === 1).
 * - Limits concurrent uploads to avoid overwhelming the storage provider.
 *
 * @param assets - Array of base64 assets to upload.
 * @param session - Mongoose ClientSession used for DB upserts and document creation.
 * @param concurrency - Maximum parallel uploads (default: 2).
 * @returns Array of created Asset document ObjectIds.
 */
export async function uploadAssets(
    assets: Base64Asset[],
    session: ClientSession,
    concurrency = 4 // Increased from 1: upload up to 4 assets in parallel
): Promise<Types.ObjectId[]> {
    if (!assets?.length) return [];

    // Resolve the configured storage provider (Cloudinary in this module).
    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);

    // p-limit ensures we only run `concurrency` uploads in parallel.
    const limit = pLimit(concurrency);

    // Map assets to limited processing tasks and await all results.
    return Promise.all(assets.map(asset => limit(() => processSingleAsset(asset, storage, session))));
}

/**
 * Process a single base64 asset end-to-end.
 *
 * Pipeline summary:
 * 1. Validate and normalize incoming base64 -> data URL.
 * 2. Compute checksum and attempt an atomic upsert of AssetFile (with session).
 *    - If the checksum already exists, increment refCount and skip upload.
 *    - If new, mark as new and proceed to upload.
 * 3. Upload to Cloudinary (no DB session) when the file is new.
 * 4. Persist upload metadata back to AssetFile (with session).
 * 5. Create an Asset document that references the AssetFile (with session).
 *
 * The function is resilient to transient duplicate-key races on the checksum upsert:
 * it retries the upsert a few times when a duplicate-key error is detected.
 *
 * @param asset - Incoming base64 asset.
 * @param storage - Storage provider instance returned by getDocumentStorageProvider.
 * @param session - Mongoose ClientSession for DB operations that must be transactional.
 * @returns ObjectId of the created Asset document.
 */
async function processSingleAsset(
    asset: Base64Asset,
    storage: ReturnType<typeof getDocumentStorageProvider>,
    session: ClientSession
): Promise<Types.ObjectId> {
    // Validate and normalize the incoming base64 string to a data URL.
    const dataUrl = assertValidDataUrl(asset.base64);

    // Convert data URL to a Buffer for checksum and size calculations.
    const buffer = base64ToBuffer(dataUrl);

    // Compute a deterministic checksum (sha256) used for deduplication.
    const checksum = sha256(buffer);

    // Use provided name or fallback to a sensible default for the Asset title.
    const title = asset.name?.trim() || "Uploaded Asset";

    let assetFile: HydratedDocument<IAssetFile>;
    let isNew = false;

    // --------------------------------------------------
    // 1️⃣ Fast AssetFile upsert (WITH session)
    // --------------------------------------------------
    // Attempt an upsert that increments refCount atomically. This is done inside
    // the provided session so the increment and subsequent Asset creation can be
    // part of the same transaction when the caller uses one.
    //
    // We retry on duplicate-key races because two concurrent requests with the
    // same checksum may both attempt to create the document simultaneously.
    for (let i = 0; i < 5; i++) {
        try {
            assetFile = await AssetFileModel.findOneAndUpdate(
                { checksum },
                { $inc: { refCount: 1 } },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                    session
                }
            );

            // If refCount is 1 after the upsert, this is the first time we've seen this checksum.
            isNew = assetFile.refCount === 1;
            break;
        } catch (err) {
            // If the error is a Mongo duplicate-key race, wait a short backoff and retry.
            if (!isMongoDuplicateKeyError(err) || i === 4) throw err;
            await new Promise(r => setTimeout(r, 50 * (i + 1)));
        }
    }

    // --------------------------------------------------
    // 2️⃣ Cloudinary upload (NO DB session)
    // --------------------------------------------------
    // Only perform the external upload when the checksum is new. External uploads
    // are intentionally performed outside the DB session/transaction because
    // provider SDKs typically do not participate in MongoDB transactions.
    if (isNew) {
        try {
            const uploaded = await storage.create(dataUrl, {
                checksum,
                fileName: asset.name,
                // Pass buffer.length directly — avoids re-decoding base64 inside calculateTimeout
                timeout: calculateTimeout(buffer.length),
                maxRetries: 1
            });

            // --------------------------------------------------
            // 3️⃣ Save upload metadata (WITH session)
            // --------------------------------------------------
            // Persist provider metadata back to the AssetFile document inside the session.
            // This keeps DB state consistent: objectKey, publicUrl, contentType, fileSize.
            await AssetFileModel.updateOne(
                { _id: assetFile!._id },
                {
                    $set: {
                        storageProvider: STORAGE_PROVIDER.CLOUDINARY,
                        objectKey: uploaded.providerId,
                        publicUrl: uploaded.url,
                        contentType: uploaded.contentType,
                        fileSize: uploaded.fileSize
                    }
                },
                { session }
            );
        } catch (err) {
            // 🔁 Manual rollback (WITH session)
            // If the external upload fails, decrement the refCount we previously incremented.
            // This manual compensation keeps refCount accurate and avoids leaking a phantom file record.
            await AssetFileModel.updateOne(
                { _id: assetFile!._id },
                { $inc: { refCount: -1 } },
                { session }
            );
            throw err;
        }
    }

    // --------------------------------------------------
    // 4️⃣ Create Asset document (WITH session)
    // --------------------------------------------------
    // Create the user-facing Asset document that references the AssetFile.
    // This operation is performed inside the session so callers can wrap the
    // entire flow in a transaction if desired.
    const assetDoc = await AssetModel.create(
        [
            {
                file: assetFile!._id,
                assetType: asset.assetType ?? ASSET_TYPE.DOCUMENT,
                title,
                visibility: VISIBILITY.PUBLIC
            }
        ],
        { session }
    );

    return assetDoc[0]._id;
}

/**
 * Calculate a sensible upload timeout based on payload size.
 *
 * The input is a data URL string. We estimate the raw byte length from the
 * base64 length and return a timeout in milliseconds tuned for small, medium,
 * and large payloads.
 *
 * - <= 10 MB: 30s
 * - > 10 MB and <= 20 MB: 120s
 * - > 20 MB: 300s
 *
 * @param dataUrl - Base64 data URL string.
 * @returns Timeout in milliseconds.
 */
/**
 * Calculate a sensible upload timeout based on raw byte count.
 * Accepts buffer byte length directly to avoid redundant base64 decoding.
 */
function calculateTimeout(byteLength: number): number {
    const mb = byteLength / (1024 * 1024);
    if (mb > 20) return 300_000; // 5 min for very large files
    if (mb > 10) return 180_000; // 3 min
    if (mb > 5)  return 120_000; // 2 min
    if (mb > 2)  return 60_000;  // 1 min
    return 30_000;               // 30 s for small files (≤2 MB)
}