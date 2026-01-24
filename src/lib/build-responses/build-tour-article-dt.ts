import { ClientSession, Types } from 'mongoose';
import { ArticleDetail } from '@/types/article.types';
import { IDestinationBlock, TravelArticleModel } from '@/models/articles/travel-article.model';
import UserModel from '@/models/user.model';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import EmployeeModel, { IEmployee } from '@/models/employees/employees.model';
import { PopulatedAssetLean } from '@/types/populated-asset.types';
import { ITravelArticle } from '@/models/articles/travel-article.model';
import { TravelCommentModel } from '@/models/articles/travel-article-comment.model';
import { COMMENT_STATUS } from '@/constants/articleComment.const';
// Define proper types for populated data
type PopulatedAuthor = {
    _id: Types.ObjectId;
    name: string;
};

type PopulatedHeroImage = PopulatedAssetLean;

type DestinationWithImage = Omit<IDestinationBlock, "imageAsset"> & {
    imageAsset?: {
        title: string;
        assetId: PopulatedAssetLean;
    };
};

type LeanTravelArticle = Omit<ITravelArticle, 'author' | 'heroImage' | 'destinations' | 'seo'> & {
    _id: Types.ObjectId;
    author: PopulatedAuthor;
    heroImage: PopulatedHeroImage;
    destinations?: DestinationWithImage[];
    seo: Omit<ITravelArticle['seo'], 'ogImage'> & { ogImage: PopulatedAssetLean }
};
/**
 * Builds a TourArticle DTO by ID, with optional deletion inclusion and transaction support
 * @param articleId - The article ID (string or ObjectId)
 * @param withDeleted - Whether to include deleted articles
 * @param session - Optional MongoDB session for transaction
 * @returns Promise<ArticleDetail | null> - The formatted article or null if not found
 */
export async function buildTourArticleDto(
    articleId: string | Types.ObjectId,
    withDeleted = false,
    session?: ClientSession
): Promise<ArticleDetail | null> {
    const id = typeof articleId === 'string'
        ? new Types.ObjectId(articleId)
        : articleId;

    // Fetch article and comment counts in parallel for better performance
    const [baseArticle, commentCount, pendingCommentCount] = await Promise.all([
        // Get the article
        withDeleted
            ? TravelArticleModel.findOneWithDeleted({ _id: id }, {}, session)
            : TravelArticleModel.findById(id).session(session ?? null),

        // Count approved comments
        TravelCommentModel.countDocuments({
            articleId: id,
            status: COMMENT_STATUS.APPROVED
        }).session(session ?? null),

        // Count pending comments
        TravelCommentModel.countDocuments({
            articleId: id,
            status: COMMENT_STATUS.PENDING
        }).session(session ?? null)
    ]);

    if (!baseArticle) return null;

    const article = await TravelArticleModel.populate(baseArticle, [
        {
            path: 'author',
            model: UserModel,
            select: 'name'
        },
        {
            path: 'heroImage',
            model: AssetModel,
            select: '_id',
            options: { session },
            populate: {
                path: 'file',
                model: AssetFileModel,
                select: 'publicUrl'
            }
        },
        {
            path: 'destinations.imageAsset.assetId',
            model: AssetModel,
            select: '_id',
            options: { session },
            populate: {
                path: 'file',
                model: AssetFileModel,
                select: 'publicUrl'
            }
        },
        {
            path: 'seo.ogImage',
            model: AssetModel,
            select: '_id',
            options: { session },
            populate: {
                path: 'file',
                model: AssetFileModel,
                select: 'publicUrl'
            }
        }
    ]) as unknown as LeanTravelArticle;

    /* ---------------- AUTHOR AVATAR ---------------- */

    let authorAvatarUrl: string | undefined;
    const authorId =
        article.author instanceof Types.ObjectId
            ? article.author
            : article.author?._id;

    if (authorId) {
        const employee = await EmployeeModel.findOne({ user: authorId })
            .populate({
                path: 'avatar',
                model: AssetModel,
                select: '_id',
                populate: {
                    path: 'file',
                    model: AssetFileModel,
                    select: 'publicUrl'
                }
            })
            .lean()
            .exec() as unknown as Omit<IEmployee, "avatar"> & { avatar?: PopulatedAssetLean };

        authorAvatarUrl = employee?.avatar?.file?.publicUrl;
    }

    /* ---------------- DESTINATION IMAGE ASSETS ---------------- */

    const destinationAssetIds =
        article.destinations
            ?.map(d =>
                d.imageAsset?.assetId instanceof Types.ObjectId
                    ? d.imageAsset.assetId
                    : null
            )
            .filter(Boolean) as Types.ObjectId[] || [];


    const destinationAssets = destinationAssetIds.length
        ? await AssetModel.find({ _id: { $in: destinationAssetIds } })
            .populate({
                path: 'file',
                model: AssetFileModel,
                select: 'publicUrl'
            })
            .lean<PopulatedAssetLean[]>()
            .exec()
        : [];

    const assetUrlMap = new Map<string, string>();
    for (const asset of destinationAssets) {
        if (asset.file?.publicUrl) {
            assetUrlMap.set(asset._id.toString(), asset.file.publicUrl);
        }
    }

    /* ---------------- BUILD DESTINATIONS ---------------- */

    const destinations = article.destinations?.map(dest => ({
        id: dest._id?.toString(),
        division: dest.division,
        district: dest.district,
        area: dest.area,
        description: dest.description,
        content: dest.content,
        highlights: dest.highlights ?? [],
        foodRecommendations: dest.foodRecommendations ?? [],
        localFestivals: dest.localFestivals ?? [],
        localTips: dest.localTips ?? [],
        transportOptions: dest.transportOptions ?? [],
        accommodationTips: dest.accommodationTips ?? [],
        coordinates: dest.coordinates ?? { lat: 0, lng: 0 },
        imageAsset:
            dest.imageAsset?.assetId && typeof dest.imageAsset.assetId === 'object'
                ? {
                    title: dest.imageAsset.title,
                    assetId: dest.imageAsset.assetId._id.toString(),
                    url: dest.imageAsset.assetId.file?.publicUrl
                }
                : undefined

    })) ?? [];

    /* ---------------- FINAL DTO ---------------- */

    return {
        id: article._id.toString(),
        title: article.title,
        banglaTitle: article.banglaTitle,
        slug: article.slug,
        status: article.status,
        articleType: article.articleType,
        author: {
            id: authorId?.toString() ?? '',
            name:
                article.author instanceof Types.ObjectId
                    ? ''
                    : article.author?.name ?? '',
            avatarUrl: authorAvatarUrl
        },
        authorBio: article.authorBio,
        summary: article.summary,
        heroImage: article.heroImage?.file?.publicUrl,
        categories: article.categories ?? [],
        tags: article.tags ?? [],
        publishedAt: article.publishedAt?.toISOString(),
        readingTime: article.readingTime,
        wordCount: article.wordCount,
        viewCount: article.viewCount,
        likeCount: article.likeCount,
        shareCount: article.shareCount,
        allowComments: article.allowComments,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        seo: {
            metaTitle: article.seo?.metaTitle ?? '',
            metaDescription: article.seo?.metaDescription ?? '',
            ogImage: article.seo?.ogImage.file?.publicUrl
        },
        destinations,
        faqs: article.faqs ?? [],
        commentCount,
        pendingCommentCount
    } as ArticleDetail;
}