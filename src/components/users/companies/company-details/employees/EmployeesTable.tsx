"use client";

import Image from "next/image";
import { useState } from "react";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeListItemDTO, EmployeeDetailDTO } from "@/types/employee.types";
import {
    MdArrowBack,
    MdArrowForward,
    MdPeople,
} from "react-icons/md";
import { EmployeeDetailDialog } from "./EmployeeDetailDialog";

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
        force?: boolean | undefined
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

    const formatDate = (
        dateString: string | Date | null | undefined
    ): string => {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
            case "onLeave":
                return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
        }
    };

    const formatStatus = (status: string): string => {
        return status.replace(/([A-Z])/g, " $1").trim();
    };

    const renderAvatar = (name?: string, avatarId?: string) => {
        const isUrl =
            !!avatarId &&
            (avatarId.startsWith("http://") || avatarId.startsWith("https://"));
        if (isUrl) {
            return (
                <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
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
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-semibold text-white text-sm flex-shrink-0 shadow-sm">
                {name?.charAt(0)?.toUpperCase() || "?"}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-4">
                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                                    Error Loading Employees
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="relative">
                    {/* Loading Overlay */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-20 rounded-lg flex items-center justify-center"
                        >
                            <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-5 w-5">
                                        <div className="absolute inset-0 border-2 border-gray-200 dark:border-gray-700 rounded-full" />
                                        <div className="absolute inset-0 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        Loading employees...
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Table Container */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                        <TableHead className="h-11 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">
                                            Employee
                                        </TableHead>
                                        <TableHead className="h-11 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide hidden sm:table-cell">
                                            Email
                                        </TableHead>
                                        <TableHead className="h-11 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide hidden md:table-cell">
                                            Phone
                                        </TableHead>
                                        <TableHead className="h-11 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide hidden lg:table-cell">
                                            Type
                                        </TableHead>
                                        <TableHead className="h-11 px-4 text-right align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">
                                            Salary
                                        </TableHead>
                                        <TableHead className="h-11 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">
                                            Status
                                        </TableHead>
                                        <TableHead className="h-11 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide hidden xl:table-cell">
                                            Last Login
                                        </TableHead>
                                        <TableHead className="h-11 px-4 text-left align-middle font-medium text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide hidden xl:table-cell">
                                            Joined
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <AnimatePresence mode="wait">
                                        {items.length === 0 && !loading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-64 text-center">
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="flex flex-col items-center justify-center gap-3"
                                                    >
                                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                            <MdPeople className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                                No employees found
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                Try adjusting your search or filters
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((e, index) => (
                                                <motion.tr
                                                    key={e.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{
                                                        duration: 0.15,
                                                        delay: index * 0.02,
                                                    }}
                                                    onClick={() => handleRowClick(e.id)}
                                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group"
                                                >
                                                    {/* Employee */}
                                                    <TableCell className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {renderAvatar(e.user.name, e.avatar)}
                                                            <div className="min-w-0">
                                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                                    {e.user.name || "Unknown"}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    {e.user.email || e.contactPhone || "—"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Email */}
                                                    <TableCell className="px-4 py-4 hidden sm:table-cell">
                                                        {e.user.email ? (
                                                            <a
                                                                href={`mailto:${e.user.email}`}
                                                                onClick={(ev) => ev.stopPropagation()}
                                                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                                                            >
                                                                {e.user.email}
                                                            </a>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 dark:text-gray-600">—</span>
                                                        )}
                                                    </TableCell>

                                                    {/* Phone */}
                                                    <TableCell className="px-4 py-4 hidden md:table-cell">
                                                        {e.contactPhone ? (
                                                            <a
                                                                href={`tel:${e.contactPhone}`}
                                                                onClick={(ev) => ev.stopPropagation()}
                                                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                                                            >
                                                                {e.contactPhone}
                                                            </a>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 dark:text-gray-600">
                                                                {e.user.phone || "—"}
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    {/* Type */}
                                                    <TableCell className="px-4 py-4 hidden lg:table-cell">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {e.employmentType || "—"}
                                                        </span>
                                                    </TableCell>

                                                    {/* Salary */}
                                                    <TableCell className="px-4 py-4 text-right">
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                                                            {formatCurrency(e.salary, e.currency)}
                                                        </span>
                                                    </TableCell>

                                                    {/* Status */}
                                                    <TableCell className="px-4 py-4">
                                                        <Badge
                                                            className={`${getStatusColor(
                                                                e.status
                                                            )} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium text-xs`}
                                                        >
                                                            <span className="relative flex h-2 w-2">
                                                                {e.status === "active" && (
                                                                    <>
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                                                    </>
                                                                )}
                                                                {e.status === "onLeave" && (
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                                                                )}
                                                                {e.status !== "active" && e.status !== "onLeave" && (
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500" />
                                                                )}
                                                            </span>
                                                            {e.statusBadge?.label || formatStatus(e.status)}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Last Login */}
                                                    <TableCell className="px-4 py-4 hidden xl:table-cell">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                                                            {e.lastLogin ? (
                                                                <time dateTime={e.lastLogin}>
                                                                    {formatDate(e.lastLogin)}
                                                                </time>
                                                            ) : (
                                                                "Never"
                                                            )}
                                                        </span>
                                                    </TableCell>

                                                    {/* Joined */}
                                                    <TableCell className="px-4 py-4 hidden xl:table-cell">
                                                        <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                                                            <time dateTime={e.dateOfJoining}>
                                                                {formatDate(e.dateOfJoining)}
                                                            </time>
                                                        </span>
                                                    </TableCell>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-6">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-semibold">{items.length}</span> of{" "}
                            <span className="font-semibold">{total}</span> employees
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Page {page} of {pages}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page <= 1 || loading}
                            className="h-9 px-3 gap-1"
                        >
                            <MdArrowBack className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>

                        <div className="flex items-center gap-1">
                            {(() => {
                                const pagesToShow: (number | string)[] = [];
                                const maxVisible = 5;
                                
                                if (pages <= maxVisible) {
                                    for (let i = 1; i <= pages; i++) {
                                        pagesToShow.push(i);
                                    }
                                } else {
                                    if (page <= 3) {
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
                                }

                                return pagesToShow.map((p, idx) => {
                                    if (typeof p === "string") {
                                        return (
                                            <span
                                                key={`ellipsis-${idx}`}
                                                className="flex h-9 w-9 items-center justify-center text-gray-400"
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
                                            className="h-9 w-9 p-0"
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
                            className="h-9 px-3 gap-1"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <MdArrowForward className="h-4 w-4" />
                        </Button>
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