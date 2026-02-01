// app/api/users/companies/v1/route.ts
import { NextRequest } from 'next/server';
import mongoose, { Types } from 'mongoose';

import type {
    CompanyQueryParams,
    CompanySortBy,
    SortDir,
    CompanyListResponseDTO,
    CompanyDashboardStatsDTO,
    CompanyRowDTO
} from '@/types/company.types';
import { COMPANY_SORT_FIELDS } from '@/types/company.types';

import ConnectDB from '@/config/db';
import GuideModel from '@/models/guide/guide.model';
import TourModel from '@/models/tours/tour.model';
import EmployeeModel from '@/models/employees/employees.model';
import { GUIDE_STATUS } from '@/constants/guide.const';
import { withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import UserModel from '@/models/user.model';
import { ReviewModel } from '@/models/tours/review.model';

// -----------------------------
// Aggregation Result Types
// -----------------------------
interface AggregationCompany {
    _id: Types.ObjectId;
    companyName: string;
    host: {
        id: Types.ObjectId;
        name: string;
        email: string;
        avatar?: string;
        companyName: string;
        createdAt: Date;
    };
    metrics: {
        employeesCount: number;
        toursCount: number;
        reviewsCount: number;
        averageRating: number;
    };
    timestamps: {
        createdAt: Date;
        updatedAt?: Date | null;
        lastLogin?: Date | null;
    };
    tags: string[];
}

interface AggregationResult {
    metadata: { total: number }[];
    data: AggregationCompany[];
}

// -----------------------------
// Default Query Params
// -----------------------------
const DEFAULT_PARAMS: Required<CompanyQueryParams> = {
    search: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 1,
    limit: 20,
};

// -----------------------------
// Query Param Utilities
// -----------------------------
function parseQueryParam<T>(
    value: string | null,
    defaultValue: T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validator?: (val: any) => boolean
): T {
    if (!value) return defaultValue;

    if (typeof defaultValue === 'number') {
        const num = parseInt(value, 10);
        return (!isNaN(num) && (!validator || validator(num))) ? (num as T) : defaultValue;
    }

    if (typeof defaultValue === 'string') {
        return (!validator || validator(value)) ? (value as T) : defaultValue;
    }

    if (typeof defaultValue === 'boolean') {
        return (value === 'true') as T;
    }

    return defaultValue;
}

function isValidSortBy(value: string): value is CompanySortBy {
    return Object.values(COMPANY_SORT_FIELDS).includes(value as CompanySortBy);
}

function isValidSortDir(value: string): value is SortDir {
    return value === 'asc' || value === 'desc';
}

// -----------------------------
// Aggregation Pipeline
// -----------------------------
function buildAggregationPipeline(params: Required<CompanyQueryParams>) {
    const { search, sortBy, sortDir, page, limit } = params;
    const skip = (page - 1) * limit;

    const matchStage: mongoose.PipelineStage = {
        $match: {
            status: GUIDE_STATUS.APPROVED,
            deletedAt: null,
        },
    };    

    const userLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(UserModel),
            localField: 'owner.user',
            foreignField: '_id',
            as: 'ownerUser',
        },
    };

    const employeeLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(EmployeeModel),
            let: { guideId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$companyId', '$$guideId'] }, deletedAt: null } },
                { $count: 'count' },
            ],
            as: 'employeeData',
        },
    };

    const tourLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(TourModel),
            let: { guideId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$companyId', '$$guideId'] }, deletedAt: null } },
                { $count: 'count' },
            ],
            as: 'tourData',
        },
    };

    const reviewLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(TourModel),
            let: { guideId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$companyId', '$$guideId'] }, deletedAt: null } },
                { $project: { _id: 1 } },
            ],
            as: 'guideTours',
        },
    };

    const unwindToursStage: mongoose.PipelineStage = {
        $unwind: { path: '$guideTours', preserveNullAndEmptyArrays: true },
    };

    const reviewLookupDetailStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(ReviewModel),
            let: { tourId: '$guideTours._id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$tour', '$$tourId'] }, deletedAt: null, isApproved: true } },
                { $project: { rating: 1 } },
            ],
            as: 'tourReviews',
        },
    };

    const groupReviewStage: mongoose.PipelineStage = {
        $group: {
            _id: '$_id',
            root: { $first: '$$ROOT' },
            allReviews: { $push: '$tourReviews' },
        },
    };

    const projectStage: mongoose.PipelineStage = {
        $project: {
            _id: 1,
            companyName: '$root.companyName',
            host: {
                id: '$root.ownerUser._id',
                name: '$root.ownerUser.name',
                email: '$root.ownerUser.email',
                avatar: '$root.ownerUser.avatar',
                createdAt: '$root.ownerUser.createdAt',
            },
            metrics: {
                employeesCount: { $ifNull: [{ $arrayElemAt: ['$root.employeeData.count', 0] }, 0] },
                toursCount: { $ifNull: [{ $arrayElemAt: ['$root.tourData.count', 0] }, 0] },
                reviewsCount: {
                    $reduce: {
                        input: '$allReviews',
                        initialValue: 0,
                        in: { $add: ['$$value', { $size: '$$this' }] },
                    },
                },
                averageRating: {
                    $cond: [
                        {
                            $gt: [
                                {
                                    $reduce: {
                                        input: '$allReviews',
                                        initialValue: 0,
                                        in: { $add: ['$$value', { $size: '$$this' }] },
                                    },
                                },
                                0,
                            ],
                        },
                        {
                            $divide: [
                                {
                                    $reduce: {
                                        input: {
                                            $reduce: {
                                                input: '$allReviews',
                                                initialValue: [],
                                                in: { $concatArrays: ['$$value', '$$this'] },
                                            },
                                        },
                                        initialValue: 0,
                                        in: { $add: ['$$value', '$$this.rating'] },
                                    },
                                },
                                {
                                    $reduce: {
                                        input: '$allReviews',
                                        initialValue: 0,
                                        in: { $add: ['$$value', { $size: '$$this' }] },
                                    },
                                },
                            ],
                        },
                        0,
                    ],
                },
            },
            timestamps: {
                createdAt: '$root.createdAt',
                updatedAt: '$root.updatedAt',
                lastLogin: { $arrayElemAt: ['$root.ownerUser.lastLogin', 0] },
            },
            tags: [],
        },
    };

    const sortFieldMap: Record<CompanySortBy, string> = {
        name: 'companyName',
        averageRating: 'metrics.averageRating',
        reviewsCount: 'metrics.reviewsCount',
        employeesCount: 'metrics.employeesCount',
        toursCount: 'metrics.toursCount',
        createdAt: 'timestamps.createdAt',
    };

    const sortStage: mongoose.PipelineStage = { $sort: { [sortFieldMap[sortBy]]: sortDir === 'asc' ? 1 : -1 } };

    const facetStage: mongoose.PipelineStage = {
        $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: skip }, { $limit: limit }],
        },
    };

    const postLookupSearchStage: mongoose.PipelineStage | null =
        search?.trim()
            ? {
                $match: {
                    $or: [
                        { companyName: { $regex: search.trim(), $options: 'i' } },
                        { 'ownerUser.name': { $regex: search.trim(), $options: 'i' } },
                        { 'ownerUser.email': { $regex: search.trim(), $options: 'i' } },
                    ],
                },
            }
            : null;


    return [
        matchStage,
        userLookupStage,
        { $unwind: { path: '$ownerUser', preserveNullAndEmptyArrays: true } },
        ...(postLookupSearchStage ? [postLookupSearchStage] : []),
        employeeLookupStage,
        tourLookupStage,
        reviewLookupStage,
        unwindToursStage,
        reviewLookupDetailStage,
        groupReviewStage,
        projectStage,
        sortStage,
        facetStage,
    ];
}

