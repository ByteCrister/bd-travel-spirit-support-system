// api/support/employee-password-requests/v1

import { NextRequest } from "next/server";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";

import ResetPasswordRequestModel from "@/models/employees/reset-password-request.model";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { USER_ROLE } from "@/constants/user.const";
import { Types } from "mongoose";

interface ForgotPasswordRequestBody {
    email: string;
    description?: string;
}

export default async function EmpPassReqPostHandler(req: NextRequest) {

    const body: ForgotPasswordRequestBody = await req.json();
    const email = body.email?.trim().toLowerCase();
    const description = body.description?.trim();

    /* ----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new ApiError("Invalid email address", 400);
    }

    /* ----------------------------------------
    RATE LIMIT (per email)
    ----------------------------------------- */

    const allowed = await authRateLimit({
        identifier: email,
        limit: 5,
        window: 60,
    });

    if (!allowed) {
        throw new ApiError(
            "Too many requests. Please try again later.",
            429
        );
    }

    /* ----------------------------------------
    TRANSACTION
    ----------------------------------------- */

    await ConnectDB();

    const result = await withTransaction(async (session) => {
        /* ----------------------------------------
           USER LOOKUP
        ----------------------------------------- */

        const user = await UserModel.findOne({ email, role: { $in: [USER_ROLE.SUPPORT] } }) // only for "support" members
            .select("_id role")
            .session(session);

        if (!user) {
            // Prevent email enumeration
            return {
                message:
                    "If an account exists, your request has been submitted.",
            };
        }

        /* ----------------------------------------
           EMPLOYEE LOOKUP (OPTIONAL)
        ----------------------------------------- */

        const employee = await EmployeeModel.findOne({ user: user._id })
            .select("_id")
            .session(session)
            .lean();

        if (!employee) {
            // Prevent email enumeration
            return {
                message:
                    "If an account exists, your request has been submitted.",
            };
        }

        /* ----------------------------------------
           DUPLICATE PENDING CHECK
        ----------------------------------------- */

        const existingRequest =
            await ResetPasswordRequestModel.findOne({
                user: user._id,
                status: REQUEST_STATUS.PENDING,
            }).session(session);

        if (existingRequest) {
            throw new ApiError(
                "You already have a pending password reset request.",
                400
            );
        }

        /* ----------------------------------------
           METADATA
        ----------------------------------------- */

        const xForwardedFor = req.headers.get("x-forwarded-for");
        const ip = xForwardedFor
            ? xForwardedFor.split(",")[0].trim()
            : undefined;

        const agent = req.headers.get("user-agent") || undefined;

        /* ----------------------------------------
           CREATE REQUEST
        ----------------------------------------- */

        const resetRequest =
            await ResetPasswordRequestModel.createRequest(
                {
                    userId: user._id as Types.ObjectId,
                    employeeId: employee._id as Types.ObjectId,
                    description,
                    ip,
                    agent,
                },
                session
            );

        const doc = Array.isArray(resetRequest)
            ? resetRequest[0]
            : resetRequest;

        return {
            message: "Your password reset request has been submitted.",
            requestId: (doc._id as Types.ObjectId).toString(),
        };
    });

    return {
        data: result,
        status: 201,
    };
}