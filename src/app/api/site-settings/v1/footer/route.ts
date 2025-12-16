// app/api/site-settings/footer/route.ts
import ConnectDB from "@/config/db";
import SiteSettings, { ISiteSettings } from "@/models/site-settings.model";
import type {
    FooterSettingsDTO,
} from "@/types/footer-settings.types";
import { Lean } from "@/types/mongoose-lean.types";
import { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET: returns FooterSettingsDTO (data only)
 */
export const GET = withErrorHandler(async () => {

    await ConnectDB();
    const doc: Lean<ISiteSettings> | null = await SiteSettings.findOne()
        .lean();

    if (!doc) {
        throw new ApiError("No site settings found", 404);
    }

    const dto: FooterSettingsDTO = {
        id: doc._id?.toString(),
        socialLinks: (doc.socialLinks ?? []).map((s) => ({
            id: (s._id as Types.ObjectId)?.toString() ?? undefined,
            key: s.key,
            label: s.label ?? null,
            icon: s.icon ?? null,
            url: s.url,
            active: !!s.active,
            order: typeof s.order === "number" ? s.order : null,
            createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
            updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
        })),
        locations: (doc.locations ?? []).map((l) => ({
            id: (l._id as Types.ObjectId)?.toString() ?? undefined,
            key: l.key,
            country: l.country,
            region: l.region ?? null,
            city: l.city ?? null,
            slug: l.slug ?? null,
            lat: l.lat,
            lng: l.lng,
            active: !!l.active,
            location: l.location ?? null,
        })),
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
    };

    return { data: dto, status: 200 };
})