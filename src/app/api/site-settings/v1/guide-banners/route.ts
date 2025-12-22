// app/api/site-settings/v1/guide-banners/route.ts
import { NextRequest } from "next/server";

import ConnectDB from "@/config/db";
import GuideBannerSetting from "@/models/site-settings/guideBanner.model";
import "@/models/asset.model";

import type { IAsset } from "@/models/asset.model";
import { GUIDE_BANNER_SORT_KEYS, type GuideBannerSortKey } from "@/types/guide-banner-settings.types";
import { Lean } from "@/types/mongoose-lean.types";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { GuideBanner } from "@/models/site-settings.model";

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
------------------------- */
export const GET = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    const { limit, offset, sortBy, sortDir, active, search } = parseQuery(req);

    /* -------------------------
       Mongo-level filters
    ------------------------- */
    const filter: Record<string, unknown> = {};

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