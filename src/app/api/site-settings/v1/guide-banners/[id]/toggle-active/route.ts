// PATCH /api/site-settings/v1/guide-banners/:id/toggle-active
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import SiteSettings from "@/models/site-settings.model";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { AssetModel } from "@/models/asset.model";

// toggle active status fro guide banner
export const PATCH = withErrorHandler(async (req: NextRequest,
    { params }: { params: Promise<{ id: string }> }) => {

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid id", 400);
    }

    await ConnectDB();

    // Update the banner active field in a single query
    const updatedDoc = await SiteSettings.findOneAndUpdate(
        { "guideBanners._id": id },
        [
            {
                $set: {
                    guideBanners: {
                        $map: {
                            input: "$guideBanners",
                            as: "b",
                            in: {
                                $cond: [
                                    { $eq: ["$$b._id", new mongoose.Types.ObjectId(id)] },
                                    { $mergeObjects: ["$$b", { active: { $not: "$$b.active" } }] },
                                    "$$b",
                                ],
                            },
                        },
                    },
                },
            },
        ],
        { new: true }
    ).lean();

    if (!updatedDoc) {
        throw new ApiError("Guide banner not found", 404);
    }

    const banner = updatedDoc.guideBanners.find(
        (b) => b._id?.toString() === id
    );

    if (!banner) {
        throw new ApiError("Guide banner not found", 404);
    }

    const asset = await AssetModel.findById(banner.asset)
        .select("publicUrl")
        .lean<{ publicUrl: string }>();

    return { data: { ...banner, asset: asset?.publicUrl }, status: 200 };
});