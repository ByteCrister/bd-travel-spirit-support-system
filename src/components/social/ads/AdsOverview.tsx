// components/ads/AdsOverview.tsx
'use client';

import React, { JSX, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  MdAnalytics, 
  MdTrendingUp, 
  MdPending, 
  MdVisibility, 
  MdRefresh,
  MdError
} from 'react-icons/md';
import { HiSparkles } from 'react-icons/hi';
import { TbClick } from 'react-icons/tb';
import useAdsStore from '@/store/ad.store';
import { showToast } from '@/components/global/showToast';
import { AdsSkeletons } from './AdsSkeletons';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/utils/helpers/ads-ui';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  })
};

const iconVariants: Variants = {
  hover: {
    scale: 1.1,
    rotate: [0, -5, 5, -5, 0],
    transition: { duration: 0.4 }
  }
};

const errorVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  gradient: string;
  iconBg: string;
  index: number;
  trend?: 'up' | 'down' | null;
}

function StatCard({ icon: Icon, label, value, subValue, gradient, iconBg, index, trend }: StatCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group">
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient}`} />
        
        {/* Content */}
        <div className="relative p-5">
          <div className="flex items-start justify-between mb-3">
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className={`p-3 rounded-xl ${iconBg} shadow-sm group-hover:shadow-md transition-all duration-300`}
            >
              <Icon className="w-5 h-5 text-white" />
            </motion.div>
            
            {trend && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trend === 'up' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {trend === 'up' ? '↑' : '↓'}
              </motion.div>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                className="text-2xl font-bold text-slate-900 dark:text-white"
              >
                {value}
              </motion.p>
              {subValue && (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {subValue}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className={`h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
      </Card>
    </motion.div>
  );
}

export function AdsOverview(): JSX.Element {
  const { overview, overviewMeta, fetchOverview } = useAdsStore();

  useEffect(() => {
    if (overviewMeta.error) {
      showToast.error(overviewMeta.error);
    }
  }, [overviewMeta.error]);

  if (overviewMeta.loading) {
    return <AdsSkeletons.OverviewSkeleton />;
  }

  if (overviewMeta.error && !overview) {
    return (
      <motion.div
        variants={errorVariants}
        initial="hidden"
        animate="visible"
        className="my-2"
      >
        <div role="alert" className="relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-rose-500/10 dark:from-red-500/20 dark:to-rose-500/20" />
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-red-200 dark:border-red-800 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <MdError className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Failed to Load Overview
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {overviewMeta.error}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  fetchOverview().catch((e) => showToast.error(String(e?.message ?? 'Retry failed')));
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <MdRefresh className="w-4 h-4" />
                Retry
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const stats = [
    {
      icon: MdAnalytics,
      label: 'Total Advertisements',
      value: formatNumber(overview?.totalAds ?? 0),
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    },
    {
      icon: MdTrendingUp,
      label: 'Active Campaigns',
      value: formatNumber(overview?.activeAds ?? 0),
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      trend: 'up' as const,
    },
    {
      icon: MdPending,
      label: 'Pending Approval',
      value: formatNumber(overview?.pendingAds ?? 0),
      gradient: 'from-amber-500 to-yellow-500',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-500',
    },
    {
      icon: MdVisibility,
      label: 'Total Impressions',
      value: formatNumber(overview?.impressionsTotal ?? 0),
      gradient: 'from-sky-500 to-blue-500',
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500',
    },
    {
      icon: TbClick,
      label: 'Clicks & CTR',
      value: formatNumber(overview?.clicksTotal ?? 0),
      subValue: overview?.averageCTR ? `${overview.averageCTR.toFixed(2)}%` : '—',
      gradient: 'from-violet-500 to-purple-500',
      iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header with sparkle icon */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <HiSparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Overview Statistics
        </h2>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            {...stat}
            index={index}
          />
        ))}
      </div>

      {/* Additional Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Draft</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatNumber(overview?.draftAds ?? 0)}
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Paused</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatNumber(overview?.pausedAds ?? 0)}
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expired</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatNumber(overview?.expiredAds ?? 0)}
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Rejected</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {formatNumber(overview?.rejectedAds ?? 0)}
          </p>
        </div>
      </motion.div>
    </div>
  );
}