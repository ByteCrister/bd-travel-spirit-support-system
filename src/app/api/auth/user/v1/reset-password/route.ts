// app/api/auth/user/v1/reset-password/route.ts
// Called after OTP verification to set a new password for an admin user.

import { NextRequest } from 'next/server';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import UserModel from '@/models/user.model';
import ConnectDB from '@/config/db';
import { USER_ROLE } from '@/constants/user.const';
import { authRateLimit } from '@/lib/upstash-redis/auth-rate-limit';

async function ResetPasswordHandler(req: NextRequest) {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();
    const newPassword = body.newPassword;

    if (!email || !newPassword) {
        throw new ApiError('Email and new password are required', 400);
    }

    // Password strength validation
    const passwordRegex = /^(?=.{6,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;
    if (!passwordRegex.test(newPassword)) {
        throw new ApiError(
            "Password must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
            400
        );
    }

    /* ----------------------------------------
       RATE LIMIT (per email, prevent brute force)
    ----------------------------------------- */
    const allowed = await authRateLimit({
        identifier: `reset-password:${email}`,
        limit: 5,
        window: 300, // 5-minute window
    });

    if (!allowed) {
        throw new ApiError("Too many requests. Please try again later.", 429);
    }

    await ConnectDB();

    // Only allow admin users to use this endpoint.
    // OTP was already verified in the /auth/token/v1 PATCH call (which marks the token used).
    const user = await UserModel.findOne({ email, role: USER_ROLE.ADMIN }).select('+password');
    if (!user) {
        throw new ApiError('Admin account not found.', 404);
    }

    // Update password — hashing happens via UserModel pre-save hook
    user.password = newPassword;
    await user.save();

    return {
        data: {
            success: true,
            message: 'Password has been successfully reset.',
        },
        status: 200,
    };
}

export const POST = withErrorHandler(ResetPasswordHandler);
