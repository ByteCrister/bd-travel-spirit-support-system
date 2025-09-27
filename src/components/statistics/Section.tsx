'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExportMenu } from './exports/ExportMenu';
import { ChartSkeleton } from './skeletons/ChartSkeleton';
import { TableSkeleton } from './skeletons/TableSkeleton';
import { ChatStats, EmployeesStats, ImagesStats, NotificationsStats, ReportsStats, ReviewsStats, ToursStats, UsersStats } from '@/types/statistics.types';

interface SectionProps {
    title: string;
    description?: string;
    loading: boolean;
    error: string | null;
    data: UsersStats | ToursStats | ReviewsStats | ReportsStats | ImagesStats | NotificationsStats | ChatStats | EmployeesStats | null;
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
    className = "",
}: SectionProps) {
    const sectionId = title.toLowerCase().replace(/\s+/g, '-');

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
            id={sectionId}
            aria-labelledby={`${sectionId}-heading`}
        >
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2
                            id={`${sectionId}-heading`}
                            className="text-xl font-semibold text-gray-900 dark:text-white"
                        >
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <ExportMenu
                            data={data}
                            section={sectionId}
                            disabled={loading || !!error || !data}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="sr-only">Refresh {title}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Section Content */}
            <div className="p-6">
                {error ? (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onClearError();
                                    onRefresh();
                                }}
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : loading ? (
                    <div className="space-y-8">
                        <ChartSkeleton height={300} />
                        <TableSkeleton rows={5} columns={4} />
                    </div>
                ) : data ? (
                    <div className="space-y-8">
                        {children}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>No data available</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="mt-2"
                        >
                            Load Data
                        </Button>
                    </div>
                )}
            </div>
        </motion.section>
    );
}