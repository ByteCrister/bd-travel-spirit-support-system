// app/api/site-settings/v1/guide-subscriptions/[id]/route.ts
import { NextRequest } from "next/server";
import type {
    UpsertSubscriptionTierPayload,
} from "@/types/guide-subscription-settings.types";
import ConnectDB from "@/config/db";
import SiteSettings, { SubscriptionTier } from "@/models/site-settings.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { HydratedDocument } from "mongoose";
import { isValidObjectId } from "mongoose";

interface Params {
    params: Promise<{ id: string }>;
}

/* -------------------------
 PUT handler: upsertTier
------------------------- */
export const PUT = withErrorHandler(async (req: NextRequest, { params }: Params) => {
    await ConnectDB();

    const id = decodeURIComponent((await params).id);
    if (!id) throw new ApiError("Missing tier id param", 400);

    let payload: { tier: UpsertSubscriptionTierPayload };
    try {
        payload = await req.json();
    } catch {
        throw new ApiError("Invalid JSON", 400);
    }

    const tier = payload.tier as Partial<SubscriptionTier>;
    if (!tier.title || !tier.key) throw new ApiError("Missing required fields", 400);

    const doc = await SiteSettings.findOne();
    if (!doc) throw new ApiError("Settings not found", 404);

    const subDoc = doc.guideSubscriptions.find(
        (t) => t._id!.toString() === id
    ) as HydratedDocument<SubscriptionTier>;

    if (!subDoc) throw new ApiError("Tier not found", 404);

    // Update fields
    subDoc.set({
        ...tier,
        updatedAt: new Date(),
    });

    await doc.save();

    return {
        data: {
            tier: {
                ...subDoc.toObject(),
                _id: subDoc._id!.toString(),
                createdAt: subDoc.createdAt?.toISOString(),
                updatedAt: subDoc.updatedAt?.toISOString(),
            },
            updatedAt: doc.updatedAt?.toISOString(),
        },
        status: 200,
    };
});

/* -------------------------
 DELETE handler: removeTier
------------------------- */
export const DELETE = withErrorHandler(async (req: Request, { params }: Params) => {

    const { id } = await params;

    await ConnectDB();

    if (!id || !isValidObjectId(id)) {
        throw new ApiError("Invalid subscription id", 400);
    }

    const settings = await SiteSettings.findOne();
    if (!settings) {
        throw new ApiError("Settings not found", 404);
    }

    const before = settings.guideSubscriptions.length;
    settings.guideSubscriptions = settings.guideSubscriptions.filter(
        (tier) => tier._id?.toString() !== id
    );

    if (settings.guideSubscriptions.length === before) {
        throw new ApiError("Subscription tier not found", 404);
    }

    await settings.save();
    const updated = await SiteSettings.findOne().lean();

    return {
        data: {
            updatedAt: updated?.updatedAt?.toISOString()
        },
        status: 200,
    }

});