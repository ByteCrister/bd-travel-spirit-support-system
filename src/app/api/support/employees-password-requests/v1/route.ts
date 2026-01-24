import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";

import ResetPasswordRequestModel, { IResetPasswordRequest } from "@/models/employees/reset-password-request.model";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import { FilterQuery, PipelineStage } from "mongoose";
import { REQUEST_STATUS, RequestStatus } from "@/constants/reset-password-request.const";
// import { ResetPasswordRequestPopulated } from "@/types/employee-password-request.types.server";
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
       Base query - first filter by support users
    ------------------------------------------ */

    // First, get all support user IDs
    const supportUsers = await UserModel.find({
        role: USER_ROLE.SUPPORT
    }).select("_id").lean();

    const supportUserIds = supportUsers.map(user => user._id);

    const query: FilterQuery<IResetPasswordRequest> = {
        user: { $in: supportUserIds }
    };

    if (status && status !== "all") {
        query.status = status;
    }

    /* -----------------------------------------
       Search within support users
    ------------------------------------------ */
    if (search) {
        const regex = new RegExp(search, "i");

        // Get support users matching search
        const matchingSupportUsers = await UserModel.find({
            _id: { $in: supportUserIds },
            $or: [{ email: regex }, { name: regex }]
        }).select("_id").lean();

        // Get employees of support users matching search
        const matchingEmployees = await EmployeeModel.find({
            user: { $in: supportUserIds },
            $or: [
                { "contactInfo.phone": regex },
                { "contactInfo.email": regex },
            ],
        }).select("_id").lean();

        const searchConditions = [];

        if (matchingSupportUsers.length > 0) {
            searchConditions.push({ user: { $in: matchingSupportUsers.map(u => u._id) } });
        }

        if (matchingEmployees.length > 0) {
            searchConditions.push({ employee: { $in: matchingEmployees.map(e => e._id) } });
        }

        searchConditions.push({ description: regex });

        if (searchConditions.length > 0) {
            query.$or = searchConditions;
        }
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
       Query execution with aggregation for better control
    ------------------------------------------ */

    // Use aggregation to properly handle population and filtering
    const aggregationPipeline: PipelineStage[] = [
        { $match: query },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $lookup: {
                from: "employees",
                localField: "employee",
                foreignField: "_id",
                as: "employeeInfo"
            }
        },
        { $unwind: { path: "$employeeInfo", preserveNullAndEmptyArrays: true } },
        {
            $match: {
                "userInfo.role": USER_ROLE.SUPPORT
            }
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: limitNum }
    ];

    const countPipeline = [
        { $match: query },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" },
        {
            $match: {
                "userInfo.role": USER_ROLE.SUPPORT
            }
        },
        { $count: "total" }
    ];

    const [requests, countResult] = await Promise.all([
        ResetPasswordRequestModel.aggregate(aggregationPipeline),
        ResetPasswordRequestModel.aggregate(countPipeline)
    ]);

    const total = countResult[0]?.total || 0;

    /* -----------------------------------------
       DTO transformation (frontend-safe)
    ------------------------------------------ */

    const data = requests.map((req) => ({
        _id: req._id.toString(),
        requesterEmail: req.userInfo?.email || "",
        requesterName: req.userInfo?.name || "",
        requesterMobile: req.employeeInfo?.contactInfo?.phone || "",
        description: req.description,
        reason: req.denialReason,
        status: req.status,
        requestedAt: req.requestedAt?.toISOString(),
        reviewedAt: req.reviewedAt?.toISOString(),
        fulfilledAt: req.fulfilledAt?.toISOString(),
        requestedFromIP: req.requestedFromIP,
        requestedAgent: req.requestedAgent,
        createdAt: req.createdAt?.toISOString(),
        updatedAt: req.updatedAt?.toISOString(),
    }));

    console.log(requests);

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