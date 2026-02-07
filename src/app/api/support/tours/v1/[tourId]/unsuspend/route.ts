// app/api/support/v1/tours/[tourId]/unsuspend/route.ts
import { NextRequest } from "next/server";
import {
    withErrorHandler,
    ApiError,
    HandlerResult,
} from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import TourModel from "@/models/tours/tour.model";
import ConnectDB from "@/config/db";
import { Types } from "mongoose";
import { TourApprovalResponse } from "@/types/tour-approval.types";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

/**
 * POST /api/support/v1/tours/[tourId]/unsuspend
 * Remove suspension from a tour
 */
export const POST = withErrorHandler(
    async (
        req: NextRequest,
        { params }: { params: Promise<{ tourId: string }> }
    ) => {
        const tourId = resolveMongoId((await params).tourId);
        const body = await req.json();
        const { reason } = body;

        // Validate inputs
        if (!tourId) {
            throw new ApiError("Tour ID is required", 400);
        }

        if (!Types.ObjectId.isValid(tourId)) {
            throw new ApiError("Invalid Tour ID format", 400);
        }

        if (!reason || !reason.trim()) {
            throw new ApiError("Unsuspension reason is required", 400);
        }

        const restoredBy = await getUserIdFromSession();
        if (!restoredBy) {
            throw new ApiError("Unauthorized", 401);
        }

        await VERIFY_USER_ROLE.SUPPORT(restoredBy)

        await ConnectDB();

        const result = await withTransaction(async (session) => {
            // Check if tour exists
            const existingTour = await TourModel.findById(tourId).session(session);
            if (!existingTour) {
                throw new ApiError("Tour not found", 404);
            }

            // Check if actually suspended
            if (existingTour.moderationStatus !== "suspended" || !existingTour.suspension) {
                throw new ApiError("Tour is not suspended", 400);
            }

            // Unsuspend the tour using the model method
            const updatedTour = await TourModel.unsuspendById(tourId, {
                session,
                restoredBy: new Types.ObjectId(restoredBy),
            });

            if (!updatedTour) {
                throw new ApiError("Failed to unsuspend tour", 500);
            }

            const tourDetailDTO = await buildTourDetailDTO(
                updatedTour._id as Types.ObjectId,
                session
            );

            const response: TourApprovalResponse = {
                success: true,
                message: `Tour unsuspended: ${reason}`,
                tour: tourDetailDTO,
                updatedAt: new Date(),
            };

            return response;
        });

        return {
            status: 200,
            data: result,
        } as HandlerResult<TourApprovalResponse>;
    }
);