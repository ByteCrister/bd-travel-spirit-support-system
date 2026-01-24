import { sha256, base64ToBuffer, assertValidDataUrl, isCloudinaryUrl, isBase64DataUrl } from "@/lib/helpers/document-conversions";
import AssetModel from "@/models/assets/asset.model";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import { ASSET_TYPE, AssetType } from "@/constants/asset.const";
import { Types, ClientSession } from "mongoose";
import AssetFileModel, { IAssetFile } from "@/models/assets/asset-file.model";
import { MongoServerError } from "mongodb";

export type IncomingDocument = {
    type: string;
    url: string; // base64 OR cloudinary
};

/**
 * Resolve employee documents by reusing existing assets, uploading new base64 assets,
 * and cleaning up assets that are no longer referenced.
 *
 * This function:
 * - Loads existing Asset documents referenced by `existingDocs`.
 * - For each incoming document:
 *   - If `url` is a Cloudinary public URL, it must match an existing asset and will be reused.
 *   - If `url` is a base64 data URL, the function validates and converts it to a buffer,
 *     computes a checksum and attempts to reuse an existing asset with the same checksum.
 *     If no matching checksum exists, the base64 payload is uploaded via `uploadAssets`
 *     using the provided `assetType`.
 * - After resolving all incoming documents, any previously existing assets that are not
 *   referenced by the final resolved list are deleted via `cleanupAssets`.
 *
 * **Important behavior**
 * - All DB reads/writes and cloud operations are executed using the provided `session`
 *   so the caller can wrap the call in a transaction.
 * - The function returns the final list of `{ type, asset }` pairs that should be stored
 *   for the entity (employee).
 *
 * @param {IncomingDocument[]} incoming - Array of incoming documents to resolve.
 *   Each item must include:
 *     - **type**: string — logical document type (for example "passport", "cv").
 *     - **url**: string — either:
 *         • a Cloudinary public URL (unchanged existing asset), or
 *         • a base64 data URL (new or updated asset) in the form `data:<mime>;base64,<payload>`.
 *
 * @param {{ type: string; asset: Types.ObjectId }[]} existingDocs - Array of currently stored document references.
 *   Each item must include:
 *     - **type**: string — logical document type (should correspond to incoming.type when applicable).
 *     - **asset**: Types.ObjectId — MongoDB ObjectId referencing an Asset document.
 *
 * @param {AssetType} assetType - Category to assign to newly uploaded assets.
 *   Use one of the values from the `ASSET_TYPE` enum:
 *     - ASSET_TYPE.IMAGE
 *     - ASSET_TYPE.VIDEO
 *     - ASSET_TYPE.DOCUMENT
 *     - ASSET_TYPE.AUDIO
 *     - ASSET_TYPE.PDF
 *     - ASSET_TYPE.OTHER
 *
 * @param {ClientSession} session - Mongoose ClientSession used for transactional DB operations.
 *
 * @example
 * // Keep an existing Cloudinary URL and upload a new base64 document
 * const incoming = [
 *   { type: "passport", url: "https://res.cloudinary.com/your-cloud/image/upload/v12345/abc.pdf" },
 *   { type: "cv", url: "data:application/pdf;base64,JVBERi0xLjQKJ..." }
 * ];
 *
 * const existingDocs = [
 *   { type: "passport", asset: new Types.ObjectId("64b8f0f2a1b2c3d4e5f67890") },
 *   { type: "id_card", asset: new Types.ObjectId("64b8f0f2a1b2c3d4e5f67891") }
 * ];
 *
 * const assetType: AssetType = ASSET_TYPE.DOCUMENT;
 *
 * await session.withTransaction(async () => {
 *   const resolved = await resolveEmployeeDocuments(incoming, existingDocs, assetType, session);
 *   // resolved: Array<{ type: string; asset: Types.ObjectId }>
 * });
 *
 * @returns {Promise<{ type: string; asset: Types.ObjectId }[]>}
 *   Resolves to the final list of document references that should be stored for the employee.
 *   Each item contains:
 *     - **type**: string — document type.
 *     - **asset**: Types.ObjectId — ObjectId of the resolved (reused or newly uploaded) Asset.
 *
 * @throws {Error} "Invalid document URL provided" — when a Cloudinary URL is supplied but no matching
 *   existing asset is found among `existingDocs`.
 * @throws {Error} "Invalid document format" — when `url` is neither a recognized Cloudinary URL nor
 *   a valid base64 data URL.
 *
 * @sideEffects
 * - May call `uploadAssets` to upload new assets to Cloudinary for base64 inputs.
 * - May call `cleanupAssets` to delete assets that were removed from the incoming list.
 * - Reads Asset documents from the database using `AssetModel.find`.
 *
 * @notes
 * - The function relies on helper utilities: `isCloudinaryUrl`, `isBase64DataUrl`,
 *   `assertValidDataUrl`, `base64ToBuffer`, and `sha256`.
 * - For performance, the function builds maps keyed by `publicUrl` and `checksum` to
 *   quickly find reusable assets.
 * - The caller is responsible for providing a valid `session` and for committing/aborting
 *   the transaction if desired.
 * - Ensure `existingDocs` contains only assets that belong to the same entity and are not
 *   already soft-deleted (deletedAt should be null).
 */
