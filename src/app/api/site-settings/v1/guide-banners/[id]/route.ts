// app/api/site-settings/guide-banners/[id]/route.ts
export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import mongoose from "mongoose";
import SiteSettings, { GuideBanner } from "@/models/site-settings.model";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { AssetModel, AssetRef, IAsset } from "@/models/asset.model";

import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { STORAGE_PROVIDER, VISIBILITY, ASSET_TYPE } from "@/constants/asset.const";
import { GuideBannerUpdateDTO } from "@/types/guide-banner-settings.types";
import { base64ToBuffer, sha256 } from "@/lib/helpers/convert";
import { Types } from "mongoose";
import { HydratedDocument } from "mongoose";
import { resolveGuideBannersOrder } from "@/lib/helpers/resolve-guideBanner-order";
import { isValidObjectId } from "mongoose";

export type GuideBannerDoc = HydratedDocument<GuideBanner>;

type GuideBannerWithAsset = GuideBanner & {
    asset: AssetRef;
};

// used to fetch banner by id
export const GET = withErrorHandler(
    async (
        req: NextRequest,
        { params }: { params: Promise<{ id?: string }> }
    ) => {
        const id = (await params)?.id;

        if (!id) {
            throw new ApiError("Missing id parameter", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid id format", 400);
        }

        await ConnectDB();

        const doc = await SiteSettings.findOne(
            { "guideBanners._id": id },
            { "guideBanners.$": 1 }
        )
            .populate("guideBanners.asset", "publicUrl -_id")
            .lean();

        if (!doc || !doc.guideBanners?.length) {
            throw new ApiError("Guide banner not found", 404);
        }

        const banner = doc.guideBanners[0] as GuideBannerWithAsset;
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
    }
);

// updated existing banner
export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
        const id = (await params)?.id;
        if (!id) throw new ApiError("Missing banner id in route", 400);
        if (!Types.ObjectId.isValid(id)) throw new ApiError("Invalid banner id", 400);

        const body = (await req.json()) as GuideBannerUpdateDTO;

        if (body.asset !== undefined && typeof body.asset !== "string") {
            throw new ApiError("asset must be a string (base64 | url | asset id)", 400);
        }

        const assetStr = body.asset;

        const isBase64 =
            typeof assetStr === "string" &&
            (assetStr.startsWith("data:") || assetStr.length > 1000);

        if (isBase64 && assetStr!.length > 10_000_000) {
            throw new ApiError("Asset too large", 413);
        }

        await ConnectDB();

        const site = await SiteSettings.findOne();
        if (!site) throw new ApiError("Site settings not found", 500);

        const guideBanners =
            site.guideBanners as unknown as mongoose.Types.DocumentArray<GuideBannerDoc>;

        const bannerSubdoc = guideBanners.id(id);
        if (!bannerSubdoc) throw new ApiError("Guide banner not found", 404);

        let assetDoc: IAsset | null = null;

        if (assetStr) {
            // BASE64 → upload or update only if image changed
            if (isBase64) {
                const buffer = base64ToBuffer(assetStr);
                const checksum = sha256(buffer);

                assetDoc = await AssetModel.findById(bannerSubdoc.asset);

                const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);

                if (assetDoc) {
                    //  Only update if checksum is different
                    if (assetDoc.checksum !== checksum) {
                        const uploaded = await provider.update(
                            assetDoc.objectKey,
                            assetStr,
                            body.alt ?? "Guide Banner"
                        );

                        // Update AssetModel fields
                        assetDoc.publicUrl = uploaded.url;
                        assetDoc.contentType = uploaded.contentType ?? assetDoc.contentType;
                        assetDoc.fileSize = uploaded.fileSize ?? buffer.length;
                        assetDoc.checksum = checksum;
                        assetDoc.title = uploaded.fileName ?? body.alt ?? assetDoc.title;
                        await assetDoc.save();
                    }
                } else {
                    // No previous asset, create new one
                    const uploaded = await provider.create(assetStr, body.alt ?? "Guide Banner");

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
            }

            // CLOUDINARY URL or ObjectId → just fetch existing asset
            else if (/^https?:\/\//.test(assetStr)) {
                assetDoc = await AssetModel.findOne({
                    publicUrl: assetStr,
                    $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
                });
                if (!assetDoc) throw new ApiError("Referenced asset not found for provided URL", 404);
            } else if (Types.ObjectId.isValid(assetStr)) {
                assetDoc = await AssetModel.findById(assetStr);
                if (!assetDoc) throw new ApiError("Referenced asset not found", 404);
            } else {
                throw new ApiError("Invalid asset format", 400);
            }

            bannerSubdoc.asset = assetDoc?._id as Types.ObjectId;
        }

        // Update other fields
        if ("alt" in body) bannerSubdoc.alt = body.alt ?? null;
        if ("caption" in body) bannerSubdoc.caption = body.caption ?? null;
        if ("active" in body) bannerSubdoc.active = body.active;

        // Order handling
        if ("order" in body && body.order !== undefined && body.order !== bannerSubdoc.order) {
            const newOrder = body.order ?? 0;
            const otherBanners = guideBanners.filter((b) => b._id.toString() !== id);
            const updatedBanners = resolveGuideBannersOrder(otherBanners, newOrder);

            site.guideBanners = [
                ...updatedBanners,
                { ...bannerSubdoc.toObject(), order: newOrder },
            ];
        } else {
            bannerSubdoc.order = bannerSubdoc.order ?? 0;
        }

        site.markModified("guideBanners");
        await site.save();

        const refreshed = await SiteSettings.findOne();
        const updatedBanner = (
            refreshed!.guideBanners as unknown as mongoose.Types.DocumentArray<GuideBannerDoc>
        ).id(id);

        if (!updatedBanner) throw new ApiError("Failed to retrieve updated banner", 500);

        return {
            data: {
                ...updatedBanner.toObject(),
                asset: assetDoc?.publicUrl ?? updatedBanner.asset,
            },
            status: 200,
        };
    }
);

// delete existing banner
export const DELETE = withErrorHandler(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const id = decodeURIComponent((await params).id);

    if (!isValidObjectId(id)) {
        throw new ApiError("Invalid guide banner id", 400);
    }

    const bannerId = new Types.ObjectId(id);

    // Connect to DB (assume connection is already initialized)
    await ConnectDB();

    // Fetch the singleton
    const settings = await SiteSettings.findOne();
    if (!settings) {
        throw new ApiError("Site settings not found", 404);
    }

    // Find the guide banner
    const banner = settings.guideBanners.find((b) => b._id?.equals(bannerId));
    if (!banner) {
        throw new ApiError("Guide banner not found", 404);
    }

    // Soft-delete the associated asset
    if (banner.asset) {
        await AssetModel.findByIdAndUpdate(banner.asset, { deletedAt: new Date() });
    }

    // Remove the banner from the array
    settings.guideBanners = settings.guideBanners.filter(
        (b) => !b._id?.equals(bannerId)
    );

    await settings.save();

    return { data: null, status: 200 };
});