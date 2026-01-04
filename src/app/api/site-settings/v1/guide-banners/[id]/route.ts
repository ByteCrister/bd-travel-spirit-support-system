// app/api/site-settings/guide-banners/[id]/route.ts
export const runtime = "nodejs";
import "@/models/assets/asset.model";
import "@/models/assets/asset-file.model";
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import GuideBannerSetting, { IGuideBanner } from "@/models/site-settings/guideBanner.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { ASSET_TYPE } from "@/constants/asset.const";
import { GuideBannerUpdateDTO } from "@/types/guide-banner-settings.types";
import { resolveGuideBannersOrder } from "@/lib/helpers/resolve-guideBanner-order";
import { PopulatedAsset } from "@/types/populated-asset.types";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import AssetModel from "@/models/assets/asset.model";
import { cleanupAssets } from "@/lib/cloudinary/delete.cloudinary";
import AssetFileModel from "@/models/assets/asset-file.model";

type PopulatedGuideBannerSetting = Omit<IGuideBanner, "asset"> & {
    asset: PopulatedAsset;
}

/**
 * GET Banner by ID
 * - Treat soft-deleted banners (deleteAt != null) as not found.
 */
export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
    const id = (await params)?.id;
    if (!id || !Types.ObjectId.isValid(id)) throw new ApiError("Invalid banner ID", 400);

    await ConnectDB();

    // Find and ensure not soft-deleted
    const populatedBanner = await GuideBannerSetting.findById(id)
        .populate({
            path: "asset",
            select: "file",
            populate: { path: "file", select: "publicUrl" }
        })
        .lean();

    const banner = populatedBanner as unknown as PopulatedGuideBannerSetting;

    if (!banner || banner.deleteAt) throw new ApiError("Guide banner not found", 404);

    // Narrow the populated union properly
    const asset = banner.asset.file.publicUrl;

    return {
        data: {
            ...banner,
            asset,
        },
        status: 200,
    };
});

/**
 * PUT / Update Banner
 * - Updated to use new Asset/AssetFile models with Cloudinary
 */
