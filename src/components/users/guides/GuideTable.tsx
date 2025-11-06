// components/guide/GuideTable.tsx
"use client";

import { useState } from "react";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/pendingGuide.types";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RejectReasonModal, ReviewCommentModal } from "./GuideModals";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// React Icons
import {
    FiCheckCircle,
    FiXCircle,
    FiMessageSquare,
    FiClock,
    FiUser,
    FiMail,
    FiBriefcase,
    FiInfo,
} from "react-icons/fi";
import {
    HiChevronUp,
    HiChevronDown,
    HiDocumentText
} from "react-icons/hi";
import { BiSort } from "react-icons/bi";
import { AiOutlineInbox } from "react-icons/ai";
import { BsFileEarmarkText } from "react-icons/bs";
import { TableSkeleton } from "./TableSkeleton";
import { SortByTypes, SortDirTypes } from "@/store/guide.store";
import { GuideDetailsDialog } from "./GuideDetailsDialog";
import StatusBadge from "./StatusBadge";
import DocumentsPopover from "./DocumentsPopover";

type Props = {
    guides: PendingGuideDTO[];
    loading?: boolean;
    error?: string | null;
    sortBy: SortByTypes;
    sortDir: SortDirTypes;
    onSortChange: (
        sortBy: SortByTypes,
        sortDir: SortDirTypes,
    ) => void;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onComment: (id: string, comment: string) => void;
    onOpenDocument: (guide: PendingGuideDTO, doc: PendingGuideDocumentDTO) => void;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
};

