// app/api/support/guide-password-requests/v1/[id]/reject/route.ts

import { NextRequest } from 'next/server';
import mongoose, { Types } from 'mongoose';
import GuideForgotPasswordModel from '@/models/guide/guide-forgot-password.model';
import { FORGOT_PASSWORD_STATUS } from '@/constants/guide-forgot-password.const';
import { PasswordRequestDto } from '@/types/guide/guide-forgot-password.types';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import ConnectDB from '@/config/db';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { getUserIdFromSession } from '@/lib/auth/session.auth';
import VERIFY_USER_ROLE from '@/lib/auth/verify-user-role';
import { buildGuidePasswordDto } from '@/lib/build-responses/build-guide-password-dto';
import guideUpdatePasswordRejectHtml from '@/lib/html/guide-password-reject.html';
import { mailer } from '@/config/node-mailer';
import GuideModel from '@/models/guide/guide.model';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

interface RejectRequestBody {
    reason: string;
}

async function rejectRequestHandler(
    request: NextRequest,
    { params }: RouteParams
): Promise<HandlerResult<PasswordRequestDto>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid request ID format', 400);
    }

    let body: RejectRequestBody;
    try {
        body = await request.json();
    } catch {
        throw new ApiError('Invalid request body', 400);
    }

    const { reason } = body;

    if (!reason || typeof reason !== "string") {
        throw new ApiError("Rejection reason is required", 400);
    }

    const trimmedReason = reason.trim();

    if (trimmedReason.length < 1 || trimmedReason.length > 300) {
        throw new ApiError('Reason must be between 1 and 300 characters', 400);
    }

    const requestId = new mongoose.Types.ObjectId(id);

    const adminObjectId = await getUserIdFromSession();

    if (!adminObjectId) {
        throw new ApiError('Valid admin session required', 401);
    }

    await VERIFY_USER_ROLE.SUPPORT(adminObjectId);

    let userEmail: string | null = null;

    const updatedRequest = await withTransaction(async (session) => {
        // Fetch request with guide and user email
        const requestWithGuide = await GuideForgotPasswordModel.findById(requestId)
            .populate<{ guideId: { owner: { user: { email: string } } } }>({
                path: 'guideId',
                model: GuideModel,
                select: 'owner.user',
                populate: {
                    path: 'owner.user',
                    select: 'email'
                }
            })
            .session(session || undefined);

        if (!requestWithGuide) {
            throw new ApiError('Password reset request not found', 404);
        }

        if (requestWithGuide.status === FORGOT_PASSWORD_STATUS.APPROVED) {
            throw new ApiError('Request is already approved', 400);
        }

        if (requestWithGuide.status === FORGOT_PASSWORD_STATUS.REJECTED) {
            throw new ApiError('Request is already rejected', 400);
        }

        if (requestWithGuide.expiresAt < new Date()) {
            throw new ApiError('Cannot reject an expired request', 400);
        }

        const guide = requestWithGuide.guideId;
        if (!guide?.owner?.user || !guide.owner.user.email) {
            throw new ApiError('Associated user email not found', 404);
        }

        userEmail = guide.owner.user.email;

        // Call model method
        await requestWithGuide.reject(
            new Types.ObjectId(adminObjectId),
            trimmedReason,
            { session }
        );

        return await buildGuidePasswordDto(id.toString(), session);
    });

    // Send rejection email (outside transaction)
    if (userEmail) {
        try {
            const html = guideUpdatePasswordRejectHtml(userEmail, trimmedReason);
            await mailer(userEmail, "Guide Password Reset Rejected", html);
        } catch (emailError) {
            console.error("Failed to send rejection email:", emailError);
        }
    }

    return {
        data: updatedRequest,
        status: 200
    };
}

export const POST = withErrorHandler(rejectRequestHandler);