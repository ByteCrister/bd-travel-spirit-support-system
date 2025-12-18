// app/api/site-settings/v1/guide-banners/route.ts
import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import SiteSettings, { GuideBanner, ISiteSettings } from "@/models/site-settings.model";
import "@/models/asset.model";
import type { IAsset } from "@/models/asset.model";
import { GUIDE_BANNER_SORT_KEYS, type GuideBannerSortKey } from "@/types/guide-banner-settings.types";
import { Lean } from "@/types/mongoose-lean.types";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/* -------------------------
   Query parsing
------------------------- */
function parseQuery(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const limit = Math.max(1, Number(searchParams.get("limit") ?? 25));
    const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
    const sortByRaw = searchParams.get("sortBy") ?? "order";
    const sortDir = searchParams.get("sortDir") === "desc" ? -1 : 1;

    // Narrow sortBy to the known keys using a type guard
    const sortBy = isGuideBannerSortKey(sortByRaw) ? sortByRaw : "order";

    const activeParam = searchParams.get("active");
    const active = activeParam === null ? undefined : activeParam === "true";

    const search = searchParams.get("search")?.trim();

    return { limit, offset, sortBy, sortDir, active, search };
}

/* Type guard to narrow string -> GuideBannerSortKey */
function isGuideBannerSortKey(v: unknown): v is GuideBannerSortKey {
    return typeof v === "string" && (GUIDE_BANNER_SORT_KEYS as readonly string[]).includes(v);
}

/* -------------------------
   Helper types for populated/lean docs
------------------------- */

/**
 * After populate(..., options: { lean: true }) + .lean(), the populated asset will be a plain object
 * with only the selected fields. We model that shape here.
 */
type PopulatedAssetLean = Lean<Pick<IAsset, "_id" | "publicUrl">>;

/**
 * A guide banner as returned from the DB after .lean().
 * - asset may be populated (PopulatedAssetLean) or still an ObjectId/string or null.
 * - createdAt/updatedAt are Date objects in the DB; we keep them as Date here and convert to ISO later.
 */
type GuideBannerLean = Lean<
    GuideBanner & {
        _id: unknown;
        asset?: PopulatedAssetLean | string | null;
        createdAt?: Date | null;
        updatedAt?: Date | null;
    }
>;

/* Typed accessor for sort keys to avoid any casts */
function getFieldForSort(b: GuideBannerLean, key: GuideBannerSortKey): Date | number | boolean | undefined {
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
------------------------- */
export const GET = withErrorHandler(async (req: NextRequest) => {

    await ConnectDB();
    const { limit, offset, sortBy, sortDir, active, search } = parseQuery(req);

    const settings = (await SiteSettings.findOne()
        .populate({
            path: "guideBanners.asset",
            select: "_id publicUrl",
            options: { lean: true },
        })
        .lean()
        .exec()) as Lean<ISiteSettings> | null;

    if (!settings?.guideBanners?.length) {
        return {
            data: {
                data: [],
                meta: { total: 0, limit, offset },
            }, status: 200
        };
    }

    /* -------------------------
       In-memory filtering (subdocs)
    ------------------------- */
    let banners: GuideBannerLean[] = settings.guideBanners as GuideBannerLean[];

    if (typeof active === "boolean") {
        banners = banners.filter((b) => Boolean(b.active) === active);
    }

    if (search) {
        const q = search.toLowerCase();
        banners = banners.filter(
            (b) => (b.alt ?? "").toLowerCase().includes(q) || (b.caption ?? "").toLowerCase().includes(q)
        );
    }

    /* -------------------------
       Sorting (type-safe)
    ------------------------- */
    banners.sort((a: GuideBannerLean, b: GuideBannerLean) => {
        const av = getFieldForSort(a, sortBy);
        const bv = getFieldForSort(b, sortBy);

        if (av == null && bv == null) return 0;
        if (av == null) return -1 * sortDir;
        if (bv == null) return 1 * sortDir;

        // Date comparison
        if (av instanceof Date && bv instanceof Date) {
            return (av.getTime() - bv.getTime()) * sortDir;
        }

        // Numeric comparison
        if (typeof av === "number" && typeof bv === "number") {
            return (av - bv) * sortDir;
        }

        // Boolean comparison (true > false)
        if (typeof av === "boolean" && typeof bv === "boolean") {
            return (Number(av) - Number(bv)) * sortDir;
        }

        // Fallback to string compare
        return String(av).localeCompare(String(bv)) * sortDir;
    });

    const total = banners.length;
    const page = banners.slice(offset, offset + limit);

    /* -------------------------
       Mapping → API entity
    ------------------------- */
    const data = page.map((b: GuideBannerLean) => ({
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
        }, status: 200
    };

});