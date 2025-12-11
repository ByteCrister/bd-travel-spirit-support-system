// app/api/site-settings/footer/locations/[key]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { locationSchema } from "@/utils/validators/footer-settings.validator";
import SiteSettings from "@/models/site-settings.model";

interface Params {
    params: Promise<{ key: string }>;
}

/**
 * PUT: upsert location by key (atomic). Creates if missing, updates if exists.
 */
export async function PUT(req: NextRequest, { params }: Params) {
    const key = decodeURIComponent((await params).key);

    try {
        const body = await req.json();
        const parsed = locationSchema.safeParse({ ...body, key });
        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid location payload", errors: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        await ConnectDB();

        const existingKeyOwner = await SiteSettings.findOne({
            "locations.key": parsed.data.key
        }, {
            "locations.$": 1
        }).lean();

        // If exists AND key in URL is NOT an update (i.e., creating new)
        if (existingKeyOwner && req.method === "PUT") {
            // If existing entry is different than the one being updated (based on _id check)
            if (existingKeyOwner.locations?.[0]?.key === parsed.data.key) {
                // This is fine — the user is updating existing by key
            } else {
                return NextResponse.json(
                    { message: "Location key must be unique" },
                    { status: 409 }
                );
            }
        }

        const now = new Date();

        // Build incoming location object
        const incoming = {
            _id: new Types.ObjectId(),
            key: parsed.data.key,
            country: parsed.data.country,
            region: parsed.data.region ?? undefined,
            city: parsed.data.city ?? undefined,
            slug: parsed.data.slug ?? undefined,
            lat: parsed.data.lat,
            lng: parsed.data.lng,
            active: parsed.data.active ?? true,
            location: parsed.data.location ?? undefined,
            createdAt: now,
            updatedAt: now,
        };

        // Atomic update WITHOUT versioning / changelog
        const updatedDoc = await SiteSettings.findOneAndUpdate(
            {},
            [
                {
                    $set: {
                        locations: {
                            $let: {
                                vars: {
                                    existing: { $ifNull: ["$locations", []] },
                                    found: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ["$locations", []] },
                                                as: "l",
                                                cond: { $eq: ["$$l.key", parsed.data.key] }
                                            }
                                        }
                                    }
                                },
                                in: {
                                    $cond: [
                                        { $gt: ["$$found", 0] },
                                        {
                                            $map: {
                                                input: "$$existing",
                                                as: "l",
                                                in: {
                                                    $cond: [
                                                        { $eq: ["$$l.key", parsed.data.key] },
                                                        {
                                                            $mergeObjects: [
                                                                "$$l",
                                                                {
                                                                    country: incoming.country,
                                                                    region: incoming.region,
                                                                    city: incoming.city,
                                                                    slug: incoming.slug,
                                                                    lat: incoming.lat,
                                                                    lng: incoming.lng,
                                                                    active: incoming.active,
                                                                    location: incoming.location,
                                                                    updatedAt: now
                                                                }
                                                            ]
                                                        },
                                                        "$$l"
                                                    ]
                                                }
                                            }
                                        },
                                        { $concatArrays: ["$$existing", [incoming]] }
                                    ]
                                }
                            }
                        }
                    }
                }
            ],
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        ).lean();

        if (!updatedDoc) {
            return NextResponse.json({ message: "Failed to upsert location" }, { status: 500 });
        }

        const found = (updatedDoc.locations ?? []).find((l) => l.key === parsed.data.key) ?? null;
        return NextResponse.json(found, { status: 200 });

    } catch (err) {
        console.error("PUT /api/site-settings/footer/locations/[key] error:", err);
        return NextResponse.json({ message: "Failed to save location" }, { status: 500 });
    }
}

/**
 * DELETE: remove location by key (atomic)
 */
export async function DELETE(req: NextRequest, { params }: Params) {
    const key = decodeURIComponent((await params).key);

    try {

        await ConnectDB();

        const updatedDoc = await SiteSettings.findOneAndUpdate(
            {},
            [
                {
                    $set: {
                        locations: {
                            $filter: {
                                input: { $ifNull: ["$locations", []] },
                                as: "l",
                                cond: { $ne: ["$$l.key", key] }
                            }
                        }
                    }
                }
            ],
            { upsert: false, returnDocument: "after", setDefaultsOnInsert: true }
        ).lean();

        if (!updatedDoc) {
            return NextResponse.json({ message: "Site settings not found" }, { status: 404 });
        }

        const stillExists = (updatedDoc.locations ?? []).some((l) => l.key === key);
        if (stillExists) {
            return NextResponse.json({ message: "Failed to delete location" }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err) {
        console.error("DELETE /api/site-settings/footer/locations/[key] error:", err);
        return NextResponse.json({ message: "Failed to delete location" }, { status: 500 });
    }
}