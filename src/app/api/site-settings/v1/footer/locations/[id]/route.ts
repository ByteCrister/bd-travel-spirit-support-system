// app/api/site-settings/footer/locations/[id]/route.ts
import { NextRequest } from "next/server";
import { isValidObjectId, Types } from "mongoose";
import ConnectDB from "@/config/db";
import { locationSchema } from "@/utils/validators/footer-settings.validator";
import SiteSettings, { LocationEntry } from "@/models/site-settings.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PUT: create or update location by id
 */
export const PUT = withErrorHandler(async (req: NextRequest, { params }: Params) => {
    const rawId = decodeURIComponent((await params).id);
    const isCreate = rawId === "new" || !rawId;
    const locationId = isCreate ? new Types.ObjectId() : new Types.ObjectId(rawId);

    await ConnectDB();

    const body = await req.json();
    const parsed = locationSchema.safeParse({ ...body, id: locationId.toString() });

    if (!parsed.success) {
        const first =
            Object.values(parsed.error.flatten().fieldErrors)
                .flat()
                .filter(Boolean)[0] ?? "Invalid location payload";
        throw new ApiError(first, 400);
    }

    /** Enforce unique key (except for same id) */
    const keyConflict = await SiteSettings.findOne(
        {
            locations: {
                $elemMatch: {
                    key: parsed.data.key,
                    _id: { $ne: locationId },
                },
            },
        },
        { "locations.$": 1 }
    ).lean();

    if (keyConflict) {
        throw new ApiError("Location key must be unique", 409);
    }

    const now = new Date();

    const incoming = {
        _id: locationId,
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
                                            cond: { $eq: ["$$l._id", locationId] },
                                        },
                                    },
                                },
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
                                                    { $eq: ["$$l._id", locationId] },
                                                    {
                                                        $mergeObjects: [
                                                            "$$l",
                                                            {
                                                                ...incoming,
                                                                createdAt: "$$l.createdAt",
                                                            },
                                                        ],
                                                    },
                                                    "$$l",
                                                ],
                                            },
                                        },
                                    },
                                    { $concatArrays: ["$$existing", [incoming]] },
                                ],
                            },
                        },
                    },
                },
            },
        ],
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).lean();

    if (!updatedDoc) {
        throw new ApiError("Failed to save location", 500);
    }

    const saved =
        updatedDoc.locations?.find((l) => String(l._id) === String(locationId)) ?? null;

    if (!saved) {
        throw new ApiError("Failed to retrieve saved location", 500);
    }

    // Type assertion: tell TS this is a LocationEntry
    const locationEntry = saved as LocationEntry;

    // deleting _id from the db returned object and put it into id variable and send the response
    return {
        data: (({ _id, ...rest }) => ({ ...rest, id: _id }))(locationEntry),
        status: 200
    };

});

/**
 * DELETE: remove location by id (strict)
 */
export const DELETE = withErrorHandler(async (_req, { params }: Params) => {
    const id = decodeURIComponent((await params).id);

    if (!isValidObjectId(id)) {
        throw new ApiError("Invalid location id", 400);
    }

    await ConnectDB();

    // First, find the singleton document
    const settings = await SiteSettings.findOne();

    if (!settings) {
        throw new ApiError("Settings not found", 404);
    }

    // Check if location exists
    const locationExists = settings.locations.some(loc =>
        loc._id.toString() === id
    );

    if (!locationExists) {
        throw new ApiError("Location not found", 404);
    }

    // Remove the location from the array
    settings.locations = settings.locations.filter(loc =>
        loc._id.toString() !== id
    );

    // Mark the locations array as modified
    settings.markModified('locations');

    // Save the document
    const updatedDoc = await settings.save();

    // Verify deletion
    const stillExists = updatedDoc.locations.some(loc => loc._id.toString() === id);

    if (stillExists) {
        throw new ApiError("Failed to delete location", 500);
    }

    return { data: null, status: 200 };
});