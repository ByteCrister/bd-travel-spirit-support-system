// app/api/support/v1/employees-password-requests/[id]/update-password/route.ts

import { NextRequest } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { withTransaction } from "@/lib/helpers/withTransaction";

import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import ResetPasswordRequestModel from "@/models/employees/reset-password-request.model";

import { REQUEST_STATUS } from "@/constants/reset-password-request.const";
import { ResetPasswordRequestDTO } from "@/types/password-reset.types";
import { ResetPasswordRequestPopulated } from "@/types/employee-password-request.types.server";
import { validatePassword } from "@/lib/helpers/validatePassword";
import { employeePasswordUpdateEmail } from "@/lib/html/employee-password-update.html";
import { mailer } from "@/config/node-mailer";
import { USER_ROLE } from "@/constants/user.const";
/**
 * Update password that has been requested by an employee with "support" role
 */
export const POST = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const requestId = (await params).id;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError("Invalid request ID", 400);
    }

    const body = await request.json() as {
        newPassword: string;
        notifyRequester?: boolean;
    };

    validatePassword(body.newPassword)

    const adminId = await getUserIdFromSession();
    if (!adminId) {
        throw new ApiError("Unauthorized", 401);
    }

    await ConnectDB();

    const updatedRequest = await withTransaction<ResetPasswordRequestPopulated>(
        async (session) => {
            /** Load reset request */
            const resetRequest =
                await ResetPasswordRequestModel
                    .findById(requestId)
                    .populate({
                        path: "user",
                        select: "email name role",
                        model: UserModel,
                        match: {
                            role: USER_ROLE.SUPPORT, // get only "support" members
                        },
                    })
                    .populate({
                        path: "employee",
                        select: "contactInfo",
                        model: EmployeeModel
                    })
                    .session(session)
                    .lean<ResetPasswordRequestPopulated>();

            if (!resetRequest) {
                throw new ApiError("Reset password request not found", 404);
            }

            if (resetRequest.status === REQUEST_STATUS.FULFILLED) {
                throw new ApiError("Password already updated", 400);
            }

            if (resetRequest.status === REQUEST_STATUS.DENIED) {
                throw new ApiError("Request has been denied", 400);
            }

            const userId = resetRequest.user?._id;
            if (!userId) {
                throw new ApiError("Associated user not found", 500);
            }

            /** Update user password */
            const user = await UserModel.findById(userId).session(session);
            if (!user) throw new ApiError("User not found", 500);

            user.password = body.newPassword;
            await user.save({ session });


            /** Mark reset request fulfilled */
            const updated =
                await ResetPasswordRequestModel
                    .findByIdAndUpdate(
                        requestId,
                        {
                            $set: {
                                status: REQUEST_STATUS.FULFILLED,
                                fulfilledAt: new Date(),
                                reviewedBy: adminId
                            }
                        },
                        { new: true, session }
                    )
                    .populate({
                        path: "user",
                        select: "email name role",
                        model: UserModel
                    })
                    .populate({
                        path: "employee",
                        select: "contactInfo",
                        model: EmployeeModel
                    })
                    .populate({
                        path: "reviewedBy",
                        select: "name email",
                        model: UserModel
                    })
                    .lean<ResetPasswordRequestPopulated>();

            if (!updated) {
                throw new ApiError("Failed to finalize password update", 500);
            }

            if (body.notifyRequester) {
                const html = employeePasswordUpdateEmail(updated.user.email, updated.user.name, body.newPassword)
                await mailer(updated.user.email, "Password Updated!", html)
            }

            return updated;
        }
    );

    const employeeContact =
        updatedRequest.employee?.contactInfo ?? null;

    const responseDTO: ResetPasswordRequestDTO = {
        _id: updatedRequest._id.toString(),
        requesterEmail: updatedRequest.user.email,
        requesterName: updatedRequest.user.name || undefined,
        requesterMobile: employeeContact?.phone || undefined,
        description: updatedRequest.description,
        reason: undefined,
        status: updatedRequest.status,
        requestedAt: updatedRequest.requestedAt.toISOString(),
        reviewedAt: updatedRequest.reviewedAt?.toISOString(),
        fulfilledAt: updatedRequest.fulfilledAt?.toISOString(),
        requestedFromIP: updatedRequest.requestedFromIP,
        requestedAgent: updatedRequest.requestedAgent,
        createdAt: updatedRequest.createdAt.toISOString(),
        updatedAt: updatedRequest.updatedAt.toISOString(),
    };

    return {
        data: responseDTO,
        status: 200
    };
});