// app/api/support/v1/tours/[tourId]/approve/route.ts
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

/**
 * POST /api/support/v1/tours/[tourId]/approve
 * Approve a tour for publication
 */
export const POST = withErrorHandler(
    async (
        req: NextRequest,
        { params }: { params: Promise<{ tourId: string }> }
    ) => {
        const tourId = resolveMongoId((await params).tourId);
        const body = await req.json();
        const { reason } = body;

        // Validate tourId
        if (!tourId) {
            throw new ApiError("Tour ID is required", 400);
        }

        if (!Types.ObjectId.isValid(tourId)) {
            throw new ApiError("Invalid Tour ID format", 400);
        }

        const approvedBy = await getUserIdFromSession();
        if (!approvedBy) {
            throw new ApiError("Unauthorized", 401);
        }

        await ConnectDB();

        const result = await withTransaction(async (session) => {

            // Approve the tour
            const updatedTour = await TourModel.approveById(tourId, {
                session,
                approvedBy: new Types.ObjectId(approvedBy),
            });

            if (!updatedTour) {
                throw new ApiError("Tour not found", 404);
            }

            const tourDetailDTO = await buildTourDetailDTO(
                updatedTour._id as Types.ObjectId,
                false,
                session
            );

            const response: TourApprovalResponse = {
                success: true,
                message: reason
                    ? `Tour approved: ${reason}`
                    : "Tour approved successfully",
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