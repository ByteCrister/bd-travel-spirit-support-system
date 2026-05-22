'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { ExportMenu } from './exports/ExportMenu';
import { ChartSkeleton } from './skeletons/ChartSkeleton';
import { TableSkeleton } from './skeletons/TableSkeleton';
import {
    ChatStats, EmployeesStats, ImagesStats, NotificationsStats,
    ReportsStats, ReviewsStats, ToursStats, UsersStats,
} from '@/types/dashboard/statistics.types';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight text-xl';
const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 mt-0.5';
const NEU_BTN_ICON =
    'rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 ' +
    'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
    'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40';
const NEU_ERROR_BOX =
    'flex items-start gap-3 p-4 rounded-xl ' +
    'bg-[#FF2157]/5 shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
    'border border-[#FF2157]/20';
const NEU_BTN_DANGER =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#FF2157] ' +
    'font-[family-name:var(--font-space-mono)] ' +
    'bg-[#E7E5E4] shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] ' +
    'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
    'transition-all duration-150';
const NEU_EMPTY_BOX =
    'flex flex-col items-center gap-4 py-14 text-center';
const NEU_BTN_GHOST =
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E7E5E4] text-sm text-[#1E2938] ' +
    'font-[family-name:var(--font-space-mono)] ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40';

type SectionData =
    | UsersStats | ToursStats | ReviewsStats | ReportsStats
    | ImagesStats | NotificationsStats | ChatStats | EmployeesStats | null;

interface SectionProps {
    title: string;
    description?: string;
    loading: boolean;
    error: string | null;
    data: SectionData;
    onRefresh: () => void;
    onClearError: () => void;
    children: React.ReactNode;
    className?: string;
}

export function Section({
    title,
    description,
    loading,
    error,
    data,
    onRefresh,
    onClearError,
    children,
    className = '',
}: SectionProps) {
    const sectionId = title.toLowerCase().replace(/\s+/g, '-');

    return (
        <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`${NEU_CARD} ${className}`}
            id={sectionId}
            aria-labelledby={`${sectionId}-heading`}
        >
            {/* ── Header ── */}
            <div className="px-6 py-4 flex items-center justify-between gap-4 border-b border-[#c8c6c5]/40">
                <div className="min-w-0">
                    <h2 id={`${sectionId}-heading`} className={NEU_HEADING}>
                        {title}
                    </h2>
                    {description && <p className={NEU_MUTED}>{description}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <ExportMenu
                        data={data}
                        section={sectionId}
                        disabled={loading || !!error || !data}
                    />
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className={NEU_BTN_ICON}
                        aria-label={`Refresh ${title}`}
                    >
                        <RefreshCw
                            className={`h-4 w-4 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="p-6">
                {error ? (
                    <div className={NEU_ERROR_BOX} role="alert">
                        <AlertCircle className="h-5 w-5 text-[#FF2157] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]">
                                {error}
                            </p>
                        </div>
                        <button
                            onClick={() => { onClearError(); onRefresh(); }}
                            className={NEU_BTN_DANGER}
                        >
                            Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="space-y-8">
                        <ChartSkeleton height={300} />
                        <TableSkeleton rows={5} columns={4} />
                    </div>
                ) : data ? (
                    <div className="space-y-8">{children}</div>
                ) : (
                    <div className={NEU_EMPTY_BOX}>
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                            No data available
                        </p>
                        <button onClick={onRefresh} className={NEU_BTN_GHOST}>
                            Load Data
                        </button>
                    </div>
                )}
            </div>
        </motion.section>
    );
}