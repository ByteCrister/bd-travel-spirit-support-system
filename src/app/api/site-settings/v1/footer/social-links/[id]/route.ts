// app/api/site-settings/footer/social-links/[id]/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { socialLinkSchema } from "@/utils/validators/footer-settings.validator";
import SiteSettings from "@/models/site-settings.model";
import { SocialLinkDTO } from "@/types/footer-settings.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PUT: update a single social link (atomic)
 */
export const PUT = withErrorHandler(async (req: NextRequest, { params }: Params) => {

    const id = decodeURIComponent((await params).id);

    await ConnectDB();

    const body = await req.json();
    const parsed = socialLinkSchema.safeParse({ ...body, id });
    if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;

        const firstError =
            Object.values(fieldErrors)
                .flat()
                .filter(Boolean)[0] ?? "Validation failed";

        throw new ApiError(firstError, 400);
    }

    const payload = parsed.data;

    const existing = await SiteSettings.findOne().lean();
    if (!existing) throw new ApiError("Site settings not found", 404);

    const current = existing.socialLinks ?? [];
    const targetIndex = current.findIndex((s) => String(s._id) === id);
    if (targetIndex === -1) throw new ApiError("Social link not found", 404);

    current[targetIndex] = {
        ...current[targetIndex],
        key: payload.key,
        label: payload.label ?? "",
        icon: payload.icon ?? "",
        url: payload.url,
        active: payload.active ?? true,
        order: payload.order ?? current[targetIndex].order ?? 0,
        updatedAt: new Date(),
    };

    const saved = await SiteSettings.upsertSingleton({ socialLinks: current });

    const savedEntry = saved.socialLinks.find((s) => String(s._id) === id) || current[targetIndex];

    const dto: SocialLinkDTO = {
        id: String(savedEntry._id),
        key: savedEntry.key,
        label: savedEntry.label,
        icon: savedEntry.icon,
        url: savedEntry.url,
        active: savedEntry.active,
        order: savedEntry.order,
        createdAt: savedEntry.createdAt ? new Date(savedEntry.createdAt).toISOString() : null,
        updatedAt: savedEntry.updatedAt ? new Date(savedEntry.updatedAt).toISOString() : null,
    };

    const list: SocialLinkDTO[] = saved.socialLinks.map((s) => ({
        id: String(s._id),
        key: s.key,
        label: s.label,
        icon: s.icon,
        url: s.url,
        active: s.active,
        order: Number(s.order ?? 0),
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
    }));

    return { data: { socialLinks: list, link: dto }, status: 200 };
});


/**
 * DELETE: remove a single social link (atomic)
 */
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: Params) => {
    const id = decodeURIComponent((await params).id);
    await ConnectDB();

    let matchObjectId: Types.ObjectId | null = null;
    try {
        matchObjectId = new Types.ObjectId(id);
    } catch {
        matchObjectId = null;
    }

    const updatedDoc = await SiteSettings.findOneAndUpdate(
        {},
        [
            {
                $set: {
                    socialLinks: {
                        $filter: {
                            input: { $ifNull: ["$socialLinks", []] },
                            as: "s",
                            cond: {
                                $not: {
                                    $or: [
                                        ...(matchObjectId ? [{ $eq: ["$$s._id", matchObjectId] }] : []),
                                        { $eq: ["$$s.key", id] },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
        ],
        {
            upsert: false,
            returnDocument: "after",
            setDefaultsOnInsert: true,
        }
    ).lean();


    if (!updatedDoc) {
        throw new ApiError("Site settings not found", 404);
    }

    const stillExists = (updatedDoc.socialLinks ?? []).some((s) =>
        (matchObjectId ? String(s._id) === String(matchObjectId) : false) || s.key === id
    );

    if (stillExists) {
        throw new ApiError("Failed to delete social link", 500);

    }
    return { data: null, status: 200 };
})