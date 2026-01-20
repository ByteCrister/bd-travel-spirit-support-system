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
import { applicationSuspended } from "@/lib/html/application-suspended.html";
import { mailer } from "@/config/node-mailer";
import UserModel from "@/models/user.model";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";

/**
 * Update guide application status to approved/rejected/suspended
 */
export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        await ConnectDB();

        const { id } = await params;
        const body = await req.json();
        const { status, reason, until } = body; // Added 'until' for suspension

        const reviewerId = await getUserIdFromSession();
        if (!reviewerId || !mongoose.Types.ObjectId.isValid(reviewerId)) {
            throw new ApiError("Unauthorized", 401);
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid guide id", 400);
        }

        // Status validation - added SUSPENDED
        const validStatuses = [GUIDE_STATUS.APPROVED, GUIDE_STATUS.REJECTED, GUIDE_STATUS.SUSPENDED];
        if (!validStatuses.includes(status)) {
            throw new ApiError(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`, 400);
        }

        // Validation rules for each status
        if (status === GUIDE_STATUS.REJECTED && (!reason || !reason.trim())) {
            throw new ApiError("Rejection reason is required", 400);
        }

        if (status === GUIDE_STATUS.SUSPENDED) {
            if (!reason || !reason.trim()) {
                throw new ApiError("Suspension reason is required", 400);
            }
            if (!until) {
                throw new ApiError("Suspension end date is required", 400);
            }

            const untilDate = new Date(until);
            if (untilDate <= new Date()) {
                throw new ApiError("Suspension end date must be in the future", 400);
            }
        }

        const reviewerObjectId = new mongoose.Types.ObjectId(reviewerId);

        const result = await withTransaction(async (session) => {
            const guide = await GuideModel.findById(id).session(session);

            if (!guide) {
                throw new ApiError("Guide not found", 404);
            }

            // Status transition validation
            if (status === GUIDE_STATUS.APPROVED && guide.status !== GUIDE_STATUS.PENDING) {
                throw new ApiError(
                    `Guide must be '${GUIDE_STATUS.PENDING}' to approve`,
                    400
                );
            }

            if (status === GUIDE_STATUS.REJECTED && guide.status !== GUIDE_STATUS.PENDING) {
                throw new ApiError(
                    `Guide must be '${GUIDE_STATUS.PENDING}' to reject`,
                    400
                );
            }

            if (status === GUIDE_STATUS.SUSPENDED && guide.status !== GUIDE_STATUS.APPROVED) {
                throw new ApiError(
                    `Guide must be '${GUIDE_STATUS.APPROVED}' to suspend`,
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

                // Send approval email
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
            if (status === GUIDE_STATUS.REJECTED) {
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
            }

            // ================= SUSPENDED =================
            if (status === GUIDE_STATUS.SUSPENDED) {
                const untilDate = new Date(until);

                // Format date for email
                const formattedDate = untilDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                const formattedTime = untilDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });

                // Send suspension email
                await mailer(
                    user.email,
                    "Important: Your Guide Account Has Been Suspended ⚠️",
                    applicationSuspended(
                        guide.companyName,
                        user.email,
                        reason,
                        formattedDate,
                        formattedTime
                    )
                );

                return GuideModel.suspend(
                    id,
                    reviewerObjectId,
                    reason,
                    untilDate,
                    session
                );
            }

            throw new ApiError("Invalid operation", 400);
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