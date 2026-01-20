// app/api/site-settings/v1/advertising/config/prices/bulk/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";

import { PLACEMENT, AD_STATUS } from "@/constants/advertising.const";
import { CURRENCY } from "@/constants/tour.const";
import ConnectDB from "@/config/db";
import AdvertisingSetting from "@/models/site-settings/advertising.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import type { AdvertisingPriceDTO } from "@/types/advertising-settings.types";

/* ----------------------------- Zod Schemas ----------------------------- */
const UpdatePayloadSchema = z.object({
  id: z.string().optional(),
  placement: z.enum(PLACEMENT).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.enum(CURRENCY).optional(),
  defaultDurationDays: z.number().positive().nullable().optional(),
  allowedDurationsDays: z.array(z.number().positive()).optional(),
  active: z.boolean().optional(),
  status: z.enum(AD_STATUS).optional(),
});

const BulkUpdateSchema = z.object({
  updates: z.array(UpdatePayloadSchema).default([]), // allow empty array now
  removeIds: z.array(z.string()).default([]),
  editorId: z.string().optional(),
  note: z.string().optional(),
});

/* -------------------------------- PUT ---------------------------------- */
export const PUT = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = BulkUpdateSchema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);
  }

  const { updates, removeIds, note } = parsed.data;

  await ConnectDB();

  const processed: AdvertisingPriceDTO[] = [];

  await withTransaction(async (session) => {
    /* --------------------------- Soft deletes -------------------------- */
    for (const id of removeIds) {
      await AdvertisingSetting.softDeleteById(id, session);
    }

    /* ------------------------ Updates / Creates ------------------------ */
    for (const up of updates) {
      if (up.id) {
        // Update existing document
        const doc = await AdvertisingSetting.findById(up.id).session(session);

        if (!doc) {
          if (!up.placement) {
            throw new ApiError(`Missing placement for new entry (id=${up.id})`, 401);
          }

          const [created] = await AdvertisingSetting.create([{
            title: "Unknown",
            placement: up.placement,
            price: up.price ?? 0,
            currency: up.currency,
            defaultDurationDays: up.defaultDurationDays ?? null,
            allowedDurationsDays: up.allowedDurationsDays ?? [],
            active: up.active ?? true,
          }], { session });

          processed.push(AdvertisingSetting.toDTO(created));
          continue;
        }

        // Apply updates only for provided fields
        if (up.placement !== undefined) doc.placement = up.placement;
        if (up.price !== undefined) doc.price = up.price;
        if (up.currency !== undefined) doc.currency = up.currency;
        if ("defaultDurationDays" in up) doc.defaultDurationDays = up.defaultDurationDays ?? null;
        if (up.allowedDurationsDays !== undefined) doc.allowedDurationsDays = up.allowedDurationsDays;
        if (up.active !== undefined) doc.active = up.active;

        await doc.save({ session });
        processed.push(AdvertisingSetting.toDTO(doc));
      } else {
        // New entry without ID
        if (!up.placement) throw new ApiError("placement is required for new entries", 401);

        const doc = await AdvertisingSetting.upsertByPlacement({
          title: "Unknown",
          placement: up.placement,
          price: up.price ?? 0,
          currency: up.currency,
          defaultDurationDays: up.defaultDurationDays ?? null,
          allowedDurationsDays: up.allowedDurationsDays ?? [],
          active: up.active ?? true,
        }, session);

        processed.push(AdvertisingSetting.toDTO(doc));
      }
    }
  });

  // Return all active pricing entries
  const active = await AdvertisingSetting.findActiveLean();
  return {
    data: {
      pricing: active.map(AdvertisingSetting.toDTO),
      notes: note ?? null,
      version: Date.now(),
    },
    status: 200,
  };
});