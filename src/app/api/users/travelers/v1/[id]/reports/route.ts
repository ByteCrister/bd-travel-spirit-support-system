import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';
import { TravelerReport, PaginatedResponse } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import TourModel from '@/models/tours/tour.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { ReportPriority, ReportStatus } from '@/constants/report.const';
import { ReportModel } from '@/models/tours/report.model';

interface Params {
    params: Promise<{ id: string }>;
}

interface ReportAggregationResult {
    _id: mongoose.Types.ObjectId;
    tour: {
        _id: mongoose.Types.ObjectId;
        title: string;
    };
    reason: string;
    message: string;
    status: ReportStatus;
    priority: ReportPriority;
    createdAt: Date;
    resolvedAt?: Date;
}

async function getTravelerReports(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<PaginatedResponse<TravelerReport>>> {
    await ConnectDB();

    const id = resolveMongoId((await params).id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError('Invalid traveler ID', 400);
    }

    const travelerExists = await TravelerModel.exists({ _id: id, deletedAt: null });
    if (!travelerExists) {
        throw new ApiError('Traveler not found', 404);
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                reporter: new mongoose.Types.ObjectId(id),
                deletedAt: null,
            },
        },
        { $sort: { createdAt: -1 as const } },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: getCollectionName(TourModel),
                            localField: 'tour',
                            foreignField: '_id',
                            as: 'tour',
                        },
                    },
                    { $unwind: '$tour' },
                    {
                        $project: {
                            _id: 1,
                            'tour._id': 1,
                            'tour.title': 1,
                            reason: 1,
                            message: 1,
                            status: 1,
                            priority: 1,
                            createdAt: 1,
                            resolvedAt: 1,
                        },
                    },
                ],
            },
        },
    ];

    const result = await ReportModel.aggregate(pipeline);
    const metadata = result[0]?.metadata?.[0];
    const total = metadata?.total || 0;
    const data = (result[0]?.data || []) as ReportAggregationResult[];

    const reports: TravelerReport[] = data.map((report) => ({
        _id: report._id.toString(),
        tour: {
            _id: report.tour._id.toString(),
            title: report.tour.title,
        },
        reason: report.reason,
        message: report.message,
        status: report.status,
        priority: report.priority,
        createdAt: report.createdAt.toISOString(),
        resolvedAt: report.resolvedAt?.toISOString(),
    }));

    const responseData: PaginatedResponse<TravelerReport> = {
        data: reports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(getTravelerReports);