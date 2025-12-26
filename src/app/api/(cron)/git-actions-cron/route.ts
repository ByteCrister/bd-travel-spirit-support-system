// app/api/git-actions-cron/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import AssetModel from "@/models/asset.model";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * Function to permanently delete assets that are soft-deleted
 */
export async function cleanDeletedAssets(session?: mongoose.ClientSession) {
    // Find assets that were soft-deleted more than 1 day ago
    const ONE_DAY_AGO = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

    const result = await AssetModel.deleteMany(
        { deletedAt: { $lte: ONE_DAY_AGO } },
        { session }
    ).exec();

    return { deletedCount: result.deletedCount ?? 0 };
}

/**
 * POST API handler
 */
export const POST = withErrorHandler(async (req: NextRequest) => {

    await ConnectDB(); // Ensure DB connection

    const body = await req.json();
    if (body.action !== "cleanup") {
        throw new ApiError("Invalid action", 400)
    }

    // Run cleanup in a transaction
    await withTransaction(async (session) => {
        return cleanDeletedAssets(session);
    });

    return {
        data: null,
        status: 200,
    }

})