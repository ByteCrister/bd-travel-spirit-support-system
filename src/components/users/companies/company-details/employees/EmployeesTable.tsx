"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EmployeeListItemDTO,
  EmployeeDetailDTO,
} from "@/types/employee/employee.types";
import { MdArrowBack, MdArrowForward, MdPeople } from "react-icons/md";
import { EmployeeDetailDialog } from "./EmployeeDetailDialog";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_TABLE_WRAP =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60 overflow-hidden";

const NEU_TH =
  "h-11 px-4 text-left align-middle font-bold text-xs font-[family-name:var(--font-space-mono)] " +
  "uppercase tracking-widest text-[#1E2938]/50 bg-[#E7E5E4]";

const NEU_TR_HOVER =
  "border-b border-[#d0cecd]/50 hover:bg-white/50 transition-colors duration-150 cursor-pointer group";

const NEU_TD = "px-4 py-3.5";

const NEU_BADGE_BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-[family-name:var(--font-space-mono)] " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_MONO_TEXT =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]";
const NEU_MONO_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";

const NEU_ERROR_BOX =
  "rounded-2xl bg-[#E7E5E4] border border-[#FF2157]/20 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
  "p-4";

const NEU_LOADING_OVERLAY =
  "absolute inset-0 z-20 flex items-center justify-center rounded-2xl " +
  "bg-[#E7E5E4]/80 backdrop-blur-sm";

const NEU_LOADING_PILL =
  "inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#E7E5E4] " +
  "shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";

const NEU_EMPTY_WELL =
  "flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7E5E4] " +
  "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";

const NEU_PAGE_BTN =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#E7E5E4] text-[#1E2938] " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_PAGE_BTN_ACTIVE =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#006666] text-white " +
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]";

const NEU_NAV_BTN =
  "inline-flex h-9 items-center gap-1.5 px-3 rounded-xl text-sm font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#E7E5E4] text-[#1E2938] " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

// ─────────────────────────────────────────────────────────────

interface Props {
  items: EmployeeListItemDTO[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  loading: boolean;
  error?: string;
  onPageChange: (page: number) => void;
  fetchEmployeeDetail: (
    employeeId: string,
    force?: boolean | undefined,
  ) => Promise<EmployeeDetailDTO>;
}

export function EmployeesTable({
  items,
  total,
  page,
  pages,
  fetchEmployeeDetail,
  loading,
  error,
  onPageChange,
}: Props) {
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeDetailDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  const handleRowClick = async (employeeId: string) => {
    setDialogOpen(true);
    setDialogLoading(true);
    try {
      const employee = await fetchEmployeeDetail(employeeId);
      setSelectedEmployee(employee);
    } catch (err) {
      console.error("Failed to fetch employee details:", err);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTimeout(() => setSelectedEmployee(null), 200);
    }
  };

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch {
      return "—";
    }
  };

