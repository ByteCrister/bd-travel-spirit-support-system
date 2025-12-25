// app/api/users/guides/[id]/status/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import GuideModel from "@/models/guide/guide.model";
import { withTransaction } from "@/lib/helpers/withTransaction";

export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        await ConnectDB();

        const { id } = await params;
        const body = await req.json();

        const reviewerId = await getUserIdFromSession();
        if (!reviewerId || !mongoose.Types.ObjectId.isValid(reviewerId)) {
            throw new ApiError("Unauthorized", 401);
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid guide id", 400);
        }

        const reviewerObjectId = new mongoose.Types.ObjectId(reviewerId);
        const { status, reason } = body;

        // Status validation
        if (status !== GUIDE_STATUS.APPROVED && status !== GUIDE_STATUS.REJECTED) {
            throw new ApiError("Invalid status value", 400);
        }

        // Reject requires reason
        if (status === GUIDE_STATUS.REJECTED && (!reason || !reason.trim())) {
            throw new ApiError("Rejection reason is required", 400);
        }

        const result = await withTransaction(async (session) => {
            const guide = await GuideModel.findById(id).session(session);
            if (!guide) {
                throw new ApiError("Guide not found", 404);
            }

            if (guide.status !== GUIDE_STATUS.PENDING) {
                throw new ApiError(
                    `Guide status must be '${GUIDE_STATUS.PENDING}'`,
                    400
                );
            }

            // SAME API → branch by status
            return status === GUIDE_STATUS.APPROVED
                ? GuideModel.approve(id, reviewerObjectId, undefined, session)
                : GuideModel.reject(id, reviewerObjectId, reason, session);
        });

        return {
            status: 200,
            data: {
                _id: result?._id,
                status: result?.status,
                reviewer: result?.reviewer,
                reviewedAt: result?.reviewedAt,
                reviewComment: result?.reviewComment,
            },
        };
    }
);