// api/support/articles/v1/route.ts
import { NextRequest } from 'next/server';
import { FilterQuery, Types, SortOrder as MongoSortOrder } from 'mongoose';

import {
    ArticleListItem,
    ArticleFilter,
    ArticleSearch,
    ArticleSort,
    ISODateString,
    UserRef,
    ImageUrl,
    ArticleListQueryResponse,
    SortOrder,
    ArticleSortField
} from '@/types/article.types';

import { ArticleStatus, ArticleType } from '@/constants/article.const';
import { TourCategories } from '@/constants/tour.const';
import UserModel from '@/models/user.model';
import AssetModel from '@/models/assets/asset.model';
import AssetFileModel from '@/models/assets/asset-file.model';
import EmployeeModel from '@/models/employees/employees.model';
import { ApiError, withErrorHandler } from '@/lib/helpers/withErrorHandler';
import { withTransaction } from '@/lib/helpers/withTransaction';
import { ITravelArticle, TravelArticleModel } from '@/models/articles/travel-article.model';
import { PopulatedAssetLean } from '@/types/populated-asset.types';
import ConnectDB from '@/config/db';

// Helper function to build MongoDB query from filters
function buildMongoQuery(filter?: ArticleFilter, search?: ArticleSearch) {
    const query: FilterQuery<ITravelArticle> = { deleted: false }; // Only non-deleted articles

    // Status filter
    if (filter?.status && filter.status.length > 0) {
        query.status = { $in: filter.status };
    }

    // Article type filter
    if (filter?.articleType && filter.articleType.length > 0) {
        query.articleType = { $in: filter.articleType };
    }

    // Categories filter
    if (filter?.categories && filter.categories.length > 0) {
        query.categories = { $in: filter.categories };
    }

    // Tags filter
    if (filter?.tags && filter.tags.length > 0) {
        query.tags = { $in: filter.tags };
    }

    // Published date range
    if (filter?.publishedFrom || filter?.publishedTo) {
        query.publishedAt = {};
        if (filter.publishedFrom) {
            query.publishedAt.$gte = new Date(filter.publishedFrom);
        }
        if (filter.publishedTo) {
            query.publishedAt.$lte = new Date(filter.publishedTo);
        }
    }

    // Reading time range
    if (filter?.minReadingTime || filter?.maxReadingTime) {
        query.readingTime = {};
        if (filter.minReadingTime !== undefined) {
            query.readingTime.$gte = filter.minReadingTime;
        }
        if (filter.maxReadingTime !== undefined) {
            query.readingTime.$lte = filter.maxReadingTime;
        }
    }

    // Word count range
    if (filter?.minWordCount || filter?.maxWordCount) {
        query.wordCount = {};
        if (filter.minWordCount !== undefined) {
            query.wordCount.$gte = filter.minWordCount;
        }
        if (filter.maxWordCount !== undefined) {
            query.wordCount.$lte = filter.maxWordCount;
        }
    }

    // Allow comments filter
    if (filter?.allowComments !== undefined) {
        query.allowComments = filter.allowComments;
    }

    // Destination city filter
    if (filter?.destinationCity) {
        query['destinations.district'] = { $regex: filter.destinationCity, $options: 'i' };
    }

    // Search query (across multiple fields)
    if (search?.query) {
        const searchRegex = { $regex: search.query, $options: 'i' };
        query.$or = [
            { title: searchRegex },
            { banglaTitle: searchRegex },
            { summary: searchRegex },
            { tags: searchRegex },
            { 'destinations.division': searchRegex },
            { 'destinations.district': searchRegex },
            { 'destinations.area': searchRegex }
        ];
    }

    return query;
}

// Helper function to build sort object
function buildSortObject(sort?: ArticleSort): { [key: string]: MongoSortOrder } {
    if (!sort) {
        return { updatedAt: -1 };
    }

    const sortFieldMap: Record<ArticleSortField, string> = {
        'publishedAt': 'publishedAt',
        'createdAt': 'createdAt',
        'updatedAt': 'updatedAt',
        'title': 'title',
        'viewCount': 'viewCount',
        'likeCount': 'likeCount',
        'shareCount': 'shareCount',
        'readingTime': 'readingTime',
        'wordCount': 'wordCount'
    };

    const field = sortFieldMap[sort.field] || 'updatedAt';
    const order: MongoSortOrder = sort.order === 'asc' ? 1 : -1;

    return { [field]: order };
}

