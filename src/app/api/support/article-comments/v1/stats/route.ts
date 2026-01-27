// api/support/article-comments/v1/stats/route.ts
import { withTransaction } from '@/lib/helpers/withTransaction';
import { CommentAdminStatsDTO } from '@/types/article-comment.types';
import { COMMENT_STATUS } from '@/constants/articleComment.const';
import { ARTICLE_STATUS } from '@/constants/article.const';
import ConnectDB from '@/config/db';
import { withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { TravelArticleModel } from '@/models/articles/travel-article.model';
import { TravelCommentModel } from '@/models/articles/travel-article-comment.model';

const GetHandler = async () => {
    await ConnectDB();

    // Fetch stats within a transaction for consistency
    const stats = await withTransaction(async (session) => {
        // Get all stats in parallel for performance
        const [
            totalComments,
            totalApprovedComments,
            totalPendingComments,
            totalRejectedComments,
            uniqueCommenters,
            mostCommentedArticle,
        ] = await Promise.all([
            // Article counts with session
            TravelArticleModel.countActive({}, session),
            TravelArticleModel.countActive({ status: ARTICLE_STATUS.PUBLISHED }, session),
            TravelArticleModel.countActive({ status: ARTICLE_STATUS.DRAFT }, session),

            // Comment counts (excluding soft-deleted) with session
            TravelCommentModel.countDocuments({ isDeleted: false }, { session: session }),
            TravelCommentModel.countDocuments({
                status: COMMENT_STATUS.APPROVED,
                isDeleted: false
            }, { session: session }),
            TravelCommentModel.countDocuments({
                status: COMMENT_STATUS.PENDING,
                isDeleted: false
            }, { session: session }),
            TravelCommentModel.countDocuments({
                status: COMMENT_STATUS.REJECTED,
                isDeleted: false
            }, { session: session }),

            // Unique commenters (distinct authors who have commented)
            TravelCommentModel.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$author' } },
                { $count: 'uniqueAuthors' }
            ]).session(session).then(result => result[0]?.uniqueAuthors || 0),

            // Most commented article (non-deleted)
            TravelCommentModel.aggregate([
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
            TravelCommentModel.countDocuments({
                isDeleted: false,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }, { session: session }),

            // Recent articles (last 30 days)
            TravelArticleModel.countActive({
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }, session)
        ]);

        // Calculate average replies per comment with session
        const avgRepliesResult = await TravelCommentModel.aggregate([
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

        // Build the response
        const stats: CommentAdminStatsDTO = {
            // Core comment stats
            totalComments,
            totalApproved: totalApprovedComments,
            totalPending: totalPendingComments,
            totalRejected: totalRejectedComments,
            uniqueCommenters,
            avgRepliesPerComment: parseFloat(avgRepliesPerComment.toFixed(2)),
            mostActiveArticle: mostCommentedArticle ? {
                articleId: mostCommentedArticle.articleId,
                title: mostCommentedArticle.title,
                totalComments: mostCommentedArticle.totalComments
            } : null,
        };

        return stats;
    });

    return {
        data: stats,
        status: 200,
    }
}

export const GET = withErrorHandler(GetHandler);