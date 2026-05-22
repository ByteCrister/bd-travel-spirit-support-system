'use client';

import { memo, useState } from 'react';
import { CommentDetailDTO, CommentFiltersDTO } from '@/types/article/article-comment.types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    HiArrowUturnLeft,
    HiCheckCircle,
    HiXCircle,
    HiChevronDown,
    HiEllipsisHorizontal,
    HiArrowPath,
} from 'react-icons/hi2';
import { HiTrash } from 'react-icons/hi';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ReplyEditor } from './ReplyEditor';
import { ModerationReasonDialog } from './ModerationReasonDialog';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { COMMENT_STATUS } from '@/constants/articleComment.const';

// ── Style constants ────────────────────────────────────────────
const S = {
    card:
        'group rounded-2xl bg-[#E7E5E4] border border-white/60 p-4 ' +
        'shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] ' +
        'hover:shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] ' +
        'hover:-translate-y-0.5 transition-all duration-200',

    layout: 'flex items-start gap-3',

    // avatar
    avatarFallback:
        'h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center ' +
        'bg-[#006666]/10 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]',
    avatarInitial:
        'font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#006666]',
    avatarImg: 'rounded-xl ring-2 ring-white/60 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]',

    // header
    header: 'flex items-center gap-2 flex-wrap mb-2',
    authorName: 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm',
    roleBadge:
        'inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
        'bg-[#E7E5E4] text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',
    timestamp:
        'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40',

    // status badges
    badgeApproved:
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
        'bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',
    badgeRejected:
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
        'bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',
    badgePending:
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
        'bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]',

    // content
    content:
        'mb-3 font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/80 ' +
        'leading-relaxed whitespace-pre-wrap break-words',

    // action bar
    actions: 'flex flex-wrap items-center gap-2',

    btnApprove:
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#00A63D] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:bg-[#00A63D]/10 hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    btnReject:
        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    btnGhost:
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] text-[#1E2938]/60 ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    btnIcon:
        'h-8 w-8 rounded-xl flex items-center justify-center ' +
        'bg-[#E7E5E4] text-[#1E2938]/50 ' +
        'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    // reply section
    replyDivider: 'mt-4 pt-4 border-t border-[#1E2938]/10',

    // skeleton / loading
    loadingWrap: 'mt-4 space-y-3 pl-4 border-l-2 border-[#1E2938]/10',
    skeletonAvatar: 'h-8 w-8 rounded-xl bg-[#d0cecd] animate-pulse flex-shrink-0',
    skeletonLine: 'rounded-lg bg-[#d0cecd] animate-pulse',

    // children thread
    childrenWrap: 'mt-4 space-y-3 pl-4 border-l-2 border-[#006666]/20',

    loadMoreBtn:
        'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#006666] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200',
};