export async function resolveDocuments(
    incoming: IncomingDocument[],
    existingDocs: { type: string; asset: Types.ObjectId }[],
    assetType: AssetType,
    session: ClientSession
) {
    /** 1️⃣ Load existing assets with populated AssetFile */
    const existingAssets = await AssetModel.find({
        _id: { $in: existingDocs.map(d => d.asset) },
        deletedAt: null,
    })
        .populate<{ file: IAssetFile }>("file")
        .session(session);

    /** 2️⃣ Build lookup maps for quick reuse */
    const assetByUrl = new Map<string, typeof existingAssets[0]>();
    const assetByChecksum = new Map<string, typeof existingAssets[0]>();

    for (const asset of existingAssets) {
        const file = asset.file;
        if (file?.publicUrl) assetByUrl.set(file.publicUrl, asset);
        if (file?.checksum) assetByChecksum.set(file.checksum, asset);
    }

    const finalDocuments: { type: string; asset: Types.ObjectId }[] = [];
    const usedAssetIds = new Set<string>();

    /** 3️⃣ Resolve each incoming document */
    for (const doc of incoming) {
        // CASE A: Existing Cloudinary URL
        if (isCloudinaryUrl(doc.url)) {
            const asset = assetByUrl.get(doc.url);
            if (!asset) throw new Error(`Invalid document URL provided: ${doc.url}`);

            usedAssetIds.add(asset._id.toString());
            finalDocuments.push({ type: doc.type, asset: asset._id });
            continue;
        }

        // CASE B: Base64 → reuse by checksum or upload
        if (isBase64DataUrl(doc.url)) {
            const dataUrl = assertValidDataUrl(doc.url);
            const buffer = base64ToBuffer(dataUrl);
            const checksum = sha256(buffer);

            // 1️⃣ Try to reuse existing asset by checksum
            const existing = assetByChecksum.get(checksum);
            if (existing) {
                usedAssetIds.add(existing._id.toString());
                finalDocuments.push({ type: doc.type, asset: existing._id });
                continue;
            }

            // 2️⃣ Upload new asset (concurrency-safe)
            try {
                const [newAssetId] = await uploadAssets(
                    [
                        {
                            base64: doc.url,
                            name: doc.type,
                            assetType: assetType ?? ASSET_TYPE.DOCUMENT,
                        },
                    ],
                    session
                );

                usedAssetIds.add(newAssetId.toString());
                finalDocuments.push({ type: doc.type, asset: newAssetId });
            } catch (err) {
                // Handle duplicate checksum race condition
                if (err instanceof MongoServerError && err.code === 11000 && err.keyPattern?.checksum) {
                    const reused = await AssetFileModel.findOne({ checksum }).session(session);
                    if (!reused) throw new Error("Failed to reuse existing asset after checksum conflict");
                    usedAssetIds.add((reused._id as Types.ObjectId).toString());
                    finalDocuments.push({ type: doc.type, asset: reused._id as Types.ObjectId });
                } else {
                    throw err;
                }
            }

            continue;
        }

        throw new Error(`Invalid document format: ${doc.url}`);
    }

    /** 4️⃣ Soft-delete assets that are no longer referenced */
    const assetsToDelete = existingDocs
        .map(d => d.asset)
        .filter(id => !usedAssetIds.has(id.toString()));

    if (assetsToDelete.length > 0) {
        await cleanupAssets(assetsToDelete, session);
    }

    return finalDocuments;
}