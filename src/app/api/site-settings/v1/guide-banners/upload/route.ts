// app/api/site-settings/v1/guide-banners/upload/route.ts
export const runtime = "nodejs";

import { AssetModel } from "@/models/asset.model";
import { STORAGE_PROVIDER, VISIBILITY, ASSET_TYPE } from "@/constants/asset.const";
import ConnectDB from "@/config/db";
import SiteSettings from "@/models/site-settings.model";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { GuideBannerCreateDTO } from "@/types/guide-banner-settings.types";
import { base64ToBuffer, sha256 } from "@/lib/helpers/convert";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { NextRequest } from "next/server";
import { resolveGuideBannersOrder } from "@/lib/helpers/resolve-guideBanner-order";

function deriveAssetType(contentType?: string): ASSET_TYPE {
    if (!contentType) return ASSET_TYPE.OTHER;
    if (contentType.startsWith("image/")) return ASSET_TYPE.IMAGE;
    return ASSET_TYPE.OTHER;
}

// upload guide banner
export const POST = withErrorHandler(async (req: NextRequest) => {

    const body = (await req.json()) as GuideBannerCreateDTO;

    if (!body?.asset || typeof body.asset !== "string") {
        throw new ApiError("asset is required", 400);
    }

    if (body.asset.length > 10_000_000) {
        throw new ApiError("Asset too large", 413);
    }

    await ConnectDB();

    const buffer = base64ToBuffer(body.asset);
    const checksum = sha256(buffer);

    let assetDoc = await AssetModel.findOne({
        checksum,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    });

    if (!assetDoc) {
        const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
        const uploaded = await provider.create(body.asset, body.alt ?? "Guide Banner");

        assetDoc = await AssetModel.create({
            storageProvider: STORAGE_PROVIDER.CLOUDINARY,
            objectKey: uploaded.providerId,
            publicUrl: uploaded.url,
            contentType: uploaded.contentType ?? "application/octet-stream",
            fileSize: uploaded.fileSize ?? buffer.length,
            checksum,
            assetType: deriveAssetType(uploaded.contentType),
            title: uploaded.fileName ?? body.alt ?? undefined,
            visibility: VISIBILITY.PUBLIC,
        });
    }

    const bannerEntry = {
        asset: assetDoc._id,
        alt: body.alt ?? null,
        caption: body.caption ?? null,
        order: body.order ?? 0,
        active: body.active ?? true,
    };

    const site =
        (await SiteSettings.findOne()) ??
        (await SiteSettings.create({}));

    site.guideBanners = resolveGuideBannersOrder(site.guideBanners, bannerEntry.order);
    site.guideBanners.push(bannerEntry);
    site.markModified("guideBanners");
    await site.save();

    const siteObj = site.toObject();
    const created = siteObj.guideBanners.at(-1)!;

    return {
        data: {
            ...created,
            _id: String(created._id),
            asset: assetDoc.publicUrl,
        },
        status: 201,
    };
    
});