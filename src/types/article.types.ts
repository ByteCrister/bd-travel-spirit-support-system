// /types/article.types.ts

import { ARTICLE_STATUS, ARTICLE_TYPE } from "@/constants/article.const";
import { COMMENT_STATUS } from "@/constants/articleComment.const";
import { TRAVEL_TYPE } from "@/constants/tour.const";

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
   Content blocks (aligned, but safe for UI)
   ============================================================ */

export type RichTextBlockType = 'paragraph' | 'link' | 'heading';

export interface RichTextBlock {
    type: RichTextBlockType;
    text?: string;
    href?: string;
}

export interface Activity {
    title: string;
    url?: string;
    provider?: string;
    duration?: string;
    price?: string;
    rating?: number;
}

export interface Attraction {
    title: string;
    description: string;
    bestFor?: string;
    insiderTip?: string;
    address?: string;
    openingHours?: string;
    images: ImageUrl[]; // normalized for UI
    coordinates?: { lat: number; lng: number };
}

export interface DestinationBlock {
    city: string;
    country: string;
    region?: string;
    description: string;
    content: RichTextBlock[];
    highlights: string[];
    attractions: Attraction[];
    activities: Activity[];
    images: ImageUrl[];
}

export interface FaqItem {
    question: string;
    answer: string;
}

/* ============================================================
   Article core DTOs
   ============================================================ */

/** Minimal shape for table/list rows */
export interface ArticleListItem {
    id: ID;
    title: string;
    slug: string;
    status: ARTICLE_STATUS;
    articleType: ARTICLE_TYPE;
    author: UserRef;
    summary: string;
    heroImage?: ImageUrl;
    categories?: TRAVEL_TYPE[];
    tags?: string[];
    publishedAt?: ISODateString;
    readingTime?: number;
    wordCount?: number;
    viewCount: number;
    likeCount: number;
    shareCount: number;
    allowComments: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;

    // Derived/display helpers
    destinationCount?: number; // quick glance in table
    topDestinations?: string[]; // e.g., ["Sylhet", "Cox's Bazar"]
}

/** Detailed shape for /article/[articleId]/page.tsx */
export interface ArticleDetail extends Omit<ArticleListItem, 'destinationCount' | 'topDestinations'> {
    seo: {
        metaTitle: string;
        metaDescription: string;
        ogImage?: ImageUrl | string; // support legacy string, prefer ImageUrl
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
    status: COMMENT_STATUS;
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
    status?: ARTICLE_STATUS[];
    articleType?: ARTICLE_TYPE[];
    categories?: TRAVEL_TYPE[];
    tags?: string[];
    authorIds?: ID[];
    publishedFrom?: ISODateString;
    publishedTo?: ISODateString;
    minReadingTime?: number;
    maxReadingTime?: number;
    minWordCount?: number;
    maxWordCount?: number;
    allowComments?: boolean;
    destinationCity?: string; // subdocument match
    destinationCountry?: string;
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
    slug: string;
    status: ARTICLE_STATUS;
    articleType: ARTICLE_TYPE;
    authorBio?: string;
    summary: string;
    heroImage: ImageUrl | null; // backend may accept image id; UI may carry ImageUrl
    destinations?: DestinationBlock[];
    categories?: TRAVEL_TYPE[];
    tags?: string[];
    seo?: {
        metaTitle: string;
        metaDescription: string;
        ogImage?: ImageUrl | null;
    };
    faqs?: FaqItem[];
    allowComments?: boolean;
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
    id: ID;
}

export interface DeleteArticleInput {
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
    | 'destinationCount'
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
}

/* ============================================================
   API route helpers (optional but convenient)
   ============================================================ */

export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: string; status?: number };

export type ArticleListApi = ApiResult<ArticleListQueryResponse>;
export type ArticleDetailApi = ApiResult<ArticleDetail>;
export type ArticleStatsApi = ApiResult<ArticleDashboardStats>;
export type CreateArticleApi = ApiResult<CreateArticleResponse>;
export type UpdateArticleApi = ApiResult<UpdateArticleResponse>;
export type DeleteArticleApi = ApiResult<DeleteArticleResponse>;
