export const runtime = "nodejs";

import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import GuideBannerSetting, { IGuideBanner } from "@/models/site-settings/guideBanner.model";

import "@/models/assets/asset.model";
import "@/models/assets/asset-file.model";

import {
    GUIDE_BANNER_SORT_KEYS,
    GuideBannerCreateDTO,
    type GuideBannerSortKey,
} from "@/types/site-settings/guide-banner-settings.types";
import { Lean } from "@/types/common/mongoose-lean.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { GuideBanner } from "@/models/site-settings.model";
import { ASSET_TYPE } from "@/constants/asset.const";
import { base64ToBuffer } from "@/lib/helpers/document-conversions";
import { resolveGuideBannersOrder } from "@/lib/helpers/resolve-guideBanner-order";
import { Types } from "mongoose";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { uploadAssets } from "@/lib/cloudinary/upload.cloudinary";
import { PopulatedAssetLean } from "@/types/common/populated-asset.types";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";

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

    const search = sanitizeSearch(searchParams.get("search")?.trim()) ?? "";

    return { limit, offset, sortBy, sortDir, active, search };
}

function isGuideBannerSortKey(v: unknown): v is GuideBannerSortKey {
    return (
        typeof v === "string" &&
        (GUIDE_BANNER_SORT_KEYS as readonly string[]).includes(v)
    );
}

/* -------------------------
   Helper types
------------------------- */
type BannerWithPopulatedAsset = Omit<IGuideBanner, "asset"> & {
    asset: PopulatedAssetLean;
};

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
         Mongo filters
      ------------------------- */
    const filter: Record<string, unknown> = {
        deleteAt: null,
    };

    if (typeof active === "boolean") {
        filter.active = active;
    }

    if (search) {
        filter.$or = [
            { alt: { $regex: search, $options: "i" } },
            { caption: { $regex: search, $options: "i" } },
        ];
    }

    /* -------------------------
         Query
      ------------------------- */
    const docs = await GuideBannerSetting.find(filter)
        .populate({
            path: "asset",
            select: "_id file",
            populate: {
                path: "file",
                select: "_id publicUrl",
            },
            options: { lean: true },
        })
        .lean<GuideBannerLean[]>()
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
         Sorting
      ------------------------- */
    docs.sort((a, b) => {
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

    const total = docs.length;
    const page = docs.slice(offset, offset + limit);

    /* -------------------------
         Mapping → API response
      ------------------------- */
    const data = page.map((b) => {
        let assetUrl: string | null = null;

        if (
            b.asset &&
            typeof b.asset === "object" &&
            "file" in b.asset &&
            b.asset.file &&
            typeof b.asset.file === "object" &&
            "publicUrl" in b.asset.file
        ) {
            assetUrl = b.asset.file.publicUrl as string;
        }

        return {
            _id: String(b._id),
            asset: assetUrl,
            alt: b.alt ?? null,
            caption: b.caption ?? null,
            order: typeof b.order === "number" ? b.order : 0,
            active: typeof b.active === "boolean" ? b.active : true,
            createdAt: b.createdAt?.toISOString(),
            updatedAt: b.updatedAt?.toISOString(),
        };
    });

    return {
        data: {
            data,
            meta: { total, limit, offset },
        },
        status: 200,
    };
});


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

    // Early size validation
    const buffer = base64ToBuffer(body.asset);
    if (buffer.length > 10_000_000) {
        throw new ApiError("Asset too large", 413);
    }

    await ConnectDB();

    return withTransaction(async (session) => {
        /* -------------------------
               1️⃣ Upload asset (Asset + AssetFile)
            ------------------------- */
        const [assetId] = await uploadAssets(
            [
                {
                    base64: body.asset,
                    name: body.alt ?? "Guide Banner",
                    assetType: ASSET_TYPE.IMAGE,
                },
            ],
            session
        );

        if (!assetId) {
            throw new ApiError("Failed to upload asset", 500);
        }

        /* -------------------------
               2️⃣ Resolve order (non-deleted only)
            ------------------------- */
        const existingBanners = (await GuideBannerSetting.find({
            deleteAt: null,
        })
            .sort({ order: 1 })
            .lean()
            .session(session)
            .exec()) as GuideBannerLean[];

        const requestedOrder = body.order ?? existingBanners.length;

        const tempBanner: GuideBannerLean = {
            _id: undefined as unknown as Types.ObjectId,
            order: requestedOrder,
            asset: assetId,
        } as GuideBannerLean;

        const resolved = resolveGuideBannersOrder(
            [...existingBanners, tempBanner],
            requestedOrder
        );

        const bannersToUpdate = resolved.filter((b) => b._id);
        const newBanner = resolved.find((b) => !b._id);
        const finalOrder = newBanner?.order ?? requestedOrder;

        /* -------------------------
               3️⃣ Update existing banner orders
            ------------------------- */
        if (bannersToUpdate.length) {
            await GuideBannerSetting.bulkWrite(
                bannersToUpdate.map((b) => ({
                    updateOne: {
                        filter: { _id: b._id },
                        update: { $set: { order: b.order } },
                    },
                })),
                { session }
            );
        }

        /* -------------------------
               4️⃣ Create new banner
            ------------------------- */
        const banner = await GuideBannerSetting.create(
            [
                {
                    asset: assetId,
                    alt: body.alt ?? null,
                    caption: body.caption ?? null,
                    order: finalOrder,
                    active: body.active ?? true,
                },
            ],
            { session }
        ).then((d) => d[0]);

        /* -------------------------
               5️⃣ Populate asset.file.publicUrl
            ------------------------- */
        await banner.populate({
            path: "asset",
            populate: {
                path: "file",
                select: "publicUrl",
            },
        });

        /* -------------------------
               6️⃣ Response
            ------------------------- */
        const populatedBanner = banner as unknown as BannerWithPopulatedAsset;
        return {
            data: {
                _id: String(populatedBanner._id),
                asset:
                    populatedBanner.asset &&
                        typeof populatedBanner.asset === "object" &&
                        "file" in populatedBanner.asset &&
                        populatedBanner.asset.file &&
                        typeof populatedBanner.asset.file === "object"
                        ? populatedBanner.asset.file.publicUrl
                        : null,
                alt: populatedBanner.alt ?? null,
                caption: populatedBanner.caption ?? null,
                order: populatedBanner.order,
                active: populatedBanner.active,
                createdAt: populatedBanner.createdAt?.toISOString(),
                updatedAt: populatedBanner.updatedAt?.toISOString(),
            },
            status: 201,
        };
    });
});