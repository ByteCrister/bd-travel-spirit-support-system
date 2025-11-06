'use client';

import { memo } from 'react';
import { CommentItem } from './CommentItem';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticleCommentsStore } from '@/store/article-comment.store';

export const Thread = memo(function Thread({ articleId }: { articleId: string }) {
    const store = useArticleCommentsStore();
    const threadKey = store.threadKeyOf(articleId, null);
    const cache = store.selectThreadByKey(threadKey);
    const loading = store.threadLoading[threadKey];
    const error = store.threadError[threadKey];

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
                                store.fetchRootComments({ articleId, force: true, pageSize: 100 })
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
            {nodes.map((n) => (
                <CommentItem key={n.id} node={n} articleId={articleId} />
            ))}

            {hasNext && (
                <div className="pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            store.loadMoreComments({
                                articleId,
                                parentId: null,
                                cursor: nextCursor ?? null,
                                pageSize: 100,
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