// -----------------------------
// Dashboard Stats
// -----------------------------
async function getDashboardStats(): Promise<CompanyDashboardStatsDTO> {
    const [totalCompanies, totalEmployees, totalTours] = await Promise.all([
        GuideModel.countDocuments({ status: GUIDE_STATUS.APPROVED, deletedAt: null }),
        EmployeeModel.countDocuments({ deletedAt: null }),
        TourModel.countDocuments({ deletedAt: null }),
    ]);

    return { totalCompanies, totalEmployees, totalTours };
}

// -----------------------------
// API Handler
// -----------------------------
export const GET = withErrorHandler(async (request: NextRequest) => {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const params: Required<CompanyQueryParams> = {
        search: parseQueryParam(searchParams.get('search'), DEFAULT_PARAMS.search),
        sortBy: parseQueryParam(searchParams.get('sortBy'), DEFAULT_PARAMS.sortBy, isValidSortBy),
        sortDir: parseQueryParam(searchParams.get('sortDir'), DEFAULT_PARAMS.sortDir, isValidSortDir),
        page: parseQueryParam(searchParams.get('page'), DEFAULT_PARAMS.page, (v) => v > 0),
        limit: parseQueryParam(searchParams.get('limit'), DEFAULT_PARAMS.limit, (v) => v > 0 && v <= 100),
    };

    const pipeline = buildAggregationPipeline(params);
    const aggregationResult = await GuideModel.aggregate<AggregationResult>(pipeline);
    const result = aggregationResult[0];

    const total = result?.metadata?.[0]?.total || 0;
    const rows = result?.data || [];
    const pages = Math.ceil(total / params.limit);

    const stats = await getDashboardStats();

    const responseRows: CompanyRowDTO[] = rows.map((row: AggregationCompany) => ({
        id: row._id.toString(),
        name: row.companyName,
        host: {
            id: row.host.id?.toString() || '',
            name: row.host.name || 'Unknown',
            email: row.host.email || '',
            avatar: row.host.avatar || null,
            companyName: row.host.companyName,
            createdAt: row.host.createdAt?.toISOString() || new Date().toISOString(),
        },
        metrics: {
            employeesCount: row.metrics.employeesCount,
            toursCount: row.metrics.toursCount,
            reviewsCount: row.metrics.reviewsCount,
            averageRating: row.metrics.averageRating,
        },
        timestamps: {
            lastLogin: row.timestamps.lastLogin?.toISOString() || null,
            createdAt: row.timestamps.createdAt.toISOString(),
            updatedAt: row.timestamps.updatedAt?.toISOString() || null,
        },
        tags: row.tags || [],
    }));

    const responseData: CompanyListResponseDTO & {
        stats: CompanyDashboardStatsDTO
    } = {
        rows: responseRows,
        total,
        page: params.page,
        pages,
        stats,
    };

    return {
        data: responseData,
        status: 200,
    }
})