// app/api/support/v1/employees-password-request/[id]/route.ts (Next.js 14)
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { ResetPasswordRequestDTO } from "@/types/employee/password-reset.types";
import ConnectDB from "@/config/db";
import ResetPasswordRequestModel from "@/models/employees/reset-password-request.model";
import { ResetPasswordRequestPopulated } from "@/types/employee/employee-password-request.types.server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

/**
 * Get specific employees password request details
 */
export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const requestId = (await params).id;

    // Validate the ID format
    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
        throw new ApiError("Invalid request ID format", 400)
    }

    // Connect to database
    await ConnectDB();

    // Find the reset password request by ID with populated data
    const rawResetRequest = await ResetPasswordRequestModel.findById(requestId)
        .populate("user", "email name role")
        .populate("employee", "contactInfo")
        .populate("reviewedBy", "name email")
        .lean();

    const resetRequest = rawResetRequest as unknown as ResetPasswordRequestPopulated

    // Check if request exists
    if (!resetRequest) {
        throw new ApiError("Reset password request not found", 404)
    }

    // Transform to DTO format
    const dto: ResetPasswordRequestDTO = {
        _id: resetRequest._id.toString(),
        requesterEmail: resetRequest.user?.email || "",
        requesterName: resetRequest.user?.name || undefined,
        requesterMobile: resetRequest.employee?.contactInfo?.phone || undefined,
        description: resetRequest.description || undefined,
        reason: resetRequest.denialReason || undefined,
        status: resetRequest.status,
        requestedAt: resetRequest.requestedAt.toISOString(),
        reviewedAt: resetRequest.reviewedAt?.toISOString(),
        fulfilledAt: resetRequest.fulfilledAt?.toISOString(),
        requestedFromIP: resetRequest.requestedFromIP || undefined,
        requestedAgent: resetRequest.requestedAgent || undefined,
        createdAt: resetRequest.createdAt.toISOString(),
        updatedAt: resetRequest.updatedAt.toISOString(),
    }

    return { data: dto, status: 200 }

})