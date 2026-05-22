import { NextRequest } from 'next/server';
import mongoose, { PipelineStage } from 'mongoose';
import { TravelerViewedArticle, PaginatedResponse } from '@/types/user/traveler.types';
import ConnectDB from '@/config/db';
import { TravelerModel } from '@/models/travelers/traveler.model';
import { getCollectionName } from '@/lib/helpers/get-collection-name';
import { resolveMongoId } from '@/lib/helpers/resolveMongoId';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import { UserTourInteractionModel } from '@/models/travelers/traveler-tour-interaction.model';
import { withErrorHandler, ApiError, HandlerResult } from '@/lib/helpers/withErrorHandler';

interface Params {
    params: Promise<{ id: string }>;
}

interface ViewedArticleAggregationResult {
    article: {
        _id: mongoose.Types.ObjectId;
        title: string;
        slug: string;
    };
    viewedAt: Date;
    durationSeconds?: number;
}

async function getTravelerViewedArticles(
    req: NextRequest,
    { params }: Params
): Promise<HandlerResult<PaginatedResponse<TravelerViewedArticle>>> {
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
        { $unwind: '$viewedArticles' },
        { $sort: { 'viewedArticles.viewedAt': -1 as const } },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: getCollectionName(TravelArticleModel),
                            localField: 'viewedArticles.article',
                            foreignField: '_id',
                            as: 'article',
                        },
                    },
                    { $unwind: '$article' },
                    {
                        $project: {
                            _id: 0,
                            article: {
                                _id: '$article._id',
                                title: '$article.title',
                                slug: '$article.slug',
                            },
                            viewedAt: '$viewedArticles.viewedAt',
                            durationSeconds: '$viewedArticles.durationSeconds',
                        },
                    },
                ],
            },
        },
    ];

    const result = await UserTourInteractionModel.aggregate(pipeline);
    const metadata = result[0]?.metadata?.[0];
    const total = metadata?.total || 0;
    const data = (result[0]?.data || []) as ViewedArticleAggregationResult[];

    const viewedArticles: TravelerViewedArticle[] = data.map((item) => ({
        article: {
            _id: item.article._id.toString(),
            title: item.article.title,
            slug: item.article.slug,
        },
        viewedAt: item.viewedAt.toISOString(),
        durationSeconds: item.durationSeconds,
    }));

    const responseData: PaginatedResponse<TravelerViewedArticle> = {
        data: viewedArticles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };

    return { data: responseData };
}

export const GET = withErrorHandler(getTravelerViewedArticles);