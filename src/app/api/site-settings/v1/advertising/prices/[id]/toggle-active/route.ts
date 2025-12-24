// app/api/site-settings/v1/advertising/prices/[id]/toggle-active/route.ts
import { NextRequest } from "next/server";
import AdvertisingSetting from "@/models/site-settings/advertising.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import ConnectDB from "@/config/db";
import { advertisingToDTO } from "@/models/site-settings/advertising.model";

export const PUT = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await ConnectDB();

    const { id } = await params;

    if (!id) {
        throw new ApiError("Invalid id", 400);
    }

    const dto = await withTransaction(async (session) => {
        // Fetch document in transaction
        const doc = await AdvertisingSetting.findById(id).session(session);
        if (!doc || doc.deletedAt) {
            throw new ApiError("Advertising price not found or deleted", 401);
        }

        // Toggle active field
        doc.active = !doc.active;
        await doc.save({ session });

        // Return DTO
        return advertisingToDTO(doc);
    });

    return { data: dto, status: 200 };
});