// app/api/site-settings/guide-banners/[id]/route.ts
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
import { AssetModel } from "@/models/asset.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER, VISIBILITY, ASSET_TYPE } from "@/constants/asset.const";
import { GuideBannerUpdateDTO } from "@/types/guide-banner-settings.types";
import { base64ToBuffer, sha256 } from "@/lib/helpers/convert";
import { resolveGuideBannersOrder } from "@/lib/helpers/resolve-guideBanner-order";

/**
 * GET Banner by ID
 * - Treat soft-deleted banners (deleteAt != null) as not found.
 */
export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
    const id = (await params)?.id;
    if (!id || !Types.ObjectId.isValid(id)) throw new ApiError("Invalid banner ID", 400);

    await ConnectDB();

    // Find and ensure not soft-deleted
    const banner = await GuideBannerSetting.findById(id).populate("asset", "publicUrl").lean();
    if (!banner || banner.deleteAt) throw new ApiError("Guide banner not found", 404);

    // Narrow the populated union properly
    const asset =
        banner.asset &&
            typeof banner.asset === "object" &&
            "publicUrl" in banner.asset
            ? banner.asset.publicUrl
            : null;

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
 * - Respect soft-delete semantics when reordering (exclude deleted banners)
 * - Update asset handling to work with base64, URL, or ObjectId references
 */
export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
    const id = (await params)?.id;
    if (!id || !Types.ObjectId.isValid(id)) throw new ApiError("Invalid banner ID", 400);

    const body = (await req.json()) as GuideBannerUpdateDTO;
    await ConnectDB();

    const banner = await GuideBannerSetting.findById(id);
    if (!banner || banner.deleteAt) throw new ApiError("Guide banner not found", 404);

    let assetDoc = null;

    // Handle asset update
    if (body.asset) {
        const assetStr = body.asset;
        const isBase64 = assetStr.startsWith("data:") || assetStr.length > 1000;

        if (isBase64 && assetStr.length > 10_000_000) throw new ApiError("Asset too large", 413);

        const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);

        if (isBase64) {
            const buffer = base64ToBuffer(assetStr);
            const checksum = sha256(buffer);

            if (banner.asset) {
                assetDoc = await AssetModel.findById(banner.asset);
                // If asset exists but checksum differs, update provider and asset doc
                if (assetDoc && assetDoc.checksum !== checksum) {
                    const uploaded = await provider.update(assetDoc.objectKey, assetStr);
                    assetDoc.publicUrl = uploaded.url;
                    assetDoc.contentType = uploaded.contentType ?? assetDoc.contentType;
                    assetDoc.fileSize = uploaded.fileSize ?? buffer.length;
                    assetDoc.checksum = checksum;
                    assetDoc.title = uploaded.fileName ?? body.alt ?? assetDoc.title;
                    await assetDoc.save();
                } else if (!assetDoc) {
                    // Create new asset if referenced asset doc not found
                    const uploaded = await provider.create(assetStr);
                    assetDoc = await AssetModel.create({
                        storageProvider: STORAGE_PROVIDER.CLOUDINARY,
                        objectKey: uploaded.providerId,
                        publicUrl: uploaded.url,
                        contentType: uploaded.contentType ?? "application/octet-stream",
                        fileSize: uploaded.fileSize ?? buffer.length,
                        checksum,
                        assetType: ASSET_TYPE.IMAGE,
                        title: uploaded.fileName ?? body.alt ?? undefined,
                        visibility: VISIBILITY.PUBLIC,
                    });
                }
            } else {
                // No existing asset on banner, create new
                const uploaded = await provider.create(assetStr);
                assetDoc = await AssetModel.create({
                    storageProvider: STORAGE_PROVIDER.CLOUDINARY,
                    objectKey: uploaded.providerId,
                    publicUrl: uploaded.url,
                    contentType: uploaded.contentType ?? "application/octet-stream",
                    fileSize: uploaded.fileSize ?? buffer.length,
                    checksum,
                    assetType: ASSET_TYPE.IMAGE,
                    title: uploaded.fileName ?? body.alt ?? undefined,
                    visibility: VISIBILITY.PUBLIC,
                });
            }
        } else if (/^https?:\/\//.test(assetStr)) {
            // Reference by URL — only accept non-deleted assets
            assetDoc = await AssetModel.findOne({ publicUrl: assetStr, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });
            if (!assetDoc) throw new ApiError("Referenced asset not found", 404);
        } else if (Types.ObjectId.isValid(assetStr)) {
            assetDoc = await AssetModel.findById(assetStr);
            if (!assetDoc) throw new ApiError("Referenced asset not found", 404);
        } else {
            throw new ApiError("Invalid asset format", 400);
        }

        // Assign the asset ObjectId to the banner
        if (assetDoc) banner.asset = assetDoc._id as Types.ObjectId;
    }

    // Update scalar fields
    if ("alt" in body) banner.alt = body.alt ?? null;
    if ("caption" in body) banner.caption = body.caption ?? null;
    if ("active" in body) banner.active = body.active;

    // Handle order change: exclude soft-deleted banners when resolving order
    if ("order" in body && body.order !== undefined && body.order !== banner.order) {
        const allOtherBanners = (await GuideBannerSetting.find({ _id: { $ne: id }, deleteAt: null }).sort({ order: 1 }).lean().exec()).map(b => b);
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
            await GuideBannerSetting.bulkWrite(bulkOperations);
        }

        // Find the new order for the current banner from resolved list
        const currentBannerResolved = resolved.find(b => String(b._id ?? "") === String(id));
        banner.order = currentBannerResolved?.order ?? body.order;
    }

    await banner.save();

    // Prepare response asset value: prefer updated assetDoc.publicUrl if available
    const responseAsset = assetDoc?.publicUrl ?? (typeof banner.asset === "object" && "toString" in banner.asset ? banner.asset.toString() : banner.asset);

    return {
        data: {
            ...banner.toObject(),
            asset: responseAsset,
        },
        status: 200,
    };
});

