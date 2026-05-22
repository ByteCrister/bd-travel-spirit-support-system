// app/api/dashboard/v1/statistics/v1/employees/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { EmployeesStats, CategoryCount } from "@/types/dashboard/statistics.types";
import ConnectDB from "@/config/db";
import EmployeeModel from "@/models/employees/employees.model";

/**
 * MongoDB date filter type
 */
type DateRangeFilter = {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

/**
 * Safely parse a string into a Date object
 */
function parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Build a typed MongoDB date filter from query parameters.
 */
function buildDateFilter(from: string | null, to: string | null): DateRangeFilter {
    const fromDate = parseDate(from);
    const toDate = parseDate(to);

    if (!fromDate && !toDate) return {};

    const createdAt: DateRangeFilter["createdAt"] = {};
    if (fromDate) createdAt.$gte = fromDate;
    if (toDate) createdAt.$lte = toDate;

    return { createdAt };
}

/**
 * Core handler that fetches employees statistics.
 */
async function getEmployeesStats(req: NextRequest): Promise<HandlerResult<EmployeesStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter = buildDateFilter(from, to);

    // 1. Counts by role (employmentType)
    const roleAgg = await EmployeeModel.aggregate<{ label: string; count: number }>([
        { $match: { deletedAt: null, ...dateFilter } },
        { $group: { _id: "$employmentType", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);
    const countsByRole: CategoryCount[] = roleAgg;

    // 2. Counts by department (not implemented – return empty array)
    const countsByDepartment: CategoryCount[] = [];

    // 3. Counts by status
    const statusAgg = await EmployeeModel.aggregate<{ label: string; count: number }>([
        { $match: { deletedAt: null, ...dateFilter } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);
    const countsByStatus: CategoryCount[] = statusAgg;

    // 4. Shifts data (scheduled shifts count)
    const shiftsAgg = await EmployeeModel.aggregate<{ scheduled: number }>([
        { $match: { deletedAt: null, ...dateFilter } },
        { $project: { shiftCount: { $size: "$shifts" } } },
        { $group: { _id: null, scheduled: { $sum: "$shiftCount" } } },
    ]);
    const scheduled = shiftsAgg[0]?.scheduled || 0;

    const shiftsData = {
        scheduled,
        completed: 0, // not tracked
        completionRate: 0,
    };

    return {
        data: {
            countsByRole,
            countsByDepartment,
            countsByStatus,
            shiftsData,
        },
    };
}

// Export the wrapped handler as the GET method
export const GET = withErrorHandler(getEmployeesStats);