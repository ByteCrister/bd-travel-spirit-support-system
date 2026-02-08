// app/api/support/guide-password-requests/v1/[id]/approve/route.ts

import { NextRequest } from 'next/server';
import mongoose, { Types } from 'mongoose';
import UserModel from '@/models/user.model';
import { FORGOT_PASSWORD_STATUS } from '@/constants/guide-forgot-password.const';
import { PasswordRequestDto } from '@/types/guide/guide-forgot-password.types';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import ConnectDB from '@/config/db';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import GuideForgotPasswordModel from '@/models/guide/guide-forgot-password.model';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import VERIFY_USER_ROLE from '@/lib/auth/verify-user-role';
import { buildGuidePasswordDto } from '@/lib/build-responses/build-guide-password-dto';
import guideUpdatePasswordHtml from '@/lib/html/guide-password-update.html';
import { mailer } from '@/config/node-mailer';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

interface ApproveRequestBody {
    newPass: string;
    sendEmail: boolean;
}

async function approveRequestHandler(
    request: NextRequest,
    { params }: RouteParams
): Promise<HandlerResult<PasswordRequestDto>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid request ID format', 400);
    }

    let body: ApproveRequestBody;

    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid request body", 400);
    }

    const { newPass, sendEmail = false } = body; // default false


    if (!newPass || typeof newPass !== "string") {
        throw new ApiError("Password is required", 400);
    }

    if (typeof sendEmail !== "boolean") {
        throw new ApiError("sendEmail must be true or false", 400);
    }

    // Reuse SAME regex as model (important)
    const passwordRegex = /^(?=.{6,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;

    if (!passwordRegex.test(newPass)) {
        throw new ApiError(
            "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
            400
        );
    }

    const requestId = new mongoose.Types.ObjectId(id);

    const adminObjectId = await getUserIdFromSession();

    if (!adminObjectId) {
        throw new ApiError('Valid adminId is required', 400);
    }
    await VERIFY_USER_ROLE.SUPPORT(adminObjectId);

    let updatedPass: string | null = null;
    // Execute approval and password update in a single transaction
    const updatedRequest = await withTransaction(async (session) => {
        // Fetch the request document with guide info to get user ID
        const requestWithGuide = await GuideForgotPasswordModel.findById(requestId)
            .populate<{ guideId: { owner: { user: mongoose.Types.ObjectId } } }>({
                path: 'guideId',
                select: 'owner.user',
                populate: {
                    path: 'owner.user',
                    select: '_id'
                }
            })
            .session(session || undefined);

        if (!requestWithGuide) {
            throw new ApiError('Password reset request not found', 404);
        }

        // Check if request is already approved or rejected
        if (requestWithGuide.status === FORGOT_PASSWORD_STATUS.APPROVED) {
            throw new ApiError('Request is already approved', 400);
        }

        if (requestWithGuide.status === FORGOT_PASSWORD_STATUS.REJECTED) {
            throw new ApiError('Request is already rejected', 400);
        }

        // Check if request is expired
        if (requestWithGuide.expiresAt < new Date()) {
            throw new ApiError('Cannot approve an expired request', 400);
        }

        // Get the user ID from the guide
        const guide = requestWithGuide.guideId;
        if (!guide?.owner?.user) {
            throw new ApiError('Associated user not found', 404);
        }

        const userId = guide.owner.user._id;

        // Update user's password
        const user = await UserModel.findById(userId).session(session || undefined);
        if (!user) {
            throw new ApiError('User not found', 404);
        }

        updatedPass = newPass;
        user.password = newPass;
        await user.save({ session });

        // Use the instance method to approve the request
        await requestWithGuide.approve(new Types.ObjectId(adminObjectId), { session });

        // Return the updated request DTO
        return await buildGuidePasswordDto(id.toString(), session);
    });

    if(!updatedPass){
        throw new ApiError("Password not updated yet!");
    }
    if (sendEmail) {
        const html = guideUpdatePasswordHtml(updatedRequest.user.email, updatedPass);
        await mailer("Guide new password", updatedRequest.user.email, html);
    }

    return {
        data: updatedRequest,
        status: 200
    };
}

export const POST = withErrorHandler(approveRequestHandler);