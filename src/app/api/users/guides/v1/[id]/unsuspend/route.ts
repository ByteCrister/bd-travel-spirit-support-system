// app/api/users/guides/[id]/unsuspend/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";

import ConnectDB from "@/config/db";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import GuideModel from "@/models/guide/guide.model";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { applicationUnsuspended } from "@/lib/html/application-unsuspended.html";
import { mailer } from "@/config/node-mailer";
import UserModel from "@/models/user.model";

/**
 * Remove suspension from a guide
 */
export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
        await ConnectDB();

        const { id } = await params;
        const body = await req.json();
        const { reason } = body; // Optional reason for unsuspension

        const adminId = await getUserIdFromSession();
        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            throw new ApiError("Unauthorized", 401);
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError("Invalid guide id", 400);
        }

        const adminObjectId = new mongoose.Types.ObjectId(adminId);

        const result = await withTransaction(async (session) => {
            const guide = await GuideModel.findById(id).session(session);

            if (!guide) {
                throw new ApiError("Guide not found", 404);
            }

            // Check if guide is actually suspended
            if (!guide.suspension || guide.suspension.until <= new Date()) {
                throw new ApiError("Guide is not currently suspended", 400);
            }

            const userId = guide.owner?.user;
            if (!userId) {
                throw new ApiError("Guide owner user not found", 400);
            }

            const user = await UserModel.findById(userId).session(session);
            if (!user) {
                throw new ApiError("User not found", 404);
            }

            // Remove suspension
            const updatedGuide = await GuideModel.findByIdAndUpdate(
                id,
                {
                    $unset: { suspension: "" },
                    $set: {
                        status: GUIDE_STATUS.APPROVED,
                        reviewer: adminObjectId,
                        reviewedAt: new Date(),
                        reviewComment: reason || "Suspension lifted by administrator",
                    },
                },
                { new: true, runValidators: true, session }
            );

            // Send unsuspension email
            await mailer(
                user.email,
                "Your Guide Account Has Been Restored ✅",
                applicationUnsuspended(
                    guide.companyName,
                    user.email,
                    reason || "Your suspension has been lifted"
                )
            );

            return updatedGuide;
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