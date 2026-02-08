// api/support/articles/v1/stats/route.ts
import { ARTICLE_STATUS } from '@/constants/article.const';
import { ArticleDashboardStats } from '@/types/article/article.types';
import { subMonths } from 'date-fns';
import { withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { ClientSession } from 'mongoose';
import ConnectDB from '@/config/db';
import { TravelArticleModel } from '@/models/articles/travel-article.model';

/**
 * GET: Article dashboard statistics
 */
export const GET = withErrorHandler(async () => {
    await ConnectDB();

    const stats = await withTransaction(async (session: ClientSession) => {
        /**
         * Fixed configuration
         */
        const MONTH_RANGE = 12;
        const now = new Date();
        const startDate = subMonths(now, MONTH_RANGE);

        /**
         * Base filter (exclude deleted articles)
         */
        const baseFilter = { deleted: false };

        const [
            summaryAggregation,
            statusOverTimeAggregation,
            topAuthorsAggregation,
            topDestinationsAggregation,
            popularTagsAggregation,
        ] = await Promise.all([
            /**
             * 1. Summary statistics
             */
            TravelArticleModel.aggregate([
                { $match: baseFilter },
                {
                    $group: {
                        _id: null,
                        totalArticles: { $sum: 1 },
                        draftCount: {
                            $sum: { $cond: [{ $eq: ['$status', ARTICLE_STATUS.DRAFT] }, 1, 0] },
                        },
                        publishedCount: {
                            $sum: { $cond: [{ $eq: ['$status', ARTICLE_STATUS.PUBLISHED] }, 1, 0] },
                        },
                        archivedCount: {
                            $sum: { $cond: [{ $eq: ['$status', ARTICLE_STATUS.ARCHIVED] }, 1, 0] },
                        },
                        totalViews: { $sum: '$viewCount' },
                        totalLikes: { $sum: '$likeCount' },
                        totalShares: { $sum: '$shareCount' },
                        totalReadingTime: { $sum: '$readingTime' },
                        totalWordCount: { $sum: '$wordCount' },
                        articlesWithReadingTime: {
                            $sum: { $cond: [{ $gt: ['$readingTime', 0] }, 1, 0] },
                        },
                        articlesWithWordCount: {
                            $sum: { $cond: [{ $gt: ['$wordCount', 0] }, 1, 0] },
                        },
                    },
                },
            ]).session(session),

            /**
             * 2. Status trends over last 12 months
             */
            TravelArticleModel.aggregate([
                {
                    $match: {
                        ...baseFilter,
                        createdAt: { $gte: startDate },
                    },
                },
                {
                    $project: {
                        month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                        status: 1,
                    },
                },
                {
                    $group: {
                        _id: { month: '$month', status: '$status' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.month': 1 } },
                {
                    $project: {
                        bucketLabel: '$_id.month',
                        status: '$_id.status',
                        count: 1,
                        _id: 0,
                    },
                },
            ]).session(session),

            /**
             * 3. Top authors
             */
            TravelArticleModel.aggregate([
                { $match: baseFilter },
                {
                    $group: {
                        _id: '$author',
                        articleCount: { $sum: 1 },
                        totalViews: { $sum: '$viewCount' },
                        totalLikes: { $sum: '$likeCount' },
                    },
                },
                { $sort: { articleCount: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                {
                    $project: {
                        author: {
                            id: '$_id',
                            name: '$user.name',
                            avatarUrl: '$user.avatarUrl',
                        },
                        articleCount: 1,
                        totalViews: 1,
                        totalLikes: 1,
                    },
                },
            ]).session(session),

            /**
             * 4. Top destinations
             */
            TravelArticleModel.aggregate([
                { $match: baseFilter },
                { $unwind: '$destinations' },
                {
                    $group: {
                        _id: {
                            division: '$destinations.division',
                            district: '$destinations.district',
                            area: '$destinations.area',
                        },
                        articleCount: { $sum: 1 },
                    },
                },
                { $sort: { articleCount: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        city: {
                            $ifNull: ['$_id.area', '$_id.district'],
                        },
                        division: '$_id.division',
                        district: '$_id.district',
                        country: 'Bangladesh',
                        articleCount: 1,
                        _id: 0,
                    },
                },
            ]).session(session),

            /**
             * 5. Popular tags
             */
            TravelArticleModel.aggregate([
                { $match: baseFilter },
                { $unwind: '$tags' },
                {
                    $match: {
                        tags: { $nin: [null, ''] },
                    },
                },
                {
                    $group: {
                        _id: '$tags',
                        articleCount: { $sum: 1 },
                    },
                },
                { $sort: { articleCount: -1 } },
                { $limit: 20 },
                {
                    $project: {
                        tag: '$_id',
                        articleCount: 1,
                        _id: 0,
                    },
                },
            ]).session(session),
        ]);

        /**
         * Summary fallback
         */
        const summary = summaryAggregation[0] ?? {
            totalArticles: 0,
            draftCount: 0,
            publishedCount: 0,
            archivedCount: 0,
            totalViews: 0,
            totalLikes: 0,
            totalShares: 0,
            totalReadingTime: 0,
            totalWordCount: 0,
            articlesWithReadingTime: 0,
            articlesWithWordCount: 0,
        };

        /**
         * Averages
         */
        const averageReadingTime = summary.articlesWithReadingTime
            ? Math.round(summary.totalReadingTime / summary.articlesWithReadingTime)
            : 0;

        const averageWordCount = summary.articlesWithWordCount
            ? Math.round(summary.totalWordCount / summary.articlesWithWordCount)
            : 0;

        /**
         * Group status trends by month
         */
        const grouped: Record<string, Record<string, number>> = {};
        statusOverTimeAggregation.forEach(item => {
            grouped[item.bucketLabel] ??= {};
            grouped[item.bucketLabel][item.status] = item.count;
        });

        const byStatusOverTime = Object.entries(grouped).map(([month, statuses]) => ({
            bucketLabel: month,
            count: Object.values(statuses).reduce((a, b) => a + b, 0),
            statusBreakdown: statuses,
        }));

        /**
         * Final response
         */
        const result: ArticleDashboardStats = {
            summary: {
                totalArticles: summary.totalArticles,
                draftCount: summary.draftCount,
                publishedCount: summary.publishedCount,
                archivedCount: summary.archivedCount,
                totalViews: summary.totalViews,
                totalLikes: summary.totalLikes,
                totalShares: summary.totalShares,
                averageReadingTime,
                averageWordCount,
            },
            byStatusOverTime,
            topAuthors: topAuthorsAggregation,
            topDestinations: topDestinationsAggregation,
            popularTags: popularTagsAggregation,
        };

        return result;
    });

    return {
        data: stats,
        status: 200,
    };
});