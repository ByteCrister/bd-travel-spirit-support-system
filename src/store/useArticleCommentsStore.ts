// /stores/articleComments.store.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AxiosError } from 'axios';

import {
    type AdminArticleRowVM,
    type ArticleCommentSummaryListResponseDTO,
    type ArticleFiltersDTO,
    type ArticleSortKey,
    type SortDTO,
    type OffsetPageMetaDTO,
    type ArticleCommentSummaryRowDTO,
    type CommentDetailDTO,
    type CommentThreadSegmentDTO,
    type CommentFiltersDTO,
    type CommentSortKey,
    type CursorPageMetaDTO,
    type CreateCommentPayloadDTO,
    type CreateCommentResponseDTO,
    type ToggleLikePayloadDTO,
    type ToggleLikeResponseDTO,
    type UpdateCommentStatusPayloadDTO,
    type UpdateCommentStatusResponseDTO,
    type LoadMoreCommentsRequestDTO,
    type LoadMoreCommentsResponseDTO,
    type CommentAdminStatsDTO,
    type ApiErrorDTO,
} from '@/types/article-comment.types';

import api from '@/utils/api/axios';
import { COMMENT_STATUS } from '@/constants/articleComment.const';

const ROOT_DIRECTORY = '/articles/comments';

/**
 * Map Axios errors into a normalized ApiErrorDTO for consistent UI handling.
 */
const toApiError = (err: unknown): ApiErrorDTO => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ax = err as AxiosError<any>;
    return {
        name: 'HttpError',
        statusCode: ax.response?.status,
        errorCode: ax.response?.data?.errorCode,
        message: ax.response?.data?.message ?? ax.message,
        details: ax.response?.data?.details ?? null,
        requestId: ax.response?.headers?.['x-request-id'] ?? null,
    };
};

/* ========================================================================== */
/* Cache, persistence, and keys                                               */
/* ========================================================================== */

const DEFAULT_TABLE_TTL_MS = 60_000; // 1 min for article table
const DEFAULT_THREAD_TTL_MS = 60_000; // 1 min for per-thread comments

const LS_KEYS = {
    tableQuery: 'ac.table.query', // filters/sort/page/pageSize
};

/* ========================================================================== */
/* Local store types                                                           */
/* ========================================================================== */

type TableQuery = {
    page: number;
    pageSize: number;
    sort: SortDTO<ArticleSortKey>;
    filters: ArticleFiltersDTO;
};

type TableCacheEntry = {
    data: ArticleCommentSummaryRowDTO[];
    meta: {
        pagination: OffsetPageMetaDTO;
        sort: SortDTO<ArticleSortKey>;
        filtersApplied: ArticleFiltersDTO;
    };
    fetchedAt: number; // for TTL enforcement
};

// Range-aware group cache (filters + sort canonical key)
type TableGroupKey = string;

type IndexRange = { start: number; end: number }; // inclusive indices

type TableGroupCacheEntry = {
    itemsByIndex: Record<number, ArticleCommentSummaryRowDTO>;
    coveredRanges: IndexRange[]; // non-overlapping, merged
    meta: {
        pagination: OffsetPageMetaDTO;
        sort: SortDTO<ArticleSortKey>;
        filtersApplied: ArticleFiltersDTO;
    };
    fetchedAt: number;
};

// With this for production safety:
type ThreadKey = string;

type ThreadCacheEntry = {
    nodes: CommentDetailDTO[]; // flattened for VM assembly
    meta: {
        pagination: CursorPageMetaDTO;
        sort: SortDTO<CommentSortKey>;
        filtersApplied: CommentFiltersDTO;
        scope: { articleId: string; parentId?: string | null; depthMax?: number | null };
    };
    fetchedAt: number;
};

type InFlightKey = string;

/* ========================================================================== */
/* Range helpers                                                              */
/* ========================================================================== */

const mergeRanges = (ranges: IndexRange[]): IndexRange[] => {
    if (!ranges.length) return [];
    const sorted = [...ranges].sort((a, b) => a.start - b.start);
    const merged: IndexRange[] = [];
    let cur = { ...sorted[0] };
    for (let i = 1; i < sorted.length; i++) {
        const r = sorted[i];
        if (r.start <= cur.end + 1) {
            cur.end = Math.max(cur.end, r.end);
        } else {
            merged.push(cur);
            cur = { ...r };
        }
    }
    merged.push(cur);
    return merged;
};

