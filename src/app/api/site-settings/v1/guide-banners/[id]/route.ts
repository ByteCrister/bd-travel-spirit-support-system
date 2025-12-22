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

// GET Banner by ID
export const GET = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
    const id = (await params)?.id;
    if (!id || !Types.ObjectId.isValid(id)) throw new ApiError("Invalid banner ID", 400);

    await ConnectDB();
    const banner = await GuideBannerSetting.findById(id).populate("asset", "publicUrl").lean();
    if (!banner) throw new ApiError("Guide banner not found", 404);

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

// PUT / Update Banner
export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
    const id = (await params)?.id;
    if (!id || !Types.ObjectId.isValid(id)) throw new ApiError("Invalid banner ID", 400);

    const body = (await req.json()) as GuideBannerUpdateDTO;
    await ConnectDB();

    const banner = await GuideBannerSetting.findById(id);
    if (!banner) throw new ApiError("Guide banner not found", 404);

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
                if (assetDoc?.checksum !== checksum) {
                    const uploaded = await provider.update(assetDoc.objectKey, assetStr);
                    assetDoc.publicUrl = uploaded.url;
                    assetDoc.contentType = uploaded.contentType ?? assetDoc.contentType;
                    assetDoc.fileSize = uploaded.fileSize ?? buffer.length;
                    assetDoc.checksum = checksum;
                    assetDoc.title = uploaded.fileName ?? body.alt ?? assetDoc.title;
                    await assetDoc.save();
                }
            } else {
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
            assetDoc = await AssetModel.findOne({ publicUrl: assetStr, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });
            if (!assetDoc) throw new ApiError("Referenced asset not found", 404);
        } else if (Types.ObjectId.isValid(assetStr)) {
            assetDoc = await AssetModel.findById(assetStr);
            if (!assetDoc) throw new ApiError("Referenced asset not found", 404);
        } else {
            throw new ApiError("Invalid asset format", 400);
        }

        banner.asset = assetDoc._id;
    }

    // Update fields
    if ("alt" in body) banner.alt = body.alt ?? null;
    if ("caption" in body) banner.caption = body.caption ?? null;
    if ("active" in body) banner.active = body.active;

    // Handle order
    if ("order" in body && body.order !== undefined && body.order !== banner.order) {
        const allOtherBanners = (await GuideBannerSetting.find({ _id: { $ne: id } })).map(b => b.toObject());
        const tempBanner = { ...banner.toObject(), order: body.order };
        const resolved = resolveGuideBannersOrder([...allOtherBanners, tempBanner], body.order);
        // Persist updated orders
        await Promise.all(resolved.map(b => GuideBannerSetting.updateOne({ _id: b._id }, { order: b.order })));
        banner.order = resolved.find(b => b._id?.toString() === id)?.order ?? body.order;
    }

    await banner.save();

    return {
        data: {
            ...banner.toObject(),
            asset: assetDoc?.publicUrl ?? banner.asset,
        },
        status: 200,
    };
});

// DELETE Banner
export const DELETE = withErrorHandler(async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid guide banner id", 400);

    await ConnectDB();

    // Find the banner
    const banner = await GuideBannerSetting.findById(id);
    if (!banner) throw new ApiError("Guide banner not found", 404);

    // Delete asset from Cloudinary if exists
    if (banner.asset) {
        const assetDoc = await AssetModel.findById(banner.asset);
        if (assetDoc) {
            const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
            try {
                await provider.delete(assetDoc.objectKey); // Remove from Cloudinary
            } catch (err) {
                console.warn("Failed to delete asset from Cloudinary:", err);
            }
            await assetDoc.deleteOne(); // Remove asset doc from DB
        }
    }

    // Delete the banner document
    await banner.deleteOne();

    return { data: null, status: 200 };
});