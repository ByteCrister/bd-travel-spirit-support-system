// app/api/site-settings/footer/social-links/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/user-id.session.auth";
import { socialLinkSchema } from "@/utils/validators/footer-settings.validator";
import SiteSettings from "@/models/site-settings.model";

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromSession();
        await ConnectDB();

        const body = await req.json();
        const parsed = socialLinkSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid social link payload", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const current = await SiteSettings.findOne().sort({ version: -1 }).lean();
        const currentSocial = current?.socialLinks ?? [];
        const newId = new mongoose.Types.ObjectId();

        const newEntry = {
            _id: newId,
            key: parsed.data.key,
            label: parsed.data.label ?? "",
            icon: parsed.data.icon ?? "",
            url: parsed.data.url,
            active: typeof parsed.data.active === "boolean" ? parsed.data.active : true,
            order: parsed.data.order ?? 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedSocial = [...currentSocial, newEntry];

        const saved = await SiteSettings.upsertSingleton({ socialLinks: updatedSocial }, new mongoose.Types.ObjectId(userId), "Create social link");

        // find created link (best effort: match key+url)
        const createdLink = (saved.socialLinks ?? []).find((s) => String(s._id) === String(newId)) ?? null;
        return NextResponse.json(createdLink, { status: 201 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.log("POST /api/site-settings/footer/social-links error:", err);
        return NextResponse.json({ message: "Failed to create social link" }, { status: 500 });
    }
}
