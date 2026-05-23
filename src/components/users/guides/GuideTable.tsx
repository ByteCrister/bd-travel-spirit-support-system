// components/guide/GuideTable.tsx
"use client";

import { useState } from "react";
import {
  PendingGuideDTO,
  PendingGuideDocumentDTO,
} from "@/types/guide/pendingGuide.types";
import { GUIDE_STATUS } from "@/constants/guide.const";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RejectReasonModal, ReviewCommentModal } from "./GuideModals";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
import { HiChevronUp, HiChevronDown, HiDocumentText } from "react-icons/hi";
import { BiSort } from "react-icons/bi";
import { AiOutlineInbox } from "react-icons/ai";
import { BsFileEarmarkText } from "react-icons/bs";
import { TableSkeleton } from "./TableSkeleton";
import { SortByTypes, SortDirTypes } from "@/store/guide/guide.store";
import { GuideDetailsDialog } from "./GuideDetailsDialog";
import StatusBadge from "./StatusBadge";
import DocumentsPopover from "./DocumentsPopover";
import { ApproveConfirmDialog } from "./ApproveConfirmDialog";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_TABLE_WRAPPER = "bg-[#E7E5E4] rounded-2xl overflow-hidden";

const NEU_TABLE_HEADER_ROW =
  "bg-[#E7E5E4] border-b border-[#1E2938]/10 hover:bg-[#E7E5E4]";

const NEU_TH_TEXT =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_TH_SORTABLE =
  "flex items-center gap-2 cursor-pointer select-none hover:text-[#006666] transition-colors duration-150";

const NEU_TR =
  "group border-b border-[#1E2938]/[0.06] " +
  "hover:bg-[#E7E5E4] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";

const NEU_TD_TEXT =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] truncate";

const NEU_TD_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60 truncate";

const NEU_AVATAR_FALLBACK =
  "bg-[#006666]/20 text-[#006666] font-[family-name:var(--font-space-mono)] font-bold text-xs";

