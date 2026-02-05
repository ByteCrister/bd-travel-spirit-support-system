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
import { sanitizeSearch } from '@/lib/helpers/sanitize-search';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';

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

    // 1️⃣ Match approved guides
    const matchStage: mongoose.PipelineStage = {
        $match: { status: GUIDE_STATUS.APPROVED, deletedAt: null },
    };

    // 2️⃣ Lookup owner user
    const userLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(UserModel),
            localField: 'owner.user',
            foreignField: '_id',
            as: 'ownerUser',
        },
    };

    // 3️⃣ Unwind owner user
    const unwindOwnerUserStage: mongoose.PipelineStage = {
        $unwind: { path: '$ownerUser', preserveNullAndEmptyArrays: true },
    };

    // 4️⃣ Lookup avatar asset
    const avatarAssetLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(AssetModel),
            localField: 'ownerUser.avatar',
            foreignField: '_id',
            as: 'ownerAvatarAsset',
        },
    };

    // 5️⃣ Unwind avatar asset
    const unwindAvatarAssetStage: mongoose.PipelineStage = {
        $unwind: { path: '$ownerAvatarAsset', preserveNullAndEmptyArrays: true },
    };

    // 6️⃣ Lookup avatar file
    const avatarFileLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(AssetFileModel),
            localField: 'ownerAvatarAsset.file',
            foreignField: '_id',
            as: 'ownerAvatarFile',
        },
    };

    // 7️⃣ Unwind avatar file
    const unwindAvatarFileStage: mongoose.PipelineStage = {
        $unwind: { path: '$ownerAvatarFile', preserveNullAndEmptyArrays: true },
    };

    // 8️⃣ Lookup guide logo asset (fallback)
    const guideLogoAssetLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(AssetModel),
            localField: 'logoUrl',
            foreignField: '_id',
            as: 'guideLogoAsset',
        },
    };

    // 9️⃣ Unwind guide logo asset
    const unwindGuideLogoAssetStage: mongoose.PipelineStage = {
        $unwind: { path: '$guideLogoAsset', preserveNullAndEmptyArrays: true },
    };

    // 🔟 Lookup guide logo file
    const guideLogoFileLookupStage: mongoose.PipelineStage = {
        $lookup: {
            from: getCollectionName(AssetFileModel),
            localField: 'guideLogoAsset.file',
            foreignField: '_id',
            as: 'guideLogoFile',
        },
    };

    // 1️⃣1️⃣ Unwind guide logo file
    const unwindGuideLogoFileStage: mongoose.PipelineStage = {
        $unwind: { path: '$guideLogoFile', preserveNullAndEmptyArrays: true },
    };

    // 1️⃣2️⃣ Lookup employees
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

    // 1️⃣3️⃣ Lookup tours
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

    // 1️⃣4️⃣ Lookup guide tours for reviews
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

    // 1️⃣5️⃣ Optional search filter
    const postLookupSearchStage: mongoose.PipelineStage | null = search?.trim()
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

    // 1️⃣6️⃣ Project final structure
    const projectStage: mongoose.PipelineStage = {
        $project: {
            _id: 1,
            companyName: '$root.companyName',
            host: {
                id: '$root.ownerUser._id',
                name: '$root.ownerUser.name',
                email: '$root.ownerUser.email',
                avatar: {
                    $ifNull: [
                        '$ownerAvatarFile.publicUrl',
                        '$guideLogoFile.publicUrl', // fallback
                        null,
                    ],
                },
                companyName: '$root.companyName',
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
                lastLogin: '$root.ownerUser.lastLogin',
            },
            tags: [],
        },
    };

    // 1️⃣7️⃣ Sort and paginate
    const sortFieldMap: Record<CompanySortBy, string> = {
        name: 'companyName',
        averageRating: 'metrics.averageRating',
        reviewsCount: 'metrics.reviewsCount',
        employeesCount: 'metrics.employeesCount',
        toursCount: 'metrics.toursCount',
        createdAt: 'timestamps.createdAt',
    };
    const sortStage: mongoose.PipelineStage = {
        $sort: { [sortFieldMap[sortBy]]: sortDir === 'asc' ? 1 : -1 },
    };

    const facetStage: mongoose.PipelineStage = {
        $facet: { metadata: [{ $count: 'total' }], data: [{ $skip: skip }, { $limit: limit }] },
    };

    // 1️⃣8️⃣ Final pipeline
    return [
        matchStage,
        userLookupStage,
        unwindOwnerUserStage,
        avatarAssetLookupStage,
        unwindAvatarAssetStage,
        avatarFileLookupStage,
        unwindAvatarFileStage,
        guideLogoAssetLookupStage,
        unwindGuideLogoAssetStage,
        guideLogoFileLookupStage,
        unwindGuideLogoFileStage,
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
        search: parseQueryParam(sanitizeSearch(searchParams.get('search') ?? undefined) ?? null, DEFAULT_PARAMS.search),
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