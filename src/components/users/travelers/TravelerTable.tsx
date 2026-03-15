'use client';

// components/travelers/TravelerTable.tsx
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Table,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TravelerListItem } from '@/types/user/traveler.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldOff, ChevronRight, SearchX } from 'lucide-react';

interface TravelerTableProps {
    travelers: TravelerListItem[];
    onRowClick: (id: string) => void;
    emptyMessage?: string;
}

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
    active: {
        label: 'Active',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotColor: 'bg-emerald-500',
    },
    suspended: {
        label: 'Suspended',
        className: 'bg-red-50 text-red-700 border-red-200',
        dotColor: 'bg-red-500',
    },
    locked: {
        label: 'Locked',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        dotColor: 'bg-amber-500',
    },
    inactive: {
        label: 'Inactive',
        className: 'bg-slate-50 text-slate-600 border-slate-200',
        dotColor: 'bg-slate-400',
    },
};

const tableVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
};

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
    },
    exit: { opacity: 0, x: 8, transition: { duration: 0.2 } },
};

function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string) {
    const colors = [
        'from-blue-400 to-blue-600',
        'from-violet-400 to-violet-600',
        'from-emerald-400 to-emerald-600',
        'from-amber-400 to-amber-600',
        'from-rose-400 to-rose-600',
        'from-cyan-400 to-cyan-600',
    ];
    return colors[name.charCodeAt(0) % colors.length];
}

export function TravelerTable({
    travelers,
    onRowClick,
    emptyMessage = 'No travelers found',
}: TravelerTableProps) {
    if (travelers.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
            >
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                    <SearchX className="h-8 w-8 text-slate-400" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 mt-1">
                        Try adjusting your filters or search terms
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-4 py-3">
                            Traveler
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">
                            Email
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">
                            Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">
                            Verified
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-3">
                            Joined
                        </TableHead>
                        <TableHead className="w-8" />
                    </TableRow>
                </TableHeader>

                <motion.tbody
                    variants={tableVariants}
                    initial="hidden"
                    animate="visible"
                    className="[&_tr:last-child]:border-0"
                >
                    <AnimatePresence mode="popLayout">
                        {travelers.map((traveler, index) => {
                            const status = statusConfig[traveler.accountStatus] ?? statusConfig.inactive;
                            const avatarGradient = getAvatarColor(traveler.name);

                            return (
                                <motion.tr
                                    key={traveler._id}
                                    variants={rowVariants}
                                    layout
                                    onClick={() => onRowClick(traveler._id)}
                                    className={cn(
                                        'group cursor-pointer border-slate-100',
                                        'transition-colors duration-150 hover:bg-blue-50/50',
                                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                                    )}
                                >
                                    {/* Traveler */}
                                    <td className="pl-4 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-9 w-9 ring-2 ring-slate-100">
                                                    <AvatarImage src={traveler.avatarUrl} className="object-cover" />
                                                    <AvatarFallback
                                                        className={cn(
                                                            'text-xs font-bold text-white bg-gradient-to-br',
                                                            avatarGradient
                                                        )}
                                                    >
                                                        {getInitials(traveler.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {traveler.accountStatus === 'active' && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold leading-none text-slate-800 group-hover:text-slate-900 transition-colors">
                                                    {traveler.name}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1 font-mono">
                                                    #{traveler._id.slice(-6)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="py-3.5">
                                        <p className="text-sm text-slate-500 group-hover:text-slate-600 transition-colors font-mono text-[13px]">
                                            {traveler.email}
                                        </p>
                                    </td>

                                    {/* Status */}
                                    <td className="py-3.5">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border gap-1.5',
                                                status.className
                                            )}
                                        >
                                            <span className={cn('h-1.5 w-1.5 rounded-full inline-block', status.dotColor)} />
                                            {status.label}
                                        </Badge>
                                    </td>

                                    {/* Verified */}
                                    <td className="py-3.5">
                                        {traveler.isVerified ? (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                <span className="text-xs font-medium text-emerald-600">Verified</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldOff className="h-4 w-4 text-slate-400" />
                                                <span className="text-xs font-medium text-slate-400">Unverified</span>
                                            </div>
                                        )}
                                    </td>

                                    {/* Joined */}
                                    <td className="py-3.5">
                                        <p className="text-sm text-slate-500 tabular-nums">
                                            {format(new Date(traveler.createdAt), 'MMM d, yyyy')}
                                        </p>
                                    </td>

                                    {/* Arrow */}
                                    <td className="py-3.5 pr-4">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </motion.tbody>
            </Table>
        </div>
    );
}