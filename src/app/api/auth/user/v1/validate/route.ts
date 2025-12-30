// app/api/auth/user/v1/validate/route.ts
import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { compare } from "bcryptjs";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { USER_ROLE } from "@/constants/user.const";

export const POST = withErrorHandler(async (req: NextRequest) => {

    const { email, password } = await req.json();

    if (!email || !password) {
        throw new ApiError("Email and password required.", 400);
    }

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    // ---- Rate limit by IP ----
    const ipAllowed = await authRateLimit({
        identifier: `ip:${ip}`,
        limit: 10,
        window: 60,
    });

    if (!ipAllowed) {
        throw new ApiError("Too many attempts. Try again in a minute.", 429);
    }

    // ---- RATE LIMIT BY EMAIL ----
    const emailAllowed = await authRateLimit({
        identifier: `ip:${ip}:email:${email}`,
        limit: 5, // 5 attempts / 1 minute
        window: 60,
    });

    if (!emailAllowed) {
        throw new ApiError("Too many attempts on this account. Try again soon.", 429);
    }

    await ConnectDB();

    const user = await UserModel.findOne({ email, role: [USER_ROLE.ADMIN, USER_ROLE.SUPPORT] }).select("+password");

    if (!user) {
        throw new ApiError("No account found with this email address or insufficient role", 401);
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
        throw new ApiError("Invalid password.", 401);
    }

    return {
        data: {
            id: (user._id as Types.ObjectId).toString(),
            email: user.email,
            role: user.role,
        }, status: 200
    };
})
