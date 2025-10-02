'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Users, MapPin, Star, Clock, Calendar, TrendingUp, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { CompanyRowDTO } from '@/types/company.types';
import { cn } from '@/lib/utils';

/**
 * Props for CompanyTable.
 * @property rows - Array of company rows to render.
 */
export interface CompanyTableProps {
    rows: CompanyRowDTO[];
}

/**
 * CompanyTable: Renders the companies list with rich, accessible columns.
 * Adds subtle hover scale animation using framer-motion.
 */
export const CompanyTable = memo(function CompanyTable({
    rows,
}: CompanyTableProps) {
    const router = useRouter();

    const handleViewCompany = (companyId: string) => {
        router.push(`/companies/${companyId}`);
    };

    return (
        <div className="overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Company
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Host Email
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <Users className="w-4 h-4" />
                                Employees
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <MapPin className="w-4 h-4" />
                                Tours
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Reviews
                            </div>
                        </TableHead>
                        <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center justify-end gap-2">
                                <Star className="w-4 h-4" />
                                Rating
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Last Login
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Created
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="h-32 text-center"
                            >
                                <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Building2 className="w-12 h-12 opacity-20" />
                                    <p className="text-sm font-medium">No companies found</p>
                                    <p className="text-xs">Try adjusting your search or filters</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row, index) => (
                            <motion.tr
                                key={row.id}
                                className={cn(
                                    'group relative border-b border-slate-100 dark:border-slate-800 last:border-b-0',
                                    'transition-all duration-200',
                                    'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-violet-50/30',
                                    'dark:hover:from-blue-950/20 dark:hover:to-violet-950/10',
                                    'cursor-pointer'
                                )}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ x: 4 }}
                            >
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                            {row.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {row.name}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {row.host.companyName}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <span className="text-sm">{row.host.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                                        {row.metrics.employeesCount.toLocaleString()}
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                                        {row.metrics.toursCount.toLocaleString()}
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                                        {row.metrics.reviewsCount.toLocaleString()}
                                    </span>
                                </TableCell>
                                <TableCell className="py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                            {formatRating(row.metrics.averageRating)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {formatDate(row.timestamps.lastLogin)}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatRelativeTime(row.timestamps.lastLogin)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {formatDate(row.timestamps.createdAt)}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatRelativeTime(row.timestamps.createdAt)}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* View Button - Appears on hover */}
                                <motion.td
                                    className="absolute right-4 top-1/2 -translate-y-1/2"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    <motion.button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewCompany(row.id);
                                        }}
                                        className="hidden group-hover:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        aria-label={`View ${row.name}`}
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View</span>
                                    </motion.button>
                                </motion.td>
                            </motion.tr>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
});

function formatRating(n: number): string {
    const v = Math.min(5, Math.max(0, n));
    return v.toFixed(1);
}

function formatDate(iso?: string | null): string {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        }).format(d);
    } catch {
        return '—';
    }
}

function formatRelativeTime(iso?: string | null): string {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
        return '';
    }
}