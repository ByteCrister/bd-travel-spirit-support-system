// app/api/support/v1/tours/[tourId]/suspend/route.ts
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
import { TourApprovalResponse } from "@/types/tour/tour-approval.types";
import { buildTourDetailDTO } from "@/lib/build-responses/build-tour-details";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

/**
 * POST /api/support/v1/tours/[tourId]/suspend
 * Suspend a tour with a reason and optional duration
 */
export const POST = withErrorHandler(
    async (
        req: NextRequest,
        { params }: { params: Promise<{ tourId: string }> }
    ) => {
        const tourId = resolveMongoId((await params).tourId);
        const body = await req.json();
        const { reason, suspensionDuration, isAllTime, notes } = body;

        // Validate inputs
        if (!tourId) {
            throw new ApiError("Tour ID is required", 400);
        }

        if (!Types.ObjectId.isValid(tourId)) {
            throw new ApiError("Invalid Tour ID format", 400);
        }

        if (!reason || !reason.trim()) {
            throw new ApiError("Suspension reason is required", 400);
        }

        // Validate suspension duration if not all-time
        if (!isAllTime && (!suspensionDuration || suspensionDuration <= 0)) {
            throw new ApiError("Suspension duration must be a positive number when not all-time", 400);
        }

        const suspendedBy = await getUserIdFromSession();
        if (!suspendedBy) {
            throw new ApiError("Unauthorized", 401);
        }

        await VERIFY_USER_ROLE.SUPPORT(suspendedBy)

        await ConnectDB();

        const result = await withTransaction(async (session) => {
            // Check if tour exists and get current status
            const existingTour = await TourModel.findById(tourId).session(session);
            if (!existingTour) {
                throw new ApiError("Tour not found", 404);
            }

            // Check if already suspended
            if (existingTour.moderationStatus === "suspended") {
                throw new ApiError("Tour is already suspended", 400);
            }

            // Suspend the tour using the model method
            const updatedTour = await TourModel.suspendById(tourId, {
                reason,
                session,
                suspendedBy: new Types.ObjectId(suspendedBy),
                isAllTime: isAllTime || false,
                durationDays: suspensionDuration,
                notes,
            });

            if (!updatedTour) {
                throw new ApiError("Failed to suspend tour", 500);
            }

            const tourDetailDTO = await buildTourDetailDTO(
                updatedTour._id as Types.ObjectId,
                session
            );

            const response: TourApprovalResponse = {
                success: true,
                message: `Tour suspended: ${reason}`,
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