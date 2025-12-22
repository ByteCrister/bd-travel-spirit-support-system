// app/api/site-settings/v1/footer/social-links/[id]/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";

import ConnectDB from "@/config/db";
import SocialLinkSetting from "@/models/site-settings/socialLink.model";

import { socialLinkSchema } from "@/utils/validators/footer-settings.validator";
import type { SocialLinkDTO } from "@/types/footer-settings.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PUT: update a single social link
 */
export const PUT = withErrorHandler(async (req: NextRequest, { params }: Params) => {
    const id = decodeURIComponent((await params).id);

    await ConnectDB();

    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid social link id", 400);
    }

    const body = await req.json();
    const parsed = socialLinkSchema.safeParse({ ...body, id });

    if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        const firstError =
            Object.values(fieldErrors).flat().filter(Boolean)[0] ??
            "Validation failed";
        throw new ApiError(firstError, 400);
    }

    const payload = parsed.data;

    /**
     * 1. Update target document
     */
    const updated = await SocialLinkSetting.findByIdAndUpdate(
        id,
        {
            key: payload.key,
            label: payload.label ?? "",
            icon: payload.icon ?? "",
            url: payload.url,
            active: payload.active ?? true,
            order: payload.order ?? 0,
        },
        { new: true }
    );

    if (!updated) {
        throw new ApiError("Social link not found", 404);
    }

    /**
     * 2. Normalize all links (same behavior as singleton)
     */
    const allLinks = await SocialLinkSetting.find().lean();
    const normalized = SocialLinkSetting.normalizeAndAssignOrder(allLinks);

    await SocialLinkSetting.bulkWrite(
        normalized.map((l) => ({
            updateOne: {
                filter: { _id: l._id },
                update: {
                    active: l.active,
                    order: l.order,
                },
            },
        }))
    );

    /**
     * 3. Re-fetch final ordered list
     */
    const finalLinks = await SocialLinkSetting.find()
        .sort({ order: 1, createdAt: 1 })
        .lean();

    const list: SocialLinkDTO[] = finalLinks.map((s) => ({
        id: (s._id as Types.ObjectId).toString(),
        key: s.key,
        label: s.label ?? null,
        icon: s.icon ?? null,
        url: s.url,
        active: !!s.active,
        order: s.order ?? 0,
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
    }));

    const link: SocialLinkDTO = {
        id: updated._id.toString(),
        key: updated.key,
        label: updated.label ?? null,
        icon: updated.icon ?? null,
        url: updated.url,
        active: !!updated.active,
        order: updated.order ?? 0,
        createdAt: updated.createdAt
            ? updated.createdAt.toISOString()
            : null,
        updatedAt: updated.updatedAt
            ? updated.updatedAt.toISOString()
            : null,
    };

    return { data: { socialLinks: list, link }, status: 200 };
});

/**
 * DELETE: remove a single social link
 */
export const DELETE = withErrorHandler(async (_req: NextRequest, { params }: Params) => {
    const id = decodeURIComponent((await params).id);

    await ConnectDB();

    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid social link id", 400);
    }

    const deleted = await SocialLinkSetting.findByIdAndDelete(id);
    if (!deleted) {
        throw new ApiError("Social link not found", 404);
    }

    /**
     * Re-normalize remaining links
     */
    const remaining = await SocialLinkSetting.find().lean();
    const normalized = SocialLinkSetting.normalizeAndAssignOrder(remaining);

    if (normalized.length) {
        await SocialLinkSetting.bulkWrite(
            normalized.map((l) => ({
                updateOne: {
                    filter: { _id: l._id },
                    update: {
                        active: l.active,
                        order: l.order,
                    },
                },
            }))
        );
    }

    return { data: null, status: 200 };
});