// components/company/ToursTable.tsx
"use client";

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { TourListItemDTO } from "@/types/tour.types";
import {
    MdArrowBack,
    MdArrowForward,
    MdCalendarToday,
    MdStar,
    MdPeople,
    MdCheckCircle,
    MdDrafts,
    MdArchive,
    MdTrendingUp,
    MdWarning
} from "react-icons/md";
import { TOUR_STATUS } from "@/constants/tour.const";

interface Props {
    items: TourListItemDTO[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    loading: boolean;
    error?: string;
    onPageChange: (page: number) => void;
}

export function ToursTable({ items, total, page, pages, limit, loading, error, onPageChange }: Props) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case TOUR_STATUS.PUBLISHED:
                return {
                    variant: "default" as const,
                    icon: MdCheckCircle,
                    className: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-sm"
                };
            case TOUR_STATUS.DRAFT:
                return {
                    variant: "secondary" as const,
                    icon: MdDrafts,
                    className: "bg-gradient-to-r from-amber-600/10 to-yellow-600/10 text-amber-700 dark:text-amber-300 border border-amber-600/20"
                };
            default:
                return {
                    variant: "outline" as const,
                    icon: MdArchive,
                    className: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                };
        }
    };

    const rowVariants: Variants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 p-4"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10">
                        <MdWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-200">Error loading tours</p>
                        <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </motion.div>
            )}

            <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Title</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <MdCalendarToday className="h-3.5 w-3.5" />
                                        Dates
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Duration</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <MdStar className="h-3.5 w-3.5" />
                                        Rating
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <MdPeople className="h-3.5 w-3.5" />
                                        Bookings
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Featured</TableHead>
                                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Updated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {items.map((t, index) => {
                                    const statusConfig = getStatusConfig(t.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <motion.tr
                                            key={t.id}
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            custom={index}
                                            className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600/10 to-purple-600/10 group-hover:scale-110 transition-transform">
                                                        <MdTrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="text-slate-900 dark:text-slate-100">{t.title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusConfig.variant} className={`${statusConfig.className} flex items-center gap-1.5 w-fit`}>
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {t.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        {new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                        {new Date(t.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                    {t.durationDays} days
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {t.averageRating ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 px-2.5 py-1 border border-amber-500/20">
                                                            <MdStar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                            <span className="font-semibold text-sm text-amber-700 dark:text-amber-300">
                                                                {t.averageRating}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20">
                                                        <MdPeople className="h-3 w-3 mr-1" />
                                                        {t.bookingCount}
                                                    </Badge>
                                                    {t.isFull && (
                                                        <Badge variant="destructive" className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0 shadow-sm">
                                                            Full
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {t.isFeatured ? (
                                                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-sm">
                                                        <MdStar className="h-3 w-3 mr-1" />
                                                        Featured
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                            {items.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center gap-3"
                                        >
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                                                <MdArchive className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No tours found</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </motion.div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50">
                        <span className="text-slate-600 dark:text-slate-400">Showing</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{((page - 1) * limit) + 1}</span>
                        <span className="text-slate-600 dark:text-slate-400">-</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{Math.min(page * limit, total)}</span>
                        <span className="text-slate-600 dark:text-slate-400">of</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{total}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page <= 1 || loading}
                        className="gap-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
                    >
                        <MdArrowBack className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                            let pageNum: number;
                            if (pages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= pages - 2) {
                                pageNum = pages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }

                            return (
                                <Button
                                    key={pageNum}
                                    variant={page === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => onPageChange(pageNum)}
                                    disabled={loading}
                                    className={`h-9 w-9 rounded-lg transition-all font-semibold ${page === pageNum
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                        }`}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(Math.min(pages, page + 1))}
                        disabled={page >= pages || loading}
                        className="gap-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <MdArrowForward className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}