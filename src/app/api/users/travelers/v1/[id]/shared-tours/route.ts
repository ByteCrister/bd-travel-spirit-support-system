import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';
import { TravelerSharedTour, PaginatedResponse } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import TourModel from '@/models/tours/tour.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { UserTourInteractionModel } from '@/models/travelers/traveler-tour-interaction.model';

interface Params {
    params: Promise<{ id: string }>;
}

interface SharedTourAggregationResult {
    tour: {
        _id: mongoose.Types.ObjectId;
        title: string;
        uniqueTourCode: string;
    };
    sharedAt: Date;
    platform?: string;
}

async function getTravelerSharedTours(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<PaginatedResponse<TravelerSharedTour>>> {
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
        { $match: { user: new mongoose.Types.ObjectId(id) } },
        { $unwind: '$sharedTours' },
        { $sort: { 'sharedTours.sharedAt': -1 as const } },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: getCollectionName(TourModel),
                            localField: 'sharedTours.tour',
                            foreignField: '_id',
                            as: 'tour',
                        },
                    },
                    { $unwind: '$tour' },
                    {
                        $project: {
                            _id: 0,
                            tour: {
                                _id: '$tour._id',
                                title: '$tour.title',
                                uniqueTourCode: '$tour.uniqueTourCode',
                            },
                            sharedAt: '$sharedTours.sharedAt',
                            platform: '$sharedTours.platform',
                        },
                    },
                ],
            },
        },
    ];

    const result = await UserTourInteractionModel.aggregate(pipeline);
    const metadata = result[0]?.metadata?.[0];
    const total = metadata?.total || 0;
    const data = (result[0]?.data || []) as SharedTourAggregationResult[];

    const sharedTours: TravelerSharedTour[] = data.map((item) => ({
        tour: {
            _id: item.tour._id.toString(),
            title: item.tour.title,
            uniqueTourCode: item.tour.uniqueTourCode,
        },
        sharedAt: item.sharedAt.toISOString(),
        platform: item.platform,
    }));

    const responseData: PaginatedResponse<TravelerSharedTour> = {
        data: sharedTours,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(getTravelerSharedTours);