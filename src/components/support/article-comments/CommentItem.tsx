'use client';

import { memo, useState } from 'react';
import { CommentDetailDTO, CommentFiltersDTO } from '@/types/article-comment.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HiHeart, HiArrowUturnLeft, HiCheckCircle, HiXCircle, HiChevronDown, HiEllipsisHorizontal, HiArrowPath } from 'react-icons/hi2';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReplyEditor } from './ReplyEditor';
import { ModerationReasonDialog } from './ModerationReasonDialog';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { COMMENT_STATUS } from '@/constants/articleComment.const';
import { HiTrash } from 'react-icons/hi';

export const CommentItem = memo(function CommentItem({
    node,
    articleId,
    filters = {},
}: {
    node: CommentDetailDTO;
    articleId: string;
    filters?: CommentFiltersDTO;
}) {
    const {
        threadKeyOf,
        selectThreadByKey,
        fetchChildComments,
        toggleLike,
        updateStatus,
        createReply,
        deleteComment,
        restoreComment,
        loadMoreComments,
        threadLoading
    } = useArticleCommentsStore();
    const [replyOpen, setReplyOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const threadKeyChildren = threadKeyOf(articleId, node.id);
    const childCache = selectThreadByKey(threadKeyChildren);
    const childLoading = threadLoading[threadKeyChildren];
    const [loadingMore, setLoadingMore] = useState(false);

    const [toggleShow, setToggleShow] = useState<boolean>(false);

    const statusConfig = {
        [COMMENT_STATUS.APPROVED]: {
            badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50',
            label: 'Approved',
            icon: '✓',
        },
        [COMMENT_STATUS.REJECTED]: {
            badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800/50',
            label: 'Rejected',
            icon: '✕',
        },
        [COMMENT_STATUS.PENDING]: {
            badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800/50',
            label: 'Pending',
            icon: '○',
        },
    };

    const currentStatus = statusConfig[node.status];
    const isPending = node.status === COMMENT_STATUS.PENDING;

    const handleToggleShow = async () => {
        if (toggleShow) {
            setToggleShow(false);
            return;
        }

        setToggleShow(true);

        if (!childCache) {
            await fetchChildComments({
                articleId,
                parentId: node.id,
                pageSize: 10,
                sort: { key: 'createdAt', direction: 'asc' },
            });
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0.95, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="group rounded-lg border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200"
            >
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {node.author.avatarUrl ? (
                            <Image
                                src={node.author.avatarUrl}
                                alt={node.author.name}
                                width={40}
                                height={40}
                                className="rounded-full ring-2 ring-slate-200 dark:ring-slate-800"
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 ring-2 ring-slate-200 dark:ring-slate-800 flex items-center justify-center">
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    {node.author.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Header with author info */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {node.author.name}
                            </span>
                            <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700">
                                {node.author.role}
                            </Badge>
                            <Badge className={`text-xs border font-medium ${currentStatus.badge}`}>
                                {currentStatus.label}
                            </Badge>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(node.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="mb-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                                {node.content}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Like button */}
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => await toggleLike({ commentId: node.id, like: true })}
                                className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 gap-1"
                                title="Like comment"
                            >
                                <HiHeart className="h-4 w-4" />
                                <span className="text-xs">{node.likes}</span>
                            </Button>

                            {/* Moderation buttons - only for pending */}
                            {isPending && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={async () =>
                                            await updateStatus({ commentId: node.id, status: COMMENT_STATUS.APPROVED })
                                        }
                                        className="flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 
                 text-sm font-medium text-white shadow-sm 
                 hover:bg-emerald-700 focus:outline-none 
                 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 
                 dark:bg-emerald-700 dark:hover:bg-emerald-800"
                                    >
                                        <HiCheckCircle className="h-4 w-4" />
                                        Approve
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => setRejectDialogOpen(true)}
                                        className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 
                 text-sm font-medium text-white shadow-sm 
                 hover:bg-red-700 focus:outline-none 
                 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 
                 dark:bg-red-700 dark:hover:bg-red-800"
                                    >
                                        <HiXCircle className="h-4 w-4" />
                                        Reject
                                    </Button>
                                </div>
                            )}


                            {/* Reply button */}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReplyOpen((o) => !o)}
                                className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1"
                            >
                                <HiArrowUturnLeft className="h-4 w-4" />
                                Reply
                            </Button>

                            {/* View replies button */}
                            {node.replyCount > 0 && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleToggleShow}
                                    className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1"
                                    aria-expanded={!!toggleShow}
                                >
                                    <HiChevronDown className={`h-4 w-4 transition-transform ${toggleShow ? 'rotate-180' : ''}`} />
                                    <span className="text-xs">
                                        {toggleShow ? 'Hide' : 'Show'} replies ({node.replyCount})
                                    </span>
                                </Button>
                            )}

                            {/* More menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <HiEllipsisHorizontal className="h-4 w-4" />
                                        <span className="sr-only">More options</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => alert(JSON.stringify(node, null, 2))}
                                        className="text-sm cursor-pointer"
                                    >
                                        View JSON
                                    </DropdownMenuItem>

                                    {/* Add Delete option */}
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            if (confirm(`Delete comment by ${node.author.name}?`)) {
                                                try {
                                                    await deleteComment({ commentId: node.id });
                                                    // You might want to add a toast notification here
                                                } catch (error) {
                                                    console.error('Failed to delete comment:', error);
                                                }
                                            }
                                        }}
                                        className="text-sm cursor-pointer text-red-600 dark:text-red-400"
                                    >
                                        <HiTrash className="h-4 w-4 mr-2" />
                                        Delete Comment
                                    </DropdownMenuItem>

                                    {/* Add Restore option (only show if comment is deleted) */}
                                    {node.status === COMMENT_STATUS.REJECTED && (
                                        <DropdownMenuItem
                                            onClick={async () => {
                                                if (confirm(`Restore comment by ${node.author.name}?`)) {
                                                    try {
                                                        await restoreComment({ commentId: node.id });
                                                        // You might want to add a toast notification here
                                                    } catch (error) {
                                                        console.error('Failed to restore comment:', error);
                                                    }
                                                }
                                            }}
                                            className="text-sm cursor-pointer text-green-600 dark:text-green-400"
                                        >
                                            <HiArrowPath className="h-4 w-4 mr-2" />
                                            Restore Comment
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Reply editor */}
                        {replyOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"
                            >
                                <ReplyEditor
                                    onSubmit={async (content) => {
                                        await createReply({ articleId, parentId: node.id, content });
                                        setReplyOpen(false);
                                    }}
                                    onCancel={() => setReplyOpen(false)}
                                />
                            </motion.div>
                        )}

                        {/* Children loading */}
                        {childLoading && (
                            <div className="mt-4 space-y-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Children list */}
                        {toggleShow && childCache?.nodes?.length ? (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-slate-300 dark:border-slate-700">
                                {childCache.nodes.map((child) => (
                                    <CommentItem key={child.id} node={child} articleId={articleId} />
                                ))}

                                {childCache?.meta.pagination.hasNextPage && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={async () => {
                                            setLoadingMore(true);
                                            await loadMoreComments({
                                                articleId,
                                                parentId: node.id,
                                                cursor: childCache.meta.pagination.nextCursor ?? null,
                                                pageSize: 10,
                                                ...filters,
                                            });
                                            setLoadingMore(false);
                                        }}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? 'Loading...' : 'Load more replies'}
                                    </Button>
                                )}
                            </div>
                        ) : null}

                    </div>
                </div>
            </motion.div>

            {/* Moderation reason dialog */}
            <ModerationReasonDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                commentId={node.id}
            />
        </>
    );
});