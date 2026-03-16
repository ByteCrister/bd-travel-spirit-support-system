import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';
import { TravelerFAQ, PaginatedResponse } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import TourModel from '@/models/tours/tour.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { TourFAQModel } from '@/models/tours/tourFAQ.model';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';
import { ModerationStatus } from '@/constants/tour.const';

interface Params {
    params: Promise<{ id: string }>;
}

interface FAQAggregationResult {
    _id: mongoose.Types.ObjectId;
    tour: {
        _id: mongoose.Types.ObjectId;
        title: string;
    };
    question: string;
    answer?: string;
    status: ModerationStatus;
    createdAt: Date;
    answeredAt?: Date;
    likeCount: number;
    dislikeCount: number;
}

async function getTravelerFAQs(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<PaginatedResponse<TravelerFAQ>>> {
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
                askedBy: new mongoose.Types.ObjectId(id),
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
                        $addFields: {
                            likeCount: {
                                $size: {
                                    $filter: {
                                        input: '$likes',
                                        as: 'like',
                                        cond: { $eq: ['$$like.deletedAt', null] },
                                    },
                                },
                            },
                            dislikeCount: {
                                $size: {
                                    $filter: {
                                        input: '$dislikes',
                                        as: 'dislike',
                                        cond: { $eq: ['$$dislike.deletedAt', null] },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            'tour._id': 1,
                            'tour.title': 1,
                            question: 1,
                            answer: 1,
                            status: 1,
                            createdAt: 1,
                            answeredAt: 1,
                            likeCount: 1,
                            dislikeCount: 1,
                        },
                    },
                ],
            },
        },
    ];

    const result = await TourFAQModel.aggregate(pipeline);
    const metadata = result[0]?.metadata?.[0];
    const total = metadata?.total || 0;
    const data = (result[0]?.data || []) as FAQAggregationResult[];

    const faqs: TravelerFAQ[] = data.map((faq) => ({
        _id: faq._id.toString(),
        tour: {
            _id: faq.tour._id.toString(),
            title: faq.tour.title,
        },
        question: faq.question,
        answer: faq.answer,
        status: faq.status,
        createdAt: faq.createdAt.toISOString(),
        answeredAt: faq.answeredAt?.toISOString(),
        likeCount: faq.likeCount,
        dislikeCount: faq.dislikeCount,
    }));

    const responseData: PaginatedResponse<TravelerFAQ> = {
        data: faqs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(getTravelerFAQs);