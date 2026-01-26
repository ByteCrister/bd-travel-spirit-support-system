// api/auth/token/v1

import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import {
    EMAIL_VERIFICATION_PURPOSE,
    EMAIL_VERIFICATION_PURPOSE_VALUES,
    EmailVerificationPurpose,
} from '@/constants/email-verification-purpose.const';
import { ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { EmailVerificationToken } from '@/models/email-verification-token.model';
import ApplicationTokenHtml from '@/lib/html/application-token.html';
import ConnectDB from '@/config/db';
import GuideModel from '@/models/guide/guide.model';
import { GUIDE_STATUS } from '@/constants/guide.const';
import UserModel from '@/models/user.model';
import { USER_ROLE } from '@/constants/user.const';
import { mailer } from '@/config/node-mailer';

const DISALLOWED_ROLES: USER_ROLE[] = [
    USER_ROLE.TRAVELER,
    USER_ROLE.SUPPORT,
    USER_ROLE.ASSISTANT,
    USER_ROLE.ADMIN,
];

const ROLE_FRIENDLY_MESSAGE: Partial<Record<USER_ROLE, string>> = {
    [USER_ROLE.TRAVELER]: "A Traveler account already exists for this email.",
    [USER_ROLE.SUPPORT]: "This email belongs to a Support account.",
    [USER_ROLE.ASSISTANT]: "This email belongs to an Assistant account.",
    [USER_ROLE.ADMIN]: "This email belongs to an Admin account.",
};

/**
 * Token generation logic wrapped in transaction
 */
async function generateEmailVerificationToken(
    email: string,
    purpose: EmailVerificationPurpose,
    session?: mongoose.ClientSession
): Promise<string> {
    // Check for existing valid token
    const existingToken = await EmailVerificationToken.findOne({
        email,
        purpose,
        usedAt: null,
        expiresAt: { $gt: new Date() },
    }).session(session || null);

    if (existingToken) {
        // If a valid token exists, we don't generate a new one to prevent abuse
        // Instead, we'll return a placeholder and rely on rate limiting at the API level
        throw new ApiError(
            'A verification token has already been sent recently. Please check your email or try again later.',
            429
        );
    }

    // Generate new token
    const plainToken = await EmailVerificationToken.generateToken(
        email,
        purpose,
        session
    );

    return plainToken;
}

/**
 * Main handler function for token generation
 */
export default async function GuideAppTokenPostHandler(
    req: NextRequest
) {
    const body = (await req.json()) as { email: string };
    const email = body.email?.toLowerCase().trim();

    const purpose = EMAIL_VERIFICATION_PURPOSE.GUIDE_APPLICATION;

    /* =======================
       Basic Validation
    ======================= */
    if (!email) {
        throw new ApiError('Email is required', 400);
    }

    if (!Object.values(EMAIL_VERIFICATION_PURPOSE_VALUES).includes(purpose)) {
        throw new ApiError('Invalid verification purpose', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError('Invalid email format', 400);
    }

    /* =======================
       Generate Token (in transaction)
    ======================= */
    let plainToken: string = '';

    await ConnectDB();

    // Use withTransaction helper
    plainToken = await withTransaction(
        async (session) => {

            /* ---------------------------------------------------------------------- */
            /* CHECK EXISTING GUIDE APPLICATION                                 */
            /* ---------------------------------------------------------------------- */

            const user = await UserModel.findOne({ email })
                .select("+password")
                .session(session);

            if (user && DISALLOWED_ROLES.includes(user.role as USER_ROLE)) {
                throw new ApiError(
                    ROLE_FRIENDLY_MESSAGE[user.role] ?? "Account exists with this email.",
                    409
                );
            }

            if (user) {
                const existingGuide = await GuideModel.findOne({
                    "owner.user": user._id,
                })
                    .select("+accessToken")
                    .session(session);

                if (existingGuide?.status === GUIDE_STATUS.PENDING) {
                    throw new ApiError("Guide application already pending", 409);
                }

                if (existingGuide?.status === GUIDE_STATUS.APPROVED) {
                    throw new ApiError("User is already an approved guide", 409);
                }
            }

            return await generateEmailVerificationToken(email, purpose, session);
        }
    );

    /* =======================
       Send Email (outside transaction)
    ======================= */
    await mailer(email, "Guide Application Email Verification", ApplicationTokenHtml(plainToken, email));

    return {
        data: {
            success: true,
            message: 'Verification token sent successfully',
        },
        status: 200,
    };
}