/**
 * DELETE Banner
 * - Soft-delete the banner (set deleteAt and deactivate) using model helper
 * - Soft-delete associated asset and remove from provider if present
 */
export const DELETE = withErrorHandler(async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid guide banner id", 400);

    await ConnectDB();

    // Find the banner (allow deleted check to return 404 if already deleted)
    const banner = await GuideBannerSetting.findById(id);
    if (!banner) throw new ApiError("Guide banner not found", 404);

    // If banner already soft-deleted, return success (idempotent)
    if (banner.deleteAt) {
        return { data: null, status: 200 };
    }

    // If banner has an asset, attempt to remove from provider and soft-delete the asset record
    if (banner.asset) {
        const assetDoc = await AssetModel.findById(banner.asset);
        if (assetDoc) {
            // // const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
            // try {
            //     // Attempt to delete from provider; ignore provider errors but log
            // //     await provider.delete(assetDoc.objectKey);
            // } catch (err) {
            //     console.warn("Failed to delete asset from provider:", err);
            // }

            // Soft-delete the asset record (preserve history)
            if (typeof AssetModel.softDeleteById === "function") {
                try {
                    await AssetModel.softDeleteById(assetDoc._id as Types.ObjectId);
                } catch {
                    // Fallback: mark deletedAt on document and save
                    try {
                        assetDoc.deletedAt = new Date();
                        await assetDoc.save();
                    } catch (e) {
                        console.warn("Failed to soft-delete asset record:", e);
                    }
                }
            } else {
                // If helper not present, mark deletedAt directly
                assetDoc.deletedAt = new Date();
                await assetDoc.save();
            }
        }
    }

    // Soft-delete the banner using model helper if available
    if (typeof GuideBannerSetting.softDeleteById === "function") {
        await GuideBannerSetting.softDeleteById(id);
    } else {
        // Fallback: mark deleteAt and deactivate
        banner.deleteAt = new Date();
        banner.active = false;
        await banner.save();
    }

    return { data: null, status: 200 };
});