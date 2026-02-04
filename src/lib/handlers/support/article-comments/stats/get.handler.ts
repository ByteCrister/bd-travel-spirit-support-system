// api/support/article-comments/v1/stats/route.ts

import { withTransaction } from '@/lib/helpers/withTransaction';
import { CommentAdminStatsDTO } from '@/types/article-comment.types';
import { COMMENT_STATUS } from '@/constants/articleComment.const';
import ConnectDB from '@/config/db';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import TravelArticleCommentModel from '@/models/articles/travel-article-comment.model';

// Define types for the aggregation results
interface MostCommentedArticleResult {
  articleId: string;
  title: string;
  totalComments: number;
  slug: string;
}

export default async function ArticleCmntGetHandler() {
    await ConnectDB();

    // Fetch stats within a transaction for consistency
    const stats = await withTransaction(async (session) => {
        // Get all stats in parallel for performance
        const results = await Promise.all([
            // Comment counts (excluding soft-deleted)
            TravelArticleCommentModel.countDocuments({ isDeleted: false }, { session: session }),
            TravelArticleCommentModel.countDocuments({
                status: COMMENT_STATUS.APPROVED,
                isDeleted: false
            }, { session: session }),
            TravelArticleCommentModel.countDocuments({
                status: COMMENT_STATUS.PENDING,
                isDeleted: false
            }, { session: session }),
            TravelArticleCommentModel.countDocuments({
                status: COMMENT_STATUS.REJECTED,
                isDeleted: false
            }, { session: session }),

            // Unique commenters
            TravelArticleCommentModel.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$author' } },
                { $count: 'uniqueAuthors' }
            ]).session(session).then(result => result[0]?.uniqueAuthors || 0),

            // Most commented article
            TravelArticleCommentModel.aggregate([
                { $match: { isDeleted: false, status: COMMENT_STATUS.APPROVED } },
                {
                    $group: {
                        _id: '$articleId',
                        totalComments: { $sum: 1 }
                    }
                },
                { $sort: { totalComments: -1 } },
                { $limit: 1 }
            ]).session(session).then(async result => {
                if (!result.length) return null;

                const articleId = result[0]._id;
                const article = await TravelArticleModel.findById(articleId)
                    .select('title slug')
                    .session(session)
                    .lean();

                return article ? {
                    articleId: article._id.toString(),
                    title: article.title,
                    totalComments: result[0].totalComments,
                    slug: article.slug
                } : null;
            }),

            // Recent comments (last 7 days)
            TravelArticleCommentModel.countDocuments({
                isDeleted: false,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }, { session: session }),

            // Recent articles (last 30 days)
            TravelArticleModel.countActive({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }, session)
        ]);

        // Destructure results with proper typing
        const [
            totalComments,
            totalApprovedComments,
            totalPendingComments,
            totalRejectedComments,
            uniqueCommenters,
            mostCommentedArticle,
        ] = results;

        // Calculate average replies per comment with session
        const avgRepliesResult = await TravelArticleCommentModel.aggregate([
            { $match: { isDeleted: false, parentId: null } }, // Only root comments
            {
                $project: {
                    replyCount: { $size: { $ifNull: ['$replies', []] } }
                }
            },
            {
                $group: {
                    _id: null,
                    avgReplies: { $avg: '$replyCount' }
                }
            }
        ]).session(session);

        const avgRepliesPerComment = avgRepliesResult[0]?.avgReplies || 0;

        // Type guard to check if mostCommentedArticle is valid
        const hasMostCommentedArticle = (
            mostCommentedArticle !== null && 
            typeof mostCommentedArticle === 'object' &&
            'articleId' in mostCommentedArticle &&
            'title' in mostCommentedArticle &&
            'totalComments' in mostCommentedArticle
        );

        // Build the response with proper typing
        const stats: CommentAdminStatsDTO = {
            // Core comment stats
            totalComments: totalComments as number,
            totalApproved: totalApprovedComments as number,
            totalPending: totalPendingComments as number,
            totalRejected: totalRejectedComments as number,
            uniqueCommenters: uniqueCommenters as number,
            avgRepliesPerComment: parseFloat(avgRepliesPerComment.toFixed(2)),
            mostActiveArticle: hasMostCommentedArticle ? {
                articleId: (mostCommentedArticle as MostCommentedArticleResult).articleId,
                title: (mostCommentedArticle as MostCommentedArticleResult).title,
                totalComments: (mostCommentedArticle as MostCommentedArticleResult).totalComments
            } : null,
        };

        return stats;
    });

    return {
        data: stats,
        status: 200,
    };
}