const isRangeCovered = (ranges: IndexRange[], want: IndexRange): boolean => {
    for (const r of ranges) {
        if (want.start >= r.start && want.end <= r.end) return true;
    }
    return false;
};

const subtractCovered = (ranges: IndexRange[], want: IndexRange): IndexRange[] => {
    // Return the uncovered subranges within 'want'
    const uncovered: IndexRange[] = [];
    let cursor = want.start;
    const sorted = mergeRanges(ranges);
    for (const r of sorted) {
        if (r.end < cursor) continue; // range before cursor
        if (r.start > want.end) break; // beyond want
        if (cursor < r.start) {
            uncovered.push({ start: cursor, end: Math.min(want.end, r.start - 1) });
        }
        cursor = Math.max(cursor, r.end + 1);
        if (cursor > want.end) break;
    }
    if (cursor <= want.end) {
        uncovered.push({ start: cursor, end: want.end });
    }
    return uncovered;
};

/* ========================================================================== */
/* Store interface                                                            */
/* ========================================================================== */

interface ArticleCommentsState {
    // Top-of-page stats
    stats: CommentAdminStatsDTO | null;
    statsLoading: boolean;
    statsError: ApiErrorDTO | null;

    // Article table (summary)
    tableQuery: TableQuery;
    tableCache: Record<string, TableCacheEntry>; // legacy per-query cache (kept for compatibility)
    tableGroupCache: Record<TableGroupKey, TableGroupCacheEntry>; // new range-aware cache
    tableLoading: boolean;
    tableError: ApiErrorDTO | null;

    // View models for table component
    tableVM: AdminArticleRowVM[];

    // Threads cache keyed by articleId + parentId
    threadCache: Record<ThreadKey, ThreadCacheEntry>;
    threadLoading: Record<ThreadKey, boolean>;
    threadError: Record<ThreadKey, ApiErrorDTO | null>;

    // Per-row accordion state
    rowAccordionState: Record<string, { isOpen: boolean }>;

    // Request dedupe
    inFlight: Set<InFlightKey>;

    /* Actions */
    setTableQuery: (partial: Partial<TableQuery>, persistToLS?: boolean) => void;
    restoreTableQueryFromLS: () => void;

    fetchStats: () => Promise<void>;

    // Table
    fetchTable: (force?: boolean) => Promise<void>; // range-aware
    toggleAccordion: (articleId: string, open?: boolean) => void;

    // Threads
    fetchRootComments: (params: {
        articleId: string;
        pageSize?: number;
        sort?: SortDTO<CommentSortKey>;
        filters?: CommentFiltersDTO;
        force?: boolean;
    }) => Promise<void>;

    fetchChildComments: (params: {
        articleId: string;
        parentId: string;
        pageSize?: number;
        sort?: SortDTO<CommentSortKey>;
        filters?: CommentFiltersDTO;
        force?: boolean;
    }) => Promise<void>;

    loadMoreComments: (req: LoadMoreCommentsRequestDTO) => Promise<void>;

    // Mutations
    createReply: (payload: CreateCommentPayloadDTO) => Promise<CommentDetailDTO>;
    toggleLike: (payload: ToggleLikePayloadDTO) => Promise<void>;
    updateStatus: (payload: UpdateCommentStatusPayloadDTO) => Promise<void>;

    // Selectors
    selectRowVMByArticleId: (articleId: string) => AdminArticleRowVM | undefined;
    selectThreadByKey: (key: ThreadKey) => ThreadCacheEntry | undefined;

    /* Internals */
    assembleTableVM: () => void; // legacy
    assembleTableVMFromGroup: () => void; // new
    threadKeyOf: (articleId: string, parentId?: string | null) => ThreadKey;
    serializeTableQuery: (q: TableQuery) => string;
    groupKeyOf: (sort: SortDTO<ArticleSortKey>, filters: ArticleFiltersDTO) => TableGroupKey;
}

/* ========================================================================== */
/* Initial query                                                               */
/* ========================================================================== */

const initialQuery: TableQuery = {
    page: 1,
    pageSize: 20,
    sort: { key: 'createdAt', direction: 'desc' },
    filters: { status: 'any', searchQuery: null, authorId: null, taggedRegion: null },
};

/* ========================================================================== */
/* Store implementation                                                        */
/* ========================================================================== */

