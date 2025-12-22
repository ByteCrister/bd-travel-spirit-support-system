// app/api/site-settings/v1/guide-subscriptions/route.ts
import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import type { SubscriptionTierDTO, UpsertSubscriptionTierPayload } from "@/types/guide-subscription-settings.types";
import SubscriptionTierSetting, { ISubscriptionTierSetting } from "@/models/site-settings/subscriptionTier.model";

/* -------------------------
 Utility: map mongoose doc to DTO
------------------------- */
function mapTierToDto(t: ISubscriptionTierSetting): SubscriptionTierDTO {
    return {
        _id: t._id!.toString(),
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
 GET handler: fetchAll tiers
------------------------- */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const url = new URL(request.url);
    const onlyActive = url.searchParams.get("onlyActive") === "1";
    const search = (url.searchParams.get("search") ?? "").trim();
    const sortBy = (url.searchParams.get("sortBy") as "price" | "title" | "createdAt" | null) ?? "title";
    const sortDir = (url.searchParams.get("sortDir") as "asc" | "desc") ?? "asc";

    // Fetch all tiers
    let tiers: ISubscriptionTierSetting[] = await SubscriptionTierSetting.find().lean();

    // Apply server-side filters
    if (onlyActive) tiers = tiers.filter(t => t.active);
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

    const updatedAt = tiers.length > 0 ? tiers[0].updatedAt?.toISOString() : undefined;
    const version = tiers.length > 0 && tiers[0].updatedAt ? Math.floor(new Date(tiers[0].updatedAt).getTime() / 1000) : 0;

    return {
        data: { guideSubscriptions: dtoList, version, updatedAt },
        status: 200,
    };
});

/* -------------------------
 POST handler: upsertTier
------------------------- */
/* -------------------------
 POST handler: create/upsert tier
------------------------- */
export const POST = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    let payload: { tier: UpsertSubscriptionTierPayload };
    try {
        payload = await req.json();
    } catch {
        throw new ApiError("Invalid JSON", 400);
    }

    console.log(payload);

    const tier = payload.tier as Partial<ISubscriptionTierSetting>;
    if (!tier.key || !tier.title) {
        throw new ApiError("Missing required fields: key, title", 400);
    }

    // Use the model's upsertByKey helper
    const savedTier = await SubscriptionTierSetting.upsertByKey(tier);

    return {
        data: { tier: mapTierToDto(savedTier) },
        status: 201,
    };
});