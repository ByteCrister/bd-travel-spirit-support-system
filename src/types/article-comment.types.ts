// /types/article-comment.types.ts

import { COMMENT_STATUS, CommentStatus } from "@/constants/articleComment.const";
import { UserRole } from "@/constants/user.const";

/* ========================================================================== */
/* Domain enums & base primitives                                             */
/* ========================================================================== */

/**
 * Safe identifier used across DTOs.
 * While Mongo uses ObjectId, APIs should expose string IDs only.
 */
export type EntityId = string;

/**
 * ISO timestamp strings for API surface; convert to Date where needed in UI/store.
 */
export type IsoDateTime = string;

/**
 * Basic user preview fetched alongside comments.
 * Assumes your API resolves author -> User with minimal fields needed by UI.
 */
export interface UserPreviewDTO {
    id: EntityId;
    name: string;
    avatarUrl?: string | null;
    role: UserRole;
}

/* ========================================================================== */
/* Pagination, sorting, filtering                                             */
/* ========================================================================== */

/**
 * Sorting options applicable to both articles and comments lists.
 * Extend as needed (e.g., by likes desc).
 */
export type SortDirection = 'asc' | 'desc';

export type ArticleSortKey =
    | 'createdAt'
    | 'updatedAt'
    | 'title'
    | 'totalComments'
    | 'pendingComments';

export type CommentSortKey =
    | 'createdAt'
    | 'updatedAt'
    | 'likes'
    | 'status';

export interface SortDTO<K extends string = string> {
    key: K;
    direction: SortDirection;
}

/**
 * Offset pagination: page-number based UI controls.
 */
export interface OffsetPageMetaDTO {
    page: number;        // 1-based index
    pageSize: number;    // items per page (limit)
    totalItems: number;  // total matches for current filter/sort
    totalPages: number;  // ceil(totalItems / pageSize)
}

/**
 * Cursor pagination: efficient deep pagination for large comment threads.
 * Use `nextCursor` for subsequent fetches; null means end of list.
 */
export interface CursorPageMetaDTO {
    cursor?: string | null;
    nextCursor?: string | null;
    pageSize: number;
    hasNextPage: boolean;
}

/**
 * Filters for high-level article rows in the admin.
 * Use null/undefined to indicate "no filter" in requests.
 */
export interface ArticleFiltersDTO {
    searchQuery?: string | null;      // full-text over title/slug
    status?: CommentStatus | 'any';   // aggregates based on comment status; 'any' = no filter
    authorName?: EntityId | null;       // filter by article author (optional)
    taggedRegion?: string | null;     // example: region tag for travel content
}

/**
 * Filters for comment listings per article.
 */
export interface CommentFiltersDTO {
    status?: CommentStatus | 'any';
    minLikes?: number | null;
    hasReplies?: boolean | null;      // true: only threads with replies; false: leaf nodes; null: any
    authorName?: string | null;
    searchQuery?: string | null;      // search in comment content
}

/* ========================================================================== */
/* Admin stats DTO                                                            */
/* ========================================================================== */

/**
 * High-level dashboard stats for comments across all articles.
 * These power top-of-page stat cards.
 */
export interface CommentAdminStatsDTO {
    totalComments: number;
    totalApproved: number;
    totalPending: number;
    totalRejected: number;
    uniqueCommenters: number;
    avgRepliesPerComment: number;     // computed using replyCount virtuals or aggregation
    mostActiveArticle?: {
        articleId: EntityId;
        title: string;
        totalComments: number;
    } | null;
}

/* ========================================================================== */
/* Article summary rows with lightweight comment info                         */
/* ========================================================================== */

/**
 * Minimal article preview shown in the table.
 */
export interface ArticlePreviewDTO {
    id: EntityId;
    title: string;
    slug: string;
    coverImageUrl?: string | null;
    createdAt: IsoDateTime;
    updatedAt: IsoDateTime;
    author: UserPreviewDTO; // article author
}

/**
 * Aggregate comment metrics per article for table rows.
 */
export interface ArticleCommentMetricsDTO {
    totalComments: number;
    approvedComments: number;
    pendingComments: number;
    rejectedComments: number;
    latestCommentAt?: IsoDateTime | null;
}

/**
 * Row for the admin article comments table.
 * Designed to be fast to render before accordion expands.
 */
export interface ArticleCommentSummaryRowDTO {
    article: ArticlePreviewDTO;
    metrics: ArticleCommentMetricsDTO;
}

/**
 * Response for the article table with comment metrics.
 * Use offset pagination for admin table (page controls in UI).
 */
