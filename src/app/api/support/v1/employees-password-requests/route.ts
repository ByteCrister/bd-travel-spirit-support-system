import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";

import ResetPasswordRequestModel, { IResetPasswordRequest } from "@/models/employees/reset-password-request.model";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import { FilterQuery } from "mongoose";
import { REQUEST_STATUS, RequestStatus } from "@/constants/reset-password-request.const";
import { ResetPasswordRequestPopulated } from "@/types/employee-password-request.types.server";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { USER_ROLE } from "@/constants/user.const";
import { Types } from "mongoose";

/* -----------------------------------------
   Query params
------------------------------------------ */

interface ListQueryParams {
    search?: string;
    status?: RequestStatus | "all";
    sortBy?: string;
    sortDir?: "asc" | "desc";
    page?: string;
    limit?: string;
}

/* -----------------------------------------
   Get list of request for password resets
------------------------------------------ */

export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries()) as ListQueryParams;

    const {
        search,
        status,
        sortBy = "requestedAt",
        sortDir = "desc",
        page = "1",
        limit = "20",
    } = params;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    /* -----------------------------------------
       Base query (typed)
    ------------------------------------------ */

    const query: FilterQuery<IResetPasswordRequest> = {};

    if (status && status !== "all") {
        query.status = status;
    }

    /* -----------------------------------------
       Search
    ------------------------------------------ */

    if (search) {
        const regex = new RegExp(search, "i");

        const [users, employees] = await Promise.all([
            UserModel.find({ $or: [{ email: regex }, { name: regex }] }).select("_id"),
            EmployeeModel.find({
                $or: [
                    { "contactInfo.phone": regex },
                    { "contactInfo.email": regex },
                ],
            }).select("_id"),
        ]);

        query.$or = [
            ...(users.length ? [{ user: { $in: users.map(u => u._id) } }] : []),
            ...(employees.length ? [{ employee: { $in: employees.map(e => e._id) } }] : []),
            { description: regex },
        ];
    }

    /* -----------------------------------------
       Sorting
    ------------------------------------------ */

    const sortFieldMap: Record<string, string> = {
        requesterEmail: "user.email",
        requesterName: "user.name",
        status: "status",
        requestedAt: "requestedAt",
        reviewedAt: "reviewedAt",
        fulfilledAt: "fulfilledAt",
    };

    const sortField = sortFieldMap[sortBy] ?? "requestedAt";
    const sortOrder = sortDir === "asc" ? 1 : -1;

    /* -----------------------------------------
       Query execution
    ------------------------------------------ */

    const [total, requests] = await Promise.all([
        ResetPasswordRequestModel.countDocuments(query),
        ResetPasswordRequestModel.find(query)
            .populate({
                path: "user",
                select: "email name role",
                model: UserModel,
                // this is for main admin dashboard so I have to get only "support" employees 
                match: {
                    role: USER_ROLE.SUPPORT,
                },
            })
            .populate({
                path: "employee",
                select: "contactInfo status",
                model: EmployeeModel,
            })
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limitNum)
            .lean<ResetPasswordRequestPopulated[]>(),
    ]);

    /* -----------------------------------------
       DTO transformation (frontend-safe)
    ------------------------------------------ */

    const data = requests.map((req) => ({
        _id: req._id.toString(),
        requesterEmail: req.user.email,
        requesterName: req.user.name,
        requesterMobile: req.employee?.contactInfo?.phone,
        description: req.description,
        reason: req.denialReason,
        status: req.status,
        requestedAt: req.requestedAt.toISOString(),
        reviewedAt: req.reviewedAt?.toISOString(),
        fulfilledAt: req.fulfilledAt?.toISOString(),
        requestedFromIP: req.requestedFromIP,
        requestedAgent: req.requestedAgent,
        createdAt: req.createdAt.toISOString(),
        updatedAt: req.updatedAt.toISOString(),
    }));

    return {
        data: {
            data,
            meta: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        },
        status: 200,
    };
});


interface ForgotPasswordRequestBody {
    email: string;
    description?: string;
}
/* -----------------------------------------
   Employee requests for password reset
------------------------------------------ */
export const POST = withErrorHandler(async (req: NextRequest) => {

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
});