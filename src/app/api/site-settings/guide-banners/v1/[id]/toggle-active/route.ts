// PATCH /api/site-settings/v1/guide-banners/[id]/toggle-active
import "@/models/assets/asset.model";
import "@/models/assets/asset-file.model";
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import AssetModel, { IAsset } from "@/models/assets/asset.model";
import { PopulatedAssetFileLean } from "@/types/common/populated-asset.types";

type populatedAssetDoc = Omit<IAsset, "file"> & {
    file: PopulatedAssetFileLean;
};
/**
 * Toggle guide banner active/inactive
 */
export const PATCH = withErrorHandler(async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid id", 400);
    }

    await ConnectDB();

    // Find the banner and ensure it's not soft-deleted (deleteAt === null)
    const banner = await GuideBannerSetting.findOne({ _id: id, deleteAt: null });
    if (!banner) throw new ApiError("Guide banner not found", 404);

    // Ensure active is boolean (default true if undefined) and toggle
    const currentActive = typeof banner.active === "boolean" ? banner.active : true;
    banner.active = !currentActive;
    await banner.save();

    // Fetch asset URL (only non-deleted assets)
    let assetUrl: string | null = null;
    if (banner.asset) {
        const assetDoc = await AssetModel.findOne({
            _id: banner.asset,
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
        })
            .populate({
                path: "file",
                select: "publicUrl",
            })
            .lean()
            .exec();

        assetUrl = (assetDoc as unknown as populatedAssetDoc)?.file.publicUrl ?? null;
    }

    const obj = banner.toObject();

    return {
        data: {
            _id: String(obj._id),
            asset: assetUrl,
            alt: obj.alt ?? null,
            caption: obj.caption ?? null,
            order: typeof obj.order === "number" ? obj.order : 0,
            active: typeof obj.active === "boolean" ? obj.active : true,
            createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : undefined,
            updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
        },
        status: 200,
    };
});
