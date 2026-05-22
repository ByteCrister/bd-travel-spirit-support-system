import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';
import { TravelerLikedTour, PaginatedResponse } from '@/types/user/traveler.types';
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

interface LikedTourAggregationResult {
    tour: {
        _id: mongoose.Types.ObjectId;
        title: string;
        uniqueTourCode: string;
    };
    likedAt: Date;
}

async function getTravelerLikedTours(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<PaginatedResponse<TravelerLikedTour>>> {
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
        { $unwind: '$likedTours' },
        { $sort: { 'likedTours.likedAt': -1 as const } },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: getCollectionName(TourModel),
                            localField: 'likedTours.tour',
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
                            likedAt: '$likedTours.likedAt',
                        },
                    },
                ],
            },
        },
    ];

    const result = await UserTourInteractionModel.aggregate(pipeline);
    const metadata = result[0]?.metadata?.[0];
    const total = metadata?.total || 0;
    const data = (result[0]?.data || []) as LikedTourAggregationResult[];

    const likedTours: TravelerLikedTour[] = data.map((item) => ({
        tour: {
            _id: item.tour._id.toString(),
            title: item.tour.title,
            uniqueTourCode: item.tour.uniqueTourCode,
        },
        likedAt: item.likedAt.toISOString(),
    }));

    const responseData: PaginatedResponse<TravelerLikedTour> = {
        data: likedTours,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(getTravelerLikedTours);