// app/api/site-settings/v1/advertising/config/route.ts
import type {
    AdvertisingConfigDTO,
    AdvertisingPriceDTO,
} from "@/types/advertising-settings.types";
import AdvertisingSetting from "@/models/site-settings/advertising.model";
import ConnectDB from "@/config/db";
import { withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * GET /api/site-settings/advertising/config
 *
 * Returns the advertising config used by the admin UI:
 * { pricing: AdvertisingPriceDTO[], notes?: string | null, version?: number }
 */
export const GET = withErrorHandler(async () => {
    // Ensure DB connection
    await ConnectDB();

    // Use model helper method to get lean documents with proper typing
    const docs = await AdvertisingSetting.findActiveLean();

    // Use model helper to convert to DTO
    const pricing: AdvertisingPriceDTO[] = docs.map(doc =>
        AdvertisingSetting.toDTO(doc)
    );

    // Build config DTO
    const config: AdvertisingConfigDTO = {
        pricing,
        notes: null,
        version: pricing.length, // Consider storing a proper version number in DB
    };

    return { data: config, status: 200 }
})