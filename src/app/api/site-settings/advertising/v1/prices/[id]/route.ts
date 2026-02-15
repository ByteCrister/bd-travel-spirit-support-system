// app/api/site-settings/v1/advertising/config/prices/[id]/route.ts
import { NextRequest } from "next/server";
import AdvertisingSetting, {
    advertisingToDTO,
} from "@/models/site-settings/advertising.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";
import {
    AdvertisingPriceInput,
    AdvertisingPriceSchema,
} from "@/utils/validators/site-settings/advertising-setting.validator";
import { withTransaction } from "@/lib/helpers/withTransaction";

/**
 * PUT /api/advertising/prices
 *
 * Updates an advertising price entry inside a transaction. The handler
 * itself does not rely on an externally injected session; instead it
 * uses the withTransaction helper so the entire update (conflict check
 * + save) is atomic.
 */
export const PUT = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    // parse JSON body (Edge runtime)
    const rawBody = await req.json().catch(() => null);

    // validate with Zod
    const parsed = AdvertisingPriceSchema.safeParse(rawBody);
    if (!parsed.success) {
        const message = parsed.error.issues
            .map((issue) => {
                const path = issue.path.length ? issue.path.join(".") : "";
                return path ? `${path}: ${issue.message}` : issue.message;
            })
            .join("; ");
        throw new ApiError(`Invalid payload: ${message}`, 400);
    }

    const payload = parsed.data as AdvertisingPriceInput & { id?: string };

    if (!payload.id) {
        throw new ApiError("Invalid id", 400);
    }

    // Run the critical section inside a transaction so conflict checks and save are atomic.
    const dto = await withTransaction(async (session) => {
        // Find existing document within the session
        const doc = await AdvertisingSetting.findById(payload.id).session(session);
        if (!doc) {
            throw new ApiError("Advertising price not found", 404);
        }

        // If placement is being changed, ensure no active non-deleted conflict exists (session-aware)
        if (payload.placement && payload.placement !== doc.placement) {
            const conflict = await AdvertisingSetting.findOne({
                _id: { $ne: doc._id },
                placement: payload.placement,
                deletedAt: null,
            }).session(session);

            if (conflict) {
                throw new ApiError(
                    `Cannot change placement: active entry already exists for placement "${payload.placement}"`,
                    409
                );
            }
        }

        // Apply updates only for provided fields
        if (payload.placement !== undefined) doc.placement = payload.placement;
        if (payload.price !== undefined) doc.price = payload.price;
        if (payload.currency !== undefined) doc.currency = payload.currency;

        // defaultDurationDays: allow explicit null to remove default
        if (Object.prototype.hasOwnProperty.call(payload, "defaultDurationDays")) {
            doc.defaultDurationDays =
                payload.defaultDurationDays === undefined
                    ? doc.defaultDurationDays
                    : payload.defaultDurationDays;
        }

        if (payload.allowedDurationsDays !== undefined) {
            doc.allowedDurationsDays = payload.allowedDurationsDays;
        }

        if (payload.active !== undefined) {
            doc.active = Boolean(payload.active);
        }

        // Save within the session so it participates in the transaction
        await doc.save({ session });

        return advertisingToDTO(doc);
    });

    return { data: dto, status: 200 };
});

/**
 * DELETE /api/advertising/prices/:id
 *
 * Soft-deletes an advertising price by id.
 *
 * Response: { data: AdvertisingPriceDTO } with status 200.
 */
export const DELETE = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ id?: string }> }) => {
        await ConnectDB();

        const rawId = (await params)?.id;
        if (!rawId) throw new ApiError("Missing id parameter", 400);
        const id = decodeURIComponent(rawId);

        const doc = await AdvertisingSetting.softDeleteById(id);

        if (!doc) {
            throw new ApiError("Advertising price not found or already deleted", 404);
        }

        return {
            data: AdvertisingSetting.toDTO(doc),
            status: 200,
        };
    }
);
