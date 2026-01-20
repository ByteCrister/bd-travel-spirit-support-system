// app/api/site-settings/v1/footer/social-links/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import SocialLinkSetting from "@/models/site-settings/socialLink.model";

import { socialLinkSchema } from "@/utils/validators/footer-settings.validator";
import type { SocialLinkDTO } from "@/types/footer-settings.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

// Add social link
export const POST = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    const body = await req.json();
    const parsed = socialLinkSchema.safeParse(body);

    if (!parsed.success) {
        throw new ApiError("Invalid social link payload", 400);
    }

    const payload = parsed.data;

    /**
     * 1. Create new social link document
     */
    const created = await SocialLinkSetting.create({
        key: payload.key,
        label: payload.label ?? "",
        icon: payload.icon ?? "",
        url: payload.url,
        active: payload.active ?? true,
        order: payload.order ?? 0,
    });

    /**
     * 2. Re-normalize ordering + active flags (same logic as old singleton)
     */
    const allLinks = await SocialLinkSetting.find().lean();
    const normalized = SocialLinkSetting.normalizeAndAssignOrder(allLinks);

    /**
     * 3. Persist normalization results
     *    (only update fields that may change)
     */
    const bulkOps = normalized.map((l) => ({
        updateOne: {
            filter: { _id: l._id },
            update: {
                active: l.active,
                order: l.order,
            },
        },
    }));

    if (bulkOps.length) {
        await SocialLinkSetting.bulkWrite(bulkOps);
    }

    /**
     * 4. Re-fetch final ordered list
     */
    const finalLinks = await SocialLinkSetting.find({ deleteAt: null })
        .sort({ order: 1, createdAt: 1 })
        .lean();

    /**
     * 5. Build DTOs
     */
    const list: SocialLinkDTO[] = finalLinks.map((s) => ({
        id: (s._id as Types.ObjectId).toString(),
        key: s.key,
        label: s.label ?? null,
        icon: s.icon ?? null,
        url: s.url,
        active: !!s.active,
        order: typeof s.order === "number" ? s.order : 0,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
    }));

    const link: SocialLinkDTO = {
        id: (created._id as Types.ObjectId).toString(),
        key: created.key,
        label: created.label ?? null,
        icon: created.icon ?? null,
        url: created.url,
        active: !!created.active,
        order: created.order ?? 0,
        createdAt: created.createdAt
            ? created.createdAt.toISOString()
            : null,
        updatedAt: created.updatedAt
            ? created.updatedAt.toISOString()
            : null,
    };

    return {
        data: { socialLinks: list, link },
        status: 201,
    };
});