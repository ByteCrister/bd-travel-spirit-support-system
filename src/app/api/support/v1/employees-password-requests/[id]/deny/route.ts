// app/api/support/v1/employees-password-requests/[id]/deny/route.ts

import { NextRequest } from "next/server";
import mongoose from "mongoose";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import ResetPasswordRequestModel from "@/models/employees/reset-password-request.model";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";
import { DenyResetRequestPayload, ResetPasswordRequestDTO } from "@/types/password-reset.types";
import { ResetPasswordRequestPopulated } from "@/types/employee-password-request.types.server";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import ConnectDB from "@/config/db";
import { withTransaction } from "@/lib/helpers/withTransaction";

/**
 * Post deny action for employee's password update request
 */
export const POST = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const requestId = (await params).id;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError("Invalid request ID", 400);
    }

    const body: DenyResetRequestPayload = await request.json();

    if (!body.reason?.trim()) {
        throw new ApiError("Missing required field", 400);
    }

    const adminId = await getUserIdFromSession();
    if (!adminId) {
        throw new ApiError("Unauthorized", 401);
    }

    await ConnectDB();

    const updatedRequest = await withTransaction<ResetPasswordRequestPopulated>(
        async (session) => {
            /** READ inside transaction */
            const resetRequest =
                await ResetPasswordRequestModel
                    .findById(requestId)
                    .session(session)
                    .lean<{ status: string }>();

            if (!resetRequest) {
                throw new ApiError("Reset password request not found", 404);
            }

            if (resetRequest.status === REQUEST_STATUS.DENIED) {
                throw new ApiError("Request already denied", 400);
            }

            if (resetRequest.status === REQUEST_STATUS.FULFILLED) {
                throw new ApiError("Request already fulfilled", 400);
            }

            /**  WRITE inside same transaction */
            const updated =
                await ResetPasswordRequestModel
                    .findByIdAndUpdate(
                        requestId,
                        {
                            $set: {
                                status: REQUEST_STATUS.DENIED,
                                denialReason: body.reason.trim(),
                                reviewedAt: new Date(),
                                reviewedBy: adminId
                            }
                        },
                        {
                            new: true,
                            runValidators: true,
                            session
                        }
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
                throw new ApiError("Update failed", 500);
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
        reason: updatedRequest.denialReason,
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
};