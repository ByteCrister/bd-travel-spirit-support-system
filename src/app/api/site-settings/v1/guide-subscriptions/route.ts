// app/api/site-settings/v1/guide-subscriptions/route.ts
import { NextRequest } from "next/server";
import type {
    SubscriptionTierDTO,
    UpsertSubscriptionTierPayload,
} from "@/types/guide-subscription-settings.types";
import ConnectDB from "@/config/db";
import SiteSettings, { ISiteSettings, SubscriptionTier } from "@/models/site-settings.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { HydratedDocument } from "mongoose";

/* -------------------------
 Utility: map mongoose doc to DTO
------------------------- */
function mapTierToDto(t: SubscriptionTier): SubscriptionTierDTO {
    return {
        _id: t._id?.toString() ?? "",
        key: t.key,
        title: t.title,
        price: t.price,
        currency: t.currency,
        billingCycleDays: Array.isArray(t.billingCycleDays) ? t.billingCycleDays.map(Number) : [],
        perks: Array.isArray(t.perks) ? t.perks : [],
        active: Boolean(t.active),
        createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : undefined,
        updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : undefined,
    };
}

/* -------------------------
 GET handler: fetchAll
------------------------- */
export const GET = withErrorHandler(async (request: NextRequest) => {

    await ConnectDB();

    const url = new URL(request.url);
    const onlyActive = url.searchParams.get("onlyActive") === "1";
    const search = (url.searchParams.get("search") ?? "").trim();
    const sortBy = (url.searchParams.get("sortBy") as
        | "price"
        | "title"
        | "createdAt"
        | null) ?? "title";
    const sortDir = (url.searchParams.get("sortDir") as "asc" | "desc") ?? "asc";

    // Fetch the singleton site settings
    const doc = await SiteSettings.findOne().lean();
    const version = doc?.updatedAt ? Math.floor(new Date(doc.updatedAt).getTime() / 1000) : 0;
    const updatedAt = doc?.updatedAt instanceof Date ? doc.updatedAt.toISOString() : undefined;

    let tiers: SubscriptionTier[] = Array.isArray(doc?.guideSubscriptions) ? [...doc.guideSubscriptions] : [];

    // Apply server-side filters
    if (onlyActive) {
        tiers = tiers.filter(t => t.active);
    }
    if (search.length > 0) {
        const s = search.toLowerCase();
        tiers = tiers.filter(t => (t.title ?? "").toLowerCase().includes(s) || (t.key ?? "").toLowerCase().includes(s));
    }

    // Sorting
    tiers.sort((a, b) => {
        let av: string | number = "";
        let bv: string | number = "";

        switch (sortBy) {
            case "price":
                av = a.price ?? 0;
                bv = b.price ?? 0;
                break;
            case "createdAt":
                av = a.createdAt?.getTime() ?? 0;
                bv = b.createdAt?.getTime() ?? 0;
                break;
            default:
                av = (a.title ?? "").toLowerCase();
                bv = (b.title ?? "").toLowerCase();
        }

        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
    });

    const dtoList: SubscriptionTierDTO[] = tiers.map(mapTierToDto);

    return {
        data: {
            guideSubscriptions: dtoList,
            version,
            updatedAt,
        },
        status: 200,
    }
})

/* -------------------------
 POST handler: upsertTier
------------------------- */
export const POST = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    let payload: { tier: UpsertSubscriptionTierPayload };
    try {
        payload = await req.json();
    } catch {
        throw new ApiError("Invalid JSON", 400);
    }

    const tier = payload.tier as Partial<SubscriptionTier>;
    if (!tier.key || !tier.title) {
        throw new ApiError("Missing required fields: key, title", 400);
    }

    let doc: ISiteSettings | null = await SiteSettings.findOne();
    if (!doc) {
        doc = await SiteSettings.create({});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id: _, ...tierData } = tier;
    // Create new tier
    const toInsert = {
        ...tierData,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as SubscriptionTier;

    // Push as Mongoose subdocument
    doc.guideSubscriptions.push(toInsert);

    // Save the document
    await doc.save();

    // Get the last inserted tier (Mongoose subdoc)
    const inserted = doc.guideSubscriptions[doc.guideSubscriptions.length - 1] as HydratedDocument<SubscriptionTier>;

    return {
        data: {
            tier: {
                ...inserted.toObject(),
                _id: inserted._id!.toString(),
                createdAt: inserted.createdAt?.toISOString(),
                updatedAt: inserted.updatedAt?.toISOString(),
            },
            updatedAt: doc.updatedAt?.toISOString(),
        },
        status: 201,
    }
});