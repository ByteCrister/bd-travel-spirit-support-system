'use client';

// components/travelers/TravelerStats.tsx
import { motion, Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { TravelerListStats } from '@/types/user/traveler.types';
import { Users, UserCheck, UserX, Lock, ShieldCheck, ShieldOff } from 'lucide-react';

interface TravelerStatsProps {
    stats: TravelerListStats;
}

const statConfig = [
    {
        key: 'totalTravelers' as keyof TravelerListStats,
        title: 'Total Travelers',
        icon: Users,
        gradient: 'from-blue-50 to-blue-100/50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200/80',
        valueColor: 'text-blue-900',
        labelColor: 'text-blue-500/80',
    },
    {
        key: 'activeCount' as keyof TravelerListStats,
        title: 'Active',
        icon: UserCheck,
        gradient: 'from-emerald-50 to-emerald-100/50',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        borderColor: 'border-emerald-200/80',
        valueColor: 'text-emerald-900',
        labelColor: 'text-emerald-500/80',
    },
    {
        key: 'suspendedCount' as keyof TravelerListStats,
        title: 'Suspended',
        icon: UserX,
        gradient: 'from-red-50 to-red-100/50',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        borderColor: 'border-red-200/80',
        valueColor: 'text-red-900',
        labelColor: 'text-red-500/80',
    },
    {
        key: 'lockedCount' as keyof TravelerListStats,
        title: 'Locked',
        icon: Lock,
        gradient: 'from-amber-50 to-amber-100/50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        borderColor: 'border-amber-200/80',
        valueColor: 'text-amber-900',
        labelColor: 'text-amber-500/80',
    },
    {
        key: 'verifiedCount' as keyof TravelerListStats,
        title: 'Verified',
        icon: ShieldCheck,
        gradient: 'from-violet-50 to-violet-100/50',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        borderColor: 'border-violet-200/80',
        valueColor: 'text-violet-900',
        labelColor: 'text-violet-500/80',
    },
    {
        key: 'unverifiedCount' as keyof TravelerListStats,
        title: 'Unverified',
        icon: ShieldOff,
        gradient: 'from-slate-50 to-slate-100/50',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-500',
        borderColor: 'border-slate-200/80',
        valueColor: 'text-slate-700',
        labelColor: 'text-slate-400/80',
    },
];

const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
    },
};

export function TravelerStats({ stats }: TravelerStatsProps) {
    return (
        <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {statConfig.map((item) => {
                const Icon = item.icon;
                const value = stats[item.key] as number;

                return (
                    <motion.div key={item.key} variants={cardVariants}>
                        <motion.div
                            whileHover={{ y: -3, scale: 1.02 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            <Card
                                className={`
                                    relative overflow-hidden border bg-gradient-to-br
                                    ${item.gradient} ${item.borderColor}
                                    shadow-sm hover:shadow-md transition-shadow duration-200 p-4 h-full
                                `}
                            >
                                {/* Top shine */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />

                                <div className="relative flex flex-col gap-3">
                                    <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                        <Icon className={`h-4 w-4 ${item.iconColor}`} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <motion.p
                                            className={`text-2xl font-bold tracking-tight ${item.valueColor}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                        >
                                            {value.toLocaleString()}
                                        </motion.p>
                                        <p className={`text-xs font-medium mt-0.5 leading-tight ${item.labelColor}`}>
                                            {item.title}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}