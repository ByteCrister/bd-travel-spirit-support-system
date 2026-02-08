// app/api/article/comments/_lib/mock.ts
import { faker } from '@faker-js/faker';
import {
    type ArticlePreviewDTO,
    type ArticleCommentMetricsDTO,
    type ArticleCommentSummaryRowDTO,
    type UserPreviewDTO,
    type CommentTreeNodeDTO,
    type CommentSortKey,
    type SortDTO,
    type ArticleSortKey,
    type CommentFiltersDTO,
    type ArticleFiltersDTO,
    type CursorPageMetaDTO,
    type OffsetPageMetaDTO,
    type CommentAdminStatsDTO,
} from '@/types/article/article-comment.types';
import { USER_ROLE } from '@/constants/user.const';
import { COMMENT_STATUS } from '@/constants/articleComment.const';

// --- Mock dataset sizes (tune for realism) ---
const ARTICLE_COUNT = 35;
const ROOT_COMMENTS_PER_ARTICLE = { min: 8, max: 60 };
const CHILDREN_PER_COMMENT = { min: 0, max: 10 };

// --- Helpers ---
const iso = (d: Date) => d.toISOString();
const randomStatus = (): COMMENT_STATUS =>
    faker.helpers.arrayElement([
        COMMENT_STATUS.PENDING,
        COMMENT_STATUS.APPROVED,
        COMMENT_STATUS.REJECTED,
    ]);
const randomRole = (): USER_ROLE =>
    faker.helpers.arrayElement([
        USER_ROLE.ADMIN,
        USER_ROLE.ASSISTANT,
        USER_ROLE.GUIDE,
        USER_ROLE.SUPPORT,
        USER_ROLE.TRAVELER,
    ]);

// --- Mock users ---
const mockUser = (): UserPreviewDTO => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    role: randomRole(),
});

// --- Articles ---
const articles: ArticlePreviewDTO[] = Array.from({ length: ARTICLE_COUNT }).map(() => {
    const createdAt = faker.date.past();
    const updatedAt = faker.date.recent();
    const title = faker.lorem.sentence({ min: 3, max: 8 });
    const slug = faker.helpers.slugify(title.toLowerCase());
    return {
        id: faker.string.uuid(),
        title,
        slug,
        coverImageUrl: faker.image.urlPicsumPhotos(),
        createdAt: iso(createdAt),
        updatedAt: iso(updatedAt),
        author: mockUser(),
    };
});

// --- Comments (root + some children) ---
type CommentRecord = CommentTreeNodeDTO;

const byArticleId: Record<string, { root: CommentRecord[]; children: Record<string, CommentRecord[]> }> =
    {};

for (const article of articles) {
    const rootCount = faker.number.int({ min: ROOT_COMMENTS_PER_ARTICLE.min, max: ROOT_COMMENTS_PER_ARTICLE.max });
    const root: CommentRecord[] = Array.from({ length: rootCount }).map(() => {
        const createdAt = faker.date.recent({ days: 40 });
        const updatedAt = faker.date.recent({ days: 10 });
        const hasChildren = faker.datatype.boolean();
        const replyCount = hasChildren ? faker.number.int({ min: 1, max: CHILDREN_PER_COMMENT.max }) : 0;
        return {
            id: faker.string.uuid(),
            articleId: article.id,
            parentId: null,
            author: mockUser(),
            content: faker.lorem.paragraph({ min: 1, max: 4 }),
            likes: faker.number.int({ min: 0, max: 300 }),
            status: randomStatus(),
            replyCount,
            createdAt: iso(createdAt),
            updatedAt: iso(updatedAt),
            children: undefined, // lazy
        };
    });

    const children: Record<string, CommentRecord[]> = {};
    for (const rc of root) {
        const childCount = faker.number.int({ min: CHILDREN_PER_COMMENT.min, max: rc.replyCount });
        if (childCount > 0) {
            children[rc.id] = Array.from({ length: childCount }).map(() => {
                const createdAt = faker.date.recent({ days: 20 });
                const updatedAt = faker.date.recent({ days: 10 });
                return {
                    id: faker.string.uuid(),
                    articleId: article.id,
                    parentId: rc.id,
                    author: mockUser(),
                    content: faker.lorem.paragraph({ min: 1, max: 3 }),
                    likes: faker.number.int({ min: 0, max: 80 }),
                    status: randomStatus(),
                    replyCount: 0,
                    createdAt: iso(createdAt),
                    updatedAt: iso(updatedAt),
                    children: undefined,
                };
            });
        }
    }

    byArticleId[article.id] = { root, children };
}

