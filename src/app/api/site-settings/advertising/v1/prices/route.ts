// app/api/site-settings/v1/advertising/config/prices/route.ts
import type { CreateAdvertisingPricePayload } from "@/types/advertising-settings.types";
import { NextRequest } from "next/server";
import AdvertisingSetting, { advertisingToDTO } from "@/models/site-settings/advertising.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";
import { AdvertisingPriceSchema } from "@/utils/validators/advertising-setting.validator";
import { withTransaction } from "@/lib/helpers/withTransaction";

export const POST = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    // Parse JSON body
    const rawBody = await req.json().catch(() => null);

    // Validate with Zod
    const result = AdvertisingPriceSchema.safeParse(rawBody);
    if (!result.success) {
        const message = result.error.issues
            .map(issue => {
                const path = issue.path.length ? issue.path.join(".") : "";
                return path ? `${path}: ${issue.message}` : issue.message;
            })
            .join("; ");
        throw new ApiError(`Invalid payload: ${message}`, 400);
    }

    const payload = result.data as CreateAdvertisingPricePayload;

    // Run the upsert inside a transaction
    const doc = await withTransaction(async (session) => {
        const updatedDoc = await AdvertisingSetting.upsertByPlacement(
            {
                title: payload.title,
                placement: payload.placement,
                price: payload.price,
                currency: payload.currency,
                defaultDurationDays:
                    payload.defaultDurationDays === undefined
                        ? null
                        : payload.defaultDurationDays,
                allowedDurationsDays: payload.allowedDurationsDays ?? [],
                active: payload.active === undefined ? true : Boolean(payload.active),
            },
            session
        );

        if (!updatedDoc) {
            throw new ApiError("Failed to create or update advertising price", 500);
        }

        return updatedDoc;
    });

    return { data: advertisingToDTO(doc), status: 201 };
});