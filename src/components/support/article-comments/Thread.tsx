'use client';

import { memo, useState, useEffect } from 'react';
import { CommentItem } from './CommentItem';
import { ThreadFilterBar } from './ThreadFilterBar';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { CommentFiltersDTO } from '@/types/article/article-comment.types';

// ── Style constants ────────────────────────────────────────────
const S = {
    root: 'space-y-3',

    // error box
    errorBox:
        'rounded-2xl bg-[#E7E5E4] border border-white/60 p-5 ' +
        'shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]',
    errorTitle:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] text-sm mb-1',
    errorBody:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60',
    retryBtn:
        'mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    // skeletons
    skeletonWrap: 'space-y-3',
    skeletonCard:
        'rounded-2xl p-4 bg-[#E7E5E4] border border-white/60 ' +
        'shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]',
    skeletonAvatar: 'h-10 w-10 rounded-xl flex-shrink-0 bg-[#d0cecd] animate-pulse',
    skeletonLine: 'rounded-lg bg-[#d0cecd] animate-pulse',

    commentList: 'space-y-3',

    loadMoreBtn:
        'mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#006666] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'transition-all duration-200',
};

export const Thread = memo(function Thread({ articleId }: { articleId: string }) {
    const {
        threadKeyOf,
        fetchRootComments,
        selectThreadByKey,
        loadMoreComments,
        threadLoading,
        threadError,
    } = useArticleCommentsStore();

    const threadKey = threadKeyOf(articleId, null);
    const cache = selectThreadByKey(threadKey);
    const loading = threadLoading[threadKey];
    const error = threadError[threadKey];

    const [filters, setFilters] = useState<CommentFiltersDTO>({});

    useEffect(() => {
        if (
            cache?.meta?.filtersApplied &&
            JSON.stringify(cache.meta.filtersApplied) !== JSON.stringify(filters)
        ) {
            fetchRootComments({ articleId, pageSize: 10, filters, force: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, articleId]);

    useEffect(() => {
        if (cache?.meta?.filtersApplied && !Object.keys(filters).length) {
            setFilters(cache.meta.filtersApplied);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache]);

    if (error) {
        return (
            <div className={S.errorBox}>
                <p className={S.errorTitle}>Failed to load comments</p>
                <p className={S.errorBody}>{error.message}</p>
                <button
                    className={S.retryBtn}
                    onClick={() => fetchRootComments({ articleId, force: true, pageSize: 10, filters })}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (loading && !cache) {
        return (
            <div className={S.skeletonWrap}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={S.skeletonCard}>
                        <div className="flex gap-3">
                            <div className={S.skeletonAvatar} />
                            <div className="flex-1 space-y-2">
                                <div className={`${S.skeletonLine} h-4 w-32`} />
                                <div className={`${S.skeletonLine} h-3 w-full`} />
                                <div className={`${S.skeletonLine} h-3 w-3/4`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const nodes = cache?.nodes ?? [];
    const nextCursor = cache?.meta.pagination.nextCursor;
    const hasNext = cache?.meta.pagination.hasNextPage;

    return (
        <div className={S.root}>
            <ThreadFilterBar
                articleId={articleId}
                parentId={null}
                onFilterChange={setFilters}
                currentFilters={filters}
            />

            <div className={S.commentList}>
                {nodes.map((n) => (
                    <CommentItem key={n.id} node={n} articleId={articleId} filters={filters} />
                ))}
            </div>

            {hasNext && (
                <div className="pt-2">
                    <button
                        className={S.loadMoreBtn}
                        onClick={() =>
                            loadMoreComments({
                                articleId,
                                parentId: null,
                                cursor: nextCursor ?? null,
                                pageSize: 10,
                                ...filters,
                            })
                        }
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
});