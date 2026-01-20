// app/api/site-settings/v1/footer/route.ts
import ConnectDB from "@/config/db";
import { Types } from "mongoose";

import SocialLinkSetting, { ISocialLinkSetting } from "@/models/site-settings/socialLink.model";
import LocationSetting, { ILocationEntry } from "@/models/site-settings/location.model";

import type { FooterSettingsDTO } from "@/types/footer-settings.types";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { Lean } from "@/types/mongoose-lean.types";

/**
 * GET: returns FooterSettingsDTO (data only)
 */
export const GET = withErrorHandler(async () => {
    await ConnectDB();

    const [socialLinks, locations] = await Promise.all([
        SocialLinkSetting.find({ deleteAt: null })
            .sort({ order: 1, createdAt: 1 })
            .lean(),

        LocationSetting.find({ deleteAt: null })
            .sort({ createdAt: 1 })
            .lean(),
    ]);

    if (!socialLinks.length && !locations.length) {
        throw new ApiError("No footer settings found", 404);
    }

    const dto: FooterSettingsDTO = {
        id: undefined, // no singleton document anymore

        socialLinks: socialLinks.map((s: Lean<ISocialLinkSetting>) => ({
            id: (s._id as Types.ObjectId)?.toString(),
            key: s.key,
            label: s.label ?? null,
            icon: s.icon ?? null,
            url: s.url,
            active: !!s.active,
            order: typeof s.order === "number" ? s.order : null,
            createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
            updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : null,
        })),

        locations: locations.map((l: Lean<ILocationEntry>) => ({
            id: (l._id as Types.ObjectId)?.toString(),
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

        createdAt: null,
        updatedAt: null,
    };

    return { data: dto, status: 200 };
});