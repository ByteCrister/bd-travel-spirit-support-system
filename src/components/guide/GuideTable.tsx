// components/guide/GuideTable.tsx
"use client";

import { useState } from "react";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/pendingGuide.types";
import { GUIDE_STATUS } from "@/constants/user.const";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RejectReasonModal, ReviewCommentModal } from "../../components/guide/GuideModals";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// React Icons
import {
    FiCheckCircle,
    FiXCircle,
    FiMessageSquare,
    FiClock,
    FiDownload,
    FiUser,
    FiMail,
    FiBriefcase,
} from "react-icons/fi";
import {
    HiChevronUp,
    HiChevronDown,
    HiDocumentText
} from "react-icons/hi";
import { BiSort } from "react-icons/bi";
import { AiOutlineInbox } from "react-icons/ai";
import { BsFileEarmarkText, BsFileEarmarkPdf } from "react-icons/bs";
import { TableSkeleton } from "./TableSkeleton";

type Props = {
    guides: PendingGuideDTO[];
    loading?: boolean;
    error?: string | null;
    sortBy: "status" | "name" | "email" | "companyName" | "appliedAt" | "reviewedAt" | "createdAt" | "updatedAt" | undefined;
    sortDir: "asc" | "desc";
    onSortChange: (
        sortBy: "status" | "name" | "email" | "companyName" | "appliedAt" | "reviewedAt" | "createdAt" | "updatedAt" | undefined,
        sortDir: "asc" | "desc"
    ) => void;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onComment: (id: string, comment: string) => void;
    onOpenDocument: (guide: PendingGuideDTO, doc: PendingGuideDocumentDTO) => void;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

const statusConfig = {
    [GUIDE_STATUS.PENDING]: {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
        icon: FiClock,
        dotColor: "bg-amber-500"
    },
    [GUIDE_STATUS.APPROVED]: {
        label: "Approved",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        icon: FiCheckCircle,
        dotColor: "bg-emerald-500"
    },
    [GUIDE_STATUS.REJECTED]: {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border border-red-200",
        icon: FiXCircle,
        dotColor: "bg-red-500"
    },
};

const StatusBadge = ({ status }: { status: GUIDE_STATUS }) => {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge className={cn("px-2.5 py-1 font-medium", config.className)}>
            <div className="flex items-center gap-1.5">
                <div className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
                <Icon className="h-3 w-3" />
                <span className="text-xs">{config.label}</span>
            </div>
        </Badge>
    );
};

const DocumentsPopover = ({
    guide,
    onOpenDocument
}: {
    guide: PendingGuideDTO;
    onOpenDocument: (guide: PendingGuideDTO, doc: PendingGuideDocumentDTO) => void;
}) => {
    const [open, setOpen] = useState(false);
    const documents = guide.documents || [];

    if (documents.length === 0) {
        return (
            <div className="flex items-center justify-center">
                <span className="text-xs text-gray-400">No documents</span>
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all">
                    <HiDocumentText className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                        {documents.length} {documents.length === 1 ? 'file' : 'files'}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <BsFileEarmarkText className="h-4 w-4 text-gray-500" />
                        Attached Documents
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
                    </p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                    {documents.map((doc, idx) => (
                        <motion.button
                            key={`${idx}-${doc.fileName}`}
                            onClick={() => {
                                onOpenDocument(guide, doc);
                                setOpen(false);
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors">
                                <BsFileEarmarkPdf className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                    {doc.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Click to view
                                </p>
                            </div>
                            <FiDownload className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                        </motion.button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
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
                                                    <button
                                                        onClick={() => onApprove(g._id)}
                                                        disabled={g.status !== GUIDE_STATUS.PENDING}
                                                        title="Approve request"
                                                        className={cn(
                                                            "group p-2 rounded-lg border transition-all",
                                                            g.status === GUIDE_STATUS.PENDING
                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm"
                                                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                                        )}
                                                    >
                                                        <FiCheckCircle className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setRejectId(g._id)}
                                                        disabled={g.status !== GUIDE_STATUS.PENDING}
                                                        title="Reject request"
                                                        className={cn(
                                                            "group p-2 rounded-lg border transition-all",
                                                            g.status === GUIDE_STATUS.PENDING
                                                                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 hover:shadow-sm"
                                                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                                                        )}
                                                    >
                                                        <FiXCircle className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => setCommentId(g._id)}
                                                        title="Add comment"
                                                        className="group p-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm transition-all"
                                                    >
                                                        <FiMessageSquare className="h-4 w-4" />
                                                    </button>
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
        </div>
    );
}