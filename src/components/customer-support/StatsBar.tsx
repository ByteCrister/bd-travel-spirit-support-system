'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { motion, useSpring, MotionValue } from 'framer-motion';
import {
    FiMessageSquare,
    FiEye,
    FiCheckCircle,
    FiFlag,
    FiTrash2,
    FiFileText,
} from 'react-icons/fi';
import type { ChatMessageStats } from '@/types/chatMessage.types';
import { JSX } from 'react';

type Props = {
    stats?: ChatMessageStats;
    loading: boolean;
    error?: string;
    onRetry: () => void;
};

function Counter({ value }: { value: number }) {
    const spring: MotionValue<number> = useSpring(value, { stiffness: 120, damping: 15 });
    return <motion.span>{Math.round(spring.get())}</motion.span>;
}

export function StatsBar({ stats, loading, error, onRetry }: Props) {
    const items: { label: string; value: number; icon: JSX.Element; color: string }[] = [
        { label: 'Messages', value: stats?.totalMessages ?? 0, icon: <FiMessageSquare />, color: 'from-blue-500 to-cyan-500' },
        { label: 'Drafts', value: stats?.totalDrafts ?? 0, icon: <FiFileText />, color: 'from-amber-500 to-orange-500' },
        { label: 'Delivered', value: stats?.totalDelivered ?? 0, icon: <FiCheckCircle />, color: 'from-green-500 to-emerald-500' },
        { label: 'Read', value: stats?.totalRead ?? 0, icon: <FiEye />, color: 'from-purple-500 to-pink-500' },
        { label: 'Flagged', value: stats?.totalFlagged ?? 0, icon: <FiFlag />, color: 'from-red-500 to-rose-500' },
        { label: 'Removed', value: stats?.totalRemoved ?? 0, icon: <FiTrash2 />, color: 'from-gray-500 to-slate-500' },
        { label: 'Clean', value: stats?.totalClean ?? 0, icon: <FiCheckCircle />, color: 'from-teal-500 to-cyan-500' },
    ];

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 lg:p-6">
                {error && (
                    <div className="mb-4 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                        <span>Failed to fetch stats.</span>
                        <Button variant="ghost" size="sm" onClick={onRetry} className="ml-auto">
                            Retry
                        </Button>
                    </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                            <Card className="relative overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                                            <div className="text-lg">{item.icon}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                            {item.label}
                                        </div>
                                        {loading ? (
                                            <Skeleton className="h-7 w-16 bg-slate-200 dark:bg-slate-700" />
                                        ) : (
                                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                <Counter value={item.value} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} opacity-60`} />
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}