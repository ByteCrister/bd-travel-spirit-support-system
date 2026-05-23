"use client";

import React, { useEffect, useState } from "react";
import { useCompanyDetailStore } from "@/store/company/company-detail.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Flag,
  FileText,
  MessageSquare,
  Clock,
  AlertTriangle,
  Paperclip,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import {
  REPORT_PRIORITY,
  REPORT_REASON,
  REPORT_STATUS,
  ReportPriority,
  ReportStatus,
} from "@/constants/report.const";
import { format } from "date-fns";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_ICON =
  "rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200";
const NEU_BTN_PRIMARY_ACTIVE =
  "rounded-xl w-8 h-8 flex items-center justify-center bg-[#006666] text-white text-xs font-bold " +
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_PRIMARY =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  companyId: string;
  tourId: string;
  tourTitle?: string;
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n?.[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SkeletonCard() {
  return (
    <div className={`${NEU_CARD_SM} p-5 space-y-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`${NEU_SKELETON} h-12 w-12 rounded-full`} />
          <div className="space-y-2">
            <div className={`${NEU_SKELETON} h-4 w-32`} />
            <div className={`${NEU_SKELETON} h-3 w-24`} />
          </div>
        </div>
        <div className={`${NEU_SKELETON} h-6 w-20 rounded-xl`} />
      </div>
      <div className={`${NEU_SKELETON} h-16 w-full rounded-xl`} />
      <div className="flex gap-2">
        <div className={`${NEU_SKELETON} h-6 w-20 rounded-xl`} />
        <div className={`${NEU_SKELETON} h-6 w-24 rounded-xl`} />
      </div>
    </div>
  );
}

export default function ReportsPanel({ companyId, tourId, tourTitle }: Props) {
  const { fetchReports, listCache, loading, error, params } =
    useCompanyDetailStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadingKey = `reportsList:${tourId}`;
  const errorKey = `reportsListError:${tourId}`;
  const isLoading = Boolean(loading?.[loadingKey]);
  const errorMessage = error?.[errorKey];

  const currentParams = params?.tourReports?.[tourId];
  const activeCacheKey = `${currentPage}-${pageSize}-${currentParams?.sort || ""}-${currentParams?.order || ""}`;
  const cachedData = listCache?.tourReports?.[tourId]?.[activeCacheKey];

  useEffect(() => {
    if (!companyId || !tourId) return;
    const key = `${currentPage}-${pageSize}`;
    if (!listCache?.tourReports?.[tourId]?.[key]) {
      void fetchReports(companyId, tourId, {
        page: currentPage,
        limit: pageSize,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, tourId, currentPage, pageSize]);

  useEffect(() => {
    if (cachedData && currentPage > cachedData.pages) {
      setCurrentPage(cachedData.pages || 1);
    }
  }, [cachedData, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (cachedData?.pages) {
      const safePage = Math.max(1, Math.min(newPage, cachedData.pages));
      setCurrentPage(safePage);
      return;
    }
    setCurrentPage(Math.max(1, newPage));
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize) || 10;
    setPageSize(size);
    setCurrentPage(1);
  };

  const startItem = cachedData ? (cachedData.page - 1) * pageSize + 1 : 0;
  const endItem = cachedData
    ? Math.min(cachedData.page * pageSize, cachedData.total)
    : 0;

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case REPORT_STATUS.OPEN:
        return (
          <span className={NEU_BADGE_WARNING}>
            <AlertCircle className="h-3 w-3" /> Open
          </span>
        );
      case REPORT_STATUS.IN_REVIEW:
        return (
          <span className={NEU_BADGE_PRIMARY}>
            <Eye className="h-3 w-3" /> In Review
          </span>
        );
      case REPORT_STATUS.RESOLVED:
        return (
          <span className={NEU_BADGE_SUCCESS}>
            <CheckCircle2 className="h-3 w-3" /> Resolved
          </span>
        );
      case REPORT_STATUS.REJECTED:
        return (
          <span className={NEU_BADGE_DANGER}>
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return <span className={NEU_BADGE}>{status}</span>;
    }
  };

  const getPriorityBadge = (priority: ReportPriority) => {
    switch (priority) {
      case REPORT_PRIORITY.HIGH:
        return (
          <span className={NEU_BADGE_DANGER}>
            <Flag className="h-3 w-3" /> {priority}
          </span>
        );
      case REPORT_PRIORITY.URGENT:
        return (
          <span className={NEU_BADGE_WARNING}>
            <Flag className="h-3 w-3" /> {priority}
          </span>
        );
      default:
        return (
          <span className={NEU_BADGE}>
            <Flag className="h-3 w-3" /> {priority}
          </span>
        );
    }
  };

  const getLeftBorderColor = (priority: ReportPriority) => {
    switch (priority) {
      case REPORT_PRIORITY.HIGH:
        return "border-l-[#FF2157]";
      case REPORT_PRIORITY.URGENT:
        return "border-l-[#FE9900]";
      default:
        return "border-l-[#006666]";
    }
  };

  const formatReportReason = (reason: REPORT_REASON | string) => {
    if (!reason) return "";
    return String(reason)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className={`${NEU_CARD} overflow-hidden`}>
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-[#1E2938]/10">
        <div className="flex items-center gap-4">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <Flag className="h-5 w-5 text-[#006666]" />
          </div>
          <div>
            <h3 className={`${NEU_HEADING} text-lg`}>
              Reports for {tourTitle || "Tour"}
            </h3>
            <p className={`${NEU_MUTED} mt-0.5`}>
              View and manage all reports submitted for this tour
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mx-6 mt-4">
          <div
            className={`${NEU_SURFACE_INSET} rounded-xl p-4 flex items-center gap-3`}
          >
            <AlertCircle className="h-4 w-4 text-[#FF2157] shrink-0" />
            <span className={`${NEU_MONO} text-sm text-[#FF2157]`}>
              {errorMessage}
            </span>
          </div>
        </div>
      )}

      {/* Stats row */}
      {cachedData && (
        <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: cachedData.total ?? 0,
              accent: "text-[#006666]",
            },
            {
              label: "Showing",
              value: `${startItem}–${endItem}`,
              accent: "text-[#1E2938]",
            },
            {
              label: "Page",
              value: cachedData.page ?? 1,
              accent: "text-[#1E2938]",
            },
            {
              label: "Pages",
              value: cachedData.pages ?? 1,
              accent: "text-[#FE9900]",
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
            >
              <p className={NEU_LABEL}>{label}</p>
              <p className={`${NEU_HEADING} text-xl mt-1 ${accent}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report List */}
      <div className="px-6 pb-4">
        <ScrollArea className="h-[520px]">
          <div className="space-y-3 pr-2 pb-2">
            {isLoading ? (
              Array.from({ length: pageSize > 6 ? 6 : pageSize }).map(
                (_, i) => <SkeletonCard key={i} />,
              )
            ) : cachedData &&
              cachedData.items &&
              cachedData.items.length > 0 ? (
              cachedData.items.map((report) => (
                <div
                  key={report.id}
                  className={`${NEU_CARD_SM} ${NEU_CARD_HOVER} p-5 border-l-4 ${getLeftBorderColor(report.priority)}`}
                >
                  <div className="space-y-3">
                    {/* Reporter row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-11 w-11 shrink-0">
                          {report?.reporterAvatarUrl ? (
                            <AvatarImage src={report.reporterAvatarUrl} />
                          ) : (
                            <AvatarFallback
                              className="rounded-xl text-white text-sm font-bold"
                              style={{
                                background:
                                  "linear-gradient(135deg, #006666, #008080)",
                              }}
                            >
                              {getInitials(report.reporterName)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0">
                          <p className={`${NEU_HEADING} text-sm truncate`}>
                            {report.reporterName ?? "Anonymous"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="h-3 w-3 text-[#1E2938]/40" />
                            <span className={`${NEU_MUTED} text-xs`}>
                              {report.createdAt
                                ? format(
                                    new Date(report.createdAt),
                                    "MMM dd, yyyy",
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    {/* Reason */}
                    <div
                      className={`${NEU_SURFACE_INSET_SM} rounded-xl px-3 py-2.5 flex items-center gap-2`}
                    >
                      <AlertTriangle className="h-4 w-4 text-[#FE9900] shrink-0" />
                      <span
                        className={`${NEU_MONO} text-sm font-semibold text-[#1E2938]`}
                      >
                        {formatReportReason(report.reason)}
                      </span>
                    </div>

                    {/* Message excerpt */}
                    {report.messageExcerpt && (
                      <div
                        className={`${NEU_SURFACE_INSET} rounded-xl p-3 flex gap-2`}
                      >
                        <MessageSquare className="h-4 w-4 text-[#006666] mt-0.5 shrink-0" />
                        <p
                          className={`${NEU_MONO} text-sm leading-relaxed break-words`}
                        >
                          {report.messageExcerpt}
                        </p>
                      </div>
                    )}

                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {getPriorityBadge(report.priority)}

                      {report.evidenceCount && report.evidenceCount > 0 && (
                        <span className={NEU_BADGE_PRIMARY}>
                          <Paperclip className="h-3 w-3" />
                          {report.evidenceCount} file
                          {report.evidenceCount > 1 ? "s" : ""}
                        </span>
                      )}

                      {report.reopenedCount > 0 && (
                        <span className={NEU_BADGE}>
                          <TrendingUp className="h-3 w-3" />
                          Reopened {report.reopenedCount}×
                        </span>
                      )}
                    </div>

                    {/* Flags */}
                    {report.flags && report.flags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {report.flags.map((flag: string) => (
                          <span key={flag} className={NEU_BADGE}>
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Last activity */}
                    {report.lastActivityAt && (
                      <div
                        className={`flex items-center gap-1.5 text-xs pt-2 border-t ${NEU_DIVIDER}`}
                      >
                        <Clock className="h-3 w-3 text-[#1E2938]/40 shrink-0" />
                        <span className={NEU_MUTED}>
                          Updated:{" "}
                          {format(
                            new Date(report.lastActivityAt),
                            "MMM dd, HH:mm",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div
                className={`${NEU_SURFACE_INSET} rounded-2xl py-16 flex flex-col items-center gap-3`}
              >
                <div className={NEU_ICON_WELL}>
                  <FileText className="h-8 w-8 text-[#1E2938]/30" />
                </div>
                <p className={`${NEU_HEADING} text-base text-[#1E2938]/50`}>
                  No reports found
                </p>
                <p className={NEU_MUTED}>This tour has no reports</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Pagination */}
      {cachedData && cachedData.items && cachedData.items.length > 0 && (
        <div className={`px-6 py-4 border-t ${NEU_DIVIDER}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: page size + count */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`${NEU_LABEL} normal-case`}>Show</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger
                    className={`${NEU_SURFACE_INSET_SM} w-[72px] h-8 text-xs border-none focus:ring-1 focus:ring-[#006666]/40 rounded-xl`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["5", "10", "20", "50"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={`${NEU_MONO} text-sm`}>
                <span className="text-[#006666] font-semibold">
                  {startItem}–{endItem}
                </span>{" "}
                of{" "}
                <span className="text-[#006666] font-semibold">
                  {cachedData.total}
                </span>
              </div>
            </div>

            {/* Right: page buttons */}
            <div className="flex items-center gap-1">
              <button
                className={NEU_BTN_ICON}
                onClick={() => handlePageChange(1)}
                disabled={cachedData.page === 1 || isLoading}
                aria-label="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </button>
              <button
                className={NEU_BTN_ICON}
                onClick={() => handlePageChange((cachedData.page || 1) - 1)}
                disabled={cachedData.page === 1 || isLoading}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <div
                className={`${NEU_BTN_PRIMARY_ACTIVE} min-w-[80px] justify-center text-xs font-bold`}
              >
                {cachedData.page} / {cachedData.pages}
              </div>

              <button
                className={NEU_BTN_ICON}
                onClick={() => handlePageChange((cachedData.page || 1) + 1)}
                disabled={cachedData.page === cachedData.pages || isLoading}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              <button
                className={NEU_BTN_ICON}
                onClick={() => handlePageChange(cachedData.pages)}
                disabled={cachedData.page === cachedData.pages || isLoading}
                aria-label="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
