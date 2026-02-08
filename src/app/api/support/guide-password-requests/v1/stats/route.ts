// app/api/support/guide-password-requests/v1/stats/route.ts

import { NextRequest } from 'next/server';
import { FORGOT_PASSWORD_STATUS } from '@/constants/guide-forgot-password.const';
import ConnectDB from '@/config/db';
import GuideForgotPasswordModel from '@/models/guide/guide-forgot-password.model';
import { withErrorHandler, ApiError } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { PipelineStage } from 'mongoose';
import { PasswordRequestStats } from '@/types/guide/guide-forgot-password.types';

interface MatchStage {
    status?: string;
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
}

interface AggregationResult {
    total: { count: number }[];
    pending: { count: number }[];
    approved: { count: number }[];
    rejected: { count: number }[];
    expired: { count: number }[];
    responseTimes: { avgResponseTime: number }[];
}

// Main handler function
async function getStatsHandler(request: NextRequest) {
    await ConnectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'ALL';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const matchStage: MatchStage = {};

    if (status && status !== 'ALL' && status !== FORGOT_PASSWORD_STATUS.EXPIRED) {
        matchStage.status = status;
    }

    if (startDate) {
        matchStage.createdAt = { $gte: new Date(startDate) };
    }

    if (endDate) {
        matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };
    }

    // Use withTransaction for the aggregation
    const aggregation = await withTransaction<AggregationResult[]>(async (session) => {
        const pipeline: PipelineStage[] = [
            { $match: matchStage },
            {
                $facet: {
                    total: [{ $count: "count" }],
                    pending: [
                        { $match: { status: FORGOT_PASSWORD_STATUS.PENDING } },
                        { $count: "count" }
                    ],
                    approved: [
                        { $match: { status: FORGOT_PASSWORD_STATUS.APPROVED } },
                        { $count: "count" }
                    ],
                    rejected: [
                        { $match: { status: FORGOT_PASSWORD_STATUS.REJECTED } },
                        { $count: "count" }
                    ],
                    expired: [
                        { $match: { status: FORGOT_PASSWORD_STATUS.EXPIRED } },
                        { $count: "count" }
                    ],
                    responseTimes: [
                        {
                            $match: {
                                status: { $in: [FORGOT_PASSWORD_STATUS.APPROVED, FORGOT_PASSWORD_STATUS.REJECTED] },
                                reviewedAt: { $exists: true },
                                createdAt: { $exists: true }
                            }
                        },
                        {
                            $addFields: {
                                responseTimeHours: {
                                    $divide: [
                                        { $subtract: ["$reviewedAt", "$createdAt"] },
                                        1000 * 60 * 60
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                avgResponseTime: { $avg: "$responseTimeHours" }
                            }
                        }
                    ]
                }
            }
        ];

        return GuideForgotPasswordModel.aggregate(pipeline).session(session);
    });

    if (!aggregation || aggregation.length === 0) {
        throw new ApiError('No data found', 404);
    }

    const result = aggregation[0];
    const total = result.total[0]?.count || 0;
    const pending = result.pending[0]?.count || 0;
    const approved = result.approved[0]?.count || 0;
    const rejected = result.rejected[0]?.count || 0;
    const expired = result.expired[0]?.count || 0;
    const averageResponseTime = result.responseTimes[0]?.avgResponseTime || 0;

    const stats: PasswordRequestStats = {
        total,
        pending,
        approved,
        rejected,
        expired,
        pendingPercentage: total > 0 ? (pending / total) * 100 : 0,
        approvalRate: (approved + rejected) > 0 ? (approved / (approved + rejected)) * 100 : 0,
        averageResponseTime
    };

    return { data: stats, status: 200 };
}

// Wrap the handler with error handling
export const GET = withErrorHandler(getStatsHandler);