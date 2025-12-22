// app/api/site-settings/v1/guide-subscriptions/[id]/route.ts
import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import type { UpsertSubscriptionTierPayload } from "@/types/guide-subscription-settings.types";
import SubscriptionTierSetting, { ISubscriptionTierSetting } from "@/models/site-settings/subscriptionTier.model";

/* -------------------------
 PUT handler: upsertTier
------------------------- */
export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await ConnectDB();

    const id = (await params).id;
    if (!id || !isValidObjectId(id)) throw new ApiError("Invalid tier id", 400);

    let payload: { tier: UpsertSubscriptionTierPayload };
    try {
        payload = await req.json();
    } catch {
        throw new ApiError("Invalid JSON", 400);
    }

    const tier = payload.tier as Partial<ISubscriptionTierSetting>;
    if (!tier.key || !tier.title) throw new ApiError("Missing required fields: key, title", 400);

    const existingTier = await SubscriptionTierSetting.findById(id);
    if (!existingTier) throw new ApiError("Subscription tier not found", 404);

    // Update fields
    Object.assign(existingTier, {
        ...tier,
        updatedAt: new Date(),
    });

    await existingTier.save();

    return {
        data: {
            tier: {
                ...existingTier.toObject(),
                _id: existingTier._id.toString(),
                createdAt: existingTier.createdAt?.toISOString(),
                updatedAt: existingTier.updatedAt?.toISOString(),
            },
        },
        status: 200,
    };
});

/* -------------------------
 DELETE handler: removeTier
------------------------- */
export const DELETE = withErrorHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    if (!id || !isValidObjectId(id)) throw new ApiError("Invalid subscription id", 400);

    await ConnectDB();

    const deleted = await SubscriptionTierSetting.findByIdAndDelete(id);
    if (!deleted) throw new ApiError("Subscription tier not found", 404);

    return {
        data: {
            updatedAt: deleted.updatedAt?.toISOString(),
        },
        status: 200,
    };
});