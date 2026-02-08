// api/support/employee-password-requests/v1

import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";

import ResetPasswordRequestModel, { IResetPasswordRequest } from "@/models/employees/reset-password-request.model";
import UserModel from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import { FilterQuery, PipelineStage } from "mongoose";
import { USER_ROLE } from "@/constants/user.const";
import { RequestStatus } from "@/constants/reset-password-request.const";
import { sanitizeSearch } from "@/lib/helpers/sanitize-search";

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

export default async function EmpPassReqListGetHandler(request: NextRequest) {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries()) as ListQueryParams;

    const {
        search: rawSearch,
        status,
        sortBy = "requestedAt",
        sortDir = "desc",
        page = "1",
        limit = "20",
    } = params;
    const search = sanitizeSearch(rawSearch);

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
};