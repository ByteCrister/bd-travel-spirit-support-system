// components/company/ToursTable.tsx
"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { TourDetailDTO, TourListItemDTO } from "@/types/tour.types";
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
    MdWarning,
    MdRateReview,
    MdFlag
} from "react-icons/md";
import { TOUR_STATUS } from "@/constants/tour.const";
import { TourDetailDialog } from "./TourDetailDialog";
import { TourReviewsDialog } from "./TourReviewsDialog";
import { TourReportsDialog } from "./TourReportsDialog";

interface Props {
    companyId: string;
    items: TourListItemDTO[];
    total: number;
    page: number;
    pages: number;
    limit: number;
    loading: boolean;
    error?: string;
    onPageChange: (page: number) => void;
    fetchTourDetail: (tourId: string, force?: boolean | undefined) => Promise<TourDetailDTO>;
}

export function ToursTable({
    companyId,
    items,
    total,
    page,
    pages,
    limit,
    loading,
    error,
    onPageChange,
    fetchTourDetail
}: Props) {
    const [selectedTour, setSelectedTour] = useState<TourDetailDTO | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [reviewsDialogOpen, setReviewsDialogOpen] = useState(false);
    const [selectedTourForReview, setSelectedTourForReview] = useState<{ id: string; title: string } | null>(null);
    const [selectedTourForReport, setSelectedTourForReport] = useState<{ id: string; title: string } | null>(null);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    const handleRowClick = async (tourId: string) => {
        setDialogOpen(true);
        setDialogLoading(true);
        try {
            const tour = await fetchTourDetail(tourId);
            setSelectedTour(tour);
        } catch (error) {
            console.error("Failed to fetch tour details:", error);
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setTimeout(() => setSelectedTour(null), 200);
        }
    };

    const handleReviewsClick = (e: React.MouseEvent, tourId: string, tourTitle: string) => {
        e.stopPropagation();
        setSelectedTourForReview({ id: tourId, title: tourTitle });
        setReviewsDialogOpen(true);
    };

    const handleReviewsDialogClose = (open: boolean) => {
        setReviewsDialogOpen(open);
        if (!open) {
            setTimeout(() => setSelectedTourForReview(null), 200);
        }
    };

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
        <>
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
                                <TableRow className="border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50/80 via-indigo-50/30 to-slate-50/80 dark:from-slate-800/80 dark:via-indigo-950/30 dark:to-slate-800/80 hover:from-slate-50/80 hover:via-indigo-50/30 hover:to-slate-50/80 dark:hover:from-slate-800/80 dark:hover:via-indigo-950/30 dark:hover:to-slate-800/80">
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
                                            <MdRateReview className="h-3.5 w-3.5" />
                                            Reviews
                                        </div>
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <MdFlag className="h-3.5 w-3.5" />
                                            Reports
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
                                        const hasReports = t.reportCount > 0;
                                        const hasHighReports = t.reportCount >= 100;

                                        return (
                                            <motion.tr
                                                key={t.id}
                                                variants={rowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                custom={index}
                                                onClick={() => handleRowClick(t.id)}
                                                className="group border-b border-slate-100 dark:border-slate-800/50 hover:bg-gradient-to-r hover:from-slate-50/50 hover:via-indigo-50/20 hover:to-slate-50/50 dark:hover:from-slate-800/30 dark:hover:via-indigo-950/20 dark:hover:to-slate-800/30 transition-all cursor-pointer"
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600/10 to-purple-600/10 group-hover:scale-110 transition-transform">
                                                            <MdTrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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
                                                                    {t.averageRating.toFixed(1)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {t.reviewCount > 0 ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handleReviewsClick(e, t.id, t.title)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 w-fit hover:from-blue-500/20 hover:to-indigo-500/20 transition-all h-auto"
                                                        >
                                                            <MdRateReview className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                            <span className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                                                                {t.reviewCount}
                                                            </span>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {hasReports ? (
                                                        <div
                                                            className={`group flex items-center gap-2 px-2 py-1 rounded-lg w-fit transition-all duration-150 ease-out transform ${hasHighReports
                                                                ? "bg-gradient-to-r from-red-50/40 to-rose-50/30 border border-red-200 hover:from-red-100 hover:to-rose-100/60 hover:border-red-300"
                                                                : "bg-gradient-to-r from-amber-50/30 to-orange-50/20 border border-amber-200 hover:from-amber-100 hover:to-orange-100/60 hover:border-amber-300"
                                                                } hover:shadow-sm hover:scale-[1.02]`}
                                                        >
                                                            <span
                                                                className={`inline-flex items-center justify-center rounded-full p-1 transition-colors duration-150 ${hasHighReports ? "bg-red-100 text-red-700 group-hover:bg-red-200" : "bg-orange-100 text-orange-700 group-hover:bg-orange-200"}`}
                                                                aria-hidden
                                                            >
                                                                <MdFlag className="h-4 w-4" />
                                                            </span>

                                                            <button
                                                                type="button"
                                                                className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary rounded px-2 py-0.5 bg-transparent transition-colors duration-150"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedTourForReport({ id: t.id, title: t.title });
                                                                    setReportDialogOpen(true);
                                                                }}
                                                                aria-label={`View ${t.reportCount} reports for ${t.title}`}
                                                                title={`View ${t.reportCount} reports`}
                                                            >
                                                                <span className="text-sm font-semibold leading-none">
                                                                    {t.reportCount}
                                                                </span>

                                                                <span className="text-xs text-muted-foreground/90">
                                                                    {hasHighReports ? "High" : "Active"}
                                                                </span>
                                                            </button>

                                                            <span className="ml-1 flex items-center">
                                                                <svg className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" aria-hidden>
                                                                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 w-fit transition-colors duration-150 hover:bg-emerald-100 hover:shadow-sm">
                                                            <MdCheckCircle className="h-4 w-4 text-emerald-600" />
                                                            <span className="text-xs font-medium text-emerald-700">Clean</span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20">
                                                            <MdPeople className="h-3 w-3 mr-1" />
                                                            {t.bookingCount}/{t.maxGroupSize}
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
                                        <TableCell colSpan={10} className="h-32">
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
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/50 shadow-sm">
                            <span className="text-slate-600 dark:text-slate-400">Showing</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                {Math.min(((page - 1) * limit) + 1, total)}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">-</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                                {Math.min(page * limit, total)}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">of</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {total}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page <= 1 || loading}
                            className="gap-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 border-slate-200 dark:border-slate-800"
                        >
                            <MdArrowBack className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>

                        <div className="flex items-center gap-1">
                            {(() => {
                                const visible: (number | string)[] = [];
                                const maxShown = 7;

                                if (pages <= maxShown) {
                                    for (let i = 1; i <= pages; i++) visible.push(i);
                                } else {
                                    const start = Math.max(2, page - 2);
                                    const end = Math.min(pages - 1, page + 2);

                                    visible.push(1);
                                    if (start > 2) visible.push("…");
                                    for (let i = start; i <= end; i++) visible.push(i);
                                    if (end < pages - 1) visible.push("…");
                                    visible.push(pages);
                                }

                                return visible.map((p, idx) => {
                                    if (typeof p === "string") {
                                        return (
                                            <span
                                                key={`ellipsis-${idx}`}
                                                className="h-9 w-9 inline-flex items-center justify-center text-slate-500 dark:text-slate-400"
                                            >
                                                {p}
                                            </span>
                                        );
                                    }

                                    const isActive = page === p;

                                    return (
                                        <Button
                                            key={p}
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => onPageChange(p)}
                                            disabled={loading}
                                            className={[
                                                "h-9 w-9 rounded-lg transition-all duration-300",
                                                isActive
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25"
                                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800"
                                            ].join(" ")}
                                        >
                                            {p}
                                        </Button>
                                    );
                                });
                            })()}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(pages, page + 1))}
                            disabled={page >= pages || loading}
                            className="gap-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 border-slate-200 dark:border-slate-800"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <MdArrowForward className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <TourDetailDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                tour={selectedTour}
                loading={dialogLoading}
            />

            {selectedTourForReview && (
                <TourReviewsDialog
                    open={reviewsDialogOpen}
                    onOpenChange={handleReviewsDialogClose}
                    tourId={selectedTourForReview.id}
                    tourTitle={selectedTourForReview.title}
                    companyId={companyId}
                />
            )}

            <TourReportsDialog
                open={reportDialogOpen}
                onOpenChange={setReportDialogOpen}
                companyId={companyId}
                tourId={selectedTourForReport?.id ?? ""}
                tourTitle={selectedTourForReport?.title ?? ""}
            />
        </>
    );
}