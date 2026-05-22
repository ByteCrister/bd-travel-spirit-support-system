// components/article/ArticleStatsGrid.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArticleDashboardStats } from '@/types/article/article.types';
import {
    HiDocumentText,
    HiEye,
    HiHeart,
    HiShare,
    HiClock,
    HiCheckCircle,
    HiDocumentDuplicate,
    HiArchiveBox,
} from 'react-icons/hi2';

// ── Style tokens ──────────────────────────────────────────────
const S = {
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5',
    card:
        'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-5 flex flex-col gap-4 hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300',
    iconWell:
        'w-10 h-10 rounded-xl flex items-center justify-center shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] flex-shrink-0',
    label:
        'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest',
    value:
        'font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938] text-2xl xl:text-3xl',
    skeleton:
        'rounded-lg bg-[#d0cecd] animate-pulse',
    skeletonCard:
        'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-5 flex flex-col gap-4',
} as const;

// Icon background colours (soft tints on the neu surface)
const iconBg: Record<string, string> = {
    total: 'bg-[#006666]/10 text-[#006666]',
    published: 'bg-[#00A63D]/10 text-[#00A63D]',
    drafts: 'bg-[#FE9900]/10 text-[#FE9900]',
    archived: 'bg-[#1E2938]/10 text-[#1E2938]/60',
    views: 'bg-[#006666]/10 text-[#006666]',
    likes: 'bg-[#FF2157]/10 text-[#FF2157]',
    shares: 'bg-[#006666]/15 text-[#006666]',
    time: 'bg-[#FE9900]/10 text-[#FE9900]',
};

type Props = {
    stats?: ArticleDashboardStats;
    isLoading: boolean;
};

type StatCardProps = {
    label: string;
    value: number | undefined;
    icon: React.ElementType;
    colorKey: string;
    index: number;
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, colorKey, index }) => (
    <motion.div
        className={S.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
    >
        <div className="flex items-center justify-between">
            <span className={S.label}>{label}</span>
            <div className={`${S.iconWell} ${iconBg[colorKey]}`}>
                <Icon className="w-4 h-4" />
            </div>
        </div>

        {value === undefined ? (
            <div className="space-y-1.5">
                <div className={`${S.skeleton} h-8 w-20`} />
            </div>
        ) : (
            <motion.span
                className={S.value}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: index * 0.05 + 0.1 }}
            >
                {value.toLocaleString()}
            </motion.span>
        )}
    </motion.div>
);

export default function ArticleStatsGrid({ stats, isLoading }: Props) {
    const summary = stats?.summary;

    if (isLoading && !summary) {
        return (
            <div className={S.grid}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={S.skeletonCard}>
                        <div className="flex items-center justify-between">
                            <div className={`${S.skeleton} h-3 w-24`} />
                            <div className={`${S.skeleton} w-10 h-10 rounded-xl`} />
                        </div>
                        <div className={`${S.skeleton} h-8 w-20`} />
                    </div>
                ))}
            </div>
        );
    }

    const statsData = [
        { label: 'Total Articles', value: summary?.totalArticles, icon: HiDocumentText, colorKey: 'total' },
        { label: 'Published', value: summary?.publishedCount, icon: HiCheckCircle, colorKey: 'published' },
        { label: 'Drafts', value: summary?.draftCount, icon: HiDocumentDuplicate, colorKey: 'drafts' },
        { label: 'Archived', value: summary?.archivedCount, icon: HiArchiveBox, colorKey: 'archived' },
        { label: 'Total Views', value: summary?.totalViews, icon: HiEye, colorKey: 'views' },
        { label: 'Total Likes', value: summary?.totalLikes, icon: HiHeart, colorKey: 'likes' },
        { label: 'Total Shares', value: summary?.totalShares, icon: HiShare, colorKey: 'shares' },
        { label: 'Avg Reading Time', value: summary?.averageReadingTime, icon: HiClock, colorKey: 'time' },
    ];

    return (
        <div className={S.grid}>
            {statsData.map((stat, index) => (
                <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    colorKey={stat.colorKey}
                    index={index}
                />
            ))}
        </div>
    );
}