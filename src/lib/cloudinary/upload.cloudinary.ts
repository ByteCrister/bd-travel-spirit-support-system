// lib/cloudinary/upload.cloudinary.ts
import mongoose from "mongoose";
import AssetModel from "@/models/assets/asset.model";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER, ASSET_TYPE, VISIBILITY } from "@/constants/asset.const";
import { assertValidDataUrl, base64ToBuffer, sha256 } from "@/lib/helpers/document-conversions";
import { DuplicateAssetChecksumError, isMongoDuplicateKeyError } from "@/lib/helpers/asset-checksum-error";
import AssetFileModel from "@/models/assets/asset-file.model";
import { Types } from "mongoose";

/**
 * A single asset provided as a base64 data URL and an optional friendly name.
 *
 * @example
 * const asset: Base64Asset = {
 *   base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
 *   name: "profile-picture.png"
 *   assetType: "DOCUMENT"
 * };
 */
export interface Base64Asset {
    /** Base64-encoded data URL string. Must include the data URL prefix like "data:image/png;base64,..." */
    base64: string;

    /** Optional human-friendly filename or title used for DB title and error messages */
    name?: string;

    assetType?: string;
}

/**
 * Upload multiple base64-encoded assets to the configured document storage provider
 * and persist metadata in the AssetModel collection.
 *
 * **Behavior**
 * - Validates each `base64` value is a proper data URL.
 * - Computes a checksum and prevents duplicates by checksum.
 * - Uploads the file to the storage provider and saves an AssetModel document in the DB.
 * - Uses the provided `session` for all DB operations so the caller can control transactions.
 *
 * @param {Base64Asset[]} assets - Array of assets to upload. Each item must include a valid base64 data URL in `base64`.
 *
 * @example
 * const assets = [
 *   { base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...", name: "avatar.png", assetType: "DOCUMENT" },
 *   { base64: "data:application/pdf;base64,JVBERi0xLjQKJ...", name: "resume.pdf", assetType: "PDF" }
 * ];
 * const ids = await uploadAssets(assets, session);
 *
 * @param {mongoose.ClientSession} session - Mongoose client session to use for DB writes. Pass `null` only if you do not want transactional behavior.
 *
 * @returns {Promise<mongoose.Types.ObjectId[]>} Promise that resolves to an array of created Asset document IDs in the same order as the input assets.
 *
 * @throws {DuplicateAssetChecksumError} If an asset with the same checksum already exists or a concurrent insert causes a checksum duplicate.
 * @throws {Error} Any other error thrown by the storage provider or Mongoose operations is rethrown.
 */
export async function uploadAssets(
    assets: Base64Asset[],
    session: mongoose.ClientSession
): Promise<Types.ObjectId[]> {
    if (!assets?.length) return [];

    const storage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
    const assetIds: Types.ObjectId[] = [];

    for (const { base64, name, assetType } of assets) {
        const dataUrl = assertValidDataUrl(base64);
        const buffer = base64ToBuffer(dataUrl);
        const checksum = sha256(buffer);
        const title = name?.trim() || "Uploaded Asset";

        // 1️⃣ Check if AssetFile already exists
        let assetFile = await AssetFileModel.findOne({ checksum }).session(session);

        // 2️⃣ If not, upload to storage and create AssetFile
        if (!assetFile) {
            try {
                const uploaded = await storage.create(dataUrl);

                assetFile = await AssetFileModel.create(
                    [
                        {
                            storageProvider: STORAGE_PROVIDER.CLOUDINARY,
                            objectKey: uploaded.providerId,
                            publicUrl: uploaded.url,
                            contentType: uploaded.contentType,
                            fileSize: uploaded.fileSize,
                            checksum,
                            refCount: 1, // start at 1
                        },
                    ],
                    { session }
                ).then(d => d[0]);
            } catch (err: unknown) {
                // Handle rare race condition: another transaction inserted same checksum
                if (isMongoDuplicateKeyError(err)) {
                    assetFile = await AssetFileModel.findOne({ checksum }).session(session);
                    if (!assetFile) throw new DuplicateAssetChecksumError(title);
                    // increment refCount for existing file
                    await AssetFileModel.incrementRef((assetFile._id as Types.ObjectId).toString(), session);
                } else {
                    throw err;
                }
            }
        } else {
            // ✅ Existing file: increment refCount because we are creating a new Asset
            await AssetFileModel.incrementRef((assetFile._id as Types.ObjectId).toString(), session);
        }

        if (!assetFile) throw new Error(`Failed to resolve AssetFile for checksum ${checksum}`);

        // 3️⃣ Create Asset document
        const asset = await AssetModel.create(
            [
                {
                    file: assetFile._id,
                    assetType: assetType ?? ASSET_TYPE.DOCUMENT,
                    title,
                    visibility: VISIBILITY.PUBLIC,
                },
            ],
            { session }
        ).then(d => d[0]);

        assetIds.push(asset._id);
    }

    return assetIds;
}