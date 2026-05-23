'use client';

import { motion } from 'framer-motion';
import { ARTICLE_STATUS, ArticleStatus } from '@/constants/article.const';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';

const NEU_BADGE_SUCCESS =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_BADGE_WARNING =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_BADGE =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';

const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';

// ── Status badge map ──────────────────────────────────────────
const STATUS_BADGE: Record<ArticleStatus, string> = {
    [ARTICLE_STATUS.PUBLISHED]: NEU_BADGE_SUCCESS,
    [ARTICLE_STATUS.DRAFT]: NEU_BADGE,
    [ARTICLE_STATUS.ARCHIVED]: NEU_BADGE_WARNING,
};

const STATUS_LABEL: Record<ArticleStatus, string> = {
    [ARTICLE_STATUS.PUBLISHED]: 'Published',
    [ARTICLE_STATUS.DRAFT]: 'Draft',
    [ARTICLE_STATUS.ARCHIVED]: 'Archived',
};

// ── Pulse dot colours ─────────────────────────────────────────
const STATUS_DOT: Record<ArticleStatus, string> = {
    [ARTICLE_STATUS.PUBLISHED]: 'bg-[#00A63D]',
    [ARTICLE_STATUS.DRAFT]: 'bg-[#1E2938]/40',
    [ARTICLE_STATUS.ARCHIVED]: 'bg-[#FE9900]',
};

type Props = {
    title: string;
    status: ArticleStatus;
    updatedAt: string;
    commentCount?: number;
    pendingCommentCount?: number;
    headerPulse?: boolean;
    onView?: () => void;
    onDelete?: () => void;
};

export function HeaderBar({
    title,
    status,
    updatedAt,
    commentCount,
    pendingCommentCount,
    headerPulse,
}: Props) {
    return (
        <motion.div
            className={`${NEU_CARD} px-6 py-5`}
            animate={headerPulse ? { scale: 1.008 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Title + status */}
                <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className={`${NEU_HEADING} text-xl sm:text-2xl truncate`}>
                            {title}
                        </h1>

                        {/* Status badge with animated dot */}
                        <span className={STATUS_BADGE[status] ?? NEU_BADGE}>
                            <span className="relative flex h-2 w-2">
                                <span
                                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${STATUS_DOT[status]}`}
                                />
                                <span
                                    className={`relative inline-flex h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
                                />
                            </span>
                            {STATUS_LABEL[status]}
                        </span>
                    </div>

                    {/* Meta row */}
                    <div className={`${NEU_MUTED} flex flex-wrap items-center gap-x-4 gap-y-1`}>
                        <span>
                            Updated{' '}
                            {new Date(updatedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>

                        {typeof commentCount === 'number' && (
                            <>
                                <span className="hidden sm:inline text-[#1E2938]/20">•</span>
                                <span>Comments: {commentCount}</span>
                            </>
                        )}

                        {typeof pendingCommentCount === 'number' && (
                            <>
                                <span className="hidden sm:inline text-[#1E2938]/20">•</span>
                                <span>Pending: {pendingCommentCount}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}