  const formatCurrency = (amount: number | undefined, currency = "USD") => {
    if (amount === undefined || amount === null) return "—";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return `${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`;
      case "onLeave":
        return `${NEU_BADGE_BASE} bg-[#FE9900]/10 text-[#FE9900]`;
      default:
        return `${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/60`;
    }
  };

  const formatStatus = (status: string): string =>
    status.replace(/([A-Z])/g, " $1").trim();

  const renderAvatar = (name?: string, avatarId?: string) => {
    const isUrl =
      !!avatarId &&
      (avatarId.startsWith("http://") || avatarId.startsWith("https://"));
    if (isUrl) {
      return (
        <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/60 flex-shrink-0 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
          <Image
            src={avatarId as string}
            alt={name ?? "avatar"}
            width={40}
            height={40}
            className="object-cover"
            unoptimized
          />
        </div>
      );
    }
    return (
      <div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 bg-[#006666] shadow-[2px_2px_6px_#004d4d,-1px_-1px_4px_#008080]">
        {name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    );
  };

  // Pagination helper
  const pagesToShow: (number | string)[] = [];
  const maxVisible = 5;
  if (pages <= maxVisible) {
    for (let i = 1; i <= pages; i++) pagesToShow.push(i);
  } else if (page <= 3) {
    for (let i = 1; i <= 4; i++) pagesToShow.push(i);
    pagesToShow.push("…");
    pagesToShow.push(pages);
  } else if (page >= pages - 2) {
    pagesToShow.push(1);
    pagesToShow.push("…");
    for (let i = pages - 3; i <= pages; i++) pagesToShow.push(i);
  } else {
    pagesToShow.push(1);
    pagesToShow.push("…");
    for (let i = page - 1; i <= page + 1; i++) pagesToShow.push(i);
    pagesToShow.push("…");
    pagesToShow.push(pages);
  }

  return (
    <>
      <div className="space-y-4">
        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={NEU_ERROR_BOX}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                <span className="text-[#FF2157] font-bold text-xs">!</span>
              </div>
              <div>
                <p className="text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#FF2157] uppercase tracking-wide">
                  Error Loading Employees
                </p>
                <p className={`${NEU_MONO_MUTED} mt-0.5`}>{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Table */}
        <div className="relative">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={NEU_LOADING_OVERLAY}
            >
              <div className={NEU_LOADING_PILL}>
                <div className="relative h-5 w-5">
                  <div className="absolute inset-0 border-2 border-[#E7E5E4] rounded-full shadow-[inset_1px_1px_3px_#c8c6c5]" />
                  <div className="absolute inset-0 border-2 border-[#006666] border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]">
                  Loading…
                </p>
              </div>
            </motion.div>
          )}

          <div className={NEU_TABLE_WRAP}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#c8c6c5]/60">
                    <th className={NEU_TH}>Employee</th>
                    <th className={`${NEU_TH} hidden sm:table-cell`}>Email</th>
                    <th className={`${NEU_TH} hidden md:table-cell`}>Phone</th>
                    <th className={`${NEU_TH} hidden lg:table-cell`}>Type</th>
                    <th className={`${NEU_TH} text-right`}>Salary</th>
                    <th className={NEU_TH}>Status</th>
                    <th className={`${NEU_TH} hidden xl:table-cell`}>
                      Last Login
                    </th>
                    <th className={`${NEU_TH} hidden xl:table-cell`}>Joined</th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence mode="wait">
                    {items.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={8} className="h-64 text-center">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center gap-4"
                          >
                            <div className={NEU_EMPTY_WELL}>
                              <MdPeople className="h-8 w-8 text-[#1E2938]/30" />
                            </div>
                            <div>
                              <p className="font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] text-sm uppercase tracking-wide">
                                No employees found
                              </p>
                              <p className={`${NEU_MONO_MUTED} mt-1`}>
                                Try adjusting your search or filters
                              </p>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    ) : (
                      items.map((e, index) => (
                        <motion.tr
                          key={e.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, delay: index * 0.02 }}
                          onClick={() => handleRowClick(e.id)}
                          className={NEU_TR_HOVER}
                        >
                          {/* Employee */}
                          <td className={NEU_TD}>
                            <div className="flex items-center gap-3">
                              {renderAvatar(e.user.name, e.avatar)}
                              <div className="min-w-0">
                                <p
                                  className={`${NEU_MONO_TEXT} font-semibold truncate`}
                                >
                                  {e.user.name || "Unknown"}
                                </p>
                                <p className={`${NEU_MONO_MUTED} truncate`}>
                                  {e.user.email || e.contactPhone || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className={`${NEU_TD} hidden sm:table-cell`}>
                            {e.user.email ? (
                              <a
                                href={`mailto:${e.user.email}`}
                                onClick={(ev) => ev.stopPropagation()}
                                className={`${NEU_MONO_MUTED} hover:text-[#006666] truncate block transition-colors duration-150`}
                              >
                                {e.user.email}
                              </a>
                            ) : (
                              <span className={NEU_MONO_MUTED}>—</span>
                            )}
                          </td>

                          {/* Phone */}
                          <td className={`${NEU_TD} hidden md:table-cell`}>
                            {e.contactPhone ? (
                              <a
                                href={`tel:${e.contactPhone}`}
                                onClick={(ev) => ev.stopPropagation()}
                                className={`${NEU_MONO_MUTED} hover:text-[#006666] truncate block transition-colors duration-150`}
                              >
                                {e.contactPhone}
                              </a>
                            ) : (
                              <span className={NEU_MONO_MUTED}>
                                {e.user.phone || "—"}
                              </span>
                            )}
                          </td>

                          {/* Type */}
                          <td className={`${NEU_TD} hidden lg:table-cell`}>
                            <span className={NEU_MONO_TEXT}>
                              {e.employmentType || "—"}
                            </span>
                          </td>

                          {/* Salary */}
                          <td className={`${NEU_TD} text-right`}>
                            <span
                              className={`${NEU_MONO_TEXT} font-semibold tabular-nums`}
                            >
                              {formatCurrency(e.salary, e.currency)}
                            </span>
                          </td>

                          {/* Status */}
                          <td className={NEU_TD}>
                            <span className={getStatusBadgeClass(e.status)}>
                              <span className="relative flex h-2 w-2">
                                {e.status === "active" && (
                                  <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A63D] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A63D]" />
                                  </>
                                )}
                                {e.status === "onLeave" && (
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FE9900]" />
                                )}
                                {e.status !== "active" &&
                                  e.status !== "onLeave" && (
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E2938]/40" />
                                  )}
                              </span>
                              {e.statusBadge?.label || formatStatus(e.status)}
                            </span>
                          </td>

                          {/* Last Login */}
                          <td className={`${NEU_TD} hidden xl:table-cell`}>
                            <span className={`${NEU_MONO_MUTED} tabular-nums`}>
                              {e.lastLogin ? (
                                <time dateTime={e.lastLogin}>
                                  {formatDate(e.lastLogin)}
                                </time>
                              ) : (
                                "Never"
                              )}
                            </span>
                          </td>

                          {/* Joined */}
                          <td className={`${NEU_TD} hidden xl:table-cell`}>
                            <span className={`${NEU_MONO_MUTED} tabular-nums`}>
                              <time dateTime={e.dateOfJoining}>
                                {formatDate(e.dateOfJoining)}
                              </time>
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-1 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <span className={`${NEU_MONO_TEXT} text-sm`}>
              <span className="font-semibold">{items.length}</span>
              <span className="text-[#1E2938]/50"> of </span>
              <span className="font-semibold">{total}</span>
              <span className="text-[#1E2938]/50"> employees</span>
            </span>
            <span className={NEU_MONO_MUTED}>
              Page {page} / {pages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className={NEU_NAV_BTN}
              aria-label="Previous page"
            >
              <MdArrowBack className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {pagesToShow.map((p, idx) =>
                typeof p === "string" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-9 w-9 items-center justify-center text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] text-sm"
                  >
                    {p}
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    disabled={loading}
                    className={page === p ? NEU_PAGE_BTN_ACTIVE : NEU_PAGE_BTN}
                    aria-label={`Page ${p}`}
                    aria-current={page === p ? "page" : undefined}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => onPageChange(Math.min(pages, page + 1))}
              disabled={page >= pages || loading}
              className={NEU_NAV_BTN}
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <MdArrowForward className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <EmployeeDetailDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        employee={selectedEmployee}
        loading={dialogLoading}
      />
    </>
  );
}
