// app/api/users/v1/guides/[id]/review-comment/route.ts

import { NextRequest } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import GuideModel from "@/models/guide/guide.model";
import { withTransaction } from "@/lib/helpers/withTransaction";

export const POST = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        await ConnectDB();

        const { id } = await params;
        const { reviewComment } = await req.json();

        const reviewerId = await getUserIdFromSession();
        if (!reviewerId || !mongoose.Types.ObjectId.isValid(reviewerId)) {
            throw new ApiError("Unauthorized", 401);
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid guide id", 400);
        }

        if (!reviewComment || !reviewComment.trim()) {
            throw new ApiError("reviewComment is required", 400);
        }

        const reviewerObjectId = new mongoose.Types.ObjectId(reviewerId);

        const updatedGuide = await withTransaction(async (session) => {
            const guide = await GuideModel.findById(id).session(session);
            if (!guide) {
                throw new ApiError("Guide not found", 404);
            }

            // Only reviewer or admin can update comment
            if (!guide.reviewer?.equals(reviewerObjectId)) {
                throw new ApiError("Forbidden", 403);
            }

            guide.reviewComment = reviewComment.trim();
            await guide.save({ session });

            return guide;
        });

        return {
            status: 200,
            data: {
                _id: updatedGuide._id,
                reviewComment: updatedGuide.reviewComment,
                updatedAt: updatedGuide.updatedAt,
            },
        };
    }
);
