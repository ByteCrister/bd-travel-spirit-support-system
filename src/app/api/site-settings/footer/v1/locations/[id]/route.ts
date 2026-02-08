// app/api/site-settings/v1/footer/locations/[id]/route.ts
import { NextRequest } from "next/server";
import { isValidObjectId, Types } from "mongoose";

import ConnectDB from "@/config/db";
import LocationSetting from "@/models/site-settings/location.model";

import { locationSchema } from "@/utils/validators/footer-settings.validator";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { LocationEntryDTO } from "@/types/site-settings/footer-settings.types";

interface Params {
    params: Promise<{ id: string }>;
}

/**
 * PUT: create or update location by id
 */
export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        const rawId = decodeURIComponent((await params).id);
        const isCreate = rawId === "new" || !rawId;

        await ConnectDB();

        if (!isCreate && !isValidObjectId(rawId)) {
            throw new ApiError("Invalid location id", 400);
        }

        const locationId = isCreate
            ? new Types.ObjectId()
            : new Types.ObjectId(rawId);

        const body = await req.json();

        const parsed = locationSchema.safeParse({
            ...body,
            id: locationId.toString(),
        });

        if (!parsed.success) {
            const first =
                Object.values(parsed.error.flatten().fieldErrors)
                    .flat()
                    .filter(Boolean)[0] ?? "Invalid location payload";
            throw new ApiError(first, 400);
        }

        /**
         * Enforce unique key - only check non-deleted records
         */
        const keyConflict = await LocationSetting.findOne({
            key: parsed.data.key,
            _id: { $ne: locationId },
            deleteAt: null, // Only check non-deleted records
        }).lean();

        if (keyConflict) {
            throw new ApiError("Location key must be unique", 409);
        }

        /**
         * Prepare payload
         */
        const payload: LocationEntryDTO = {
            id: locationId.toString(),
            key: parsed.data.key,
            country: parsed.data.country,
            region: parsed.data.region ?? undefined,
            city: parsed.data.city ?? undefined,
            slug: parsed.data.slug ?? undefined,
            lat: parsed.data.lat,
            lng: parsed.data.lng,
            active: parsed.data.active ?? true,
            location: {
                type: "Point" as const,
                coordinates: [parsed.data.lng, parsed.data.lat] as [number, number],
            },
        };

        /**
         * Create or update
         */
        const saved = await LocationSetting.findByIdAndUpdate(
            locationId,
            payload,
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        ).lean();

        if (!saved) {
            throw new ApiError("Failed to save location", 500);
        }

        /**
         * DTO-compatible response
         */
        return {
            data: {
                id: saved._id.toString(),
                key: saved.key,
                country: saved.country,
                region: saved.region ?? null,
                city: saved.city ?? null,
                slug: saved.slug ?? null,
                lat: saved.lat,
                lng: saved.lng,
                active: !!saved.active,
                location: saved.location ?? null,
                createdAt: saved.createdAt
                    ? new Date(saved.createdAt).toISOString()
                    : null,
                updatedAt: saved.updatedAt
                    ? new Date(saved.updatedAt).toISOString()
                    : null,
            },
            status: 200,
        };
    }
);