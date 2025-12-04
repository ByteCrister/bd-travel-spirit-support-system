// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { USER_ROLE } from "@/constants/user.const";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";
import { authRateLimit } from "@/lib/redis/auth-rate-limit";
import ResetPasswordRequestModel from "@/models/employees/reset-password-request.model";
import { Types } from "mongoose";
import UserModel from "@/models/user.model";
import ConnectDB from "@/config/db";

interface ForgotPasswordRequestBody {
    email: string;
    description?: string;
}

export async function POST(req: NextRequest) {
    try {
        await ConnectDB()

        const body: ForgotPasswordRequestBody = await req.json();
        const email = body.email?.trim().toLowerCase();
        const description = body.description?.trim();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ success: false, message: "Invalid email" }, { status: 400 });
        }

        // Rate limit per email
        const allowed = await authRateLimit({ identifier: email, limit: 5, window: 60 });
        if (!allowed) {
            return NextResponse.json({ success: false, message: "Too many requests. Please try again later." }, { status: 429 });
        }

        // Check if at least one support user exists
        const supportUserExists = await UserModel.exists({ role: USER_ROLE.SUPPORT });
        if (!supportUserExists) {
            return NextResponse.json({ success: false, message: "No support user available to handle password reset requests." }, { status: 400 });
        }

        // Prevent multiple pending requests for the same email
        const existing = await ResetPasswordRequestModel.findOne({
            requesterEmail: email,
            status: REQUEST_STATUS.PENDING,
        });
        if (existing) {
            return NextResponse.json({ success: false, message: "You already have a pending password reset request." }, { status: 400 });
        }

        // Capture IP and user agent
        const xForwardedFor = req.headers.get("x-forwarded-for");
        const ip = xForwardedFor
            ? xForwardedFor.split(",")[0].trim()  // take the first IP if multiple
            : undefined;

        const userAgent = req.headers.get("user-agent") || undefined;
        // Create reset password request
        const resetRequest = await ResetPasswordRequestModel.createRequest({
            email,
            description,
            role: USER_ROLE.SUPPORT, // requester role is SUPPORT
            requestedFromIP: ip,
            requestedAgent: userAgent,
        });

        return NextResponse.json({
            success: true,
            message: "Your password reset request has been submitted.",
            requestId: (resetRequest._id as Types.ObjectId).toString(),
        });
    } catch (err) {
        console.log("Forgot password request error:", err);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}