'use client';

import { memo, useState, useEffect } from 'react';
import { CommentItem } from './CommentItem';
import { ThreadFilterBar } from './ThreadFilterBar'; // Add this import
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticleCommentsStore } from '@/store/article-comment.store';
import { CommentFiltersDTO } from '@/types/article-comment.types';

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

    // Add state for filters
    const [filters, setFilters] = useState<CommentFiltersDTO>({});

    // Fetch comments when filters change
    useEffect(() => {
        if (cache?.meta?.filtersApplied &&
            JSON.stringify(cache.meta.filtersApplied) !== JSON.stringify(filters)) {
            fetchRootComments({
                articleId,
                pageSize: 10,
                filters,
                force: true
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, articleId]);

    // Initialize filters from cache on mount
    useEffect(() => {
        if (cache?.meta?.filtersApplied && !Object.keys(filters).length) {
            setFilters(cache.meta.filtersApplied);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache]);

    const handleFilterChange = (newFilters: CommentFiltersDTO) => {
        setFilters(newFilters);
    };

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Failed to load comments</AlertTitle>
                <AlertDescription>
                    {error.message}
                    <div className="mt-2">
                        <Button
                            size="sm"
                            onClick={() =>
                                fetchRootComments({ articleId, force: true, pageSize: 10, filters })
                            }
                        >
                            Retry
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    if (loading && !cache) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    const nodes = cache?.nodes ?? [];
    const nextCursor = cache?.meta.pagination.nextCursor;
    const hasNext = cache?.meta.pagination.hasNextPage;

    return (
        <div className="space-y-3">
            {/* Add filter bar */}
            <ThreadFilterBar
                articleId={articleId}
                parentId={null}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
            />

            {/* Comment list */}
            <div className="space-y-3">
                {nodes.map((n) => (
                    <CommentItem
                        key={n.id}
                        node={n}
                        articleId={articleId}
                        filters={filters} // Pass filters down
                    />
                ))}
            </div>

            {hasNext && (
                <div className="pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            loadMoreComments({
                                articleId,
                                parentId: null,
                                cursor: nextCursor ?? null,
                                pageSize: 10,
                                ...filters, // Include filters in loadMore
                            })
                        }
                    >
                        Load more
                    </Button>
                </div>
            )}
        </div>
    );
});