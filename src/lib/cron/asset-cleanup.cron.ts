import mongoose from "mongoose";
import { CloudinaryAssetProvider } from "@/lib/cloudinary/asset-provider.cloudinary";
import { withTransaction } from "@/lib/helpers/withTransaction";
import AssetModel from "@/models/assets/asset.model";
import AssetFileModel from "@/models/assets/asset-file.model";
import { STORAGE_PROVIDER } from "@/constants/asset.const";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const cloudinaryProvider = new CloudinaryAssetProvider();

export type AssetCleanupResult = {
    assetsDeleted: number;
    filesDeleted: number;
    cloudinaryDeleted: number;
    cloudinaryFailed: number;
};

/**
 * Permanently remove assets soft-deleted more than one month ago.
 * Deletes Cloudinary files, AssetFile records, and Asset records safely.
 */
export async function cleanupDeletedAssets(): Promise<AssetCleanupResult> {
    const cutoff = new Date(Date.now() - ONE_MONTH_MS);

    console.log(
        `[cron:asset-cleanup] Finding assets soft-deleted before ${cutoff.toISOString()}`
    );

    const expiredAssets = await AssetModel.find({
        deletedAt: { $ne: null, $lte: cutoff },
    })
        .select("_id file")
        .populate<{ file: { _id: mongoose.Types.ObjectId; objectKey: string; storageProvider: string } }>(
            "file",
            "objectKey storageProvider"
        )
        .lean();

    if (!expiredAssets.length) {
        console.log("[cron:asset-cleanup] No expired soft-deleted assets found");
        return {
            assetsDeleted: 0,
            filesDeleted: 0,
            cloudinaryDeleted: 0,
            cloudinaryFailed: 0,
        };
    }

    const assetIds = expiredAssets.map((asset) => asset._id as mongoose.Types.ObjectId);
    const fileIds = [
        ...new Set(
            expiredAssets
                .map((asset) => asset.file?._id?.toString())
                .filter((id): id is string => Boolean(id))
        ),
    ];

    const result = await withTransaction(async (session) => {
        const deleteAssetsResult = await AssetModel.deleteMany(
            { _id: { $in: assetIds } },
            { session }
        ).exec();

        let filesDeleted = 0;
        const deletedCloudinaryKeys: string[] = [];

        for (const fileId of fileIds) {
            const remainingAssets = await AssetModel.countDocuments({
                file: fileId,
            })
                .session(session)
                .exec();

            if (remainingAssets > 0) {
                continue;
            }

            const fileDoc = await AssetFileModel.findById(fileId).session(session).exec();
            if (!fileDoc) continue;

            const isReferenced = await AssetModel.exists({ file: fileId, deletedAt: null }).session(session).exec();
            if (isReferenced) {
                console.warn(
                    `[cron:asset-cleanup] Skipping AssetFile ${fileId} — still referenced by active asset`
                );
                continue;
            }

            if (fileDoc.storageProvider === STORAGE_PROVIDER.CLOUDINARY) {
                deletedCloudinaryKeys.push(fileDoc.objectKey);
            }

            await AssetFileModel.deleteOne({ _id: fileId }, { session }).exec();
            filesDeleted += 1;
        }

        return {
            assetsDeleted: deleteAssetsResult.deletedCount ?? 0,
            filesDeleted,
            deletedCloudinaryKeys,
        };
    });

    let cloudinaryDeleted = 0;
    let cloudinaryFailed = 0;

    if (result.deletedCloudinaryKeys.length) {
        console.log(
            `[cron:asset-cleanup] Deleting ${result.deletedCloudinaryKeys.length} Cloudinary object(s)`
        );

        try {
            const { success, failed } = await cloudinaryProvider.deleteMany(
                result.deletedCloudinaryKeys
            );
            cloudinaryDeleted = success.length;
            cloudinaryFailed = failed.length;

            if (failed.length) {
                console.warn(
                    `[cron:asset-cleanup] Cloudinary delete failures: ${failed.join(", ")}`
                );
            }
        } catch (error) {
            cloudinaryFailed = result.deletedCloudinaryKeys.length;
            console.error("[cron:asset-cleanup] Cloudinary batch delete error:", error);
        }
    }

    console.log(
        `[cron:asset-cleanup] Completed — assets=${result.assetsDeleted}, files=${result.filesDeleted}, cloudinaryOk=${cloudinaryDeleted}, cloudinaryFailed=${cloudinaryFailed}`
    );

    return {
        assetsDeleted: result.assetsDeleted,
        filesDeleted: result.filesDeleted,
        cloudinaryDeleted,
        cloudinaryFailed,
    };
}
