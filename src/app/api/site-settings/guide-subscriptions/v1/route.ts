// app/api/site-settings/v1/guide-subscriptions/route.ts
import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import type { SubscriptionTierDTO, UpsertSubscriptionTierPayload } from "@/types/site-settings/guide-subscription-settings.types";
import SubscriptionTierSetting, { ISubscriptionTierSetting } from "@/models/site-settings/subscriptionTier.model";
import { FilterQuery } from "mongoose";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";

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
function escapeRegex(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/* -------------------------
 GET handler: fetchAll tiers
------------------------- */
export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const url = new URL(request.url);
    const onlyActive = url.searchParams.get("onlyActive") === "true";
    const search = sanitizeSearch((url.searchParams.get("search") ?? "").trim()) ?? "";
    const sortBy = (url.searchParams.get("sortBy") as "price" | "title" | "createdAt" | null) ?? "title";
    const sortDir = (url.searchParams.get("sortDir") as "asc" | "desc") ?? "asc";

    // Build query - exclude soft-deleted by default
    const query: FilterQuery<ISubscriptionTierSetting> = {};

    // fetch items which are not deleted only
    query.deletedAt = null;

    // Apply active filter
    if (onlyActive) {
        query.active = true;
    }

    // Apply search filter using MongoDB regex (case-insensitive)
    if (search.length > 0) {
        const escaped = escapeRegex(search);
        const regex = new RegExp(escaped, "i");

        const orConditions: FilterQuery<ISubscriptionTierSetting>[] = [
            { title: regex },
            { key: regex },
            { perks: { $elemMatch: { $regex: regex } } },
        ];

        // If search contains any digit → allow numeric "contains" search
        if (/\d/.test(search)) {
            orConditions.push(
                {
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$price" },
                            regex: escaped,
                        },
                    },
                },

                // billingCycleDays numeric contains
                {
                    $expr: {
                        $anyElementTrue: {
                            $map: {
                                input: "$billingCycleDays",
                                as: "day",
                                in: {
                                    $regexMatch: {
                                        input: { $toString: "$$day" },
                                        regex: escaped,
                                    },
                                },
                            },
                        },
                    },
                }
            );
        }

        query.$or = orConditions;
    }

    // Build sort object
    const sortOptions: Record<string, 1 | -1> = {};

    switch (sortBy) {
        case "price":
            sortOptions.price = sortDir === "asc" ? 1 : -1;
            break;
        case "createdAt":
            sortOptions.createdAt = sortDir === "asc" ? 1 : -1;
            break;
        default: // "title"
            sortOptions.title = sortDir === "asc" ? 1 : -1;
    }

    // Execute optimized query with filtering and sorting in MongoDB
    const tiers: ISubscriptionTierSetting[] = await SubscriptionTierSetting
        .find(query)
        .sort(sortOptions)
        .lean()
        .exec();

    const dtoList: SubscriptionTierDTO[] = tiers.map(mapTierToDto);

    // Calculate version based on latest updatedAt
    const latestUpdate = tiers.reduce((latest, tier) => {
        const tierTime = tier.updatedAt?.getTime() || 0;
        return tierTime > latest ? tierTime : latest;
    }, 0);

    const version = Math.floor(latestUpdate / 1000);
    const updatedAt = latestUpdate > 0 ? new Date(latestUpdate).toISOString() : undefined;

    return {
        data: { guideSubscriptions: dtoList, version, updatedAt },
        status: 200,
    };
});

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