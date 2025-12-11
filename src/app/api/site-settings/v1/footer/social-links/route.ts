// app/api/site-settings/footer/social-links/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import { socialLinkSchema } from "@/utils/validators/footer-settings.validator";
import SiteSettings from "@/models/site-settings.model";
import { SocialLinkDTO } from "@/types/footer-settings.types";

export async function POST(req: NextRequest) {
    try {
        await ConnectDB();

        const body = await req.json();
        const parsed = socialLinkSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid social link payload", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const payload = parsed.data;

        const newId = new mongoose.Types.ObjectId();
        const newEntry = {
            _id: newId,
            key: payload.key,
            label: payload.label ?? "",
            icon: payload.icon ?? "",
            url: payload.url,
            active: payload.active ?? true,
            order: payload.order ?? 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Merge with existing social links
        const existingSettings = await SiteSettings.findOne().lean();
        const merged = [...(existingSettings?.socialLinks ?? []), newEntry];

        // Save via upsertSingleton
        const saved = await SiteSettings.upsertSingleton({ socialLinks: merged });

        const savedEntry =
            saved.socialLinks.find((s) => String(s._id) === String(newId)) || newEntry;

        // Convert to DTO
        const dto: SocialLinkDTO = {
            id: String(savedEntry._id),
            key: savedEntry.key,
            label: savedEntry.label,
            icon: savedEntry.icon,
            url: savedEntry.url,
            active: savedEntry.active,
            order: savedEntry.order,
            createdAt: savedEntry.createdAt ? savedEntry.createdAt.toISOString() : null,
            updatedAt: savedEntry.updatedAt ? savedEntry.updatedAt.toISOString() : null,
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

        return NextResponse.json({ socialLinks: list, link: dto }, { status: 201 });

    } catch (err) {
        console.error("POST /api/site-settings/footer/social-links error:", err);
        return NextResponse.json({ message: "Failed to create social link" }, { status: 500 });
    }
}