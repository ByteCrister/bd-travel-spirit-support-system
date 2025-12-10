// app/api/site-settings/footer/social-links/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/user-id.session.auth";
import { socialLinkSchema } from "@/utils/validators/footer-settings.validator";
import SiteSettings from "@/models/site-settings.model";

/**
 * PUT: update a single social link (atomic)
 */
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    try {
        // parse body and validate first (fail fast)
        const body = await req.json();
        const parsed = socialLinkSchema.safeParse({ ...body, id });
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid social link payload", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        // authorize before DB work
        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // ensure DB connection (ConnectDB should be idempotent / cached)
        await ConnectDB();

        // prepare values
        const now = new Date();
        // prefer provided id param; if it's not a valid ObjectId we'll still try to match by key
        let matchObjectId: Types.ObjectId | null = null;
        try {
            matchObjectId = new Types.ObjectId(id);
        } catch {
            matchObjectId = null;
        }

        // normalized update fields for the matched subdocument
        const updatedFields = {
            key: parsed.data.key,
            label: parsed.data.label ?? null,
            icon: parsed.data.icon ?? null,
            url: parsed.data.url,
            active: typeof parsed.data.active === "boolean" ? parsed.data.active : undefined,
            order: typeof parsed.data.order === "number" ? parsed.data.order : undefined,
            updatedAt: now,
        };

        // Atomic update pipeline:
        // - replace matching socialLinks element using $map + $mergeObjects
        const updatedDoc = await SiteSettings.findOneAndUpdate(
            {},
            [
                {
                    $set: {
                        socialLinks: {
                            $map: {
                                input: { $ifNull: ["$socialLinks", []] },
                                as: "s",
                                in: {
                                    $cond: [
                                        {
                                            $or: [
                                                ...(matchObjectId ? [{ $eq: ["$$s._id", matchObjectId] }] : []),
                                                { $eq: ["$$s.key", parsed.data.key] }
                                            ]
                                        },
                                        {
                                            $mergeObjects: [
                                                "$$s",
                                                Object.fromEntries(
                                                    Object.entries(updatedFields).filter(([, v]) => v !== undefined)
                                                ),
                                            ],
                                        },
                                        "$$s",
                                    ],
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
            return NextResponse.json({ message: "Site settings not found" }, { status: 404 });
        }

        // find the updated social link by _id (if matched) or by key
        const found = (updatedDoc.socialLinks ?? []).find((s) =>
            (matchObjectId ? String(s._id) === String(matchObjectId) : false) || s.key === parsed.data.key
        ) ?? null;

        if (!found) {
            // If we didn't find a matching element after the update, return 404
            return NextResponse.json({ message: "Social link not found after update" }, { status: 404 });
        }

        return NextResponse.json(found, { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("PUT /api/site-settings/footer/social-links/[id] error:", err);
        return NextResponse.json({ message: "Failed to update social link" }, { status: 500 });
    }
}

/**
 * DELETE: remove a single social link (atomic)
 */
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    const { id } = context.params;
    try {
        // authorize first
        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // ensure DB connection
        await ConnectDB();

        // attempt to parse id as ObjectId for matching
        let matchObjectId: Types.ObjectId | null = null;
        try {
            matchObjectId = new Types.ObjectId(id);
        } catch {
            matchObjectId = null;
        }

        // Atomic pipeline to remove the matching element and bump version + changelog
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
            return NextResponse.json({ message: "Site settings not found" }, { status: 404 });
        }

        // Determine whether deletion actually removed anything by checking if the id/key still exists
        const stillExists = (updatedDoc.socialLinks ?? []).some((s) =>
            (matchObjectId ? String(s._id) === String(matchObjectId) : false) || s.key === id
        );

        if (stillExists) {
            // If it still exists, something went wrong
            return NextResponse.json({ message: "Failed to delete social link" }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        if (err instanceof Response) return err;
        console.error("DELETE /api/site-settings/footer/social-links/[id] error:", err);
        return NextResponse.json({ message: "Failed to delete social link" }, { status: 500 });
    }
}