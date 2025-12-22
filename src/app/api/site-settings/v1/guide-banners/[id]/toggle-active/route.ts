// PATCH /api/site-settings/v1/guide-banners/[id]/toggle-active
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
import { AssetModel } from "@/models/asset.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

export const PATCH = withErrorHandler(async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid id", 400);
    }

    await ConnectDB();

    // Find the banner
    const banner = await GuideBannerSetting.findById(id);
    if (!banner) throw new ApiError("Guide banner not found", 404);

    // Toggle active field
    banner.active = !banner.active;
    await banner.save();

    // Fetch asset URL
    let assetUrl: string | null = null;
    if (banner.asset) {
        const assetDoc = await AssetModel.findById(banner.asset).select("publicUrl").lean();
        assetUrl = assetDoc?.publicUrl ?? null;
    }

    return {
        data: {
            ...banner.toObject(),
            asset: assetUrl,
        },
        status: 200,
    };

});
