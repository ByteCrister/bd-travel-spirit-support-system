// app/api/support/guide-password-requests/v1/route.ts

import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';

import {
    PasswordRequestDto,
    PasswordRequestStats,
    PaginatedResponse,
    SortOrder
} from '@/types/guide/guide-forgot-password.types';

import { withErrorHandler, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { FORGOT_PASSWORD_STATUS, ForgotPasswordStatus } from '@/constants/guide-forgot-password.const';

import GuideForgotPasswordModel from '@/models/guide/guide-forgot-password.model';
import ConnectDB from '@/config/db';
import { sanitizeSearch } from '@/lib/helpers/sanitize-search';

/* ------------------------------------------------------------------
   QUERY PARAM TYPES
-------------------------------------------------------------------*/

interface GetRequestsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    startDate?: Date;
    endDate?: Date;
}

/* ------------------------------------------------------------------
   AGGREGATION OUTPUT ROW (STRONGLY TYPED)
-------------------------------------------------------------------*/

interface AggregatedRequestRow {
    _id: mongoose.Types.ObjectId;
    guideId: mongoose.Types.ObjectId;
    reason: string;
    status: ForgotPasswordStatus;
    rejectionReason?: string | null;
    expiresAt: Date;
    emailSentAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;

    user: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        avatarUrl: string | null;
    };

    reviewer?: {
        _id: mongoose.Types.ObjectId;
        name: string;
        email: string;
        avatarUrl: string | null;
    } | null;
}

/* ------------------------------------------------------------------
   STATS (your logic kept, only typed better)
-------------------------------------------------------------------*/