// --- Metrics computed from dataset ---
const computeMetrics = (articleId: string): ArticleCommentMetricsDTO => {
    const { root, children } = byArticleId[articleId];
    const all = [...root, ...Object.values(children).flat()];
    const pending = all.filter((c) => c.status === COMMENT_STATUS.PENDING).length;
    const approved = all.filter((c) => c.status === COMMENT_STATUS.APPROVED).length;
    const rejected = all.filter((c) => c.status === COMMENT_STATUS.REJECTED).length;
    const latest = all.length ? all.map((c) => c.createdAt).sort().at(-1) ?? null : null;
    return {
        totalComments: all.length,
        pendingComments: pending,
        approvedComments: approved,
        rejectedComments: rejected,
        latestCommentAt: latest,
    };
};

// --- Sorting helpers ---
const sortArticles = (rows: ArticleCommentSummaryRowDTO[], sort: SortDTO<ArticleSortKey>) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const cmp = (a: ArticleCommentSummaryRowDTO, b: ArticleCommentSummaryRowDTO) => {
        switch (sort.key) {
            case 'title':
                return a.article.title.localeCompare(b.article.title) * dir;
            case 'createdAt':
                return (new Date(a.article.createdAt).getTime() - new Date(b.article.createdAt).getTime()) * dir;
            case 'updatedAt':
                return (new Date(a.article.updatedAt).getTime() - new Date(b.article.updatedAt).getTime()) * dir;
            case 'totalComments':
                return (a.metrics.totalComments - b.metrics.totalComments) * dir;
            case 'pendingComments':
                return (a.metrics.pendingComments - b.metrics.pendingComments) * dir;
            default:
                return 0;
        }
    };
    rows.sort(cmp);
};

const sortComments = (nodes: CommentTreeNodeDTO[], sort: SortDTO<CommentSortKey>) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const cmp = (a: CommentTreeNodeDTO, b: CommentTreeNodeDTO) => {
        switch (sort.key) {
            case 'createdAt':
                return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
            case 'updatedAt':
                return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
            case 'likes':
                return (a.likes - b.likes) * dir;
            case 'status':
                return a.status.localeCompare(b.status) * dir;
            default:
                return 0;
        }
    };
    nodes.sort(cmp);
};

// --- Filter helpers ---
const filterArticleRows = (
    rows: ArticleCommentSummaryRowDTO[],
    filters: ArticleFiltersDTO
): ArticleCommentSummaryRowDTO[] => {
    let filtered = rows;
    if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter((r) => r.article.title.toLowerCase().includes(q) || r.article.slug.toLowerCase().includes(q));
    }
    if (filters.status && filters.status !== 'any') {
        filtered = filtered.filter((r) => {
            switch (filters.status) {
                case COMMENT_STATUS.APPROVED: return r.metrics.approvedComments > 0;
                case COMMENT_STATUS.PENDING: return r.metrics.pendingComments > 0;
                case COMMENT_STATUS.REJECTED: return r.metrics.rejectedComments > 0;
                default: return true;
            }
        });
    }
    if (filters.authorName) {
        filtered = filtered.filter((r) => r.article.author.id === filters.authorName);
    }
    if (filters.taggedRegion) {
        // since we don't have real regions, emulate with slug prefix match
        filtered = filtered.filter((r) => r.article.slug.startsWith(filters.taggedRegion!.toLowerCase()));
    }
    return filtered;
};

const filterComments = (nodes: CommentTreeNodeDTO[], filters: CommentFiltersDTO): CommentTreeNodeDTO[] => {
    let filtered = nodes;
    if (filters.status && filters.status !== 'any') {
        filtered = filtered.filter((n) => n.status === filters.status);
    }
    if (filters.minLikes != null) {
        filtered = filtered.filter((n) => n.likes >= (filters.minLikes ?? 0));
    }
    if (filters.hasReplies != null) {
        filtered = filtered.filter((n) => (filters.hasReplies ? n.replyCount > 0 : n.replyCount === 0));
    }
    if (filters.authorName) {
        filtered = filtered.filter((n) => n.author.id === filters.authorName);
    }
    if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter((n) => n.content.toLowerCase().includes(q));
    }
    return filtered;
};

// --- Pagination helpers ---
export const makeOffsetMeta = (page: number, pageSize: number, totalItems: number): OffsetPageMetaDTO => ({
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize))),
});

export const makeCursorSlice = (nodes: CommentTreeNodeDTO[], cursor: string | null | undefined, pageSize: number) => {
    // For simplicity: cursor is an index encoded as string; null means start (index 0)
    const start = cursor ? parseInt(cursor, 10) || 0 : 0;
    const end = Math.min(start + pageSize, nodes.length);
    const slice = nodes.slice(start, end);
    const nextCursor = end < nodes.length ? String(end) : null;
    const meta: CursorPageMetaDTO = {
        cursor: cursor ?? null,
        nextCursor,
        pageSize,
        hasNextPage: end < nodes.length,
    };
    return { slice, meta };
};

// --- Public builders ---
export const buildArticleSummaryRows = (): ArticleCommentSummaryRowDTO[] => {
    return articles.map((a) => ({ article: a, metrics: computeMetrics(a.id) }));
};

