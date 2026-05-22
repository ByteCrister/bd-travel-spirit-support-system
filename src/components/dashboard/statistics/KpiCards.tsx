'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Star, Image, AlertTriangle, UserCheck, Calendar } from 'lucide-react';
import { KpiSkeleton } from './skeletons/KpiSkeleton';
import { KpiMetrics } from '@/types/dashboard/statistics.types';
import { formatCurrency, formatNumber } from '@/utils/helpers/format';
import CountUp from 'react-countup';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 ' +
  'hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 ' +
  'transition-all duration-300 p-5';
const NEU_LABEL =
  'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_VALUE =
  'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-2xl tracking-tight leading-none';
const NEU_ICON_WELL =
  'w-11 h-11 flex items-center justify-center rounded-xl shrink-0 ' +
  'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]';

// Per-KPI icon background colors (soft tints on the neumorphic surface)
const KPI_COLORS: Record<string, string> = {
  totalUsers: 'bg-[#006666]/10 text-[#006666]',
  totalTours: 'bg-[#00A63D]/10 text-[#00A63D]',
  totalBookings: 'bg-[#4f46e5]/10 text-[#4f46e5]',
  avgRating: 'bg-[#FE9900]/10 text-[#FE9900]',
  totalImages: 'bg-[#0891b2]/10 text-[#0891b2]',
  openReports: 'bg-[#FF2157]/10 text-[#FF2157]',
  totalRevenue: 'bg-[#00A63D]/10 text-[#00A63D]',
  activeEmployees: 'bg-[#006666]/10 text-[#006666]',
};

const kpiConfig = [
  {
    key: 'totalUsers' as keyof KpiMetrics,
    label: 'Total Users',
    icon: Users,
    formatter: formatNumber,
  },
  {
    key: 'totalTours' as keyof KpiMetrics,
    label: 'Total Tours',
    icon: MapPin,
    formatter: formatNumber,
  },
  {
    key: 'totalBookings' as keyof KpiMetrics,
    label: 'Total Bookings',
    icon: Calendar,
    formatter: formatNumber,
  },
  {
    key: 'avgRating' as keyof KpiMetrics,
    label: 'Avg Rating',
    icon: Star,
    formatter: (v: number) => v.toFixed(1),
  },
  {
    key: 'totalImages' as keyof KpiMetrics,
    label: 'Total Images',
    icon: Image,
    formatter: (v: number) => formatNumber(v, true),
  },
  {
    key: 'openReports' as keyof KpiMetrics,
    label: 'Open Reports',
    icon: AlertTriangle,
    formatter: formatNumber,
  },
  {
    key: 'totalRevenue' as keyof KpiMetrics,
    label: 'Total Revenue',
    icon: FaBangladeshiTakaSign,
    formatter: (v: number) => formatCurrency(v, true),
  },
  {
    key: 'activeEmployees' as keyof KpiMetrics,
    label: 'Active Employees',
    icon: UserCheck,
    formatter: formatNumber,
  },
];

interface KpiCardsProps {
  data: KpiMetrics | null;
  loading: boolean;
}

export function KpiCards({ data, loading }: KpiCardsProps) {
  if (loading || !data) return <KpiSkeleton />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiConfig.map((config, index) => {
        const Icon = config.icon;
        const value = data[config.key];
        const colorClasses = KPI_COLORS[config.key] ?? 'bg-[#006666]/10 text-[#006666]';

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }}
            className={NEU_CARD}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Text block */}
              <div className="flex flex-col gap-2 min-w-0">
                <p className={NEU_LABEL}>{config.label}</p>
                <p className={NEU_VALUE}>
                  <CountUp
                    end={Number(value)}
                    duration={1.2}
                    separator=","
                    decimals={config.key === 'avgRating' ? 1 : 0}
                  />
                </p>
              </div>

              {/* Icon well */}
              <div className={`${NEU_ICON_WELL} ${colorClasses}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}