const STATUS_BADGE: Record<string, string> = {
    [COMMENT_STATUS.APPROVED]: S.badgeApproved,
    [COMMENT_STATUS.REJECTED]: S.badgeRejected,
    [COMMENT_STATUS.PENDING]: S.badgePending,
};
const STATUS_LABEL: Record<string, string> = {
    [COMMENT_STATUS.APPROVED]: 'Approved',
    [COMMENT_STATUS.REJECTED]: 'Rejected',
    [COMMENT_STATUS.PENDING]: 'Pending',
};

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
        updateStatus,
        createReply,
        deleteComment,
        restoreComment,
        loadMoreComments,
        threadLoading,
    } = useArticleCommentsStore();

    const [replyOpen, setReplyOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [toggleShow, setToggleShow] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const threadKeyChildren = threadKeyOf(articleId, node.id);
    const childCache = selectThreadByKey(threadKeyChildren);
    const childLoading = threadLoading[threadKeyChildren];
    const isPending = node.status === COMMENT_STATUS.PENDING;

    const handleToggleShow = async () => {
        if (toggleShow) { setToggleShow(false); return; }
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
                className={S.card}
            >
                <div className={S.layout}>
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {node.author.avatarUrl ? (
                            <Image
                                src={node.author.avatarUrl}
                                alt={node.author.name}
                                width={40}
                                height={40}
                                className={S.avatarImg}
                            />
                        ) : (
                            <div className={S.avatarFallback}>
                                <span className={S.avatarInitial}>
                                    {node.author.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className={S.header}>
                            <span className={S.authorName}>{node.author.name}</span>
                            <span className={S.roleBadge}>{node.author.role}</span>
                            <span className={STATUS_BADGE[node.status] ?? S.badgePending}>
                                {STATUS_LABEL[node.status] ?? 'Unknown'}
                            </span>
                            <span className={S.timestamp}>
                                {new Date(node.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Content */}
                        <p className={S.content}>{node.content}</p>

                        {/* Actions */}
                        <div className={S.actions}>
                            {isPending && (
                                <>
                                    <button
                                        onClick={async () =>
                                            await updateStatus({ commentId: node.id, status: COMMENT_STATUS.APPROVED })
                                        }
                                        className={S.btnApprove}
                                    >
                                        <HiCheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => setRejectDialogOpen(true)}
                                        className={S.btnReject}
                                    >
                                        <HiXCircle className="h-4 w-4" />
                                        Reject
                                    </button>
                                </>
                            )}

                            <button onClick={() => setReplyOpen(!replyOpen)} className={S.btnGhost}>
                                <HiArrowUturnLeft className="h-4 w-4" />
                                Reply
                            </button>

                            {node.replyCount > 0 && (
                                <button
                                    onClick={handleToggleShow}
                                    aria-expanded={!!toggleShow}
                                    className={S.btnGhost}
                                >
                                    <HiChevronDown
                                        className={`h-4 w-4 transition-transform duration-200 ${toggleShow ? 'rotate-180' : ''}`}
                                    />
                                    <span className="text-xs">
                                        {toggleShow ? 'Hide' : 'Show'} replies ({node.replyCount})
                                    </span>
                                </button>
                            )}

                            {/* More menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className={S.btnIcon} aria-label="More options">
                                        <HiEllipsisHorizontal className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => alert(JSON.stringify(node, null, 2))}
                                        className="text-sm cursor-pointer"
                                    >
                                        View JSON
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            if (confirm(`Delete comment by ${node.author.name}?`)) {
                                                try { await deleteComment({ commentId: node.id }); }
                                                catch (e) { console.error('Failed to delete comment:', e); }
                                            }
                                        }}
                                        className="text-sm cursor-pointer text-[#FF2157]"
                                    >
                                        <HiTrash className="h-4 w-4 mr-2" />
                                        Delete Comment
                                    </DropdownMenuItem>
                                    {node.status === COMMENT_STATUS.REJECTED && (
                                        <DropdownMenuItem
                                            onClick={async () => {
                                                if (confirm(`Restore comment by ${node.author.name}?`)) {
                                                    try { await restoreComment({ commentId: node.id }); }
                                                    catch (e) { console.error('Failed to restore comment:', e); }
                                                }
                                            }}
                                            className="text-sm cursor-pointer text-[#00A63D]"
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
                                className={S.replyDivider}
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

                        {/* Child loading skeletons */}
                        {childLoading && (
                            <div className={S.loadingWrap}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className={S.skeletonAvatar} />
                                        <div className="flex-1 space-y-2">
                                            <div className={`${S.skeletonLine} h-4 w-24`} />
                                            <div className={`${S.skeletonLine} h-3 w-full`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Children thread */}
                        {toggleShow && childCache?.nodes?.length ? (
                            <div className={S.childrenWrap}>
                                {childCache.nodes.map((child) => (
                                    <CommentItem key={child.id} node={child} articleId={articleId} />
                                ))}
                                {childCache?.meta.pagination.hasNextPage && (
                                    <button
                                        className={S.loadMoreBtn}
                                        disabled={loadingMore}
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
                                    >
                                        {loadingMore ? 'Loading…' : 'Load more replies'}
                                    </button>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </motion.div>

            <ModerationReasonDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                commentId={node.id}
            />
        </>
    );
});