export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
    const id = (await params)?.id;
    if (!id || !Types.ObjectId.isValid(id)) throw new ApiError("Invalid banner ID", 400);

    const body = (await req.json()) as GuideBannerUpdateDTO;
    await ConnectDB();
    const assetsToCleanup: Types.ObjectId[] = [];

    return withTransaction(async (session) => {
        const banner = await GuideBannerSetting.findById(id).session(session);
        if (!banner || banner.deleteAt) throw new ApiError("Guide banner not found", 404);

        let newAssetId: Types.ObjectId | null = null;

        // Handle asset update
        if (body.asset) {
            const assetStr = body.asset;
            const isBase64 = assetStr.startsWith("data:");

            if (isBase64 && assetStr.length > 10_000_000) {
                throw new ApiError("Asset too large", 413);
            }

            if (isBase64) {
                const [assetId] = await uploadAssets(
                    [
                        {
                            base64: assetStr,
                            name: body.alt ?? "Guide Banner",
                            assetType: ASSET_TYPE.IMAGE,
                        },
                    ],
                    session
                );

                newAssetId = assetId;

                if (banner.asset) {
                    assetsToCleanup.push(banner.asset as Types.ObjectId);
                }
            }

            else if (/^https?:\/\//.test(assetStr)) {
                const assetFile = await AssetFileModel
                    .findOne({ publicUrl: assetStr })
                    .session(session);

                if (!assetFile) {
                    throw new ApiError("Referenced asset not found", 404);
                }

                const asset = await AssetModel
                    .findOne({ file: assetFile._id, deletedAt: null })
                    .session(session);

                if (!asset) {
                    throw new ApiError("Referenced asset not found", 404);
                }

                newAssetId = asset._id;
            }

            else if (Types.ObjectId.isValid(assetStr)) {
                const asset = await AssetModel.findById(assetStr).session(session);
                if (!asset) throw new ApiError("Referenced asset not found", 404);
                newAssetId = asset._id;
            }

            else {
                throw new ApiError("Invalid asset format", 400);
            }

            if (newAssetId) {
                banner.asset = newAssetId;
            }
        }
        
        await cleanupAssets(assetsToCleanup, session)


        // Update scalar fields
        if ("alt" in body) banner.alt = body.alt ?? null;
        if ("caption" in body) banner.caption = body.caption ?? null;
        if ("active" in body) banner.active = body.active;

        // Handle order change: exclude soft-deleted banners when resolving order
        if ("order" in body && body.order !== undefined && body.order !== banner.order) {
            const allOtherBanners = (await GuideBannerSetting.find({ _id: { $ne: id }, deleteAt: null }).sort({ order: 1 }).lean().session(session).exec()).map(b => b);
            const tempBanner = { ...banner.toObject(), order: body.order };
            const resolved = resolveGuideBannersOrder([...allOtherBanners, tempBanner], body.order);

            // Create bulk write operations for other banners whose order changed
            const bulkOperations = [];

            for (const resolvedBanner of resolved) {
                // Skip the banner we're currently updating (we'll update it separately)
                if (resolvedBanner._id?.toString() === id) continue;

                const originalBanner = allOtherBanners.find(b => String((b._id) ?? "") === String(resolvedBanner._id));
                if (originalBanner && originalBanner.order !== resolvedBanner.order) {
                    bulkOperations.push({
                        updateOne: {
                            filter: { _id: resolvedBanner._id },
                            update: { $set: { order: resolvedBanner.order } }
                        }
                    });
                }
            }

            if (bulkOperations.length > 0) {
                await GuideBannerSetting.bulkWrite(bulkOperations, { session });
            }

            // Find the new order for the current banner from resolved list
            const currentBannerResolved = resolved.find(b => String(b._id ?? "") === String(id));
            banner.order = currentBannerResolved?.order ?? body.order;
        }

        await banner.save({ session });

        // Populate for response
        const populateBanner = await banner.populate({
            path: "asset",
            populate: {
                path: "file",
                select: "publicUrl",
            },
        });

        const populatedBanner = populateBanner as unknown as PopulatedGuideBannerSetting;

        // Safely extract the public URL from the populated structure
        const getPublicUrl = (populatedBanner: PopulatedGuideBannerSetting): string | null => {
            if (
                populatedBanner?.asset &&
                typeof populatedBanner.asset === "object" &&
                populatedBanner.asset?.file &&
                typeof populatedBanner.asset.file === "object" &&
                populatedBanner.asset.file.publicUrl
            ) {
                return populatedBanner.asset.file.publicUrl;
            }
            return null;
        };

        return {
            data: {
                _id: String(populatedBanner._id),
                asset: getPublicUrl(populatedBanner),
                alt: populatedBanner.alt ?? null,
                caption: populatedBanner.caption ?? null,
                order: populatedBanner.order,
                active: populatedBanner.active,
                createdAt: populatedBanner.createdAt?.toISOString(),
                updatedAt: populatedBanner.updatedAt?.toISOString(),
            },
            status: 200,
        };
    });
});

/**
 * DELETE Banner
 * - Updated to use new Asset/AssetFile models and Cloudinary cleanup
 */
export const DELETE = withErrorHandler(async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid guide banner id", 400);

    await ConnectDB();

    return withTransaction(async (session) => {
        // Find the banner (allow deleted check to return 404 if already deleted)
        const banner = await GuideBannerSetting.findById(id).session(session);
        if (!banner) throw new ApiError("Guide banner not found", 404);

        // If banner already soft-deleted, return success (idempotent)
        if (banner.deleteAt) {
            return { data: null, status: 200 };
        }

        // If banner has an asset, use cleanupAssets to handle it
        if (banner.asset) {
            await cleanupAssets([banner.asset as Types.ObjectId], session);
        }

        // Soft-delete the banner using model helper if available
        if (typeof GuideBannerSetting.softDeleteById === "function") {
            await GuideBannerSetting.softDeleteById(id);
        } else {
            // Fallback: mark deleteAt and deactivate
            banner.deleteAt = new Date();
            banner.active = false;
            await banner.save({ session });
        }

        return { data: null, status: 200 };
    });
});