// /types/article.types.ts

import { ArticleRichTextBlockType, ArticleStatus, ArticleType, FaqCategory, FoodRecoSpiceType } from "@/constants/article.const";
import { CommentStatus } from "@/constants/articleComment.const";
import { TourCategories, Division, District } from "@/constants/tour.const";
import { ApiResponse } from "./api.types";

/* ============================================================
   Core primitives and cross-cutting types
   ============================================================ */

export type ID = string; // string ObjectId in API payloads
export type URL = string;
export type ISODateString = string; // e.g., "2025-10-08T13:23:44.165Z"

/** Minimal reference for users to keep payloads slim */
export interface UserRef {
    id: ID;
    name?: string;
    avatarUrl?: string;
}

/** Minimal reference for images (your Image model) */
export type ImageUrl = URL;

/* ============================================================
   Content blocks (aligned with updated model)
   ============================================================ */

export interface RichTextBlock {
    type: ArticleRichTextBlockType;
    text?: string;
    href?: string;
}

// Bangladesh-specific food recommendation
export interface FoodRecommendation {
    dishName: string;
    description: string;
    bestPlaceToTry?: string;
    approximatePrice?: string;
    spiceLevel?: FoodRecoSpiceType;
}

// Bangladesh-specific local festival
export interface LocalFestival {
    name: string;
    description: string;
    timeOfYear: string;
    location: string;
    significance?: string;
}

// Updated DestinationBlock for Bangladesh context
export interface DestinationBlock {
    id?: ID;
    division: Division; // e.g., "Dhaka", "Chittagong", "Sylhet"
    district: District; // e.g., "Cox's Bazar", "Bandarban", "Sylhet"
    area?: string; // Specific area/location
    description: string;
    content: RichTextBlock[];
    highlights: string[];

    // Bangladesh-specific fields
    foodRecommendations: FoodRecommendation[];
    localFestivals: LocalFestival[];
    localTips: string[];
    transportOptions: string[]; // e.g., "Bus from Dhaka", "Train", "Domestic Flight"
    accommodationTips: string[];
    coordinates: { lat: number; lng: number };
    imageAsset?: { title: string; assetId: ID; url: ImageUrl }; // Added url for frontend display
}

// Updated FAQ with category
export interface FaqItem {
    question: string;
    answer: string;
    category?: FaqCategory;
}

/* ============================================================
   Article core DTOs
   ============================================================ */

/** Minimal shape for table/list rows */
export interface ArticleListItem {
    id: ID;
    title: string;
    banglaTitle?: string; // Title in Bengali
    slug: string;
    status: ArticleStatus;
    articleType: ArticleType;
    author: UserRef;
    authorBio?: string; // Author biography
    summary: string;
    heroImage?: ImageUrl;
    categories?: TourCategories[]; // Changed from TRAVEL_TYPE to TourCategories
    tags?: string[];

    // Stats and metadata
    publishedAt?: ISODateString;
    readingTime?: number;
    wordCount?: number;
    viewCount: number;
    likeCount: number;
    shareCount: number;
    allowComments: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

/** Detailed shape for /article/[articleId]/page.tsx */
export interface ArticleDetail extends ArticleListItem {
    seo: {
        metaTitle: string;
        metaDescription: string;
        ogImage?: ImageUrl; // support legacy string, prefer ImageUrl
    };
    destinations?: DestinationBlock[];
    faqs?: FaqItem[];

    // Optional aggregated counts for admin
    commentCount?: number;
    pendingCommentCount?: number;
}

/* ============================================================
   Comments DTOs (for admin views)
   ============================================================ */

export interface CommentListItem {
    id: ID;
    articleId: ID;
    parentId?: ID | null;
    author: UserRef;
    content: string;
    likes: number;
    replies: ID[];
    status: CommentStatus;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    replyCount?: number; // virtual convenience
}

/* ============================================================
   Filters, sorting, pagination, search
   ============================================================ */

export type ArticleSortField =
    | 'publishedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'title'
    | 'viewCount'
    | 'likeCount'
    | 'shareCount'
    | 'readingTime'
    | 'wordCount';

export type SortOrder = 'asc' | 'desc';

export interface ArticleSort {
    field: ArticleSortField;
    order: SortOrder;
}

/** Flexible filter set for server/API and client UI */
export interface ArticleFilter {
    status?: ArticleStatus[];
    articleType?: ArticleType[];
    categories?: TourCategories[];
    tags?: string[];
    authorNames?: string[];
    publishedFrom?: ISODateString;
    publishedTo?: ISODateString;
    minReadingTime?: number;
    maxReadingTime?: number;
    minWordCount?: number;
    maxWordCount?: number;
    allowComments?: boolean;
    destinationCity?: string; // subdocument match
}

/** Simple search model (can be extended with field-scoped queries) */
export interface ArticleSearch {
    query?: string; // free text across title/summary/tags
}

/** Cursor-based pagination for resilience and performance */
export interface CursorPageRequest {
    limit?: number; // default server-side e.g., 20
    after?: ID | null; // last item id in current list
}

/** Alternative offset pagination if needed */
export interface OffsetPageRequest {
    page?: number; // 1-based
    pageSize?: number;
}

export interface OffsetPageResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalPages?: number;
    totalCount?: number;
}

/* ============================================================
   Combined query request/response
   ============================================================ */

export interface ArticleListQueryRequest {
    filter?: ArticleFilter;
    search?: ArticleSearch;
    sort?: ArticleSort;
    pagination: OffsetPageRequest | undefined;
}

