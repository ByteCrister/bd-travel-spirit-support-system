'use client';

import {
    HiCheckCircle,
    HiXCircle,
    HiHeart,
    HiUsers,
    HiChartBar,
} from 'react-icons/hi2';
import { HiBadgeCheck } from 'react-icons/hi';
import Link from 'next/link';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';

// ── Style constants ────────────────────────────────────────────
const S = {
    section: 'space-y-6',

    sectionTitle:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight text-2xl',
    sectionSub:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 mt-1',

    grid: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',

    card:
        'rounded-2xl bg-[#E7E5E4] ' +
        'shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] ' +
        'border border-white/60 p-5 ' +
        'hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] ' +
        'hover:-translate-y-0.5 transition-all duration-300',

    cardHeader: 'flex items-center justify-between mb-4',
    cardLabel:
        'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest',
    iconWell:
        'p-2.5 rounded-xl bg-[#E7E5E4] ' +
        'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]',

    cardValue:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-3xl tabular-nums',

    skeleton: 'rounded-lg bg-[#d0cecd] animate-pulse h-8 w-24',

    // most-active card
    activeCard:
        'rounded-2xl bg-[#006666]/5 ' +
        'shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] ' +
        'border border-[#006666]/20 p-5',
    activeCardHeader: 'flex items-center gap-3 mb-4',
    activeIconWell:
        'p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]',
    activeCardTitle:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-base',

    activeBadge:
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold ' +
        'bg-[#006666] text-white ' +
        'shadow-[3px_3px_6px_#004d4d,-2px_-2px_5px_#008080]',

    activeCount:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60',

    viewBtn:
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#006666] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    noData: 'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/40',
};

export function Stats() {
    const { stats, statsLoading } = useArticleCommentsStore();

    const StatCard = ({
        icon: Icon,
        label,
        value,
    }: {
        icon: React.ElementType;
        label: string;
        value: number | string;
    }) => (
        <div className={S.card}>
            <div className={S.cardHeader}>
                <span className={S.cardLabel}>{label}</span>
                <div className={S.iconWell}>
                    <Icon className="h-5 w-5 text-[#006666]" aria-hidden />
                </div>
            </div>
            {statsLoading ? (
                <div className={S.skeleton} />
            ) : (
                <span className={S.cardValue}>{value}</span>
            )}
        </div>
    );

    return (
        <div className={S.section}>
            <div>
                <h2 className={S.sectionTitle}>Comments Overview</h2>
                <p className={S.sectionSub}>
                    Real-time analytics and insights from your article comments
                </p>
            </div>

            <div className={S.grid}>
                <StatCard icon={HiChartBar} label="Total comments" value={stats?.totalComments ?? 0} />
                <StatCard icon={HiCheckCircle} label="Approved" value={stats?.totalApproved ?? 0} />
                <StatCard icon={HiXCircle} label="Rejected" value={stats?.totalRejected ?? 0} />
                <StatCard icon={HiBadgeCheck} label="Pending" value={stats?.totalPending ?? 0} />
                <StatCard icon={HiUsers} label="Unique commenters" value={stats?.uniqueCommenters ?? 0} />
                <StatCard icon={HiHeart} label="Avg replies / comment" value={stats?.avgRepliesPerComment ?? 0} />
            </div>

            {/* Most active article */}
            <div className={S.activeCard}>
                <div className={S.activeCardHeader}>
                    <div className={S.activeIconWell}>
                        <HiChartBar className="h-5 w-5 text-[#006666]" />
                    </div>
                    <span className={S.activeCardTitle}>Most active article</span>
                </div>

                {statsLoading ? (
                    <div className="h-10 w-64 rounded-lg bg-[#d0cecd] animate-pulse" />
                ) : stats?.mostActiveArticle ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <span className={S.activeBadge}>
                            {stats.mostActiveArticle.title}
                        </span>
                        <div className="flex items-center gap-4 flex-1 flex-wrap">
                            <span className={S.activeCount}>
                                {stats.mostActiveArticle.totalComments} comments
                            </span>
                            <Link
                                href={`/admin/articles/${stats.mostActiveArticle.articleId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={S.viewBtn}
                            >
                                View article
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <span className={S.noData}>No active article data</span>
                )}
            </div>
        </div>
    );
}