// Helper function to parse query parameters
function parseQueryParams(searchParams: URLSearchParams): {
    page: number;
    pageSize: number;
    filter: ArticleFilter;
    search: ArticleSearch;
    sort: ArticleSort;
} {
    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));

    // Parse search
    const search: ArticleSearch = {
        query: searchParams.get('query') || ''
    };

    // Parse sort
    const sortField = searchParams.get('sortField') as ArticleSortField || 'updatedAt';
    const sortOrder = (searchParams.get('sortOrder') as SortOrder) || 'desc';
    const sort: ArticleSort = {
        field: sortField,
        order: sortOrder
    };

    // Parse filter parameters
    const filter: ArticleFilter = {};

    // Helper to parse array parameters
    const parseArrayParam = <T>(param: string | null): T[] | undefined => {
        if (!param) return undefined;
        return param.split(',').filter(Boolean) as T[];
    };

    // Parse comma-separated values
    if (searchParams.has('status')) {
        filter.status = parseArrayParam<ArticleStatus>(searchParams.get('status'));
    }
    if (searchParams.has('articleType')) {
        filter.articleType = parseArrayParam<ArticleType>(searchParams.get('articleType'));
    }
    if (searchParams.has('categories')) {
        filter.categories = parseArrayParam<TourCategories>(searchParams.get('categories'));
    }
    if (searchParams.has('tags')) {
        filter.tags = parseArrayParam<string>(searchParams.get('tags'));
    }
    if (searchParams.has('authorNames')) {
        filter.authorNames = parseArrayParam<string>(searchParams.get('authorNames'));
    }

    // Parse date range
    if (searchParams.has('publishedFrom')) {
        const date = searchParams.get('publishedFrom')!;
        if (isNaN(Date.parse(date))) {
            throw new ApiError('Invalid publishedFrom date format', 400);
        }
        filter.publishedFrom = date as ISODateString;
    }
    if (searchParams.has('publishedTo')) {
        const date = searchParams.get('publishedTo')!;
        if (isNaN(Date.parse(date))) {
            throw new ApiError('Invalid publishedTo date format', 400);
        }
        filter.publishedTo = date as ISODateString;
    }

    // Parse numeric ranges
    if (searchParams.has('minReadingTime')) {
        const value = parseInt(searchParams.get('minReadingTime')!);
        if (isNaN(value)) {
            throw new ApiError('Invalid minReadingTime', 400);
        }
        filter.minReadingTime = value;
    }
    if (searchParams.has('maxReadingTime')) {
        const value = parseInt(searchParams.get('maxReadingTime')!);
        if (isNaN(value)) {
            throw new ApiError('Invalid maxReadingTime', 400);
        }
        filter.maxReadingTime = value;
    }
    if (searchParams.has('minWordCount')) {
        const value = parseInt(searchParams.get('minWordCount')!);
        if (isNaN(value)) {
            throw new ApiError('Invalid minWordCount', 400);
        }
        filter.minWordCount = value;
    }
    if (searchParams.has('maxWordCount')) {
        const value = parseInt(searchParams.get('maxWordCount')!);
        if (isNaN(value)) {
            throw new ApiError('Invalid maxWordCount', 400);
        }
        filter.maxWordCount = value;
    }

    // Parse boolean
    if (searchParams.has('allowComments')) {
        const value = searchParams.get('allowComments');
        if (value !== 'true' && value !== 'false') {
            throw new ApiError('Invalid allowComments value. Must be "true" or "false"', 400);
        }
        filter.allowComments = value === 'true';
    }

    // Parse destination city
    if (searchParams.has('destinationCity')) {
        filter.destinationCity = searchParams.get('destinationCity')!;
    }

    return { page, pageSize, filter, search, sort };
}

