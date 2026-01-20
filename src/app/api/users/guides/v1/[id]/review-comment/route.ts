// src/app/api/users/v1/guides/[id]/review-comment/route.ts
import { NextRequest } from "next/server";
import mongoose, { Types } from "mongoose";

import ConnectDB from "@/config/db";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import GuideModel, { IGuide } from "@/models/guide/guide.model";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { mailer } from "@/config/node-mailer";
import UserModel from "@/models/user.model";
import { USER_ROLE } from "@/constants/user.const";
import { reviewCommentAdd } from "@/lib/html/application-reviewComment.html";

/* ================= TYPES ================= */

interface PopulatedOwnerUser {
    _id: Types.ObjectId;
    email: string;
}

type GuideWithPopulatedOwnerUser =
    Omit<IGuide, "owner"> & {
        owner: Omit<IGuide["owner"], "user"> & {
            user: PopulatedOwnerUser;
        };
    };

/* ================= API ================= */

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

        if (!reviewComment?.trim()) {
            throw new ApiError("reviewComment is required", 400);
        }

        const reviewerObjectId = new mongoose.Types.ObjectId(reviewerId);

        const updatedGuide = await withTransaction(async (session) => {
            const guide = await GuideModel.findById(id)
                .populate<{ owner: { user: PopulatedOwnerUser } }>(
                    "owner.user",
                    "email"
                )
                .session(session) as GuideWithPopulatedOwnerUser | null;

            if (!guide) throw new ApiError("Guide not found", 404);

            if (guide.status !== GUIDE_STATUS.PENDING) {
                throw new ApiError(
                    "Review is only allowed for pending guide applications",
                    400
                );
            }

            /* -------- Reviewer info (single source of truth) -------- */
            const reviewerUser = await UserModel.findById(reviewerObjectId)
                .select("name role")
                .session(session);

            if (!reviewerUser) {
                throw new ApiError("Reviewer not found", 404);
            }

            const reviewerName =
                reviewerUser.name ??
                (reviewerUser.role === USER_ROLE.ADMIN
                    ? "Admin"
                    : reviewerUser.role === USER_ROLE.SUPPORT
                        ? "Support Team"
                        : "Reviewer");

            /* -------------------- Email -------------------- */
            await mailer(
                guide.owner.user.email,
                `Review Comment Added to Your ${guide.companyName} Application`,
                reviewCommentAdd(
                    guide.companyName,
                    guide.owner.user.email,
                    reviewComment.trim(),
                    reviewerName,
                    new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                    "Our team will review your application and provide a final decision within 3–5 business days."
                ),
            );

            /* -------------------- Update Guide -------------------- */
            guide.reviewComment = reviewComment.trim();
            guide.reviewedAt = new Date();
            guide.reviewer = reviewerObjectId;

            await guide.save({ session });

            return guide;
        });

        return {
            status: 200,
            data: {
                _id: updatedGuide._id,
                status: updatedGuide.status,
                reviewComment: updatedGuide.reviewComment,
                reviewedAt: updatedGuide.reviewedAt,
                reviewer: updatedGuide.reviewer,
                updatedAt: updatedGuide.updatedAt,
            },
        };
    }
);