// app/api/site-settings/v1/guide-banners/upload/route.ts
export const runtime = "nodejs";

import { AssetModel } from "@/models/asset.model";
import { STORAGE_PROVIDER, VISIBILITY, ASSET_TYPE } from "@/constants/asset.const";
import ConnectDB from "@/config/db";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
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

    const buffer = base64ToBuffer(body.asset);
    if (buffer.length > 10_000_000) {
        throw new ApiError("Asset too large", 413);
    }

    await ConnectDB();

    // Check if asset already exists
    let assetDoc = await AssetModel.findOne({
        checksum: sha256(buffer),
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    });

    if (!assetDoc) {
        const provider = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
        const uploaded = await provider.create(body.asset);

        assetDoc = await AssetModel.create({
            storageProvider: STORAGE_PROVIDER.CLOUDINARY,
            objectKey: uploaded.providerId,
            publicUrl: uploaded.url,
            contentType: uploaded.contentType ?? "application/octet-stream",
            fileSize: uploaded.fileSize ?? buffer.length,
            checksum: sha256(buffer),
            assetType: deriveAssetType(uploaded.contentType),
            title: uploaded.fileName ?? body.alt ?? undefined,
            visibility: VISIBILITY.PUBLIC,
        });
    }

    // Determine banner order
    const existingBanners = await GuideBannerSetting.find().sort({ order: 1 }).lean();
    const order = body.order ?? existingBanners.length;

    // Include new banner temporarily to resolve orders
    const tempBanner = { _id: undefined, order, asset: assetDoc._id };
    const allBanners = [...existingBanners, tempBanner];
    const resolvedOrders = resolveGuideBannersOrder(allBanners, order);

    // Persist updated orders for existing banners
    await Promise.all(
        resolvedOrders
            .filter((b) => b._id && b._id.toString() !== assetDoc._id.toString())
            .map((b) =>
                GuideBannerSetting.updateOne({ _id: b._id }, { order: b.order })
            )
    );

    // Find resolved order for new banner
    const finalOrder = resolvedOrders.find((b) => b.asset.toString() === assetDoc._id.toString())?.order ?? order;

    // Create the new banner in DB
    const bannerEntry = await GuideBannerSetting.create({
        asset: assetDoc._id,
        alt: body.alt ?? null,
        caption: body.caption ?? null,
        order: finalOrder,
        active: body.active ?? true,
    });

    return {
        data: {
            _id: String(bannerEntry._id),
            asset: assetDoc.publicUrl,
            alt: bannerEntry.alt,
            caption: bannerEntry.caption,
            order: bannerEntry.order,
            active: bannerEntry.active,
            createdAt: bannerEntry.createdAt,
            updatedAt: bannerEntry.updatedAt,
        },
        status: 201,
    };
});