"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import {
  FaUser,
  FaEnvelope,
  FaUsers,
  FaCalendarAlt,
  FaCreditCard,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import {
  EmployeesListResponse,
  EmployeeListItemDTO,
  EmployeeSortKey,
} from "@/types/employee/employee.types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Image from "next/image";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 overflow-hidden";

const NEU_TABLE_HEADER = "bg-[#E7E5E4] shadow-[inset_0_-3px_6px_#c8c6c5]";

const NEU_TABLE_ROW_HOVER =
  "cursor-pointer transition-colors duration-150 hover:bg-[#006666]/5 border-b border-[#1E2938]/5 last:border-0";

const NEU_TABLE_ROW_EXPANDED = "bg-[#006666]/5";

const NEU_BTN_ICON_SM =
  "flex h-7 w-7 items-center justify-center rounded-lg bg-[#E7E5E4] text-[#1E2938]/40 " +
  "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#1E2938]/50 uppercase tracking-widest";

const NEU_BADGE_BASE =
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_SKELETON = "rounded-md bg-[#d0cecd] animate-pulse";

const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] rounded-xl";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";

const NEU_MONO =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/80";
// ───────────────────────────────────────────────────────────────

type SortOrder = "asc" | "desc";

interface EmployeeTableProps {
  list: EmployeesListResponse | null;
  loading: boolean;
  onRowClick: (id: string) => void;
  onSort: (sortBy: EmployeeSortKey, sortOrder: SortOrder) => void;
  sortBy: EmployeeSortKey;
  sortOrder: SortOrder;
  onRetryPayment?: (employeeId: string) => void;
  retryLoading?: string;
}

const primaryFields = [
  {
    key: "user.name",
    label: "Name",
    icon: <FaUser className="h-3 w-3" />,
    width: "w-48",
  },
  {
    key: "user.email",
    label: "Email",
    icon: <FaEnvelope className="h-3 w-3" />,
    width: "w-56",
  },
  {
    key: "status",
    label: "Status",
    icon: <FaUsers className="h-3 w-3" />,
    width: "w-28",
  },
  {
    key: "dateOfJoining",
    label: "Joined",
    icon: <FaCalendarAlt className="h-3 w-3" />,
    width: "w-28",
  },
  {
    key: "paymentStatus",
    label: "Payment",
    icon: <FaCreditCard className="h-3 w-3" />,
    width: "w-40",
  },
] as const;

const SORTABLE_KEYS: EmployeeSortKey[] = [
  "user.name",
  "user.email",
  "status",
  "employmentType",
  "salary",
  "dateOfJoining",
  "dateOfLeaving",
  "createdAt",
  "updatedAt",
  "paymentStatus",
];

const isSortableKey = (k: string): k is EmployeeSortKey =>
  SORTABLE_KEYS.includes(k as EmployeeSortKey);