export interface ArticleCommentSummaryListResponseDTO {
    data: ArticleCommentSummaryRowDTO[];
    meta: {
        pagination: OffsetPageMetaDTO;
        sort: SortDTO<ArticleSortKey>;
        filtersApplied: ArticleFiltersDTO;
    };
}

/* ========================================================================== */
/* Comment detail DTOs for nested threads                                     */
/* ========================================================================== */

/**
 * A single comment node with author and computed replyCount.
 * Content length limit matches model (max 5000 in backend validation).
 */
export interface CommentDetailDTO {
    id: EntityId;
    articleId: EntityId;
    parentId?: EntityId | null;
    author: UserPreviewDTO;
    content: string;
    likes: number;
    status: CommentStatus;
    replyCount: number;      // from virtual or computed server-side
    createdAt: IsoDateTime;
    updatedAt: IsoDateTime;
}

/**
 * Nested comment structure for rendering tree views.
 * Children may be paginated in large threads (see CommentThreadSegmentDTO).
 */
export interface CommentTreeNodeDTO extends CommentDetailDTO {
    children?: CommentTreeNodeDTO[]; // optional if not yet expanded/fetched
}

/**
 * When fetching large threads lazily, return sliced segments with cursors.
 * This supports "More" per accordion to load next 100 replies.
 */
export interface CommentThreadSegmentDTO {
    /**
     * Root-level comments or children for a specific parent, depending on request.
     */
    nodes: CommentTreeNodeDTO[];
    meta: {
        pagination: CursorPageMetaDTO; // cursor-based for efficient "load more" on threads
        sort: SortDTO<CommentSortKey>;
        filtersApplied: CommentFiltersDTO;
        scope: {
            articleId: EntityId;
            parentId?: EntityId | null;   // undefined/null => root-level comments for article
            depthMax?: number | null;     // if server limits depth; null means unlimited
        };
    };
}

/**
 * Convenience response for fetching all comments of an article (root level), lightweight version.
 * Use when not rendering nested immediately; client can then fetch children on demand.
 */
export interface ArticleCommentsListResponseDTO {
    data: CommentDetailDTO[];
    meta: {
        pagination: CursorPageMetaDTO;
        sort: SortDTO<CommentSortKey>;
        filtersApplied: CommentFiltersDTO;
        scope: {
            articleId: EntityId;
        };
    };
}

/* ========================================================================== */
/* Mutations: reply, moderation, likes                                        */
/* ========================================================================== */

/**
 * Payload to create a reply to a comment (or a root comment if parentId is null).
 */
export interface CreateCommentPayloadDTO {
    articleId: EntityId;
    parentId?: EntityId | null;
    content: string; // validated server-side: trim, sanitize; max 5000
}

/**
 * Response for creating a comment/reply.
 * Returns the created node; clients may insert or re-fetch segment.
 */
export interface CreateCommentResponseDTO {
    data: CommentDetailDTO;
}

/**
 * Moderation update payload: approve or reject a specific comment.
 */
export interface UpdateCommentStatusPayloadDTO {
    commentId: EntityId;
    status: Exclude<CommentStatus, COMMENT_STATUS.PENDING>; // approve or reject
    reason?: string | null; // optional moderation note
}

/**
 * Response after moderation update.
 */
export interface UpdateCommentStatusResponseDTO {
    data: CommentDetailDTO;
}

/**
 * Like/unlike payload.
 * If you plan to support unlike, model as a boolean; otherwise increment-only.
 */
export interface ToggleLikePayloadDTO {
    commentId: EntityId;
    like: boolean; // true => +1, false => -1 (if allowed)
}

/**
 * Response after like toggle.
 */
export interface ToggleLikeResponseDTO {
    data: {
        commentId: EntityId;
        likes: number;
    };
}

/* ========================================================================== */
/* Delete & Restore                                                          */
/* ========================================================================== */

/**
 * Delete a comment (soft delete or hard delete based on backend)
 */
export interface DeleteCommentPayloadDTO {
    commentId: EntityId;
    reason?: string | null; // Optional deletion reason
}

export interface DeleteCommentResponseDTO {
    data: {
        commentId: EntityId;
        deletedAt: IsoDateTime;
        status: CommentStatus;
    };
}

/**
 * Restore a soft-deleted comment
 */
export interface RestoreCommentPayloadDTO {
    commentId: EntityId;
}

export interface RestoreCommentResponseDTO {
    data: CommentDetailDTO;
}

/* ========================================================================== */
/* Load-more (batch) semantics                                                */
/* ========================================================================== */

/**
 * Request to load the next batch of comments in a thread context.
 * pageSize recommended: 100 for admin bulk viewing.
 */
