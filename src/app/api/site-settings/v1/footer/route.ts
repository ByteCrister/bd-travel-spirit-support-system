// app/api/site-settings/footer/route.ts
import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import SiteSettings, { ISiteSettings } from "@/models/site-settings.model";
import { FooterSettingsInputSchema } from "@/utils/validators/footer-settings.validator";
import type {
    FooterSettingsDTO,
    FooterSettingsInput,
} from "@/types/footer-settings.types";
import { Lean } from "@/types/mongoose-lean.types";
import { Types } from "mongoose";

/**
 * GET: returns FooterSettingsDTO (data only)
 */
export async function GET() {
    try {
        await ConnectDB();
        const doc: Lean<ISiteSettings> | null = await SiteSettings.findOne()
            .lean();

        if (!doc) {
            return NextResponse.json(
                { message: "No site settings found" },
                { status: 404 }
            );
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

        return NextResponse.json(dto, { status: 200 });
    } catch (err) {
        console.error("GET /api/site-settings/footer error:", err);
        return NextResponse.json(
            { message: "Failed to fetch footer settings" },
            { status: 500 }
        );
    }
}

/**
 * POST: upsert full footer settings (requires auth). Returns FooterSettingsDTO (data only).
 */
export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body: unknown = await req.json();
        const parsed = FooterSettingsInputSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    message: "Invalid payload",
                    errors: parsed.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const payload: FooterSettingsInput = parsed.data;

        // Convert `null` values to `undefined` to satisfy Mongoose
        const normalizedPayload: Partial<ISiteSettings> = {
            ...payload,
            socialLinks: payload.socialLinks?.map((s) => ({
                key: s.key,
                url: s.url,
                label: s.label ?? "", // convert null -> undefined
                icon: s.icon ?? "", // convert null -> undefined
                active: s.active ?? true,
                order: s.order ?? 0,
            })),
            locations: payload.locations?.map((l) => ({
                key: l.key,
                country: l.country,
                region: l.region ?? undefined, // convert null -> undefined
                city: l.city ?? undefined,
                slug: l.slug ?? undefined,
                lat: l.lat,
                lng: l.lng,
                active: l.active ?? true,
                location: l.location ?? undefined, // convert null -> undefined
            })),
        };

        const saved: Lean<ISiteSettings> = await SiteSettings.upsertSingleton(
            normalizedPayload,
        );

        const dto: FooterSettingsDTO = {
            id: saved._id?.toString(),
            socialLinks: (saved.socialLinks ?? []).map((s) => ({
                id: (s._id as Types.ObjectId)?.toString() ?? undefined,
                key: s.key,
                label: s.label ?? null,
                icon: s.icon ?? null,
                url: s.url,
                active: !!s.active,
                order: typeof s.order === "number" ? s.order : null,
                createdAt: s.createdAt?.toISOString() ?? null,
                updatedAt: s.updatedAt?.toISOString() ?? null,
            })),
            locations: (saved.locations ?? []).map((l) => ({
                key: l.key,
                country: l.country,
                region: l.region ?? null,
                city: l.city ?? null,
                slug: l.slug ?? null,
                lat: l.lat,
                lng: l.lng,
                active: !!l.active,
                location: l.location ?? null,
                createdAt: l.createdAt?.toISOString() ?? null,
                updatedAt: l.updatedAt?.toISOString() ?? null,
            })),
            createdAt: saved.createdAt?.toISOString() ?? null,
            updatedAt: saved.updatedAt?.toISOString() ?? null,
        };

        return NextResponse.json(dto, { status: 200 });
    } catch (err) {
        console.error("POST /api/site-settings/footer error:", err);
        return NextResponse.json(
            { message: "Failed to save footer settings" },
            { status: 500 }
        );
    }
}