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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type SortOrder = "asc" | "desc";

interface EmployeeTableProps {
    list: EmployeesListResponse | null;
    loading: boolean;
    onRowClick: (id: string) => void;
    onSort: (sortBy: EmployeeSortKey, sortOrder: SortOrder) => void;
    sortBy: EmployeeSortKey;
    sortOrder: SortOrder;
    onRetryPayment?: (employeeId: string) => void;
    retryLoading?: string; // employeeId for which retry is loading
}

// Primary fields shown in main row
const primaryFields = [
    { key: "user.name", label: "Name", icon: <FaUser className="h-3 w-3" />, width: "w-48" },
    { key: "user.email", label: "Email", icon: <FaEnvelope className="h-3 w-3" />, width: "w-56" },
    { key: "status", label: "Status", icon: <FaUsers className="h-3 w-3" />, width: "w-28" },
    { key: "dateOfJoining", label: "Joined", icon: <FaCalendarAlt className="h-3 w-3" />, width: "w-28" },
    { key: "paymentStatus", label: "Payment", icon: <FaCreditCard className="h-3 w-3" />, width: "w-40" },
] as const;

export function EmployeeTable({
    list,
    loading,
    onRowClick,
    onSort,
    sortBy,
    sortOrder,
    onRetryPayment,
    retryLoading
}: EmployeeTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const headers = [
        { key: "accordion", label: "", icon: null, width: "w-10", sortable: false },
        { key: "avatar", label: "", icon: null, width: "w-14", sortable: false },
        ...primaryFields.map(field => ({
            ...field,
            sortable: ["user.name", "user.email", "status", "dateOfJoining", "paymentStatus"].includes(field.key),
        })),
    ];

    const sortToggle = (key: EmployeeSortKey) =>
        onSort(key, sortBy === key ? (sortOrder === "asc" ? "desc" : "asc") : "asc");

    const isSortableKey = (key: string): key is EmployeeSortKey => {
        const sortableKeys: EmployeeSortKey[] = [
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
        return sortableKeys.includes(key as EmployeeSortKey);
    };

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
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                            {headers.map((h) => (
                                <TableHead
                                    key={h.key}
                                    className={cn(
                                        "px-3 py-2.5 text-left",
                                        h.width,
                                    )}
                                >
                                    {h.sortable && isSortableKey(h.key) ? (
                                        <button
                                            type="button"
                                            className={cn(
                                                "group inline-flex items-center gap-1.5 text-left transition-colors duration-200",
                                                "text-xs font-medium uppercase tracking-wide",
                                                sortBy === h.key ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                                            )}
                                            onClick={() => sortToggle(h.key as EmployeeSortKey)}
                                            aria-label={`Sort by ${h.label}`}
                                        >
                                            <span className="inline-flex items-center gap-1.5">
                                                {h.icon}
                                                <span>{h.label}</span>
                                            </span>

                                            <motion.span
                                                animate={{ rotate: sortBy === h.key && sortOrder === "desc" ? 180 : 0 }}
                                                transition={{ duration: 0.18 }}
                                            >
                                                <ArrowUpDown
                                                    className={cn(
                                                        "h-3 w-3 transition-colors duration-200",
                                                        sortBy === h.key ? "text-foreground" : "text-muted-foreground/50 group-hover:text-muted-foreground"
                                                    )}
                                                />
                                            </motion.span>
                                        </button>
                                    ) : h.key !== "accordion" && h.key !== "avatar" ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {h.icon}
                                            <span>{h.label}</span>
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
                                        key={`skeleton-${i}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b border-border/30 last:border-0"
                                    >
                                        <TableCell className="w-10 px-3 py-3">
                                            <Skeleton className="h-4 w-4 rounded" />
                                        </TableCell>
                                        <TableCell className="w-14 px-3 py-3">
                                            <Skeleton className="h-9 w-9 rounded-full" />
                                        </TableCell>
                                        {headers.slice(2).map((h, j) => (
                                            <TableCell
                                                key={j}
                                                className={cn("px-3 py-3", h.width)}
                                            >
                                                <Skeleton className="h-4 w-full rounded-md" />
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
                                    <TableCell colSpan={headers.length} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-sm font-medium text-muted-foreground">No employees found</p>
                                            <p className="text-xs text-muted-foreground/70">Try adjusting your filters or search criteria</p>
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

interface EmployeeAccordionRowProps {
    row: EmployeeListItemDTO;
    onClick: (id: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
    onRetryPayment?: (employeeId: string) => void;
    retryLoading?: boolean;
}

function EmployeeAccordionRow({
    row,
    onClick,
    isExpanded,
    onToggle,
    onRetryPayment,
    retryLoading = false,
}: EmployeeAccordionRowProps) {
    const statusConfig = {
        active: { variant: "default" as const, label: "Active" },
        onLeave: { variant: "secondary" as const, label: "On Leave" },
        suspended: { variant: "destructive" as const, label: "Suspended" },
        terminated: { variant: "outline" as const, label: "Terminated" },
    };

    const employmentTypeConfig = {
        full_time: { label: "Full Time", color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950" },
        part_time: { label: "Part Time", color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950" },
        contract: { label: "Contract", color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950" },
        intern: { label: "Intern", color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950" },
    };

    const paymentModeConfig = {
        auto: { label: "Auto", color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400" },
        manual: { label: "Manual", color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
    };

    const statusData = (statusConfig as Record<string, { variant: string; label: string }>)[row.status] ?? {
        variant: "outline",
        label: row.status ?? "Unknown",
    };

    const employmentTypeData = (employmentTypeConfig as Record<string, { label: string; color: string }>)[row.employmentType || 'full_time'] ?? {
        label: row.employmentType || "Unknown",
        color: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950"
    };

    const paymentModeData = (paymentModeConfig as Record<string, { label: string; color: string }>)[row.paymentMode || 'manual'] ?? {
        label: row.paymentMode || "Unknown",
        color: "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-400"
    };

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onRetryPayment && !retryLoading) {
            onRetryPayment(row.id);
        }
    };

    return (
        <>
            {/* Primary Row */}
            <TableRow
                className={cn(
                    "group cursor-pointer border-b border-border/30 transition-colors duration-150 hover:bg-muted/50",
                    isExpanded && "bg-muted/30",
                    row.isDeleted && "opacity-60"
                )}
                onClick={() => onClick(row.id)}
            >
                {/* Accordion Toggle */}
                <TableCell className="w-10 px-2 py-3">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                            className="h-9 w-9 rounded-full object-cover ring-2 ring-border/50 transition-all duration-200 group-hover:ring-border"
                        />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 ring-2 ring-border/50 transition-all duration-200 group-hover:ring-border">
                            <span className="text-[10px] font-semibold text-muted-foreground">
                                {row.user.name?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                    )}
                </TableCell>

                {/* Name */}
                <TableCell className="w-48 px-3 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground/90 line-clamp-1">
                            {row.user.name}
                        </span>
                        {row.isDeleted && (
                            <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                                Deleted
                            </Badge>
                        )}
                    </div>
                </TableCell>

                {/* Email */}
                <TableCell className="w-56 px-3 py-3">
                    <span className="text-xs text-foreground/70 line-clamp-1">
                        {row.user.email}
                    </span>
                </TableCell>

                {/* Status */}
                <TableCell className="w-28 px-3 py-3">
                    <Badge
                        variant={statusData.variant as "default" | "secondary" | "destructive" | "outline" | null | undefined}
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                    >
                        {statusData.label}
                    </Badge>
                </TableCell>

                {/* Date of Joining */}
                <TableCell className="w-28 px-3 py-3">
                    <span className="text-xs text-foreground/70 whitespace-nowrap">
                        {formatDate(row.dateOfJoining)}
                    </span>
                </TableCell>

                {/* Payment Status */}
                <TableCell className="w-40 px-3 py-3" onClick={(e) => e.stopPropagation()}>
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
                        <span className="text-xs text-muted-foreground">No payment</span>
                    )}
                </TableCell>
            </TableRow>

            {/* Accordion Content - Secondary Details */}
            <AnimatePresence>
                {isExpanded && (
                    <TableRow className="border-b border-border/20 bg-muted/10">
                        <TableCell colSpan={7} className="p-0">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="px-4 py-4">
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                        {/* Employment Type */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Employment Type
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "w-fit rounded-full px-2.5 py-0.5 text-[10px] font-medium border-0",
                                                    employmentTypeData.color
                                                )}
                                            >
                                                {employmentTypeData.label}
                                            </Badge>
                                        </div>

                                        {/* Salary */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Salary
                                            </p>
                                            <p className="text-xs font-medium text-foreground/90">
                                                {typeof row.salary === "number" ? (
                                                    <>
                                                        <span className="text-[10px] text-muted-foreground">{row.currency}</span>{" "}
                                                        {row.salary.toLocaleString()}
                                                    </>
                                                ) : (
                                                    <span className="text-muted-foreground">Not set</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Payment Mode */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Payment Mode
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "w-fit rounded-full px-2.5 py-0.5 text-[10px] font-medium border-0",
                                                    paymentModeData.color
                                                )}
                                            >
                                                {paymentModeData.label}
                                            </Badge>
                                        </div>

                                        {/* Date of Leaving */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Date Left
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                {row.dateOfLeaving ? formatDate(row.dateOfLeaving) : (
                                                    <span className="text-green-600 dark:text-green-400">Active</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Shift */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Shift
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                {row.shiftSummary || <span className="text-muted-foreground">Not assigned</span>}
                                            </p>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Phone
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                {row.contactPhone || row.user.phone || <span className="text-muted-foreground">-</span>}
                                            </p>
                                        </div>

                                        {/* Last Login */}
                                        {row.lastLogin && (
                                            <div className="space-y-1.5">
                                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                    Last Login
                                                </p>
                                                <p className="text-xs text-foreground/70">
                                                    {formatDateTime(row.lastLogin)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Created At */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Created
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                {formatDate(row.createdAt)}
                                            </p>
                                        </div>

                                        {/* Updated At */}
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                Updated
                                            </p>
                                            <p className="text-xs text-foreground/70">
                                                {formatDate(row.updatedAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Details (if exists and failed/pending) */}
                                    {row.currentMonthPayment && row.currentMonthPayment.status !== "paid" && (
                                        <div className="mt-4 pt-4 border-t border-border/30">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                    Payment Details
                                                </p>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                                    {row.currentMonthPayment.dueDate && (
                                                        <div>
                                                            <p className="text-[9px] text-muted-foreground">Due Date</p>
                                                            <p className="text-xs text-foreground/70">{formatDate(row.currentMonthPayment.dueDate)}</p>
                                                        </div>
                                                    )}
                                                    {row.currentMonthPayment.attemptedAt && (
                                                        <div>
                                                            <p className="text-[9px] text-muted-foreground">Last Attempt</p>
                                                            <p className="text-xs text-foreground/70">{formatDateTime(row.currentMonthPayment.attemptedAt)}</p>
                                                        </div>
                                                    )}
                                                    {row.currentMonthPayment.failureReason && (
                                                        <div className="col-span-2">
                                                            <p className="text-[9px] text-muted-foreground">Failure Reason</p>
                                                            <p className="text-xs text-destructive">{row.currentMonthPayment.failureReason}</p>
                                                        </div>
                                                    )}
                                                </div>
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

function formatDate(s?: string | null) {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(s?: string | null) {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export default EmployeeTable;