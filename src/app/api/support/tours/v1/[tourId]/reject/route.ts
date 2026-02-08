// app/api/support/v1/tours/[tourId]/reject/route.ts
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
 * POST /api/support/v1/tours/[tourId]/reject
 * Reject a tour with a reason
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
            throw new ApiError("Rejection reason is required", 400);
        }

        const rejectedBy = await getUserIdFromSession();
        if (!rejectedBy) {
            throw new ApiError("Unauthorized", 401);
        }

        await VERIFY_USER_ROLE.SUPPORT(rejectedBy)

        await ConnectDB();

        const result = await withTransaction(async (session) => {
            // Reject the tour
            const updatedTour = await TourModel.rejectById(tourId, {
                reason,
                session,
                rejectedBy: new Types.ObjectId(rejectedBy),
            });

            if (!updatedTour) {
                throw new ApiError("Tour not found", 404);
            }

            const tourDetailDTO = await buildTourDetailDTO(
                updatedTour._id as Types.ObjectId,
                session
            );

            const response: TourApprovalResponse = {
                success: true,
                message: `Tour rejected: ${reason}`,
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