export type ArticleListQueryResponse = (OffsetPageResponse<ArticleListItem> & { paginationType: 'offset' });


/* ============================================================
   Admin stats DTOs
   ============================================================ */

export interface ArticleStatsSummary {
    totalArticles: number;
    draftCount: number;
    publishedCount: number;
    archivedCount: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    averageReadingTime?: number;
    averageWordCount?: number;
}

export interface ArticleTimeBucketStat {
    bucketLabel: string; // e.g., "2025-10", "Week 41"
    count: number;
}

export interface ArticleDashboardStats {
    summary: ArticleStatsSummary;
    byStatusOverTime?: ArticleTimeBucketStat[]; // trend lines
    topAuthors?: { author: UserRef; articleCount: number }[];
    topDestinations?: { city: string; country: string; articleCount: number }[];
    popularTags?: { tag: string; articleCount: number }[];
}

/* ============================================================
   Mutation DTOs (create/update/delete)
   ============================================================ */

export interface CreateArticleInput {
    title: string;
    banglaTitle: string;
    status: ArticleStatus;
    articleType: ArticleType;
    authorBio?: string;
    summary: string;
    heroImage?: ImageUrl | null;
    destinations: DestinationBlock[];
    categories: TourCategories[];
    tags: string[];
    seo: {
        metaTitle: string;
        metaDescription: string;
        ogImage?: ImageUrl | null;
    };
    faqs: FaqItem[];
    allowComments?: boolean;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
    id: ID;
}

export interface DeleteArticleInput {
    id: ID;
}
export interface RestoreArticleInput {
    id: ID;
}
export interface MutationResult {
    success: boolean;
    message?: string;
}

export interface CreateArticleResponse extends MutationResult {
    article?: ArticleDetail;
}

export interface UpdateArticleResponse extends MutationResult {
    article?: ArticleDetail;
}

export interface DeleteArticleResponse extends MutationResult {
    deletedId?: ID;
}

export interface RestoreArticleResponse extends MutationResult {
    article?: ArticleDetail;
}
/* ============================================================
   Cache keys and query identity
   ============================================================ */

export type CacheScope = 'list' | 'detail' | 'stats';

export interface ArticleListCacheKey {
    scope: 'list';
    filter?: ArticleFilter;
    search?: ArticleSearch;
    sort?: ArticleSort;
    pagination?: CursorPageRequest | OffsetPageRequest;
}

export interface ArticleDetailCacheKey {
    scope: 'detail';
    id: ID;
}

export interface ArticleStatsCacheKey {
    scope: 'stats';
}

export type ArticleCacheKey = ArticleListCacheKey | ArticleDetailCacheKey | ArticleStatsCacheKey;

/* ============================================================
   UI helpers for table columns and actions
   ============================================================ */

export type ArticleTableColumnKey =
    | 'title'
    | 'status'
    | 'articleType'
    | 'author'
    | 'categories'
    | 'tags'
    | 'publishedAt'
    | 'viewCount'
    | 'likeCount'
    | 'shareCount'
    | 'createdAt'
    | 'updatedAt'
    | 'actions';

export interface ArticleRowAction {
    type: 'view' | 'edit' | 'delete';
    label: string;
    href?: string; // for view/edit routing
    confirm?: boolean; // for delete confirmations
}

/* ============================================================
   Zustand store-friendly shapes
   ============================================================ */

export interface ArticleStoreState {
    // data
    listItems: ArticleListItem[];
    detailById: Record<ID, ArticleDetail | undefined>;
    stats?: ArticleDashboardStats;

    // query state
    currentFilter: ArticleFilter;
    currentSearch: ArticleSearch;
    currentSort: ArticleSort;
    currentPagination: CursorPageRequest | OffsetPageRequest;
    nextCursor?: ID | null;

    // ui state
    isLoadingList: boolean;
    isLoadingDetail: boolean;
    isLoadingStats: boolean;
    error?: string;

    // helpers
    selectedArticleId?: ID;
}

export interface ArticleStoreActions {
    setFilter: (filter: ArticleFilter) => void;
    setSearch: (search: ArticleSearch) => void;
    setSort: (sort: ArticleSort) => void;
    setPagination: (pg: CursorPageRequest | OffsetPageRequest) => void;
    setSelectedArticleId: (id?: ID) => void;

    // data loaders
    loadList: (req: ArticleListQueryRequest) => Promise<void>;
    loadDetail: (id: ID) => Promise<void>;
    loadStats: () => Promise<void>;

    // mutations
    createArticle: (input: CreateArticleInput) => Promise<CreateArticleResponse>;
    updateArticle: (input: UpdateArticleInput) => Promise<UpdateArticleResponse>;
    deleteArticle: (input: DeleteArticleInput) => Promise<DeleteArticleResponse>;
    restoreArticle: (input: RestoreArticleInput) => Promise<RestoreArticleResponse>;
}

/* ============================================================
   API route helpers (optional but convenient)
   ============================================================ */

export type ArticleListApi = ApiResponse<ArticleListQueryResponse>;
export type ArticleDetailApi = ApiResponse<ArticleDetail>;
export type ArticleStatsApi = ApiResponse<ArticleDashboardStats>;
export type CreateArticleApi = ApiResponse<CreateArticleResponse>;
export type UpdateArticleApi = ApiResponse<UpdateArticleResponse>;
export type DeleteArticleApi = ApiResponse<DeleteArticleResponse>;
export type RestoreArticleApi = ApiResponse<RestoreArticleResponse>;