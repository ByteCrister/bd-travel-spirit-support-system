import { z } from "zod";
import { AD_STATUS, PLACEMENT } from "@/constants/advertising.const";
import { CURRENCY } from "@/constants/tour.const";

/**
 * Helper: cast Object.values(...) to a tuple type required by z.enum.
 * The `as [string, ...string[]]` assertion tells TS this is a non-empty tuple.
 * If your enum could be empty, adjust accordingly.
 */

/** Trim then require at least 4 characters */
const TitleSchema = z.preprocess((val) =>
  (typeof val === "string" ? val.trim() : val),
  z.string().min(4, "Title must be at least 4 characters long")
);

/** Zod schema for create/update advertising price payload */
export const AdvertisingPriceSchema = z.object({
  id: z.string().optional(),
  title: TitleSchema,
  placement: z.enum(PLACEMENT),
  price: z.number().nonnegative(),
  currency: z.enum(CURRENCY).optional(),
  defaultDurationDays: z.number().positive().nullable().optional(),
  allowedDurationsDays: z.array(z.number().positive()).optional(),
  active: z.boolean().optional(),
  status: z.enum(AD_STATUS).optional(),
});

/** Type inferred from schema (useful for local typing) */
export type AdvertisingPriceInput = z.infer<typeof AdvertisingPriceSchema>;