export interface LoadMoreCommentsRequestDTO {
    articleId: EntityId;
    parentId?: EntityId | null; // null => root-level comments
    cursor?: string | null;
    pageSize?: number; // default server-side to 100
    sort?: SortDTO<CommentSortKey>;
    filters?: CommentFiltersDTO;
}

/**
 * Response for load-more operations. Mirrors CommentThreadSegmentDTO.
 */
export type LoadMoreCommentsResponseDTO = CommentThreadSegmentDTO;

/* ========================================================================== */
/* API error normalization                                                    */
/* ========================================================================== */

/**
 * Standardized API error for axios consumption.
 * Map low-level network/HTTP errors to this shape in interceptors.
 */
export interface ApiErrorDTO {
    name: string;               // e.g., 'HttpError'
    statusCode?: number;        // HTTP status
    errorCode?: string;         // app-specific code (e.g., 'COMMENT_NOT_FOUND')
    message: string;            // human-readable
    details?: Record<string, unknown> | null; // extra context (validation errors, etc.)
    requestId?: string | null;  // trace ID for observability
}

/* ========================================================================== */
/* Requests & endpoints (typing helpers)                                      */
/* ========================================================================== */

/**
 * High-level article list request for admin table.
 */
export interface GetArticleCommentSummaryRequestDTO {
    page?: number;             // default 1
    pageSize?: number;         // default 20
    sort?: SortDTO<ArticleSortKey>;
    filters?: ArticleFiltersDTO;
}

/**
 * Fetch root-level comments for an article.
 */
export interface GetArticleCommentsRequestDTO {
    articleId: EntityId;
    cursor?: string | null;
    pageSize?: number;         // default 100
    sort?: SortDTO<CommentSortKey>;
    filters?: CommentFiltersDTO;
}

/**
 * Fetch children of a specific parent comment (nested expansion).
 */
export interface GetChildCommentsRequestDTO {
    articleId: EntityId;
    parentId: EntityId;
    cursor?: string | null;
    pageSize?: number;         // default 100
    sort?: SortDTO<CommentSortKey>;
    filters?: CommentFiltersDTO;
}

/* ========================================================================== */
/* Utility types & guards                                                     */
/* ========================================================================== */

/**
 * Narrower union for row types if needed for UI discriminated rendering.
 * Example: different badges for status on the article row (pending > 0, etc.)
 */
export type RowBadgeVariant = 'default' | 'positive' | 'warning' | 'danger';

export const isPendingStatus = (s: CommentStatus): boolean => s === COMMENT_STATUS.PENDING;
export const isApprovedStatus = (s: CommentStatus): boolean => s === COMMENT_STATUS.APPROVED;
export const isRejectedStatus = (s: CommentStatus): boolean => s === COMMENT_STATUS.REJECTED;

/**
 * Helpers to ensure safe pagination math in the store.
 */
export const computeTotalPages = (totalItems: number, pageSize: number): number =>
    Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));

/**
 * A lightweight mapping helper for server ObjectId -> string ID normalization.
 * Use in API adapters if your backend returns `_id`.
 */
export type IdLike = { _id?: string; id?: string };
export const normalizeId = (obj: IdLike): EntityId =>
    (obj.id ?? obj._id ?? '').toString();

/* ========================================================================== */
/* Table + accordion UI data contracts                                        */
/* ========================================================================== */

/**
 * Row data consumed by the admin table component.
 * Decoupled from raw DTOs so UI can evolve without breaking store or API.
 */
export interface AdminArticleRowVM {
    id: EntityId;
    title: string;
    slug: string;
    authorName: string;
    authorAvatarUrl?: string | null;
    totalComments: number;
    pendingComments: number;
    approvedComments: number;
    rejectedComments: number;
    latestCommentAt?: IsoDateTime | null;

    /**
     * Accordion state and expansion metadata.
     * The store can use these to track fetch states per row.
     */
    accordion: {
        isOpen: boolean;
        isLoading: boolean;
        lastLoadedCursor?: string | null;
        hasNextPage: boolean;
    };
}

/**
 * Comment node VM for rendering nested accordion content.
 * Separate from DTO to allow UI-only flags (e.g., isReplyEditorOpen).
 */
export interface AdminCommentNodeVM {
    id: EntityId;
    authorName: string;
    authorAvatarUrl?: string | null;
    authorRole: UserPreviewDTO['role'];
    content: string;
    likes: number;
    status: CommentStatus;
    createdAt: IsoDateTime;
    updatedAt: IsoDateTime;
    parentId?: EntityId | null;
    replyCount: number;
    children?: AdminCommentNodeVM[];

    ui: {
        isExpanded: boolean;
        isLoadingChildren: boolean;
        isReplyEditorOpen: boolean;
    };
}
