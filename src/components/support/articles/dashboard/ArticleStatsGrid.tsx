// components/article/ArticleStatsGrid.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleDashboardStats } from '@/types/article/article.types';
import { HiDocumentText, HiEye, HiHeart, HiShare, HiClock, HiCheckCircle, HiDocumentDuplicate, HiArchiveBox } from 'react-icons/hi2';

type Props = {
    stats?: ArticleDashboardStats;
    isLoading: boolean;
};

const statIcons = {
    total: HiDocumentText,
    published: HiCheckCircle,
    drafts: HiDocumentDuplicate,
    archived: HiArchiveBox,
    views: HiEye,
    likes: HiHeart,
    shares: HiShare,
    time: HiClock,
};

const statColors = {
    total: 'from-blue-500 to-cyan-500',
    published: 'from-green-500 to-emerald-500',
    drafts: 'from-amber-500 to-orange-500',
    archived: 'from-slate-500 to-gray-500',
    views: 'from-purple-500 to-pink-500',
    likes: 'from-rose-500 to-red-500',
    shares: 'from-indigo-500 to-blue-500',
    time: 'from-teal-500 to-cyan-500',
};

type StatCardProps = {
    label: string;
    value: number | undefined;
    icon: React.ElementType;
    gradient: string;
    index: number;
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, gradient, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-16 -mt-16`} />
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
                    <motion.div
                        className={`p-2 bg-gradient-to-br ${gradient} rounded-lg shadow-md`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <Icon className="w-4 h-4 text-white" />
                    </motion.div>
                </div>
            </CardHeader>
            <CardContent>
                {value === undefined ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <motion.div
                        className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        {value.toLocaleString()}
                    </motion.div>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

export default function ArticleStatsGrid({ stats, isLoading }: Props) {
    const summary = stats?.summary;

    if (isLoading && !summary) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="border-0 shadow-lg">
                        <CardHeader>
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const statsData = [
        { label: "Total Articles", value: summary?.totalArticles, icon: statIcons.total, gradient: statColors.total },
        { label: "Published", value: summary?.publishedCount, icon: statIcons.published, gradient: statColors.published },
        { label: "Drafts", value: summary?.draftCount, icon: statIcons.drafts, gradient: statColors.drafts },
        { label: "Archived", value: summary?.archivedCount, icon: statIcons.archived, gradient: statColors.archived },
        { label: "Total Views", value: summary?.totalViews, icon: statIcons.views, gradient: statColors.views },
        { label: "Total Likes", value: summary?.totalLikes, icon: statIcons.likes, gradient: statColors.likes },
        { label: "Total Shares", value: summary?.totalShares, icon: statIcons.shares, gradient: statColors.shares },
        { label: "Avg Reading Time", value: summary?.averageReadingTime, icon: statIcons.time, gradient: statColors.time },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {statsData.map((stat, index) => (
                <StatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    icon={stat.icon}
                    gradient={stat.gradient}
                    index={index}
                />
            ))}
        </div>
    );
}