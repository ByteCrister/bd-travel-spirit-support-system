// api/dashboard/v1/statistics/v1/kpis/route.ts

import { NextRequest } from "next/server";
import { FilterQuery } from "mongoose";

import ConnectDB from "@/config/db";

import { withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";

import { UserModel, IUser } from "@/models/user.model";
import TourModel, { ITour } from "@/models/tours/tour.model";
import BookingModel, { IBooking } from "@/models/tours/booking.model";
import { ReviewModel, IReview } from "@/models/tours/review.model";
import AssetModel, { IAsset } from "@/models/assets/asset.model";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import { ReportModel, IReport } from "@/models/tours/report.model";

import { USER_ROLE } from "@/constants/user.const";
import { ASSET_TYPE } from "@/constants/asset.const";
import { REPORT_STATUS } from "@/constants/report.const";
import { EMPLOYEE_STATUS } from "@/constants/employee.const";
import { BOOKING_PAYMENT_STATUS } from "@/constants/tour-booking.const";

/**
 * GET /api/dashboard/v1/statistics/v1/kpis
 *
 * Returns KPI metrics for the admin dashboard.
 *
 * All reads run inside a transaction to ensure
 * a consistent snapshot of the database.
 */
async function getKPIs(
    req: NextRequest
){
    // Ensure MongoDB connection
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;

    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const from = fromParam ? new Date(fromParam) : undefined;
    const to = toParam ? new Date(toParam) : undefined;

    /**
     * Build date filter for createdAt
     * (used across multiple models)
     */
    const dateFilter: Record<string, unknown> = {};

    if (from || to) {
        dateFilter.createdAt = {};

        if (from) {
            (dateFilter.createdAt as Record<string, Date>).$gte = from;
        }

        if (to) {
            (dateFilter.createdAt as Record<string, Date>).$lte = to;
        }
    }

    /**
     * Run all KPI queries inside a single transaction
     * to ensure consistent reads.
     */
    const result = await withTransaction(async (session) => {
        /**
         * Build typed filters for each collection
         */

        const userFilter: FilterQuery<IUser> = {
            role: USER_ROLE.TRAVELER,
            ...dateFilter,
        };

        const tourFilter: FilterQuery<ITour> = {
            deletedAt: null,
            ...dateFilter,
        };

        const bookingFilter: FilterQuery<IBooking> = {
            deletedAt: null,
            ...dateFilter,
        };

        const imageFilter: FilterQuery<IAsset> = {
            assetType: ASSET_TYPE.IMAGE,
            deletedAt: null,
            ...dateFilter,
        };

        const reportFilter: FilterQuery<IReport> = {
            status: REPORT_STATUS.OPEN,
            deletedAt: null,
            ...dateFilter,
        };

        const employeeFilter: FilterQuery<IEmployee> = {
            status: EMPLOYEE_STATUS.ACTIVE,
            deletedAt: null,
            ...dateFilter,
        };

        /**
         * Execute all KPI queries concurrently
         */
        const [
            totalUsers,
            totalTours,
            totalBookings,
            avgRatingResult,
            totalImages,
            openReports,
            totalRevenueResult,
            activeEmployees,
        ] = await Promise.all([
            /**
             * Total travelers
             */
            UserModel.countDocuments(userFilter).session(session),

            /**
             * Total tours (excluding soft deleted)
             */
            TourModel.countDocuments(tourFilter).session(session),

            /**
             * Total bookings
             */
            BookingModel.countDocuments(bookingFilter).session(session),

            /**
             * Average rating (approved reviews only)
             */
            ReviewModel.aggregate([
                {
                    $match: {
                        isApproved: true,
                        deletedAt: null,
                        ...dateFilter,
                    } as FilterQuery<IReview>,
                },
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$rating" },
                    },
                },
            ]).session(session),

            /**
             * Total uploaded images
             */
            AssetModel.countDocuments(imageFilter).session(session),

            /**
             * Total open reports
             */
            ReportModel.countDocuments(reportFilter).session(session),

            /**
             * Total revenue from PAID bookings
             */
            BookingModel.aggregate([
                {
                    $match: {
                        "payment.status": BOOKING_PAYMENT_STATUS.PAID,
                        deletedAt: null,
                        ...dateFilter,
                    } as FilterQuery<IBooking>,
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalPaid" },
                    },
                },
            ]).session(session),

            /**
             * Active employees
             */
            EmployeeModel.countDocuments(employeeFilter).session(session),
        ]);

        /**
         * Extract aggregation results
         */
        const avgRating = avgRatingResult[0]?.avg ?? 0;
        const totalRevenue = totalRevenueResult[0]?.total ?? 0;

        return {
            totalUsers,
            totalTours,
            totalBookings,
            avgRating,
            totalImages,
            openReports,
            totalRevenue,
            activeEmployees,
        };
    });

    /**
     * Return KPI data
     */
    return { data: result };
}

/**
 * Wrap handler with global error handler
 */
export const GET = withErrorHandler(getKPIs);