async function calculateStats(
    filters: Partial<GetRequestsQueryParams>
): Promise<PasswordRequestStats> {

    const matchStage: mongoose.FilterQuery<Record<string, unknown>> = {};

    if (
        filters.status &&
        filters.status !== 'ALL' &&
        filters.status !== FORGOT_PASSWORD_STATUS.EXPIRED
    ) {
        matchStage.status = filters.status;
    }

    if (filters.startDate) {
        matchStage.createdAt = { $gte: filters.startDate };
    }

    if (filters.endDate) {
        matchStage.createdAt = {
            ...(matchStage.createdAt as object),
            $lte: filters.endDate
        };
    }

    const aggregation = await GuideForgotPasswordModel.aggregate([
        { $match: matchStage },

        {
            $facet: {
                total: [{ $count: 'count' }],

                pending: [
                    { $match: { status: FORGOT_PASSWORD_STATUS.PENDING } },
                    { $count: 'count' }
                ],

                approved: [
                    { $match: { status: FORGOT_PASSWORD_STATUS.APPROVED } },
                    { $count: 'count' }
                ],

                rejected: [
                    { $match: { status: FORGOT_PASSWORD_STATUS.REJECTED } },
                    { $count: 'count' }
                ],

                expired: [
                    { $match: { status: FORGOT_PASSWORD_STATUS.EXPIRED } },
                    { $count: 'count' }
                ],

                responseTimes: [
                    {
                        $match: {
                            status: {
                                $in: [
                                    FORGOT_PASSWORD_STATUS.APPROVED,
                                    FORGOT_PASSWORD_STATUS.REJECTED
                                ]
                            },
                            reviewedAt: { $exists: true, $ne: null },
                            createdAt: { $exists: true, $ne: null }
                        }
                    },
                    {
                        $addFields: {
                            responseTimeMs: {
                                $subtract: ['$reviewedAt', '$createdAt']
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            avgResponseTime: { $avg: '$responseTimeMs' }
                        }
                    }
                ]
            }
        }
    ]);

    const result = aggregation[0];

    const total = result.total[0]?.count || 0;
    const pending = result.pending[0]?.count || 0;
    const approved = result.approved[0]?.count || 0;
    const rejected = result.rejected[0]?.count || 0;
    const expired = result.expired[0]?.count || 0;
    const avgResponseTimeMs = result.responseTimes[0]?.avgResponseTime || 0;

    return {
        total,
        pending,
        approved,
        rejected,
        expired,
        pendingPercentage: total > 0 ? (pending / total) * 100 : 0,
        approvalRate:
            approved + rejected > 0
                ? (approved / (approved + rejected)) * 100
                : 0,
        averageResponseTime:
            avgResponseTimeMs > 0
                ? avgResponseTimeMs / (1000 * 60 * 60)
                : 0
    };
}

/* ------------------------------------------------------------------
   MAIN HANDLER
-------------------------------------------------------------------*/

async function getRequestsHandler(request: NextRequest) {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(
        100,
        Math.max(1, parseInt(searchParams.get('limit') || '20'))
    );
    const skip = (page - 1) * limit;

    const search = sanitizeSearch(searchParams.get('search') ?? '') ?? "";
    const status = searchParams.get('status') || 'ALL';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder =
        (searchParams.get('sortOrder') as SortOrder) || 'desc';

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (startDateStr) {
        startDate = new Date(startDateStr);
        if (isNaN(startDate.getTime())) {
            throw new ApiError('Invalid startDate format', 400);
        }
    }

    if (endDateStr) {
        endDate = new Date(endDateStr);
        if (isNaN(endDate.getTime())) {
            throw new ApiError('Invalid endDate format', 400);
        }
        endDate.setHours(23, 59, 59, 999);
    }

    /* ---------------- FILTER BUILD ---------------- */

    const filterQuery: mongoose.FilterQuery<Record<string, unknown>> = {};

    if (status && status !== 'ALL') {
        if (status === FORGOT_PASSWORD_STATUS.EXPIRED) {
            filterQuery.expiresAt = { $lt: new Date() };
            filterQuery.status = {
                $ne: FORGOT_PASSWORD_STATUS.EXPIRED
            };
        } else {
            filterQuery.status = status;
        }
    }

    if (startDate || endDate) {
        filterQuery.createdAt = {};
        if (startDate) (filterQuery.createdAt).$gte = startDate;
        if (endDate) (filterQuery.createdAt).$lte = endDate;
    }

    /* ---------------- AGGREGATION PIPELINE ---------------- */

    const pipeline: PipelineStage[] = [
        { $match: filterQuery },

        // GUIDE -> USER (OWNER)
        {
            $lookup: {
                from: 'guides',
                localField: 'guideId',
                foreignField: '_id',
                as: 'guide'
            }
        },
        { $unwind: '$guide' },

        {
            $lookup: {
                from: 'users',
                localField: 'guide.owner.user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },

        // USER AVATAR CHAIN
        {
            $lookup: {
                from: 'assets',
                localField: 'user.avatar',
                foreignField: '_id',
                as: 'userAsset'
            }
        },
        {
            $unwind: {
                path: '$userAsset',
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $lookup: {
                from: 'assetfiles',
                localField: 'userAsset.file',
                foreignField: '_id',
                as: 'userAssetFile'
            }
        },
        {
            $unwind: {
                path: '$userAssetFile',
                preserveNullAndEmptyArrays: true
            }
        },

        // REVIEWER
        {
            $lookup: {
                from: 'users',
                localField: 'reviewedBy',
                foreignField: '_id',
                as: 'reviewer'
            }
        },
        {
            $unwind: {
                path: '$reviewer',
                preserveNullAndEmptyArrays: true
            }
        },

        // REVIEWER AVATAR
        {
            $lookup: {
                from: 'assets',
                localField: 'reviewer.avatar',
                foreignField: '_id',
                as: 'reviewerAsset'
            }
        },
        {
            $unwind: {
                path: '$reviewerAsset',
                preserveNullAndEmptyArrays: true
            }
        },

        {
            $lookup: {
                from: 'assetfiles',
                localField: 'reviewerAsset.file',
                foreignField: '_id',
                as: 'reviewerAssetFile'
            }
        },
        {
            $unwind: {
                path: '$reviewerAssetFile',
                preserveNullAndEmptyArrays: true
            }
        },

        // SEARCH
        ...(search.trim()
            ? [
                {
                    $match: {
                        $or: [
                            {
                                'user.name': {
                                    $regex: new RegExp(search, 'i')
                                }
                            },
                            {
                                'user.email': {
                                    $regex: new RegExp(search, 'i')
                                }
                            },
                            { reason: { $regex: new RegExp(search, 'i') } }
                        ]
                    }
                }
            ]
            : []),

        // SORT
        {
            $sort: {
                [sortBy === 'user.name'
                    ? 'user.name'
                    : sortBy === 'user.email'
                        ? 'user.email'
                        : sortBy]: sortOrder === 'asc' ? 1 : -1
            }
        }
    ];

    /* -------- COUNT FOR PAGINATION -------- */

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult =
        await GuideForgotPasswordModel.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    /* -------- ADD PAGINATION -------- */

    pipeline.push({ $skip: skip }, { $limit: limit });

    /* -------- FINAL SHAPE (NO POST-PROCESSING) -------- */

    pipeline.push({
        $project: {
            _id: 1,
            guideId: 1,
            reason: 1,
            status: 1,
            rejectionReason: {
                $ifNull: ['$rejectionReason', null]
            },
            expiresAt: 1,
            emailSentAt: {
                $ifNull: ['$emailSentAt', null]
            },
            createdAt: 1,
            updatedAt: 1,

            user: {
                _id: '$user._id',
                name: '$user.name',
                email: '$user.email',
                avatarUrl: {
                    $ifNull: ['$userAssetFile.publicUrl', null]
                }
            },

            reviewer: {
                $cond: {
                    if: { $ifNull: ['$reviewedBy', false] },
                    then: {
                        _id: '$reviewer._id',
                        name: '$reviewer.name',
                        email: '$reviewer.email',
                        avatarUrl: {
                            $ifNull: ['$reviewerAssetFile.publicUrl', null]
                        }
                    },
                    else: null
                }
            }
        }
    });

    /* -------- EXECUTE -------- */

    const requests: AggregatedRequestRow[] =
        await GuideForgotPasswordModel.aggregate(pipeline);

    /* -------- MARK EXPIRED IN TRANSACTION -------- */

    const expiredIds = requests
        .filter(r => {
            const expired =
                new Date(r.expiresAt) < new Date() &&
                ![
                    FORGOT_PASSWORD_STATUS.APPROVED,
                    FORGOT_PASSWORD_STATUS.REJECTED,
                    FORGOT_PASSWORD_STATUS.EXPIRED
                ].includes(r.status as FORGOT_PASSWORD_STATUS);

            return expired;
        })
        .map(r => r._id);

    if (expiredIds.length > 0) {
        await withTransaction(async session => {
            await GuideForgotPasswordModel.updateMany(
                {
                    _id: { $in: expiredIds },
                    status: {
                        $nin: [
                            FORGOT_PASSWORD_STATUS.APPROVED,
                            FORGOT_PASSWORD_STATUS.REJECTED,
                            FORGOT_PASSWORD_STATUS.EXPIRED
                        ]
                    }
                },
                { $set: { status: FORGOT_PASSWORD_STATUS.EXPIRED } },
                { session }
            );
        });
    }

    /* -------- TRANSFORM TO DTO (NO DB CALLS) -------- */

    const transformed: PasswordRequestDto[] = requests.map(r => {
        const isExpired =
            new Date(r.expiresAt) < new Date() &&
            ![
                FORGOT_PASSWORD_STATUS.APPROVED,
                FORGOT_PASSWORD_STATUS.REJECTED,
                FORGOT_PASSWORD_STATUS.EXPIRED
            ].includes(r.status as FORGOT_PASSWORD_STATUS);

        return {
            id: r._id.toString(),
            user: {
                guideId: r.guideId.toString(),
                name: r.user.name,
                email: r.user.email,
                avatarUrl: r.user.avatarUrl
            },
            reviewer: r.reviewer
                ? {
                    reviewedById: r.reviewer._id.toString(),
                    reviewerName: r.reviewer.name,
                    reviewerEmail: r.reviewer.email,
                    reviewerAvatarUrl: r.reviewer.avatarUrl
                }
                : null,
            reason: r.reason,
            status: isExpired
                ? FORGOT_PASSWORD_STATUS.EXPIRED
                : r.status,
            rejectionReason: r.rejectionReason ?? null,
            expiresAt: r.expiresAt.toISOString(),
            emailSentAt: r.emailSentAt?.toISOString() || null,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString()
        };
    });

    /* -------- STATS (SAME FILTERS) -------- */

    const stats = await calculateStats({
        status,
        startDate,
        endDate
    });

    /* -------- FINAL RESPONSE -------- */

    const response: PaginatedResponse<PasswordRequestDto> = {
        data: transformed,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        stats
    };

    return { data: response, status: 200 };
}

/* ------------------------------------------------------------------
   EXPORT
-------------------------------------------------------------------*/

export const GET = withErrorHandler(getRequestsHandler);