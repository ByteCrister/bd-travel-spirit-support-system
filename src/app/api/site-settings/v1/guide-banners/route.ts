export const runtime = "nodejs";

import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
import "@/models/asset.model";

import { AssetModel, type IAsset } from "@/models/asset.model";
import { GUIDE_BANNER_SORT_KEYS, GuideBannerCreateDTO, type GuideBannerSortKey } from "@/types/guide-banner-settings.types";
import { Lean } from "@/types/mongoose-lean.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { GuideBanner } from "@/models/site-settings.model";
import { ASSET_TYPE, AssetType, STORAGE_PROVIDER, VISIBILITY } from "@/constants/asset.const";
import { base64ToBuffer, sha256 } from "@/lib/helpers/convert";
import { getDocumentStorageProvider } from "@/lib/storage-providers";
import { resolveGuideBannersOrder } from "@/lib/helpers/resolve-guideBanner-order";
import { Types } from "mongoose";

/* -------------------------
   Query parsing
------------------------- */
function parseQuery(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const limit = Math.max(1, Number(searchParams.get("limit") ?? 25));
    const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
    const sortByRaw = searchParams.get("sortBy") ?? "order";
    const sortDir = searchParams.get("sortDir") === "desc" ? -1 : 1;

    const sortBy = isGuideBannerSortKey(sortByRaw) ? sortByRaw : "order";

    const activeParam = searchParams.get("active");
    const active = activeParam === null ? undefined : activeParam === "true";

    const search = searchParams.get("search")?.trim();

    return { limit, offset, sortBy, sortDir, active, search };
}

function isGuideBannerSortKey(v: unknown): v is GuideBannerSortKey {
    return typeof v === "string" && (GUIDE_BANNER_SORT_KEYS as readonly string[]).includes(v);
}

/* -------------------------
   Helper types
------------------------- */
type PopulatedAssetLean = Lean<Pick<IAsset, "_id" | "publicUrl">>;

type GuideBannerLean = Lean<
    GuideBanner & {
        _id: unknown;
        asset?: PopulatedAssetLean | string | null;
        createdAt?: Date | null;
        updatedAt?: Date | null;
        deleteAt?: Date | null;
    }
>;

function getFieldForSort(
    b: GuideBannerLean,
    key: GuideBannerSortKey
): Date | number | boolean | undefined {
    switch (key) {
        case "order":
            return typeof b.order === "number" ? b.order : undefined;
        case "createdAt":
            return b.createdAt ?? undefined;
        case "active":
            return typeof b.active === "boolean" ? b.active : undefined;
        default:
            return undefined;
    }
}

/* -------------------------
   GET Guide Banner List
   - Exclude soft-deleted banners by default (deleteAt: null)
------------------------- */
export const GET = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    const { limit, offset, sortBy, sortDir, active, search } = parseQuery(req);

    /* -------------------------
       Mongo-level filters
    ------------------------- */
    const filter: Record<string, unknown> = { deleteAt: null }; // only non-deleted by default

    if (typeof active === "boolean") {
        filter.active = active;
    }

    if (search) {
        filter.$or = [
            { alt: { $regex: search, $options: "i" } },
            { caption: { $regex: search, $options: "i" } },
        ];
    }

    const docs = await GuideBannerSetting.find(filter)
        .populate({
            path: "asset",
            select: "_id publicUrl",
            options: { lean: true },
        })
        .lean()
        .exec();

    if (!docs.length) {
        return {
            data: {
                data: [],
                meta: { total: 0, limit, offset },
            },
            status: 200,
        };
    }

    /* -------------------------
       Sorting (type-safe)
    ------------------------- */
    const banners: GuideBannerLean[] = docs as GuideBannerLean[];

    banners.sort((a, b) => {
        const av = getFieldForSort(a, sortBy);
        const bv = getFieldForSort(b, sortBy);

        if (av == null && bv == null) return 0;
        if (av == null) return -1 * sortDir;
        if (bv == null) return 1 * sortDir;

        if (av instanceof Date && bv instanceof Date) {
            return (av.getTime() - bv.getTime()) * sortDir;
        }

        if (typeof av === "number" && typeof bv === "number") {
            return (av - bv) * sortDir;
        }

        if (typeof av === "boolean" && typeof bv === "boolean") {
            return (Number(av) - Number(bv)) * sortDir;
        }

        return String(av).localeCompare(String(bv)) * sortDir;
    });

    const total = banners.length;
    const page = banners.slice(offset, offset + limit);

    /* -------------------------
       Mapping → API entity
    ------------------------- */
    const data = page.map((b) => ({
        _id: String(b._id),
        asset:
            b.asset && typeof b.asset === "object" && "publicUrl" in b.asset
                ? (b.asset as PopulatedAssetLean).publicUrl
                : null,
        alt: b.alt ?? null,
        caption: b.caption ?? null,
        order: typeof b.order === "number" ? b.order : 0,
        active: typeof b.active === "boolean" ? b.active : true,
        createdAt: b.createdAt ? b.createdAt.toISOString() : undefined,
        updatedAt: b.updatedAt ? b.updatedAt.toISOString() : undefined,
    }));

    return {
        data: {
            data,
            meta: { total, limit, offset },
        },
        status: 200,
    };
});