export function GuideTable({
    guides,
    loading,
    sortBy,
    sortDir,
    onSortChange,
    onApprove,
    onReject,
    onComment,
    onOpenDocument,
    page,
    pageSize,
    total,
    onPageChange,
}: Props) {
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [commentId, setCommentId] = useState<string | null>(null);
    const [detailGuide, setDetailGuide] = useState<PendingGuideDTO | undefined>(undefined);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const canPrev = page > 1;
    const canNext = page < totalPages;

    const handleSort = (key: Props["sortBy"]) => {
        if (sortBy === key) onSortChange(key, sortDir === "asc" ? "desc" : "asc");
        else onSortChange(key, "asc");
    };

    return (
        <div className="space-y-4">
            {/* Loading State */}
            {loading && (
                <div className="py-10">
                    <TableSkeleton rows={10} cols={7} />
                </div>
            )}

            {/* Empty State */}
            {!loading && guides.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-24 px-4"
                >
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-sm border border-blue-100">
                            <AiOutlineInbox className="h-20 w-20 text-blue-400" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
                    <p className="text-sm text-gray-500 max-w-md text-center leading-relaxed">
                        We couldn&apos;t find any guide requests matching your filters. Try adjusting your search or status filters.
                    </p>
                </motion.div>
            )}

            {/* Table */}
            {!loading && guides.length > 0 && (
                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    {/* Top Scroll Bar */}
                    <div className="overflow-x-auto overflow-y-hidden"
                        onScroll={(e) => {
                            const bottom = e.currentTarget.parentElement?.querySelector('.table-scroll-bottom');
                            if (bottom) {
                                bottom.scrollLeft = e.currentTarget.scrollLeft;
                            }
                        }}>
                        <div style={{ height: '1px', width: 'max-content', minWidth: '100%' }} />
                    </div>

                    <div className="overflow-x-auto table-scroll-bottom"
                        onScroll={(e) => {
                            const top = e.currentTarget.parentElement?.querySelector('.overflow-y-hidden');
                            if (top) {
                                top.scrollLeft = e.currentTarget.scrollLeft;
                            }
                        }}>
                        <Table className="min-w-max">
                            <TableHeader>
                                <TableRow className="bg-gray-50/80 border-b border-gray-200 hover:bg-gray-50/80">
                                    <TableHead className="w-12 min-w-[48px]">
                                        <FiUser className="h-3.5 w-3.5 text-gray-500" />
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("name")}>
                                            <FiUser className="h-3.5 w-3.5 text-gray-500" />
                                            <span>Name</span>
                                            <div className="ml-auto">
                                                {sortBy === "name" ? (
                                                    sortDir === "asc" ?
                                                        <HiChevronUp className="h-4 w-4 text-blue-600" /> :
                                                        <HiChevronDown className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <BiSort className="h-4 w-4 text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    </TableHead>
                                    <TableHead className="min-w-[180px]">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("email")}>
                                            <FiMail className="h-3.5 w-3.5 text-gray-500" />
                                            <span>Email</span>
                                            <div className="ml-auto">
                                                {sortBy === "email" ? (
                                                    sortDir === "asc" ?
                                                        <HiChevronUp className="h-4 w-4 text-blue-600" /> :
                                                        <HiChevronDown className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <BiSort className="h-4 w-4 text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("companyName")}>
                                            <FiBriefcase className="h-3.5 w-3.5 text-gray-500" />
                                            <span>Company</span>
                                            <div className="ml-auto">
                                                {sortBy === "companyName" ? (
                                                    sortDir === "asc" ?
                                                        <HiChevronUp className="h-4 w-4 text-blue-600" /> :
                                                        <HiChevronDown className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <BiSort className="h-4 w-4 text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            <BsFileEarmarkText className="h-3.5 w-3.5 text-gray-500" />
                                            <span>Status</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            <HiDocumentText className="h-3.5 w-3.5 text-gray-500" />
                                            <span>Documents</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="min-w-[120px]">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide cursor-pointer" onClick={() => handleSort("appliedAt")}>
                                            <FiClock className="h-3.5 w-3.5 text-gray-500" />
                                            <span>Applied</span>
                                            <div className="ml-auto">
                                                {sortBy === "appliedAt" ? (
                                                    sortDir === "asc" ?
                                                        <HiChevronUp className="h-4 w-4 text-blue-600" /> :
                                                        <HiChevronDown className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <BiSort className="h-4 w-4 text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    </TableHead>
                                    <TableHead className="min-w-[140px]">
                                        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                            Actions
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {guides.map((g, index) => (
                                        <motion.tr
                                            key={g._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ delay: index * 0.03, duration: 0.2 }}
                                            className="group border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <TableCell className="py-3">
                                                <Avatar className="h-8 w-8 ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all">
                                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                                                        {g.name?.substring(0, 2)?.toUpperCase() || "GU"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="font-semibold text-gray-900 text-sm truncate">
                                                    {g.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="truncate">{g.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="text-sm text-gray-600 truncate">
                                                    {g.companyName}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <StatusBadge status={g.status} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <DocumentsPopover
                                                    guide={g}
                                                    onOpenDocument={onOpenDocument}
                                                />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                                    {g.appliedAt ? format(new Date(g.appliedAt), "MMM dd, yyyy") : "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Approve */}
                                                    <Button
                                                        onClick={() => onApprove(g._id)}
                                                        disabled={g.status !== GUIDE_STATUS.PENDING}
                                                        title="Approve request"
                                                        variant="outline"
                                                        size="icon"
                                                        className={cn(
                                                            g.status === GUIDE_STATUS.PENDING
                                                                ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                                        )}
                                                    >
                                                        <FiCheckCircle className="h-4 w-4" />
                                                    </Button>

                                                    {/* Reject */}
                                                    <Button
                                                        onClick={() => setRejectId(g._id)}
                                                        disabled={g.status !== GUIDE_STATUS.PENDING}
                                                        title="Reject request"
                                                        variant="outline"
                                                        size="icon"
                                                        className={cn(
                                                            g.status === GUIDE_STATUS.PENDING
                                                                ? "border-red-300 text-red-700 hover:bg-red-50"
                                                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                                        )}
                                                    >
                                                        <FiXCircle className="h-4 w-4" />
                                                    </Button>

                                                    {/* Comment */}
                                                    <Button
                                                        onClick={() => setCommentId(g._id)}
                                                        title="Add comment"
                                                        variant="outline"
                                                        size="icon"
                                                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <FiMessageSquare className="h-4 w-4" />
                                                    </Button>

                                                    {/* Details */}
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 border-gray-300 hover:bg-gray-50"
                                                        title="View details"
                                                        onClick={() => setDetailGuide(g)}
                                                    >
                                                        <FiInfo className="h-4 w-4 text-gray-700" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!loading && guides.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">
                            Showing <span className="font-semibold text-gray-900">{(page - 1) * pageSize + 1}</span> to{" "}
                            <span className="font-semibold text-gray-900">{Math.min(page * pageSize, total)}</span> of{" "}
                            <span className="font-semibold text-gray-900">{total}</span> results
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={!canPrev}
                            className="h-9 px-3 text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                            <HiChevronUp className="h-4 w-4 -rotate-90 mr-1" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1 px-2">
                            <span className="text-sm text-gray-600">Page</span>
                            <span className="text-sm font-bold text-gray-900 min-w-[2ch] text-center">{page}</span>
                            <span className="text-sm text-gray-400">/</span>
                            <span className="text-sm font-bold text-gray-900">{totalPages}</span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={!canNext}
                            className="h-9 px-3 text-sm disabled:opacity-50 hover:bg-gray-50"
                        >
                            Next
                            <HiChevronDown className="h-4 w-4 -rotate-90 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <RejectReasonModal
                open={rejectId !== null}
                onClose={() => setRejectId(null)}
                onSubmit={(reason) => {
                    if (rejectId) onReject(rejectId, reason);
                    setRejectId(null);
                }}
            />
            <ReviewCommentModal
                open={commentId !== null}
                onClose={() => setCommentId(null)}
                onSubmit={(comment) => {
                    if (commentId) onComment(commentId, comment);
                    setCommentId(null);
                }}
            />

            <GuideDetailsDialog
                open={!!detailGuide}
                guide={detailGuide}
                onClose={() => setDetailGuide(undefined)}
                onApprove={onApprove}
                onReject={onReject}
                onComment={onComment}
                onOpenDocument={onOpenDocument}
            />
        </div>
    );
}