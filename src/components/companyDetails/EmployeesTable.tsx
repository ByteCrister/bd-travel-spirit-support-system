// components/company/EmployeesTable.tsx

"use client";

import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { EmployeeListItemDTO, EmployeeDetailDTO } from "@/types/employee.types";
import { MdArrowBack, MdArrowForward, MdPeople, MdMoreVert } from "react-icons/md";
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
    fetchEmployeeDetail: (employeeId: string, force?: boolean | undefined) => Promise<EmployeeDetailDTO>;
}

export function EmployeesTable({
    items,
    total,
    page,
    pages,
    fetchEmployeeDetail,
    loading,
    error,
    onPageChange
}: Props) {
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetailDTO | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);

    const handleRowClick = async (employeeId: string) => {
        setDialogOpen(true);
        setDialogLoading(true);
        try {
            const employee = await fetchEmployeeDetail(employeeId);
            setSelectedEmployee(employee);
        } catch (error) {
            console.error("Failed to fetch employee details:", error);
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            // Clear selected employee after animation completes
            setTimeout(() => setSelectedEmployee(null), 200);
        }
    };

    const formatDate = (dateString: string | Date | null | undefined): string => {
        if (!dateString) return "—";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "—";
            return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
        } catch {
            return "—";
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "active":
                return "default";
            case "onLeave":
                return "secondary";
            default:
                return "outline";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
            case "onLeave":
                return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
            default:
                return "bg-slate-50 text-slate-700 dark:bg-slate-950/50 dark:text-slate-300 border-slate-200 dark:border-slate-800/50";
        }
    };

    const formatStatus = (status: string): string => {
        return status.replace(/([A-Z])/g, " $1").trim();
    };

    return (
        <>
            <div className="space-y-6">
                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/30 dark:to-red-950/10 border border-red-200 dark:border-red-900/50 rounded-xl p-4 shadow-sm"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
                        <div className="relative flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-red-900 dark:text-red-200">Error Loading Employees</p>
                                <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{error}</p>
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
                            className="absolute inset-0 bg-background/80 backdrop-blur-md z-10 rounded-2xl flex items-center justify-center"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-4 bg-card/80 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl border border-border/50"
                            >
                                <div className="relative">
                                    <div className="h-12 w-12 border-4 border-primary/20 rounded-full" />
                                    <div className="absolute inset-0 h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                                <p className="text-sm font-semibold text-foreground">Loading employees...</p>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Premium Table Container */}
                    <div className="relative rounded-2xl border border-border/40 bg-card overflow-hidden shadow-xl">
                        {/* Decorative gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02] pointer-events-none" />
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <div className="overflow-x-auto">
                            <Table className="w-full table-fixed">
                                <TableHeader>
                                    <TableRow className="border-b border-border/40 bg-muted/40 hover:bg-muted/40 backdrop-blur-sm">
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[150px]">Employee Name</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[120px]">Role</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[120px]">Sub-Role</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[120px]">Position</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[140px]">Department</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[120px]">Status</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[140px]">Joined Date</TableHead>
                                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-left h-12 min-w-[140px]">Last Updated</TableHead>
                                        <TableHead className="w-[50px] h-12"> </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    <AnimatePresence mode="wait">
                                        {items.length === 0 && !loading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="h-80 text-center">
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="flex flex-col items-center justify-center gap-4"
                                                    >
                                                        <div className="relative">
                                                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-inner">
                                                                <MdPeople className="h-12 w-12 text-muted-foreground/40" />
                                                            </div>
                                                            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                                                                <span className="text-xs text-muted-foreground">0</span>
                                                            </div>
                                                        </div>

                                                        <div className="text-center space-y-2">
                                                            <p className="font-bold text-lg text-foreground">No Employees Found</p>
                                                            <p className="text-sm text-muted-foreground max-w-sm">
                                                                We couldn&apos;t find any employees matching your criteria. Try adjusting your filters or search terms.
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((e, index) => (
                                                <motion.tr
                                                    key={e.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        delay: index * 0.05,
                                                        ease: [0.4, 0, 0.2, 1],
                                                    }}
                                                    onClick={() => handleRowClick(e.id)}
                                                    className="border-b border-border/30 hover:bg-muted/60 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                                                >
                                                    <TableCell className="font-semibold text-foreground text-left align-middle h-16 min-w-0">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 font-bold text-primary text-sm border-2 border-primary/10 group-hover:border-primary/30 transition-colors">
                                                                {e.fullName?.charAt(0)?.toUpperCase() || "?"}
                                                            </div>
                                                            <span className="group-hover:text-primary transition-colors truncate">{e.fullName || "Unknown"}</span>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-foreground/80 font-medium text-left align-middle h-16 min-w-0 whitespace-nowrap">
                                                        {e.role || "—"}
                                                    </TableCell>

                                                    <TableCell className="text-foreground/70 text-left align-middle h-16 min-w-0 whitespace-nowrap">
                                                        {e.subRole || "—"}
                                                    </TableCell>

                                                    <TableCell className="text-foreground/70 text-left align-middle h-16 min-w-0 whitespace-nowrap">
                                                        {e.position || "—"}
                                                    </TableCell>

                                                    <TableCell className="text-left align-middle h-16 min-w-0">
                                                        {e.department ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold border border-border/50 shadow-sm whitespace-nowrap truncate">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                                <span className="truncate">{e.department}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">No department</span>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className="text-left align-middle h-16 min-w-0">
                                                        <Badge
                                                            variant={getStatusVariant(e.status)}
                                                            className={`${getStatusColor(e.status)} font-semibold capitalize shadow-sm border px-3 py-1 transition-all duration-200 group-hover:shadow-md whitespace-nowrap inline-flex items-center min-w-0`}
                                                        >
                                                            <span className="relative flex h-2 w-2 mr-2 flex-shrink-0">
                                                                {e.status === "active" && (
                                                                    <>
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" />
                                                                    </>
                                                                )}
                                                                {e.status === "onLeave" && <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-sm" />}
                                                                {e.status !== "active" && e.status !== "onLeave" && <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500 shadow-sm" />}
                                                            </span>
                                                            <span className="truncate">{formatStatus(e.status)}</span>
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="text-sm text-muted-foreground tabular-nums text-left align-middle h-16 min-w-0 whitespace-nowrap">
                                                        <time dateTime={e.dateOfJoining}>{formatDate(e.dateOfJoining)}</time>
                                                    </TableCell>

                                                    <TableCell className="text-sm text-muted-foreground tabular-nums text-left align-middle h-16 min-w-0 whitespace-nowrap">
                                                        <time dateTime={e.updatedAt}>{formatDate(e.updatedAt)}</time>
                                                    </TableCell>

                                                    <TableCell className="text-center align-middle h-16 w-[50px]">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Additional menu actions can be added here
                                                            }}
                                                        >
                                                            <MdMoreVert className="h-4 w-4" />
                                                        </Button>
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

                {/* Premium Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    {/* Left: summary */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-border/50 bg-gradient-to-b from-white/60 to-muted/30 dark:from-slate-900/60 dark:to-slate-900/40 shadow-sm">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary/80 shadow-sm flex-shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">{items.length} <span className="font-normal text-muted-foreground">of</span> {total}</span>
                                <span className="text-xs text-muted-foreground">Results</span>
                            </div>
                        </div>

                        <div className="h-px w-6 bg-border/40 rounded" />

                        <div className="text-sm text-muted-foreground">
                            <span className="mr-2">Page</span>
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-muted/30 border border-border/50">
                                <span className="font-medium text-foreground">{page}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="font-medium text-foreground">{pages}</span>
                            </span>
                        </div>
                    </div>

                    {/* Right: controls */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, page - 1))}
                            disabled={page <= 1 || loading}
                            className="px-3 py-2 rounded-md border border-border/40 hover:bg-muted/40 disabled:opacity-40 transition"
                            aria-label="Previous page"
                        >
                            <MdArrowBack className="h-4 w-4" />
                            <span className="hidden sm:inline ml-1 text-sm font-medium">Previous</span>
                        </Button>

                        <nav aria-label="Pagination" className="flex items-center gap-2">
                            {/* compact first / ellipsis / windowed pages / ellipsis / last */}
                            {(() => {
                                const pagesToShow: (number | string)[] = [];
                                const max = 7;
                                if (pages <= max) {
                                    for (let i = 1; i <= pages; i++) pagesToShow.push(i);
                                } else {
                                    const start = Math.max(2, page - 2);
                                    const end = Math.min(pages - 1, page + 2);
                                    pagesToShow.push(1);
                                    if (start > 2) pagesToShow.push("…");
                                    for (let i = start; i <= end; i++) pagesToShow.push(i);
                                    if (end < pages - 1) pagesToShow.push("…");
                                    pagesToShow.push(pages);
                                }
                                return pagesToShow.map((p, idx) => {
                                    if (typeof p === "string") {
                                        return (
                                            <span key={`ell-${idx}`} className="inline-flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
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
                                            className={`h-9 w-9 p-0 rounded-md text-sm font-medium transition-transform ${isActive ? "scale-105 shadow" : "hover:scale-105"}`}
                                            aria-current={isActive ? "page" : undefined}
                                            aria-label={`Go to page ${p}`}
                                        >
                                            {p}
                                        </Button>
                                    );
                                });
                            })()}
                        </nav>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(Math.min(pages, page + 1))}
                            disabled={page >= pages || loading}
                            className="px-3 py-2 rounded-md border border-border/40 hover:bg-muted/40 disabled:opacity-40 transition"
                            aria-label="Next page"
                        >
                            <span className="hidden sm:inline mr-1 text-sm font-medium">Next</span>
                            <MdArrowForward className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Employee Detail Dialog */}
            <EmployeeDetailDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                employee={selectedEmployee}
                loading={dialogLoading}
            />
        </>
    );
}