export const buildStats = (): CommentAdminStatsDTO => {
    const rows = buildArticleSummaryRows();
    const totals = rows.reduce(
        (acc, r) => {
            acc.totalComments += r.metrics.totalComments;
            acc.totalApproved += r.metrics.approvedComments;
            acc.totalPending += r.metrics.pendingComments;
            acc.totalRejected += r.metrics.rejectedComments;
            return acc;
        },
        { totalComments: 0, totalApproved: 0, totalPending: 0, totalRejected: 0 }
    );
    const uniqueCommenters = new Set<string>();
    for (const id of Object.keys(byArticleId)) {
        const { root, children } = byArticleId[id];
        [...root, ...Object.values(children).flat()].forEach((c) => uniqueCommenters.add(c.author.id));
    }

    const mostActive = rows
        .slice()
        .sort((a, b) => b.metrics.totalComments - a.metrics.totalComments)[0];

    return {
        totalComments: totals.totalComments,
        totalApproved: totals.totalApproved,
        totalPending: totals.totalPending,
        totalRejected: totals.totalRejected,
        uniqueCommenters: uniqueCommenters.size,
        avgRepliesPerComment:
            rows.length === 0
                ? 0
                : Number(
                    (
                        totals.totalComments > 0
                            ? Object.values(byArticleId)
                                .flatMap(({ root }) => root)
                                .reduce((acc, c) => acc + c.replyCount, 0) / totals.totalComments
                            : 0
                    ).toFixed(2)
                ),
        mostActiveArticle: mostActive
            ? {
                articleId: mostActive.article.id,
                title: mostActive.article.title,
                totalComments: mostActive.metrics.totalComments,
            }
            : null,
    };
};

// Query helpers
export const queryArticleSummary = (
    page: number,
    pageSize: number,
    sort: SortDTO<ArticleSortKey>,
    filters: ArticleFiltersDTO
) => {
    const rows = buildArticleSummaryRows();
    sortArticles(rows, sort);
    const filtered = filterArticleRows(rows, filters);
    const meta = makeOffsetMeta(page, pageSize, filtered.length);
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, filtered.length);
    return { data: filtered.slice(start, end), meta };
};

export const queryRootComments = (
    articleId: string,
    cursor: string | null | undefined,
    pageSize: number,
    sort: SortDTO<CommentSortKey>,
    filters: CommentFiltersDTO
) => {
    // If no data for this articleId, use the first available article
    if (!byArticleId[articleId]) {
        const availableIds = Object.keys(byArticleId);
        if (availableIds.length === 0) {
            // No articles generated at all, return empty
            return { nodes: [], meta: { cursor: null, nextCursor: null, pageSize, hasNextPage: false } };
        }
        articleId = availableIds[0]; // Use first article as fallback
    }

    const all = byArticleId[articleId].root ?? [];
    const filtered = filterComments(all, filters);
    sortComments(filtered, sort);
    const { slice, meta } = makeCursorSlice(filtered, cursor, pageSize);
    return { nodes: slice, meta };
};

export const queryChildComments = (
    articleId: string,
    parentId: string,
    cursor: string | null | undefined,
    pageSize: number,
    sort: SortDTO<CommentSortKey>,
    filters: CommentFiltersDTO
) => {
    // First, try to get children for the requested parentId
    let all = byArticleId[articleId]?.children[parentId] ?? [];
    
    // If no children found for this parentId, find some children from this article
    if (all.length === 0) {
        // Fallback 1: Try to find ANY children in this article
        const articleData = byArticleId[articleId];
        if (articleData) {
            // Get all children from all parent comments
            const allChildren = Object.values(articleData.children).flat();
            if (allChildren.length > 0) {
                all = allChildren.slice(0, Math.min(pageSize, allChildren.length));
            } else {
                // Fallback 2: Generate mock children on the fly
                all = generateMockChildren(articleId, parentId, pageSize);
            }
        } else {
            // Fallback 3: Article doesn't exist, generate mock children
            all = generateMockChildren(articleId, parentId, pageSize);
        }
    }
    
    const filtered = filterComments(all, filters);
    sortComments(filtered, sort);
    const { slice, meta } = makeCursorSlice(filtered, cursor, pageSize);
    return { nodes: slice, meta };
};

// Add this helper function to generate mock children on demand
const generateMockChildren = (
    articleId: string, 
    parentId: string, 
    count: number
): CommentTreeNodeDTO[] => {
    return Array.from({ length: count }).map(() => {
        const createdAt = faker.date.recent({ days: 20 });
        const updatedAt = faker.date.recent({ days: 10 });
        return {
            id: faker.string.uuid(),
            articleId,
            parentId,
            author: mockUser(),
            content: faker.lorem.paragraph({ min: 1, max: 3 }),
            likes: faker.number.int({ min: 0, max: 80 }),
            status: randomStatus(),
            replyCount: 0,
            createdAt: iso(createdAt),
            updatedAt: iso(updatedAt),
            children: undefined,
        };
    });
};