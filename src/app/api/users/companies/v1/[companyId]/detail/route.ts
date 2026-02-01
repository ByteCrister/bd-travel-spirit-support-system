// api/users/companies/v1/[companyId]/detail
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import GuideModel from "@/models/guide/guide.model";
import TourModel from "@/models/tours/tour.model";
import EmployeeModel from "@/models/employees/employees.model";
import { ReportModel } from "@/models/tours/report.model";
import { ReviewModel } from "@/models/tours/review.model";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { TOUR_STATUS } from "@/constants/tour.const";
import { EMPLOYEE_STATUS } from "@/constants/employee.const";
import { REPORT_STATUS } from "@/constants/report.const";
import { getCollectionName } from "@/lib/helpers/get-collection-name";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

// Types based on your interfaces
interface CompanyKpisDTO {
    totalTours: number;
    totalEmployees: number;
    openReports: number;
    publishedTours: number;
    totalBookings: number;
    avgTourRating: number;
}

interface CompanyOverviewDTO {
    companyId: string;
    companyName?: string;
    kpis: CompanyKpisDTO;
    serverNow: string;
}

// Type-safe aggregation results
interface TourAggregationResult {
    _id: null;
    totalTours: number;
    publishedTours: number;
    totalBookings: number;
    avgTourRating: number;
}

interface EmployeeCountResult {
    _id: null;
    count: number;
}

interface ReportCountResult {
    _id: null;
    count: number;
}

interface ReviewRatingResult {
    _id: Types.ObjectId;
    avgRating: number;
}

export const GET = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ companyId: string }> }
) => {
    const companyId = resolveMongoId((await params).companyId);

    const companyObjectId = new Types.ObjectId(companyId);

    // Check if company (Guide) exists
    const company = await GuideModel.findById(companyObjectId);
    if (!company) {
        throw new ApiError("Company not found", 404);
    }

    // Run all queries in parallel for better performance
    const [
        tourAggregationResult,
        employeeCountResult,
        reportCountResult,
        reviewAggregationResult
    ] = await Promise.all([
        // 1. Tour KPIs aggregation
        TourModel.aggregate<TourAggregationResult>([
            {
                $match: {
                    companyId: companyObjectId,
                    deletedAt: null,
                    status: { $ne: TOUR_STATUS.DRAFT } // Exclude drafts
                }
            },
            {
                $group: {
                    _id: null,
                    totalTours: { $sum: 1 },
                    publishedTours: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", TOUR_STATUS.ACTIVE] },
                                1,
                                0
                            ]
                        }
                    },
                    totalBookings: {
                        $sum: {
                            $reduce: {
                                input: "$departures",
                                initialValue: 0,
                                in: { $add: ["$$value", { $ifNull: ["$$this.seatsBooked", 0] }] }
                            }
                        }
                    },
                    totalRatingSum: { $sum: { $ifNull: ["$ratings.average", 0] } },
                    ratedToursCount: {
                        $sum: {
                            $cond: [
                                { $gt: [{ $ifNull: ["$ratings.average", 0] }, 0] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    totalTours: 1,
                    publishedTours: 1,
                    totalBookings: 1,
                    avgTourRating: {
                        $cond: [
                            { $gt: ["$ratedToursCount", 0] },
                            { $divide: ["$totalRatingSum", "$ratedToursCount"] },
                            0
                        ]
                    }
                }
            }
        ]).exec(),

        // 2. Employee count
        EmployeeModel.aggregate<EmployeeCountResult>([
            {
                $match: {
                    companyId: companyObjectId,
                    deletedAt: null,
                    status: EMPLOYEE_STATUS.ACTIVE
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]).exec(),

        // 3. Open reports count
        ReportModel.aggregate<ReportCountResult>([
            {
                $match: {
                    status: REPORT_STATUS.OPEN, // Assuming "OPEN" is the status for open reports
                    deletedAt: null
                }
            },
            {
                $lookup: {
                    from: getCollectionName(TourModel),
                    localField: "tour",
                    foreignField: "_id",
                    as: "tourInfo"
                }
            },
            { $unwind: { path: "$tourInfo", preserveNullAndEmptyArrays: false } },
            {
                $match: {
                    "tourInfo.companyId": companyObjectId,
                    "tourInfo.deletedAt": null
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            }
        ]).exec(),

        // 4. Reviews for average rating (across all tours)
        ReviewModel.aggregate<ReviewRatingResult>([
            {
                $match: {
                    deletedAt: null,
                    isApproved: true
                }
            },
            {
                $lookup: {
                    from: getCollectionName(TourModel),
                    localField: "tour",
                    foreignField: "_id",
                    as: "tourInfo"
                }
            },
            { $unwind: { path: "$tourInfo", preserveNullAndEmptyArrays: false } },
            {
                $match: {
                    "tourInfo.companyId": companyObjectId,
                    "tourInfo.deletedAt": null
                }
            },
            {
                $group: {
                    _id: "$tourInfo.companyId",
                    avgRating: { $avg: "$rating" }
                }
            }
        ]).exec()
    ]);

    // Extract values from aggregation results
    const tourData = tourAggregationResult[0] || {
        totalTours: 0,
        publishedTours: 0,
        totalBookings: 0,
        avgTourRating: 0
    };

    const employeeCount = employeeCountResult[0]?.count || 0;
    const openReportsCount = reportCountResult[0]?.count || 0;
    const overallAvgRating = reviewAggregationResult[0]?.avgRating || 0;

    // Use tour's average rating if available, otherwise fall back to review average
    const finalAvgRating = tourData.avgTourRating > 0
        ? tourData.avgTourRating
        : overallAvgRating;

    // Construct KPIs
    const kpis: CompanyKpisDTO = {
        totalTours: tourData.totalTours,
        totalEmployees: employeeCount,
        openReports: openReportsCount,
        publishedTours: tourData.publishedTours,
        totalBookings: tourData.totalBookings,
        avgTourRating: parseFloat(finalAvgRating.toFixed(1)) // Round to 1 decimal
    };

    // Construct response
    const overviewData: CompanyOverviewDTO = {
        companyId: companyId.toString(),
        companyName: company.companyName,
        kpis,
        serverNow: new Date().toISOString()
    };

    return {
        data: overviewData,
        status: 200,
    }
})