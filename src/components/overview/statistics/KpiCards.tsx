'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Star, Image, AlertTriangle, DollarSign, UserCheck, Calendar } from 'lucide-react';
import { KpiSkeleton } from './skeletons/KpiSkeleton';
import { KpiMetrics } from '@/types/statistics.types';
import { formatCurrency, formatNumber } from '@/utils/helpers/format';
import CountUp from 'react-countup';

interface KpiCardsProps {
  data: KpiMetrics | null;
  loading: boolean;
}

const kpiConfig = [
  {
    key: 'totalUsers' as keyof KpiMetrics,
    label: 'Total Users',
    icon: Users,
    formatter: formatNumber,
    color: 'from-blue-500 to-blue-600',
  },
  {
    key: 'totalTours' as keyof KpiMetrics,
    label: 'Total Tours',
    icon: MapPin,
    formatter: formatNumber,
    color: 'from-green-500 to-green-600',
  },
  {
    key: 'totalBookings' as keyof KpiMetrics,
    label: 'Total Bookings',
    icon: Calendar,
    formatter: formatNumber,
    color: 'from-purple-500 to-purple-600',
  },
  {
    key: 'avgRating' as keyof KpiMetrics,
    label: 'Avg Rating',
    icon: Star,
    formatter: (value: number) => value.toFixed(1),
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    key: 'totalImages' as keyof KpiMetrics,
    label: 'Total Images',
    icon: Image,
    formatter: (value: number) => formatNumber(value, true),
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    key: 'openReports' as keyof KpiMetrics,
    label: 'Open Reports',
    icon: AlertTriangle,
    formatter: formatNumber,
    color: 'from-red-500 to-red-600',
  },
  {
    key: 'totalRevenue' as keyof KpiMetrics,
    label: 'Total Revenue',
    icon: DollarSign,
    formatter: (value: number) => formatCurrency(value, true),
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    key: 'activeEmployees' as keyof KpiMetrics,
    label: 'Active Employees',
    icon: UserCheck,
    formatter: formatNumber,
    color: 'from-cyan-500 to-cyan-600',
  },
];

export function KpiCards({ data, loading }: KpiCardsProps) {
  if (loading || !data) {
    return <KpiSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiConfig.map((config, index) => {
        const Icon = config.icon;
        const value = data[config.key];

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{
              y: -2,
              transition: { duration: 0.2 }
            }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {config.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  <CountUp
                    end={Number(value)}
                    duration={1.2}
                    separator=","
                    decimals={config.key === 'avgRating' ? 1 : 0}
                    prefix={config.key === 'totalRevenue' ? '$' : ''}
                  />
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${config.color} text-white`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}