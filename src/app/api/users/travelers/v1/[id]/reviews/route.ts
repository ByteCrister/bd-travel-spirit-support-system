import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';
import { TravelerReview, PaginatedResponse } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import TourModel from '@/models/tours/tour.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { ReviewModel } from '@/models/tours/review.model';

interface Params {
    params: Promise<{ id: string }>;
}

interface ReviewAggregationResult {
    _id: mongoose.Types.ObjectId;
    tour: {
        _id: mongoose.Types.ObjectId;
        title: string;
        uniqueTourCode: string;
    };
    rating: number;
    title?: string;
    comment: string;
    createdAt: Date;
    isApproved: boolean;
    helpfulCount: number;
}

async function getTravelerReviews(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<PaginatedResponse<TravelerReview>>> {
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
                user: new mongoose.Types.ObjectId(id),
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
                            'tour.uniqueTourCode': 1,
                            rating: 1,
                            title: 1,
                            comment: 1,
                            createdAt: 1,
                            isApproved: 1,
                            helpfulCount: 1,
                        },
                    },
                ],
            },
        },
    ];

    const result = await ReviewModel.aggregate(pipeline);
    const metadata = result[0]?.metadata?.[0];
    const total = metadata?.total || 0;
    const data = (result[0]?.data || []) as ReviewAggregationResult[];

    const reviews: TravelerReview[] = data.map((review) => ({
        _id: review._id.toString(),
        tour: {
            _id: review.tour._id.toString(),
            title: review.tour.title,
            uniqueTourCode: review.tour.uniqueTourCode,
        },
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        isApproved: review.isApproved,
        helpfulCount: review.helpfulCount,
    }));

    const responseData: PaginatedResponse<TravelerReview> = {
        data: reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(getTravelerReviews);