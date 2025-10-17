// components/employees/EmployeeTable.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import {
    FaUser,
    FaEnvelope,
    FaBriefcase,
    FaUsers,
    FaStar,
    FaCalendarAlt,
    FaMoneyBill,
} from "react-icons/fa";

import { cn } from "@/lib/utils";
import { EmployeesListResponse, EmployeeListItemDTO, EmployeeSortKey } from "@/types/employee.types";

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

type SortOrder = "asc" | "desc";

export function EmployeeTable({
    list,
    loading,
    onRowClick,
    onSort,
    sortBy,
    sortOrder,
}: {
    list: EmployeesListResponse | null;
    loading: boolean;
    onRowClick: (id: string) => void;
    onSort: (sortBy: EmployeeSortKey, sortOrder: SortOrder) => void;
    sortBy: EmployeeSortKey;
    sortOrder: SortOrder;
}) {
    const headers: {
        key: EmployeeSortKey | "salary";
        label: string;
        icon?: React.ReactNode;
        hideOnMobile?: boolean;
        width?: string;
    }[] = [
            { key: "user.name", label: "Name", icon: <FaUser className="h-3 w-3" />, width: "w-48" },
            { key: "user.email", label: "Email", icon: <FaEnvelope className="h-3 w-3" />, width: "w-56" },
            { key: "role", label: "Role", icon: <FaBriefcase className="h-3 w-3" />, width: "w-36" },
            { key: "position", label: "Position", icon: <FaBriefcase className="h-3 w-3" />, width: "w-40" },
            { key: "status", label: "Status", icon: <FaUsers className="h-3 w-3" />, width: "w-28" },
            { key: "rating", label: "Rating", icon: <FaStar className="h-3 w-3" />, width: "w-20" },
            { key: "dateOfJoining", label: "Joined", icon: <FaCalendarAlt className="h-3 w-3" />, width: "w-28" },
            { key: "salary", label: "Salary", icon: <FaMoneyBill className="h-3 w-3" />, hideOnMobile: true, width: "w-32" },
        ];

    const sortToggle = (key: EmployeeSortKey) =>
        onSort(key, sortBy === key ? (sortOrder === "asc" ? "desc" : "asc") : "asc");

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/60 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-14 px-3 py-2.5 text-left">
                                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Avatar
                                </span>
                            </TableHead>

                            {headers.map((h) => (
                                <TableHead
                                    key={h.key}
                                    className={cn(
                                        "px-3 py-2.5 text-left",
                                        h.width,
                                        h.hideOnMobile && "hidden lg:table-cell"
                                    )}
                                >
                                    {h.key !== "salary" ? (
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
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {h.icon}
                                            <span>{h.label}</span>
                                        </span>
                                    )}
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
                                        <TableCell className="w-14 px-3 py-3">
                                            <Skeleton className="h-9 w-9 rounded-full" />
                                        </TableCell>

                                        {headers.map((h, j) => (
                                            <TableCell
                                                key={j}
                                                className={cn(
                                                    "px-3 py-3",
                                                    h.width,
                                                    h.hideOnMobile && "hidden lg:table-cell"
                                                )}
                                            >
                                                <Skeleton className="h-4 w-full rounded-md" />
                                            </TableCell>
                                        ))}
                                    </motion.tr>
                                ))
                            ) : list && list.docs.length > 0 ? (
                                list.docs.map((row) => <EmployeeTableRow key={row.id} row={row} onClick={onRowClick} />)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={headers.length + 1} className="px-6 py-16 text-center">
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

function EmployeeTableRow({ row, onClick }: { row: EmployeeListItemDTO; onClick: (id: string) => void }) {
    const statusConfig = {
        active: { variant: "default" as const, label: "Active" },
        onLeave: { variant: "secondary" as const, label: "On Leave" },
        suspended: { variant: "destructive" as const, label: "Suspended" },
        terminated: { variant: "outline" as const, label: "Terminated" },
    };

    const statusData = (statusConfig as Record<string, { variant: string; label: string }>)[row.status] ?? {
        variant: "outline",
        label: row.status ?? "Unknown",
    };

    return (
        <motion.tr
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)", transition: { duration: 0.15 } }}
            className="group cursor-pointer border-b border-border/30 transition-colors duration-150 last:border-0"
            onClick={() => onClick(row.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(row.id);
                }
            }}
        >
            <TableCell className="w-14 px-3 py-3">
                {row.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={row.user.avatar}
                        alt={`${row.user.name} avatar`}
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

            <TableCell className="w-48 px-3 py-3">
                <span className="text-sm font-medium text-foreground/90 line-clamp-1">
                    {row.user.name}
                </span>
            </TableCell>

            <TableCell className="w-56 px-3 py-3">
                <span className="text-xs text-foreground/70 line-clamp-1">
                    {row.user.email}
                </span>
            </TableCell>

            <TableCell className="hidden w-32 px-3 py-3 lg:table-cell">
                <span className="text-xs text-foreground/70 line-clamp-1">
                    {row.subRole ?? "-"}
                </span>
            </TableCell>

            <TableCell className="w-40 px-3 py-3">
                <span className="text-xs text-foreground/90 line-clamp-1">
                    {row.position ?? "-"}
                </span>
            </TableCell>

            <TableCell className="w-28 px-3 py-3">
                <Badge
                    variant={statusData.variant as "default" | "secondary" | "destructive" | "outline" | null | undefined}
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                >
                    {statusData.label}
                </Badge>
            </TableCell>

            <TableCell className="w-20 px-3 py-3">
                <span className="text-xs text-foreground/90">
                    {typeof row.rating === "number" ? (
                        <span className="inline-flex items-center gap-0.5">
                            <span className="font-semibold">{row.rating}</span>
                            <span className="text-[10px] text-muted-foreground">/5</span>
                        </span>
                    ) : (
                        "-"
                    )}
                </span>
            </TableCell>

            <TableCell className="w-28 px-3 py-3">
                <span className="text-xs text-foreground/70 whitespace-nowrap">
                    {formatDate(row.dateOfJoining)}
                </span>
            </TableCell>

            <TableCell className="hidden w-32 px-3 py-3 lg:table-cell">
                <span className="text-xs font-medium text-foreground/90 whitespace-nowrap">
                    {typeof row.salary === "number" ? (
                        <>
                            <span className="text-[10px] text-muted-foreground">
                                {row.salaryCurrency ?? ""}
                            </span>{" "}
                            {row.salary.toLocaleString()}
                        </>
                    ) : (
                        "-"
                    )}
                </span>
            </TableCell>
        </motion.tr>
    );
}

function formatDate(s?: string | null) {
    if (!s) return "-";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default EmployeeTable;