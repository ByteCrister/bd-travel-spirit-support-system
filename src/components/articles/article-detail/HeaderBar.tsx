'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ARTICLE_STATUS } from '@/constants/article.const';

type Props = {
    title: string;
    status: ARTICLE_STATUS;
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
    const statusVariant =
        status === ARTICLE_STATUS.PUBLISHED
            ? 'default'
            : status === ARTICLE_STATUS.DRAFT
                ? 'secondary'
                : 'outline';

    return (
        <motion.div
            className="flex items-center justify-between rounded-md border border-border bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-6 py-4 shadow-sm"
            animate={headerPulse ? { scale: 1.01 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        >
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        {title}
                    </h1>
                    <Badge
                        variant={statusVariant}
                        className="uppercase tracking-wide text-xs px-2 py-0.5"
                    >
                        {status}
                    </Badge>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-3">
                    <span>Updated {new Date(updatedAt).toLocaleString()}</span>
                    {typeof commentCount === 'number' && (
                        <span>• Comments: {commentCount}</span>
                    )}
                    {typeof pendingCommentCount === 'number' && (
                        <span>• Pending: {pendingCommentCount}</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