const NEU_BTN_ICON_BASE =
  "rounded-xl w-9 h-9 flex items-center justify-center " +
  "bg-[#E7E5E4] transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_ICON_APPROVE =
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] text-[#00A63D] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] hover:text-[#00A63D]";

const NEU_BTN_ICON_REJECT =
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] text-[#FF2157] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_BTN_ICON_COMMENT =
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] text-[#006666] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_BTN_ICON_INFO =
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] text-[#1E2938]/60 " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_BTN_ICON_DISABLED =
  "opacity-40 cursor-not-allowed shadow-none pointer-events-none";

const NEU_PAGINATION_BTN =
  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm h-9 " +
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "transition-all duration-200";

const NEU_PAGINATION_TEXT =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60";

const NEU_EMPTY_CARD =
  "p-8 rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]";

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  guides: PendingGuideDTO[];
  loading?: boolean;
  error?: string | null;
  sortBy: SortByTypes;
  sortDir: SortDirTypes;
  onSortChange: (sortBy: SortByTypes, sortDir: SortDirTypes) => void;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onSuspend: (id: string, reason: string, until: Date) => Promise<boolean>;
  onUnsuspend: (id: string, reason: string) => Promise<boolean>;
  onComment: (id: string, comment: string) => Promise<boolean>;
  onOpenDocument: (
    guide: PendingGuideDTO,
    doc: PendingGuideDocumentDTO,
  ) => void;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

// Sort icon helper
function SortIcon({
  col,
  sortBy,
  sortDir,
}: {
  col: SortByTypes;
  sortBy: SortByTypes;
  sortDir: SortDirTypes;
}) {
  if (sortBy !== col)
    return <BiSort className="h-4 w-4 text-[#1E2938]/20" aria-hidden="true" />;
  return sortDir === "asc" ? (
    <HiChevronUp
      className="h-4 w-4 text-[#006666]"
      aria-label="sorted ascending"
    />
  ) : (
    <HiChevronDown
      className="h-4 w-4 text-[#006666]"
      aria-label="sorted descending"
    />
  );
}

export function GuideTable({
  guides,
  loading,
  sortBy,
  sortDir,
  onSortChange,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onComment,
  onOpenDocument,
  page,
  pageSize,
  total,
  onPageChange,
}: Props) {
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [commentId, setCommentId] = useState<string | null>(null);
  const [detailGuide, setDetailGuide] = useState<PendingGuideDTO | undefined>(
    undefined,
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleSort = (key: SortByTypes) => {
    if (sortBy === key) onSortChange(key, sortDir === "asc" ? "desc" : "asc");
    else onSortChange(key, "asc");
  };

  return (
    <div className="space-y-4">
      {/* Loading */}
      {loading && (
        <div className="py-4 px-4">
          <TableSkeleton rows={10} cols={7} />
        </div>
      )}

      {/* Empty State */}
      {!loading && guides.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center justify-center py-20 px-4"
          role="status"
          aria-label="No results found"
        >
          <div className={cn(NEU_EMPTY_CARD, "mb-5")}>
            <AiOutlineInbox
              className="h-16 w-16 text-[#1E2938]/20"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] mb-1">
            No Requests Found
          </h3>
          <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 max-w-sm text-center leading-relaxed">
            No guide requests match your current filters. Try adjusting your
            search.
          </p>
        </motion.div>
      )}

      {/* Table */}
      {!loading && guides.length > 0 && (
        <div className={NEU_TABLE_WRAPPER}>
          <div className="overflow-x-auto">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow className={NEU_TABLE_HEADER_ROW}>
                  {/* Avatar col */}
                  <TableHead className="w-12 min-w-[48px] px-4">
                    <FiUser
                      className="h-3.5 w-3.5 text-[#1E2938]/40"
                      aria-hidden="true"
                    />
                  </TableHead>

                  {/* Name */}
                  <TableHead className="min-w-[140px] px-3">
                    <div
                      className={cn(NEU_TH_TEXT, NEU_TH_SORTABLE)}
                      onClick={() => handleSort("name")}
                      role="button"
                      aria-label="Sort by name"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleSort("name")}
                    >
                      <FiUser className="h-3.5 w-3.5" aria-hidden="true" />
                      Name
                      <SortIcon col="name" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </TableHead>

                  {/* Email */}
                  <TableHead className="min-w-[180px] px-3">
                    <div
                      className={cn(NEU_TH_TEXT, NEU_TH_SORTABLE)}
                      onClick={() => handleSort("email")}
                      role="button"
                      aria-label="Sort by email"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSort("email")
                      }
                    >
                      <FiMail className="h-3.5 w-3.5" aria-hidden="true" />
                      Email
                      <SortIcon col="email" sortBy={sortBy} sortDir={sortDir} />
                    </div>
                  </TableHead>

                  {/* Company */}
                  <TableHead className="min-w-[140px] px-3">
                    <div
                      className={cn(NEU_TH_TEXT, NEU_TH_SORTABLE)}
                      onClick={() => handleSort("companyName")}
                      role="button"
                      aria-label="Sort by company"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSort("companyName")
                      }
                    >
                      <FiBriefcase className="h-3.5 w-3.5" aria-hidden="true" />
                      Company
                      <SortIcon
                        col="companyName"
                        sortBy={sortBy}
                        sortDir={sortDir}
                      />
                    </div>
                  </TableHead>

                  {/* Status */}
                  <TableHead className="min-w-[120px] px-3">
                    <div className={cn(NEU_TH_TEXT, "flex items-center gap-2")}>
                      <BsFileEarmarkText
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Status
                    </div>
                  </TableHead>

                  {/* Documents */}
                  <TableHead className="min-w-[130px] px-3">
                    <div className={cn(NEU_TH_TEXT, "flex items-center gap-2")}>
                      <HiDocumentText
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Documents
                    </div>
                  </TableHead>

                  {/* Applied */}
                  <TableHead className="min-w-[120px] px-3">
                    <div
                      className={cn(NEU_TH_TEXT, NEU_TH_SORTABLE)}
                      onClick={() => handleSort("appliedAt")}
                      role="button"
                      aria-label="Sort by applied date"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSort("appliedAt")
                      }
                    >
                      <FiClock className="h-3.5 w-3.5" aria-hidden="true" />
                      Applied
                      <SortIcon
                        col="appliedAt"
                        sortBy={sortBy}
                        sortDir={sortDir}
                      />
                    </div>
                  </TableHead>

                  {/* Actions */}
                  <TableHead className="min-w-[160px] px-3">
                    <span className={NEU_TH_TEXT}>Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <AnimatePresence mode="popLayout">
                  {guides.map((g, index) => {
                    const isPending = g.status === GUIDE_STATUS.PENDING;
                    return (
                      <motion.tr
                        key={g._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ delay: index * 0.025, duration: 0.18 }}
                        className={NEU_TR}
                      >
                        {/* Avatar */}
                        <TableCell className="py-3 px-4">
                          <Avatar className="h-8 w-8 ring-2 ring-[#1E2938]/10 group-hover:ring-[#006666]/20 transition-all">
                            <AvatarImage
                              src={g.avatar}
                              alt={g.name || "Guide avatar"}
                            />
                            <AvatarFallback className={NEU_AVATAR_FALLBACK}>
                              {g.name?.substring(0, 2)?.toUpperCase() || "GU"}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>

                        {/* Name */}
                        <TableCell className="py-3 px-3">
                          <span className={cn(NEU_TD_TEXT, "font-bold")}>
                            {g.name}
                          </span>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="py-3 px-3">
                          <span className={NEU_TD_MUTED}>{g.email}</span>
                        </TableCell>

                        {/* Company */}
                        <TableCell className="py-3 px-3">
                          <span className={NEU_TD_MUTED}>{g.companyName}</span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3 px-3">
                          <StatusBadge status={g.status} />
                        </TableCell>

                        {/* Documents */}
                        <TableCell className="py-3 px-3">
                          <DocumentsPopover
                            guide={g}
                            onOpenDocument={onOpenDocument}
                          />
                        </TableCell>

                        {/* Applied date */}
                        <TableCell className="py-3 px-3">
                          <span className={NEU_TD_MUTED}>
                            {g.appliedAt
                              ? format(new Date(g.appliedAt), "MMM dd, yyyy")
                              : "—"}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {/* Approve */}
                            <button
                              onClick={() => setApproveId(g._id)}
                              disabled={!isPending}
                              title="Approve request"
                              aria-label="Approve this guide request"
                              className={cn(
                                NEU_BTN_ICON_BASE,
                                isPending
                                  ? NEU_BTN_ICON_APPROVE
                                  : NEU_BTN_ICON_DISABLED,
                              )}
                            >
                              <FiCheckCircle
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>

                            {/* Reject */}
                            <button
                              onClick={() => setRejectId(g._id)}
                              disabled={!isPending}
                              title="Reject request"
                              aria-label="Reject this guide request"
                              className={cn(
                                NEU_BTN_ICON_BASE,
                                isPending
                                  ? NEU_BTN_ICON_REJECT
                                  : NEU_BTN_ICON_DISABLED,
                              )}
                            >
                              <FiXCircle
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>

                            {/* Comment */}
                            <button
                              onClick={() => setCommentId(g._id)}
                              title="Add comment"
                              aria-label="Add a review comment"
                              className={cn(
                                NEU_BTN_ICON_BASE,
                                NEU_BTN_ICON_COMMENT,
                              )}
                            >
                              <FiMessageSquare
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>

                            {/* Details */}
                            <button
                              onClick={() => setDetailGuide(g)}
                              title="View details"
                              aria-label="View guide details"
                              className={cn(
                                NEU_BTN_ICON_BASE,
                                NEU_BTN_ICON_INFO,
                              )}
                            >
                              <FiInfo className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && guides.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 py-2">
          <p className={NEU_PAGINATION_TEXT}>
            Showing{" "}
            <span className="font-bold text-[#1E2938]">
              {(page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[#1E2938]">
              {Math.min(page * pageSize, total)}
            </span>{" "}
            of <span className="font-bold text-[#1E2938]">{total}</span> results
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={!canPrev}
              aria-label="Previous page"
              className={NEU_PAGINATION_BTN}
            >
              <HiChevronUp className="h-4 w-4 -rotate-90" aria-hidden="true" />
              Previous
            </button>

            <span className={cn(NEU_PAGINATION_TEXT, "px-2")}>
              <span className="font-bold text-[#1E2938]">{page}</span>
              <span className="mx-1 text-[#1E2938]/30">/</span>
              <span className="font-bold text-[#1E2938]">{totalPages}</span>
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={!canNext}
              aria-label="Next page"
              className={NEU_PAGINATION_BTN}
            >
              Next
              <HiChevronDown
                className="h-4 w-4 -rotate-90"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ApproveConfirmDialog
        open={approveId !== null}
        onClose={() => setApproveId(null)}
        onConfirm={() => {
          if (approveId) onApprove(approveId);
          setApproveId(null);
        }}
      />
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
        onSuspend={onSuspend}
        onUnsuspend={onUnsuspend}
        onComment={onComment}
        onOpenDocument={onOpenDocument}
      />
    </div>
  );
}