/* -------------------------
   Helpers for POST
------------------------- */
function deriveAssetType(contentType?: string): AssetType {
    if (!contentType) return ASSET_TYPE.OTHER;
    if (contentType.startsWith("image/")) return ASSET_TYPE.IMAGE;
    return ASSET_TYPE.OTHER;
}

/* -------------------------
   POST - upload guide banner
   - Respect soft-delete (deleteAt) semantics
   - Fix TypeScript typing for temporary banner used in order resolution
   - Use bulkWrite for updates and create() for the new banner to reliably obtain _id
------------------------- */
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

    // Check if asset already exists (only non-deleted assets)
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

    if (!assetDoc) {
        throw new ApiError("Failed to create or find asset", 500);
    }

    // Determine banner order
    // Only consider non-deleted banners when resolving order
    const existingBanners = (await GuideBannerSetting.find({ deleteAt: null }).sort({ order: 1 }).lean().exec()) as GuideBannerLean[];

    const order = body.order ?? existingBanners.length;

    // Include new banner temporarily to resolve orders
    // Ensure asset is typed as a Mongoose ObjectId to satisfy GuideBanner typing
    const tempBanner: Partial<GuideBannerLean> = {
        _id: undefined as unknown as undefined,
        order,
        asset: assetDoc._id as unknown as Types.ObjectId,
    };

    // Build the array for resolution
    const allBanners = [...existingBanners, tempBanner as unknown as GuideBannerLean];
    
    // Resolve orders (resolveGuideBannersOrder expects a list of banners; cast as needed)
    const resolvedOrders = resolveGuideBannersOrder(allBanners, order);

    // Separate existing banners that need updating and find final order for new banner
    const bannersToUpdate = resolvedOrders.filter((b) => b._id);
    const newBannerResolved = resolvedOrders.find((b) => !b._id);
    const finalOrder = newBannerResolved?.order ?? order;

    // Create bulk write operations for updates only
    const bulkOperations = [];

    for (const banner of bannersToUpdate) {
        // originalBanner._id from existingBanners may be an ObjectId; compare as strings
        const originalBanner = existingBanners.find(b => String((b._id) ?? "") === String(banner._id));
        if (originalBanner && originalBanner.order !== banner.order) {
            bulkOperations.push({
                updateOne: {
                    filter: { _id: banner._id },
                    update: { $set: { order: banner.order } }
                }
            });
        }
    }

    // Execute updates first (if any)
    if (bulkOperations.length > 0) {
        await GuideBannerSetting.bulkWrite(bulkOperations);
    }

    // Create the new banner (use create to reliably get the inserted _id)
    const bannerEntry = await GuideBannerSetting.create({
        asset: assetDoc._id,
        alt: body.alt ?? null,
        caption: body.caption ?? null,
        order: finalOrder,
        active: body.active ?? true,
    });

    if (!bannerEntry) {
        throw new ApiError("Banner not created, Please try again!", 400);
    }

    // Populate asset publicUrl if needed for response
    await bannerEntry.populate({ path: "asset", select: "_id publicUrl", options: { lean: true } });

    return {
        data: {
            _id: String(bannerEntry._id),
            asset:
                bannerEntry.asset && typeof bannerEntry.asset === "object" && "publicUrl" in bannerEntry.asset
                    ? (bannerEntry.asset as PopulatedAssetLean).publicUrl
                    : (assetDoc?.publicUrl ?? null),
            alt: bannerEntry.alt ?? null,
            caption: bannerEntry.caption ?? null,
            order: bannerEntry.order,
            active: bannerEntry.active,
            createdAt: bannerEntry.createdAt ? bannerEntry.createdAt.toISOString() : undefined,
            updatedAt: bannerEntry.updatedAt ? bannerEntry.updatedAt.toISOString() : undefined,
        },
        status: 201,
    };
});