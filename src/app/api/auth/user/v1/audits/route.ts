// app/api/auth/user/v1/audits/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import AuditModel, { IAuditDoc, IAuditModel } from "@/models/audit.model";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { USER_ROLE } from "@/constants/user.const";
import { AuditListApiResponse, AuditLog, AuditQueryParams } from "@/types/current-user.types";
import VERIFY_USER_ROLE from "../../../../../../lib/auth/verify-user-role";

type ParsedAuditQueryParams =
    Required<Pick<AuditQueryParams, "page" | "pageSize">>
    & Pick<AuditQueryParams, "date" | "startDate" | "endDate">;

type DateFilter = {
    $gte?: Date;
    $lte?: Date;
};

// Helper function to parse and validate query parameters
function parseQueryParams(request: NextRequest): ParsedAuditQueryParams {
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10))
    );

    const date = searchParams.get("date") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    if (date && (startDate || endDate)) {
        throw new ApiError(
            "Cannot use 'date' parameter with 'startDate' or 'endDate'",
            400
        );
    }

    return { page, pageSize, date, startDate, endDate };
}

// Helper function to build date filter
function buildDateFilter(params: Pick<AuditQueryParams, 'date' | 'startDate' | 'endDate'>): DateFilter | undefined {
    if (params.date) {
        const selectedDate = new Date(params.date);

        // Validate date format
        if (isNaN(selectedDate.getTime())) {
            throw new ApiError("Invalid date format", 400);
        }

        const startOfDay = new Date(selectedDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        return {
            $gte: startOfDay,
            $lte: endOfDay
        };
    }

    const dateFilter: DateFilter = {};

    if (params.startDate) {
        const startDate = new Date(params.startDate);
        if (isNaN(startDate.getTime())) {
            throw new ApiError("Invalid startDate format", 400);
        }
        dateFilter.$gte = startDate;
    }

    if (params.endDate) {
        const endDate = new Date(params.endDate);
        if (isNaN(endDate.getTime())) {
            throw new ApiError("Invalid endDate format", 400);
        }
        endDate.setUTCHours(23, 59, 59, 999);
        dateFilter.$lte = endDate;
    }

    return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
}

// Helper function to transform audit document to API response format
function transformAuditDoc(audit: IAuditDoc): AuditLog {
    return {
        _id: (audit._id as Types.ObjectId).toString(),
        targetModel: audit.targetModel,
        target: audit.target.toString(),
        actor: audit.actor?.toString(),
        actorModel: audit.actorModel,
        action: audit.action,
        note: audit.note,
        ip: audit.ip,
        userAgent: audit.userAgent,
        changes: audit.changes,
        createdAt: audit.createdAt.toISOString(),
    };
}

// Main handler function
async function handler(request: NextRequest): Promise<HandlerResult<AuditListApiResponse>> {
    // 1. Get current user ID
    const currentUserId = await getUserIdFromSession();

    if (!currentUserId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Validate user has required role
    await VERIFY_USER_ROLE.MULTIPLE(currentUserId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT])

    // 3. Parse and validate query parameters
    const queryParams = parseQueryParams(request);

    // 4. Calculate skip for pagination
    const skip = (queryParams.page - 1) * queryParams.pageSize;

    // 5. Build query filter
    const filter: {
        $or: Array<{
            actor: Types.ObjectId;
            actorModel: string;
        }>;
        createdAt?: DateFilter;
    } = {
        $or: [
            { actor: new Types.ObjectId(currentUserId), actorModel: "User" },
            { actor: new Types.ObjectId(currentUserId), actorModel: "Employee" },
        ]
    };

    // 6. Add date filters
    const dateFilter = buildDateFilter(queryParams);
    if (dateFilter) {
        filter.createdAt = dateFilter;
    }

    // 7. Execute query with pagination
    const [audits, total] = await Promise.all([
        (AuditModel as IAuditModel).find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(queryParams.pageSize)
            .lean<IAuditDoc[]>()
            .exec(),
        (AuditModel as IAuditModel).countDocuments(filter).exec(),
    ]);

    // 8. Transform the data
    const transformedAudits = audits.map(transformAuditDoc);

    // 9. Build response
    const responseData: AuditListApiResponse = {
        success: true,
        audits: transformedAudits,
        total,
        page: queryParams.page,
        pageSize: queryParams.pageSize,
    };

    return {
        data: responseData,
        status: 200,
    };
}

// Export the wrapped handler
export const GET = withErrorHandler(handler);