export const useArticleCommentsStore = create<ArticleCommentsState>()(
    devtools(
        persist(
            (set, get) => ({
                stats: null,
                statsLoading: false,
                statsError: null,

                tableQuery: initialQuery,
                tableCache: {},
                tableGroupCache: {},
                tableLoading: false,
                tableError: null,

                tableVM: [],

                threadCache: {},
                threadLoading: {},
                threadError: {},

                rowAccordionState: {},

                inFlight: new Set<InFlightKey>(),

                /**
                 * Update table query. Optionally persist to localStorage.
                 * When filters change, reset page to 1 to avoid empty slices.
                 */
                setTableQuery: (partial, persistToLS = true) => {
                    const prev = get().tableQuery;
                    const nextFilters = { ...prev.filters, ...partial.filters };
                    const filtersChanged =
                        partial.filters && JSON.stringify(prev.filters) !== JSON.stringify(nextFilters);
                    const next: TableQuery = {
                        page: filtersChanged ? 1 : (partial.page ?? prev.page),
                        pageSize: partial.pageSize ?? prev.pageSize,
                        sort: partial.sort ?? prev.sort,
                        filters: nextFilters,
                    };
                    set({ tableQuery: next });

                    if (persistToLS && typeof window !== 'undefined') {
                        try {
                            localStorage.setItem(LS_KEYS.tableQuery, JSON.stringify(next));
                        } catch { }
                    }
                },

                /**
                 * Hydrate table query from localStorage (client-side only).
                 */
                restoreTableQueryFromLS: () => {
                    if (typeof window === 'undefined') return;
                    try {
                        const raw = localStorage.getItem(LS_KEYS.tableQuery);
                        if (raw) {
                            const parsed = JSON.parse(raw) as TableQuery;
                            set({ tableQuery: parsed });
                        }
                    } catch { }
                },

                /* -------------------------------- Stats ------------------------------- */

                fetchStats: async () => {
                    const inflightKey = 'stats';
                    if (get().inFlight.has(inflightKey)) return;
                    set((s) => ({
                        statsLoading: true,
                        statsError: null,
                        inFlight: new Set([...s.inFlight, inflightKey]),
                    }));
                    try {
                        const { data } = await api.get<CommentAdminStatsDTO>(`${ROOT_DIRECTORY}/stats`);
                        set((s) => {
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return { stats: data, statsLoading: false, inFlight: nextInFlight };
                        });
                    } catch (err) {
                        const apiErr = toApiError(err);
                        set((s) => {
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return { statsError: apiErr, statsLoading: false, inFlight: nextInFlight };
                        });
                    }
                },

                /* ------------------------------- Table -------------------------------- */

                serializeTableQuery: (q) => JSON.stringify(q),

                groupKeyOf: (sort, filters) => JSON.stringify({ sort, filters }),

                /**
                 * Assemble VM for table rows from legacy per-query cache + thread state.
                 * Kept for compatibility. Prefer assembleTableVMFromGroup for range-aware cache.
                 */
                assembleTableVM: () => {
                    const { tableQuery, tableCache } = get();
                    const key = get().serializeTableQuery(tableQuery);
                    const cache = tableCache[key];
                    if (!cache) {
                        set({ tableVM: [] });
                        return;
                    }

                    const vm: AdminArticleRowVM[] = cache.data.map((row) => {
                        const { article, metrics } = row;
                        const accordionState = get().rowAccordionState[article.id] ?? { isOpen: false };
                        const threadKey = get().threadKeyOf(article.id, null);
                        const tCache = get().threadCache[threadKey];
                        const hasNextPage = Boolean(tCache?.meta.pagination.hasNextPage);
                        const lastLoadedCursor = tCache?.meta.pagination.cursor ?? null;

                        return {
                            id: article.id,
                            title: article.title,
                            slug: article.slug,
                            authorName: article.author.name,
                            authorAvatarUrl: article.author.avatarUrl ?? null,
                            totalComments: metrics.totalComments,
                            pendingComments: metrics.pendingComments,
                            approvedComments: metrics.approvedComments,
                            rejectedComments: metrics.rejectedComments,
                            latestCommentAt: metrics.latestCommentAt ?? null,
                            accordion: {
                                isOpen: accordionState.isOpen,
                                isLoading: get().threadLoading[threadKey] ?? false,
                                lastLoadedCursor,
                                hasNextPage,
                            },
                        };
                    });

                    set({ tableVM: vm });
                },

                /**
                 * Assemble VM for table rows from range-aware group cache and thread state.
                 * Builds visible slice based on current page and pageSize using itemsByIndex.
                 */
                assembleTableVMFromGroup: () => {
                    const { tableQuery, tableGroupCache, groupKeyOf } = get();
                    const groupKey = groupKeyOf(tableQuery.sort, tableQuery.filters);
                    const group = tableGroupCache[groupKey];
                    if (!group) {
                        set({ tableVM: [] });
                        return;
                    }

                    const start = (tableQuery.page - 1) * tableQuery.pageSize;
                    const end = start + tableQuery.pageSize - 1;

                    const vm: AdminArticleRowVM[] = [];
                    for (let i = start; i <= end; i++) {
                        const row = group.itemsByIndex[i];
                        if (!row) break; // gap; UI can show partial until fetch resolves
                        const { article, metrics } = row;

                        const accordionState = get().rowAccordionState[article.id] ?? { isOpen: false };
                        const threadKey = get().threadKeyOf(article.id, null);
                        const tCache = get().threadCache[threadKey];

                        const hasNextPage = Boolean(tCache?.meta.pagination.hasNextPage);
                        const lastLoadedCursor = tCache?.meta.pagination.cursor ?? null;

                        vm.push({
                            id: article.id,
                            title: article.title,
                            slug: article.slug,
                            authorName: article.author.name,
                            authorAvatarUrl: article.author.avatarUrl ?? null,
                            totalComments: metrics.totalComments,
                            pendingComments: metrics.pendingComments,
                            approvedComments: metrics.approvedComments,
                            rejectedComments: metrics.rejectedComments,
                            latestCommentAt: metrics.latestCommentAt ?? null,
                            accordion: {
                                isOpen: accordionState.isOpen,
                                isLoading: get().threadLoading[threadKey] ?? false,
                                lastLoadedCursor,
                                hasNextPage,
                            },
                        });
                    }

                    set({ tableVM: vm });
                },

                /**
                 * Range-aware fetch for table rows.
                 * - Caches by filters+sort (group key).
                 * - Stores items by absolute index.
                 * - Serves smaller page sizes from already-fetched larger ranges.
                 * - Fetches only missing indices for larger page sizes or new pages.
                 */
                fetchTable: async (force = false) => {
                    const { tableQuery, tableGroupCache, groupKeyOf, inFlight } = get();
                    const groupKey = groupKeyOf(tableQuery.sort, tableQuery.filters);
                    const now = Date.now();
                    const group = tableGroupCache[groupKey];

                    // Compute absolute indices for current page
                    const start = (tableQuery.page - 1) * tableQuery.pageSize;
                    const end = start + tableQuery.pageSize - 1;
                    const want: IndexRange = { start, end };

                    // Dedupe key per requested slice
                    const inflightKey = `tableGroup:${groupKey}:${start}-${end}`;
                    if (inFlight.has(inflightKey)) return;

                    const isStale = !group || (now - (group?.fetchedAt ?? 0) >= DEFAULT_TABLE_TTL_MS);

                    // Fast path: fully covered and not stale → assemble immediately
                    if (!force && !isStale && group && isRangeCovered(group.coveredRanges, want)) {
                        get().assembleTableVMFromGroup();
                        return;
                    }

                    // Determine uncovered ranges considering TTL/force
                    const uncovered: IndexRange[] =
                        force || isStale || !group
                            ? [want]
                            : subtractCovered(group.coveredRanges, want);

                    if (uncovered.length === 0) {
                        // Covered after subtraction → assemble
                        get().assembleTableVMFromGroup();
                        return;
                    }

                    set((s) => ({
                        tableLoading: true,
                        tableError: null,
                        inFlight: new Set([...s.inFlight, inflightKey]),
                    }));

                    try {
                        // Fetch minimal slices to cover uncovered ranges
                        const fetchedSlices: {
                            range: IndexRange;
                            items: ArticleCommentSummaryRowDTO[];
                            meta: ArticleCommentSummaryListResponseDTO['meta'];
                        }[] = [];

                        for (const u of uncovered) {
                            const rangeSize = u.end - u.start + 1;

                            // Virtual page based on requested range
                            const page = Math.floor(u.start / rangeSize) + 1;
                            const pageSize = rangeSize;

                            const { data } = await api.get<ArticleCommentSummaryListResponseDTO>(
                                `${ROOT_DIRECTORY}/articles`,
                                {
                                    params: {
                                        page,
                                        pageSize,
                                        sortKey: tableQuery.sort.key,
                                        sortDir: tableQuery.sort.direction,
                                        ...tableQuery.filters,
                                    },
                                }
                            );

                            fetchedSlices.push({ range: u, items: data.data, meta: data.meta });
                        }

                        set((s) => {
                            const prev = s.tableGroupCache[groupKey];
                            const itemsByIndex = { ...(prev?.itemsByIndex ?? {}) };
                            let latestMeta = prev?.meta;

                            // Place fetched items into absolute indices
                            for (const slice of fetchedSlices) {
                                let idx = slice.range.start;
                                for (const item of slice.items) {
                                    itemsByIndex[idx++] = item;
                                }
                                latestMeta = slice.meta; // track last meta; typically identical across slices
                            }

                            const nextRanges = mergeRanges([...(prev?.coveredRanges ?? []), want]);

                            const nextMeta =
                                latestMeta ?? {
                                    pagination: {
                                        page: tableQuery.page,
                                        pageSize: tableQuery.pageSize,
                                        totalItems: prev?.meta.pagination.totalItems ?? 0,
                                        totalPages: prev?.meta.pagination.totalPages ?? 1,
                                    },
                                    sort: tableQuery.sort,
                                    filtersApplied: tableQuery.filters,
                                };

                            const nextGroup: TableGroupCacheEntry = {
                                itemsByIndex,
                                coveredRanges: nextRanges,
                                meta: nextMeta,
                                fetchedAt: Date.now(),
                            };

                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);

                            return {
                                tableGroupCache: { ...s.tableGroupCache, [groupKey]: nextGroup },
                                tableLoading: false,
                                inFlight: nextInFlight,
                            };
                        });

                        get().assembleTableVMFromGroup();
                    } catch (err) {
                        const apiErr = toApiError(err);
                        set((s) => {
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return { tableError: apiErr, tableLoading: false, inFlight: nextInFlight };
                        });
                    }
                },


                /**
                 * Toggle a row’s accordion open/closed state.
                 */
                toggleAccordion: (articleId, open) => {
                    const prev = get().rowAccordionState[articleId] ?? { isOpen: false };
                    const nextOpen = open ?? !prev.isOpen;
                    set((s) => ({
                        rowAccordionState: { ...s.rowAccordionState, [articleId]: { isOpen: nextOpen } },
                    }));
                },

                /* ------------------------------- Threads ------------------------------ */

                threadKeyOf: (articleId, parentId) => `${articleId}:${parentId ?? 'root'}`,

                /**
                 * Fetch root-level comments for an article into cache with TTL.
                 */
                fetchRootComments: async ({ articleId, pageSize = 100, sort, filters, force }) => {
                    const threadKey = get().threadKeyOf(articleId, null);
                    const cache = get().threadCache[threadKey];
                    const now = Date.now();
                    if (!force && cache && now - cache.fetchedAt < DEFAULT_THREAD_TTL_MS) return;

                    const inflightKey = `thread:${threadKey}`;
                    if (get().inFlight.has(inflightKey)) return;

                    set((s) => ({
                        threadLoading: { ...s.threadLoading, [threadKey]: true },
                        threadError: { ...s.threadError, [threadKey]: null },
                        inFlight: new Set([...s.inFlight, inflightKey]),
                    }));

                    try {
                        const { data } = await api.get<CommentThreadSegmentDTO>(
                            `${ROOT_DIRECTORY}/${articleId}/root`,
                            {
                                params: {
                                    pageSize,
                                    sortKey: sort?.key ?? 'createdAt',
                                    sortDir: sort?.direction ?? 'desc',
                                    ...(filters ?? {}),
                                },
                            }
                        );

                        const entry: ThreadCacheEntry = {
                            nodes: data.nodes.map((n) => ({
                                id: n.id,
                                articleId: n.articleId,
                                parentId: n.parentId ?? null,
                                author: n.author,
                                content: n.content,
                                likes: n.likes,
                                status: n.status,
                                replyCount: n.replyCount,
                                createdAt: n.createdAt,
                                updatedAt: n.updatedAt,
                            })),
                            meta: data.meta,
                            fetchedAt: now,
                        };

                        set((s) => {
                            const nextCache = { ...s.threadCache, [threadKey]: entry };
                            const nextLoading = { ...s.threadLoading, [threadKey]: false };
                            const nextError = { ...s.threadError, [threadKey]: null };
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return {
                                threadCache: nextCache,
                                threadLoading: nextLoading,
                                threadError: nextError,
                                inFlight: nextInFlight,
                            };
                        });

                        get().assembleTableVMFromGroup();
                    } catch (err) {
                        const apiErr = toApiError(err);
                        set((s) => {
                            const nextLoading = { ...s.threadLoading, [threadKey]: false };
                            const nextError = { ...s.threadError, [threadKey]: apiErr };
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return { threadLoading: nextLoading, threadError: nextError, inFlight: nextInFlight };
                        });
                    }
                },

                /**
                 * Fetch children of a specific parent comment (nested replies).
                 */
                fetchChildComments: async ({ articleId, parentId, pageSize = 100, sort, filters, force }) => {
                    const threadKey = get().threadKeyOf(articleId, parentId);
                    const cache = get().threadCache[threadKey];
                    const now = Date.now();
                    if (!force && cache && now - cache.fetchedAt < DEFAULT_THREAD_TTL_MS) return;

                    const inflightKey = `thread:${threadKey}`;
                    if (get().inFlight.has(inflightKey)) return;

                    set((s) => ({
                        threadLoading: { ...s.threadLoading, [threadKey]: true },
                        threadError: { ...s.threadError, [threadKey]: null },
                        inFlight: new Set([...s.inFlight, inflightKey]),
                    }));

                    try {
                        const { data } = await api.get<CommentThreadSegmentDTO>(
                            `${ROOT_DIRECTORY}/${articleId}/children/${parentId}`,
                            {
                                params: {
                                    pageSize,
                                    sortKey: sort?.key ?? 'createdAt',
                                    sortDir: sort?.direction ?? 'asc',
                                    ...(filters ?? {}),
                                },
                            }
                        );

                        const entry: ThreadCacheEntry = {
                            nodes: data.nodes.map((n) => ({
                                id: n.id,
                                articleId: n.articleId,
                                parentId: n.parentId ?? parentId,
                                author: n.author,
                                content: n.content,
                                likes: n.likes,
                                status: n.status,
                                replyCount: n.replyCount,
                                createdAt: n.createdAt,
                                updatedAt: n.updatedAt,
                            })),
                            meta: data.meta,
                            fetchedAt: now,
                        };

                        set((s) => {
                            const nextCache = { ...s.threadCache, [threadKey]: entry };
                            const nextLoading = { ...s.threadLoading, [threadKey]: false };
                            const nextError = { ...s.threadError, [threadKey]: null };
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return {
                                threadCache: nextCache,
                                threadLoading: nextLoading,
                                threadError: nextError,
                                inFlight: nextInFlight,
                            };
                        });
                    } catch (err) {
                        const apiErr = toApiError(err);
                        set((s) => {
                            const nextLoading = { ...s.threadLoading, [threadKey]: false };
                            const nextError = { ...s.threadError, [threadKey]: apiErr };
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return { threadLoading: nextLoading, threadError: nextError, inFlight: nextInFlight };
                        });
                    }
                },

                /**
                 * Load the next segment of comments for a thread using cursor-based pagination.
                 * Merges while deduplicating by comment id.
                 */
                loadMoreComments: async (req) => {
                    const threadKey = get().threadKeyOf(req.articleId, req.parentId ?? null);
                    const inflightKey = `thread:more:${threadKey}:${req.cursor ?? 'start'}`;
                    if (get().inFlight.has(inflightKey)) return;

                    set((s) => ({
                        threadLoading: { ...s.threadLoading, [threadKey]: true },
                        inFlight: new Set([...s.inFlight, inflightKey]),
                    }));

                    try {
                        const { data } = await api.get<LoadMoreCommentsResponseDTO>(
                            `${ROOT_DIRECTORY}/${req.articleId}/segment`,
                            { params: req }
                        );

                        set((s) => {
                            const existing = s.threadCache[threadKey];
                            const incoming = data.nodes.map((n) => ({
                                id: n.id,
                                articleId: n.articleId,
                                parentId: n.parentId ?? (req.parentId ?? null),
                                author: n.author,
                                content: n.content,
                                likes: n.likes,
                                status: n.status,
                                replyCount: n.replyCount,
                                createdAt: n.createdAt,
                                updatedAt: n.updatedAt,
                            }));

                            // Deduplicate by id when merging (preserve existing order, then append new)
                            const seen = new Set<string>();
                            const mergedNodes = [...(existing?.nodes ?? []), ...incoming].filter((n) => {
                                if (seen.has(n.id)) return false;
                                seen.add(n.id);
                                return true;
                            });

                            const nextEntry: ThreadCacheEntry = {
                                nodes: mergedNodes,
                                meta: data.meta,
                                fetchedAt: Date.now(),
                            };

                            const nextCache = { ...s.threadCache, [threadKey]: nextEntry };
                            const nextLoading = { ...s.threadLoading, [threadKey]: false };
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);

                            return { threadCache: nextCache, threadLoading: nextLoading, inFlight: nextInFlight };
                        });

                        get().assembleTableVMFromGroup();
                    } catch (err) {
                        const apiErr = toApiError(err);
                        set((s) => {
                            const nextLoading = { ...s.threadLoading, [threadKey]: false };
                            const nextError = { ...s.threadError, [threadKey]: apiErr };
                            const nextInFlight = new Set(s.inFlight);
                            nextInFlight.delete(inflightKey);
                            return { threadLoading: nextLoading, threadError: nextError, inFlight: nextInFlight };
                        });
                    }
                },

                /* ---------------------------- Mutations ------------------------------- */

                /**
                 * Create a reply (or root comment if parentId is null).
                 * Inserts the created node at the beginning of the relevant thread.
                 */
                createReply: async (payload) => {
                    const { data } = await api.post<CreateCommentResponseDTO>(`${ROOT_DIRECTORY}/reply`, payload);
                    const threadKey = get().threadKeyOf(payload.articleId, payload.parentId ?? null);

                    set((s) => {
                        const entry = s.threadCache[threadKey];
                        const nextNodes = [data.data, ...(entry?.nodes ?? [])];
                        const nextEntry: ThreadCacheEntry =
                            entry
                                ? { ...entry, nodes: nextNodes, fetchedAt: Date.now() }
                                : {
                                    nodes: nextNodes,
                                    meta: {
                                        pagination: {
                                            cursor: null,
                                            nextCursor: null,
                                            pageSize: 100,
                                            hasNextPage: true,
                                        },
                                        sort: { key: 'createdAt', direction: 'desc' },
                                        filtersApplied: {},
                                        scope: { articleId: payload.articleId, parentId: payload.parentId ?? null },
                                    },
                                    fetchedAt: Date.now(),
                                };
                        return { threadCache: { ...s.threadCache, [threadKey]: nextEntry } };
                    });

                    // Table counts might be stale; mark group TTL expired to revalidate on next fetch
                    const groupKey = get().groupKeyOf(get().tableQuery.sort, get().tableQuery.filters);
                    const group = get().tableGroupCache[groupKey];
                    if (group) {
                        set((s) => ({
                            tableGroupCache: {
                                ...s.tableGroupCache,
                                [groupKey]: { ...group, fetchedAt: 0 },
                            },
                        }));
                    }

                    return data.data;
                },

                /**
                 * Toggle like with optimistic updates. Applies across all cached threads containing the comment.
                 */
                toggleLike: async (payload) => {
                    // Optimistic update across all threads containing the comment
                    set((s) => {
                        const nextCache = { ...s.threadCache };
                        for (const [tKey, entry] of Object.entries(nextCache)) {
                            const idx = entry.nodes.findIndex((n) => n.id === payload.commentId);
                            if (idx >= 0) {
                                const delta = payload.like ? 1 : -1;
                                entry.nodes[idx] = {
                                    ...entry.nodes[idx],
                                    likes: Math.max(0, entry.nodes[idx].likes + delta),
                                };
                                nextCache[tKey] = entry;
                            }
                        }
                        return { threadCache: nextCache };
                    });

                    try {
                        const { data } = await api.post<ToggleLikeResponseDTO>(`${ROOT_DIRECTORY}/like`, payload);
                        // Reconcile server likes count
                        set((s) => {
                            const nextCache = { ...s.threadCache };
                            for (const [tKey, entry] of Object.entries(nextCache)) {
                                const idx = entry.nodes.findIndex((n) => n.id === payload.commentId);
                                if (idx >= 0) {
                                    entry.nodes[idx] = { ...entry.nodes[idx], likes: data.data.likes };
                                    nextCache[tKey] = entry;
                                }
                            }
                            return { threadCache: nextCache };
                        });
                    } catch (err) {
                        const apiErr = toApiError(err);
                        // Rollback
                        set((s) => {
                            const nextCache = { ...s.threadCache };
                            for (const [tKey, entry] of Object.entries(nextCache)) {
                                const idx = entry.nodes.findIndex((n) => n.id === payload.commentId);
                                if (idx >= 0) {
                                    const delta = payload.like ? -1 : 1;
                                    entry.nodes[idx] = {
                                        ...entry.nodes[idx],
                                        likes: Math.max(0, entry.nodes[idx].likes + delta),
                                    };
                                    nextCache[tKey] = entry;
                                }
                            }
                            return { threadCache: nextCache };
                        });
                        throw apiErr;
                    }
                },

                /**
                 * Update moderation status with optimistic update and server reconciliation.
                 */
                updateStatus: async (payload) => {
                    // Capture previous statuses per thread key for accurate rollback
                    const prevStatuses: Record<string, COMMENT_STATUS> = {};

                    // Optimistic: set status to payload.status, remembering previous
                    set((s) => {
                        const nextCache = { ...s.threadCache };
                        for (const [tKey, entry] of Object.entries(nextCache)) {
                            const idx = entry.nodes.findIndex((n) => n.id === payload.commentId);
                            if (idx >= 0) {
                                prevStatuses[tKey] = entry.nodes[idx].status;
                                entry.nodes[idx] = { ...entry.nodes[idx], status: payload.status };
                                nextCache[tKey] = entry;
                            }
                        }
                        return { threadCache: nextCache };
                    });

                    try {
                        const { data } = await api.post<UpdateCommentStatusResponseDTO>(
                            `${ROOT_DIRECTORY}/status`,
                            payload
                        );
                        // Reconcile replaced node from server
                        set((s) => {
                            const nextCache = { ...s.threadCache };
                            for (const [tKey, entry] of Object.entries(nextCache)) {
                                const idx = entry.nodes.findIndex((n) => n.id === payload.commentId);
                                if (idx >= 0) {
                                    entry.nodes[idx] = data.data;
                                    nextCache[tKey] = entry;
                                }
                            }
                            return { threadCache: nextCache };
                        });

                        // Table counts might have changed; mark table group stale to revalidate
                        const groupKey = get().groupKeyOf(get().tableQuery.sort, get().tableQuery.filters);
                        const group = get().tableGroupCache[groupKey];
                        if (group) {
                            set((s) => ({
                                tableGroupCache: {
                                    ...s.tableGroupCache,
                                    [groupKey]: { ...group, fetchedAt: 0 },
                                },
                            }));
                        }
                    } catch (err) {
                        const apiErr = toApiError(err);
                        // Rollback to exact previous status per thread entry
                        set((s) => {
                            const nextCache = { ...s.threadCache };
                            for (const [tKey, entry] of Object.entries(nextCache)) {
                                const idx = entry.nodes.findIndex((n) => n.id === payload.commentId);
                                if (idx >= 0 && prevStatuses[tKey]) {
                                    entry.nodes[idx] = { ...entry.nodes[idx], status: prevStatuses[tKey] };
                                    nextCache[tKey] = entry;
                                }
                            }
                            return { threadCache: nextCache };
                        });
                        throw apiErr;
                    }
                },

                /* ----------------------------- Selectors ------------------------------ */

                selectRowVMByArticleId: (articleId) => {
                    return get().tableVM.find((r) => r.id === articleId);
                },

                selectThreadByKey: (key) => {
                    return get().threadCache[key];
                },
            }),
            {
                name: 'articles-comments-store',
                version: 2, // bump version due to structural changes (added tableGroupCache)
                storage: createJSONStorage(() =>
                    typeof window !== 'undefined'
                        ? localStorage
                        : {
                            // Safe no-op storage for server-side (prevents SSR warnings)
                            getItem: () => null,
                            setItem: () => { },
                            removeItem: () => { },
                        }
                ),
                // Persist only the table query (filters/sort/page/pageSize).
                partialize: (state) => ({
                    tableQuery: state.tableQuery,
                }),
            }
        )
    )
);