/**
 * GET get the article list
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const { page, pageSize, filter, search, sort } = parseQueryParams(searchParams);

    // Execute with transaction for data consistency
    const result = await withTransaction(async (session) => {

        await ConnectDB();

        // Build MongoDB query
        const mongoQuery = buildMongoQuery(filter, search);
        const sortObject = buildSortObject(sort);

        // Handle author names filter by getting matching user IDs first
        // Inside the withTransaction callback:
        let authorUserIds: Types.ObjectId[] = [];
        if (filter.authorNames && filter.authorNames.length > 0) {
            const users = await UserModel.find({
                name: { $in: filter.authorNames.map(name => new RegExp(name, 'i')) }
            })
                .select('_id')
                .session(session)
                .lean();

            // Properly type the result and filter out invalid IDs
            authorUserIds = users
                .map(user => user._id)
                .filter((id): id is Types.ObjectId =>
                    id instanceof Types.ObjectId ||
                    (typeof id === 'object' && id !== null && '_bsontype' in id)
                );

            if (authorUserIds.length > 0) {
                mongoQuery.author = { $in: authorUserIds };
            } else {
                // If no users match, return empty result
                return {
                    items: [],
                    page,
                    pageSize,
                    totalPages: 0,
                    totalCount: 0,
                    paginationType: 'offset' as const
                };
            }
        }

        // Get total count for pagination
        const totalCount = await TravelArticleModel.countDocuments(mongoQuery).session(session);
        const totalPages = Math.ceil(totalCount / pageSize);
        const skip = (page - 1) * pageSize;

        // Fetch articles with population
        const articles = await TravelArticleModel.find(mongoQuery)
            .populate<{ author: { _id: Types.ObjectId; name: string } }>({
                path: 'author',
                model: UserModel,
                select: 'name'
            })
            .populate<{ heroImage: PopulatedAssetLean }>({
                path: 'heroImage',
                model: AssetModel,
                select: '_id',
                populate: {
                    path: 'file',
                    model: AssetFileModel,
                    select: 'publicUrl'
                }
            })
            .sort(sortObject)
            .skip(skip)
            .limit(pageSize)
            .session(session)
            .lean();

        // Get all author IDs to fetch their avatars
        const authorIds = articles
            .map(article => article.author?._id)
            .filter(Boolean) as Types.ObjectId[];

        // Fetch employees with avatars for these authors
        const avatarMap = new Map<string, string>();
        if (authorIds.length > 0) {
            const employees = await EmployeeModel.find({
                user: { $in: authorIds }
            })
                .populate<{ avatar: PopulatedAssetLean }>({
                    path: 'avatar',
                    model: AssetModel,
                    select: '_id',
                    populate: {
                        path: 'file',
                        model: AssetFileModel,
                        select: 'publicUrl'
                    }
                })
                .session(session)
                .lean();

            // Create a map of user ID to avatar URL
            employees.forEach(employee => {
                const userId = (employee.user as Types.ObjectId).toString();
                const avatarUrl = employee.avatar?.file?.publicUrl;
                if (avatarUrl) {
                    avatarMap.set(userId, avatarUrl);
                }
            });
        }

        // Transform articles to ArticleListItem
        const items: ArticleListItem[] = articles.map(article => {
            const authorUser = article.author as { _id: Types.ObjectId; name: string };
            const heroImageAsset = article.heroImage as PopulatedAssetLean;

            const author: UserRef = {
                id: authorUser?._id?.toString() || '',
                name: authorUser?.name,
                avatarUrl: authorUser?._id ? avatarMap.get(authorUser._id.toString()) : undefined
            };

            const heroImage: ImageUrl | undefined = heroImageAsset?.file?.publicUrl;

            return {
                id: article._id.toString(),
                title: article.title,
                banglaTitle: article.banglaTitle,
                slug: article.slug,
                status: article.status,
                articleType: article.articleType,
                author,
                authorBio: article.authorBio,
                summary: article.summary,
                heroImage,
                categories: article.categories as TourCategories[],
                tags: article.tags,
                publishedAt: article.publishedAt?.toISOString(),
                readingTime: article.readingTime,
                wordCount: article.wordCount,
                viewCount: article.viewCount,
                likeCount: article.likeCount,
                shareCount: article.shareCount,
                allowComments: article.allowComments,
                createdAt: article.createdAt.toISOString(),
                updatedAt: article.updatedAt.toISOString()
            };
        });

        return {
            items,
            page,
            pageSize,
            totalPages,
            totalCount,
            paginationType: 'offset' as const
        } satisfies ArticleListQueryResponse;
    });

    return {
        data: result,
        status: 200
    };
});