export function EmployeeTable({
  list,
  loading,
  onRowClick,
  onSort,
  sortBy,
  sortOrder,
  onRetryPayment,
  retryLoading,
}: EmployeeTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const headers = [
    { key: "accordion", label: "", icon: null, width: "w-10", sortable: false },
    { key: "avatar", label: "", icon: null, width: "w-14", sortable: false },
    ...primaryFields.map((f) => ({ ...f, sortable: isSortableKey(f.key) })),
  ];

  const sortToggle = (key: EmployeeSortKey) =>
    onSort(
      key,
      sortBy === key ? (sortOrder === "asc" ? "desc" : "asc") : "asc",
    );

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className={NEU_CARD}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow
              className={`${NEU_TABLE_HEADER} border-b border-[#1E2938]/10`}
            >
              {headers.map((h) => (
                <TableHead
                  key={h.key}
                  className={cn("px-3 py-3 text-left", h.width)}
                >
                  {h.sortable && isSortableKey(h.key) ? (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1.5 transition-colors duration-150",
                        "font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest",
                        sortBy === h.key
                          ? "text-[#006666]"
                          : "text-[#1E2938]/50 hover:text-[#1E2938]",
                      )}
                      onClick={() => sortToggle(h.key as EmployeeSortKey)}
                      aria-label={`Sort by ${h.label}`}
                    >
                      {h.icon}
                      {h.label}
                      <motion.span
                        animate={{
                          rotate:
                            sortBy === h.key && sortOrder === "desc" ? 180 : 0,
                        }}
                        transition={{ duration: 0.18 }}
                      >
                        <ArrowUpDown
                          className={cn(
                            "h-3 w-3",
                            sortBy === h.key
                              ? "text-[#006666]"
                              : "text-[#1E2938]/30",
                          )}
                        />
                      </motion.span>
                    </button>
                  ) : h.key !== "accordion" && h.key !== "avatar" ? (
                    <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#1E2938]/50">
                      {h.icon} {h.label}
                    </span>
                  ) : null}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence mode="wait">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <motion.tr
                    key={`sk-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-[#1E2938]/5 last:border-0"
                  >
                    <TableCell className="w-10 px-3 py-3">
                      <div className={`${NEU_SKELETON} h-7 w-7`} />
                    </TableCell>
                    <TableCell className="w-14 px-3 py-3">
                      <div className={`${NEU_SKELETON} h-9 w-9 rounded-full`} />
                    </TableCell>
                    {headers.slice(2).map((h, j) => (
                      <TableCell key={j} className={cn("px-3 py-3", h.width)}>
                        <div className={`${NEU_SKELETON} h-4 w-full`} />
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : list && list.docs.length > 0 ? (
                list.docs.map((row) => (
                  <EmployeeAccordionRow
                    key={row.id}
                    row={row}
                    onClick={onRowClick}
                    isExpanded={expandedRows.has(row.id)}
                    onToggle={() => toggleRow(row.id)}
                    onRetryPayment={onRetryPayment}
                    retryLoading={retryLoading === row.id}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={headers.length}
                    className="px-6 py-16 text-center"
                  >
                    <div
                      className={`${NEU_SURFACE_INSET_SM} mx-auto max-w-xs py-10 flex flex-col items-center gap-2`}
                    >
                      <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]/40">
                        No employees found
                      </p>
                      <p className={NEU_MUTED}>
                        Try adjusting your filters or search criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Accordion row ───────────────────────────────────────────────

interface EmployeeAccordionRowProps {
  row: EmployeeListItemDTO;
  onClick: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
  onRetryPayment?: (employeeId: string) => void;
  retryLoading?: boolean;
}

const STATUS_CONFIG = {
  active: { label: "Active", cls: "bg-[#00A63D]/10 text-[#00A63D]" },
  onLeave: { label: "On Leave", cls: "bg-[#FE9900]/10 text-[#FE9900]" },
  suspended: { label: "Suspended", cls: "bg-[#FF2157]/10 text-[#FF2157]" },
  terminated: { label: "Terminated", cls: "bg-[#1E2938]/10 text-[#1E2938]/60" },
} as Record<string, { label: string; cls: string }>;

const EMPLOYMENT_TYPE_CONFIG = {
  full_time: { label: "Full Time", cls: "bg-[#006666]/10 text-[#006666]" },
  part_time: { label: "Part Time", cls: "bg-[#FE9900]/10 text-[#FE9900]" },
  contract: { label: "Contract", cls: "bg-[#FF2157]/10 text-[#FF2157]" },
  intern: { label: "Intern", cls: "bg-[#00A63D]/10 text-[#00A63D]" },
} as Record<string, { label: string; cls: string }>;

const PAYMENT_MODE_CONFIG = {
  auto: { label: "Auto", cls: "bg-[#00A63D]/10 text-[#00A63D]" },
  manual: { label: "Manual", cls: "bg-[#006666]/10 text-[#006666]" },
} as Record<string, { label: string; cls: string }>;

function EmployeeAccordionRow({
  row,
  onClick,
  isExpanded,
  onToggle,
  onRetryPayment,
  retryLoading = false,
}: EmployeeAccordionRowProps) {
  const statusData = STATUS_CONFIG[row.status] ?? {
    label: row.status ?? "Unknown",
    cls: "bg-[#1E2938]/10 text-[#1E2938]/60",
  };
  const empTypeData = EMPLOYMENT_TYPE_CONFIG[
    row.employmentType || "full_time"
  ] ?? {
    label: row.employmentType || "Unknown",
    cls: "bg-[#1E2938]/10 text-[#1E2938]/60",
  };
  const payModeData = PAYMENT_MODE_CONFIG[row.paymentMode || "manual"] ?? {
    label: row.paymentMode || "Unknown",
    cls: "bg-[#1E2938]/10 text-[#1E2938]/60",
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRetryPayment && !retryLoading) onRetryPayment(row.id);
  };

  return (
    <>
      {/* Primary row */}
      <TableRow
        className={cn(
          NEU_TABLE_ROW_HOVER,
          isExpanded && NEU_TABLE_ROW_EXPANDED,
          row.isDeleted && "opacity-60",
        )}
        onClick={() => onClick(row.id)}
      >
        {/* Accordion toggle */}
        <TableCell className="w-10 px-2 py-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={NEU_BTN_ICON_SM}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.div>
          </button>
        </TableCell>

        {/* Avatar */}
        <TableCell className="w-14 px-2 py-3">
          {row.user.avatar ? (
            <Image
              src={row.user.avatar}
              alt={`${row.user.name} avatar`}
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-cover shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
              <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#006666]">
                {row.user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </TableCell>

        {/* Name */}
        <TableCell className="w-48 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938] line-clamp-1">
              {row.user.name}
            </span>
            {row.isDeleted && (
              <span
                className={`${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157]`}
              >
                Deleted
              </span>
            )}
          </div>
        </TableCell>

        {/* Email */}
        <TableCell className="w-56 px-3 py-3">
          <span className={`${NEU_MONO} line-clamp-1`}>{row.user.email}</span>
        </TableCell>

        {/* Status */}
        <TableCell className="w-28 px-3 py-3">
          <span className={`${NEU_BADGE_BASE} ${statusData.cls}`}>
            {statusData.label}
          </span>
        </TableCell>

        {/* Joined */}
        <TableCell className="w-28 px-3 py-3">
          <span className={NEU_MUTED}>{formatDate(row.dateOfJoining)}</span>
        </TableCell>

        {/* Payment */}
        <TableCell
          className="w-40 px-3 py-3"
          onClick={(e) => e.stopPropagation()}
        >
          {row.currentMonthPayment ? (
            <PaymentStatusBadge
              status={row.currentMonthPayment.status}
              amount={row.currentMonthPayment.amount}
              currency={row.currency}
              isRetryable={row.currentMonthPayment.status === "failed"}
              onRetry={handleRetry}
              isLoading={retryLoading}
            />
          ) : (
            <span className={NEU_MUTED}>No payment</span>
          )}
        </TableCell>
      </TableRow>

      {/* Expanded accordion */}
      <AnimatePresence>
        {isExpanded && (
          <TableRow className="border-b border-[#1E2938]/5 bg-[#E7E5E4]">
            <TableCell colSpan={7} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-5 py-4">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    <DetailCell label="Employment Type">
                      <span className={`${NEU_BADGE_BASE} ${empTypeData.cls}`}>
                        {empTypeData.label}
                      </span>
                    </DetailCell>

                    <DetailCell label="Salary">
                      <span className={NEU_MONO}>
                        {typeof row.salary === "number" ? (
                          <>
                            {row.currency} {row.salary.toLocaleString()}
                          </>
                        ) : (
                          "Not set"
                        )}
                      </span>
                    </DetailCell>

                    <DetailCell label="Payment Mode">
                      <span className={`${NEU_BADGE_BASE} ${payModeData.cls}`}>
                        {payModeData.label}
                      </span>
                    </DetailCell>

                    <DetailCell label="Date Left">
                      <span
                        className={
                          row.dateOfLeaving
                            ? NEU_MONO
                            : "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#00A63D]"
                        }
                      >
                        {row.dateOfLeaving
                          ? formatDate(row.dateOfLeaving)
                          : "Active"}
                      </span>
                    </DetailCell>

                    <DetailCell label="Shift">
                      <span className={NEU_MONO}>
                        {row.shiftSummary || "Not assigned"}
                      </span>
                    </DetailCell>

                    <DetailCell label="Phone">
                      <span className={NEU_MONO}>
                        {row.contactPhone || row.user.phone || "—"}
                      </span>
                    </DetailCell>

                    {row.lastLogin && (
                      <DetailCell label="Last Login">
                        <span className={NEU_MONO}>
                          {formatDateTime(row.lastLogin)}
                        </span>
                      </DetailCell>
                    )}

                    <DetailCell label="Created">
                      <span className={NEU_MONO}>
                        {formatDate(row.createdAt)}
                      </span>
                    </DetailCell>

                    <DetailCell label="Updated">
                      <span className={NEU_MONO}>
                        {formatDate(row.updatedAt)}
                      </span>
                    </DetailCell>
                  </div>

                  {/* Payment details for failed/pending */}
                  {row.currentMonthPayment &&
                    row.currentMonthPayment.status !== "paid" && (
                      <div className="mt-4 pt-4 border-t border-[#1E2938]/10">
                        <p className={`${NEU_LABEL} mb-2`}>Payment Details</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                          {row.currentMonthPayment.dueDate && (
                            <DetailCell label="Due Date">
                              <span className={NEU_MONO}>
                                {formatDate(row.currentMonthPayment.dueDate)}
                              </span>
                            </DetailCell>
                          )}
                          {row.currentMonthPayment.attemptedAt && (
                            <DetailCell label="Last Attempt">
                              <span className={NEU_MONO}>
                                {formatDateTime(
                                  row.currentMonthPayment.attemptedAt,
                                )}
                              </span>
                            </DetailCell>
                          )}
                          {row.currentMonthPayment.failureReason && (
                            <div className="col-span-2 space-y-1">
                              <p className={NEU_LABEL}>Failure Reason</p>
                              <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]">
                                {row.currentMonthPayment.failureReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p
        className={`font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-widest text-[#1E2938]/40`}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function formatDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default EmployeeTable;
