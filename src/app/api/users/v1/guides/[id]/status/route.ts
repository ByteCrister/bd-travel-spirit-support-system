// app/api/users/guides/[id]/status/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";

import ConnectDB from "@/config/db";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import GuideModel from "@/models/guide/guide.model";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { applicationApproved } from "@/lib/html/application-approve.html";
import { applicationRejected } from "@/lib/html/application-rejected.html";
import { mailer } from "@/config/node-mailer";
import UserModel from "@/models/user.model";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
/**
 * Update guide application status to approved/rejected
 */
export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        await ConnectDB();

        const { id } = await params;
        const body = await req.json();
        const { status, reason } = body;

        const reviewerId = await getUserIdFromSession();
        if (!reviewerId || !mongoose.Types.ObjectId.isValid(reviewerId)) {
            throw new ApiError("Unauthorized", 401);
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid guide id", 400);
        }

        // Status validation
        if (status !== GUIDE_STATUS.APPROVED && status !== GUIDE_STATUS.REJECTED) {
            throw new ApiError("Invalid status value", 400);
        }

        // Reject requires reason
        if (status === GUIDE_STATUS.REJECTED && (!reason || !reason.trim())) {
            throw new ApiError("Rejection reason is required", 400);
        }

        const reviewerObjectId = new mongoose.Types.ObjectId(reviewerId);

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

            const userId = guide.owner?.user;
            if (!userId) {
                throw new ApiError("Guide owner user not found", 400);
            }

            const user = await UserModel.findById(userId).select('+password').session(session);
            if (!user) {
                throw new ApiError("User not found", 404);
            }

            // ================= APPROVED =================
            if (status === GUIDE_STATUS.APPROVED) {
                const rawPassword = generateStrongPassword();

                user.password = rawPassword; // hashed in pre-save
                await user.save({ session });

                // ------------------------------- Email ----------------------------
                await mailer(
                    user.email,
                    "Your Guide Application Has Been Approved 🎉",
                    applicationApproved(
                        guide.companyName,
                        user.email,
                        rawPassword
                    )
                );

                return GuideModel.approve(
                    id,
                    reviewerObjectId,
                    undefined,
                    session
                );
            }

            // ================= REJECTED =================
            await mailer(
                user.email,
                "Your Guide Application Status Update",
                applicationRejected(
                    guide.companyName,
                    user.email,
                    reason
                )
            );

            return GuideModel.reject(
                id,
                reviewerObjectId,
                reason,
                session
            );
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