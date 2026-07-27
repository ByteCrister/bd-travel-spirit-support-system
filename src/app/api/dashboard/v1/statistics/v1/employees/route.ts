// app/api/dashboard/v1/statistics/v1/employees/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { EmployeesStats, CategoryCount, TimeSeriesPoint } from "@/types/dashboard/statistics.types";
import ConnectDB from "@/config/db";
import EmployeeModel from "@/models/employees/employees.model";

type DateRangeFilter = {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

function parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildDateFilter(from: string | null, to: string | null): DateRangeFilter {
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (!fromDate && !toDate) return {};
    const createdAt: DateRangeFilter["createdAt"] = {};
    if (fromDate) createdAt.$gte = fromDate;
    if (toDate) createdAt.$lte = toDate;
    return { createdAt };
}

async function getEmployeesStats(req: NextRequest): Promise<HandlerResult<EmployeesStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dateFilter = buildDateFilter(from, to);
    const baseMatch = { deletedAt: null, ...dateFilter };

    // 1. Hires over time — group by dateOfJoining day
    const hiresAgg = await EmployeeModel.aggregate<{ date: string; value: number }>([
        { $match: baseMatch },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$dateOfJoining" } },
                value: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", value: 1, _id: 0 } },
    ]);
    const hiresOverTime: TimeSeriesPoint[] = hiresAgg;

    // 2. Counts by status (active / onLeave / suspended / terminated)
    const statusAgg = await EmployeeModel.aggregate<{ label: string; count: number }>([
        { $match: baseMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    const countsByStatus: CategoryCount[] = statusAgg;

    // 3. By employment type (full_time / part_time / contract / intern)
    const employmentTypeAgg = await EmployeeModel.aggregate<{ label: string; count: number }>([
        { $match: { ...baseMatch, employmentType: { $exists: true, $ne: null } } },
        { $group: { _id: "$employmentType", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    const byEmploymentType: CategoryCount[] = employmentTypeAgg;

    // 4. By payment mode (auto / manual)
    const paymentModeAgg = await EmployeeModel.aggregate<{ label: string; count: number }>([
        { $match: baseMatch },
        { $group: { _id: "$paymentMode", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    const byPaymentMode: CategoryCount[] = paymentModeAgg;

    // 5. Payroll status breakdown — unwind payroll array, group by status
    const payrollAgg = await EmployeeModel.aggregate<{ label: string; count: number }>([
        { $match: baseMatch },
        { $unwind: { path: "$payroll", preserveNullAndEmptyArrays: false } },
        { $group: { _id: "$payroll.status", count: { $sum: 1 } } },
        { $project: { label: "$_id", count: 1, _id: 0 } },
        { $sort: { count: -1 } },
    ]);
    const payrollStatus: CategoryCount[] = payrollAgg;

    // 6. Salary statistics (avg / min / max) + total payroll paid amount
    const salaryAgg = await EmployeeModel.aggregate<{
        avg: number;
        min: number;
        max: number;
        currency: string;
    }>([
        { $match: baseMatch },
        {
            $group: {
                _id: "$currency",
                avg: { $avg: "$salary" },
                min: { $min: "$salary" },
                max: { $max: "$salary" },
            },
        },
        { $sort: { avg: -1 } },
        { $limit: 1 },
        { $project: { currency: "$_id", avg: 1, min: 1, max: 1, _id: 0 } },
    ]);

    // Total paid payroll amount (sum of paid payroll records)
    const totalPayrollAgg = await EmployeeModel.aggregate<{ total: number }>([
        { $match: baseMatch },
        { $unwind: { path: "$payroll", preserveNullAndEmptyArrays: false } },
        { $match: { "payroll.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$payroll.amount" } } },
    ]);

    const salaryStats = {
        avg: Math.round(salaryAgg[0]?.avg ?? 0),
        min: salaryAgg[0]?.min ?? 0,
        max: salaryAgg[0]?.max ?? 0,
        totalPayroll: totalPayrollAgg[0]?.total ?? 0,
        currency: salaryAgg[0]?.currency ?? "BDT",
    };

    // 7. Total shifts configured across all employees
    const shiftsAgg = await EmployeeModel.aggregate<{ total: number }>([
        { $match: baseMatch },
        { $project: { shiftCount: { $size: "$shifts" } } },
        { $group: { _id: null, total: { $sum: "$shiftCount" } } },
    ]);
    const totalShifts = shiftsAgg[0]?.total ?? 0;

    // 8. Total employees count
    const totalEmployees = await EmployeeModel.countDocuments(baseMatch);

    return {
        data: {
            hiresOverTime,
            countsByStatus,
            byEmploymentType,
            byPaymentMode,
            payrollStatus,
            salaryStats,
            totalShifts,
            totalEmployees,
        },
    };
}

export const GET = withErrorHandler(getEmployeesStats);