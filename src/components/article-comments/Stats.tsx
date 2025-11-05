'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    HiCheckCircle,
    HiXCircle,
    HiHeart,
    HiUsers,
    HiChartBar,
    HiArrowTrendingUp,
    HiArrowTrendingDown,
} from 'react-icons/hi2';
import { HiBadgeCheck } from 'react-icons/hi';
import Link from 'next/link';
import { useArticleCommentsStore } from '@/store/useArticleCommentsStore';

export function Stats() {
    const { stats, statsLoading } = useArticleCommentsStore();

    const StatCard = ({
        icon: Icon,
        label,
        value,
        trend,
        tooltip,
    }: {
        icon: React.ElementType;
        label: string;
        value: number | string;
        trend?: 'up' | 'down';
        tooltip?: string;
    }) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 dark:from-slate-900 dark:to-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 dark:to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">{label}</CardTitle>
                            <div className="p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg backdrop-blur-sm">
                                <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" aria-hidden />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            {statsLoading ? (
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-bold tabular-nums bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                                        {value}
                                    </span>
                                    {trend && (
                                        <span
                                            aria-label={trend === 'up' ? 'Trending up' : 'Trending down'}
                                            className={`p-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}
                                        >
                                            {trend === 'up' ? (
                                                <HiArrowTrendingUp className="h-4 w-4" />
                                            ) : (
                                                <HiArrowTrendingDown className="h-4 w-4" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                {tooltip && (
                    <TooltipContent className="text-xs font-medium">
                        {tooltip}
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Comments Overview
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Real-time analytics and insights from your article comments
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    icon={HiChartBar}
                    label="Total comments"
                    value={stats?.totalComments ?? 0}
                    tooltip="All comments across articles"
                />
                <StatCard
                    icon={HiCheckCircle}
                    label="Approved"
                    value={stats?.totalApproved ?? 0}
                    tooltip="Approved comments"
                />
                <StatCard
                    icon={HiXCircle}
                    label="Rejected"
                    value={stats?.totalRejected ?? 0}
                    tooltip="Rejected comments"
                />
                <StatCard
                    icon={HiBadgeCheck}
                    label="Pending"
                    value={stats?.totalPending ?? 0}
                    tooltip="Pending moderation"
                />
                <StatCard
                    icon={HiUsers}
                    label="Unique commenters"
                    value={stats?.uniqueCommenters ?? 0}
                    tooltip="Distinct users who commented"
                />
                <StatCard
                    icon={HiHeart}
                    label="Avg replies per comment"
                    value={stats?.avgRepliesPerComment ?? 0}
                    tooltip="Average reply count per comment"
                />
            </div>

            <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-indigo-500/5 dark:from-blue-400/10 dark:to-indigo-400/10" />
                <CardHeader className="relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                            <HiChartBar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                            Most active article
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
                    {statsLoading ? (
                        <Skeleton className="h-10 w-full sm:w-64 rounded-lg" />
                    ) : stats?.mostActiveArticle ? (
                        <>
                            <Badge
                                variant="secondary"
                                className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 font-medium px-4 py-2 rounded-lg text-sm"
                                aria-label="Most active article"
                            >
                                {stats.mostActiveArticle.title}
                            </Badge>
                            <div className="flex items-center gap-4 flex-1">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {stats.mostActiveArticle.totalComments}
                                    <span className="ml-1">comments</span>
                                </span>
                                <Link
                                    href={`/admin/articles/${stats.mostActiveArticle.articleId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200 border border-blue-200 dark:border-blue-800"
                                >
                                    View article
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </Link>
                            </div>
                        </>
                    ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">No active article data</span>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}