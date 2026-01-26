// api/auth/token/v1

import { NextRequest } from 'next/server';
import {
    EMAIL_VERIFICATION_PURPOSE,
    EMAIL_VERIFICATION_PURPOSE_VALUES,
    EmailVerificationPurpose,
} from '@/constants/email-verification-purpose.const';
import { ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { ClientSession } from 'mongoose';
import { EmailVerificationToken } from '@/models/email-verification-token.model';
import ConnectDB from '@/config/db';

interface PatchRequestBody {
    email?: string;
    token?: string;
}

interface ValidationResponse {
    success: boolean;
    message: string;
}

/**
 * Validate token in a transaction
 */
async function validateVerificationToken(
    email: string,
    token: string,
    purpose: EmailVerificationPurpose,
    session?: ClientSession
): Promise<void> {
    // Find valid token
    const tokenDoc = await EmailVerificationToken.findByToken(
        email,
        token,
        session
    );

    if (!tokenDoc) {
        throw new ApiError('Invalid or expired token', 400);
    }

    if (!tokenDoc.isValid()) {
        throw new ApiError('Token already used or expired', 400);
    }

    // Mark as used within the same transaction
    await tokenDoc.markAsUsed(session);
}

/**
 * Main handler function for token validation
 */
export default async function GuideAppTokenPatchHandler(
    req: NextRequest
): Promise<HandlerResult<ValidationResponse>> {
    const body = (await req.json()) as PatchRequestBody;
    const email = body.email?.toLowerCase().trim();
    const token = body.token?.trim();
    const purpose = EMAIL_VERIFICATION_PURPOSE.GUIDE_APPLICATION;

    /* =======================
       Validation
    ======================= */
    if (!email || !token) {
        throw new ApiError('Email and token are required', 400);
    }

    if (!EMAIL_VERIFICATION_PURPOSE_VALUES.includes(purpose)) {
        throw new ApiError('Invalid verification purpose', 400);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError('Invalid email format', 400);
    }

    // Token format validation (6-digit numeric token)
    const tokenRegex = /^\d{6}$/;
    if (!tokenRegex.test(token)) {
        throw new ApiError('Token must be a 6-digit number', 400);
    }

    await ConnectDB();

    /* =======================
       Validate Token (in transaction)
    ======================= */
    await withTransaction(async (session) => {
        await validateVerificationToken(email, token, purpose, session);
    });

    return {
        data: {
            success: true,
            message: 'Token validated successfully',
        },
        status: 200,
    };
}