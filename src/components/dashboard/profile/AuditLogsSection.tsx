"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertCircle,
    Calendar as CalendarIcon,
    ChevronDown,
    Filter,
    Loader2,
    RefreshCw,
    Shield,
    X,
    Clock,
    Activity,
    TrendingUp,
    CalendarDays,
    FileText,
    Database,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCurrentUserStore } from "@/store/current-user.store";
import { AUDIT_ACTION, AuditAction } from "@/constants/audit-action.const";
import { AuditDateFilter, AuditLog } from "@/types/user/current-user.types";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 28,
        },
    },
};

const filterVariants: Variants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
        height: "auto",
        opacity: 1,
        transition: {
            height: { duration: 0.25, ease: "easeInOut" },
            opacity: { duration: 0.2, delay: 0.1 },
        },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: {
            height: { duration: 0.2, ease: "easeInOut" },
            opacity: { duration: 0.15 },
        },
    },
};

export default function AuditLogsSection() {
    const {
        audits,
        auditsMeta,
        auditFilters,
        fetchUserAudits,
        setAuditDateFilter,
        resetAuditFilters,
        loadMoreAudits,
    } = useCurrentUserStore();

    const [date, setDate] = useState<Date>();
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (auditFilters.date) {
            const parsedDate = new Date(auditFilters.date);
            if (!isNaN(parsedDate.getTime())) {
                setDate(parsedDate);
            }
        } else {
            setDate(undefined);
        }

        if (auditFilters.startDate) {
            const parsedStartDate = new Date(auditFilters.startDate);
            if (!isNaN(parsedStartDate.getTime())) {
                setStartDate(parsedStartDate);
            }
        } else {
            setStartDate(undefined);
        }

        if (auditFilters.endDate) {
            const parsedEndDate = new Date(auditFilters.endDate);
            if (!isNaN(parsedEndDate.getTime())) {
                setEndDate(parsedEndDate);
            }
        } else {
            setEndDate(undefined);
        }
    }, [auditFilters.date, auditFilters.startDate, auditFilters.endDate]);

    const handleAccordionChange = useCallback(
        async (value: string) => {
            if (value === "audits") {
                if (auditsMeta.stale || audits.length === 0) {
                    await fetchUserAudits();
                }
            }
        },
        [audits.length, auditsMeta.stale, fetchUserAudits]
    );

    const applyFilters = useCallback(async () => {
        const filters: AuditDateFilter = {};
        if (date) {
            filters.date = date.toISOString();
        } else {
            if (startDate) {
                filters.startDate = startDate.toISOString();
            }
            if (endDate) {
                filters.endDate = endDate.toISOString();
            }
        }

        setAuditDateFilter(filters);
        await fetchUserAudits({ ...filters, force: true });
        setIsFilterOpen(false);
    }, [date, startDate, endDate, setAuditDateFilter, fetchUserAudits]);

    const clearFilters = useCallback(async () => {
        setDate(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        resetAuditFilters();
        await fetchUserAudits({ force: true });
        setIsFilterOpen(false);
    }, [resetAuditFilters, fetchUserAudits]);

    const handleScroll = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(() => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            if (
                scrollTop + clientHeight >= scrollHeight - 100 &&
                !auditsMeta.loading &&
                auditFilters.hasMore
            ) {
                loadMoreAudits();
            }
        }, 200);
    }, [auditsMeta.loading, auditFilters.hasMore, loadMoreAudits]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [handleScroll]);

    const getActionColor = (action: AuditAction) => {
        switch (action.toLowerCase()) {
            case AUDIT_ACTION.CREATE:
                return "bg-slate-100 text-slate-800 border-slate-300";
            case AUDIT_ACTION.UPDATE:
                return "bg-slate-100 text-slate-700 border-slate-300";
            case AUDIT_ACTION.DELETE:
                return "bg-slate-100 text-slate-800 border-slate-300";
            case AUDIT_ACTION.READ:
            default:
                return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    const getActionIcon = (action: AuditAction) => {
        switch (action.toLowerCase()) {
            case AUDIT_ACTION.CREATE:
                return <TrendingUp className="h-3 w-3" />;
            case AUDIT_ACTION.UPDATE:
                return <Activity className="h-3 w-3" />;
            case AUDIT_ACTION.DELETE:
                return <X className="h-3 w-3" />;
            case AUDIT_ACTION.READ:
            default:
                return <Shield className="h-3 w-3" />;
        }
    };

    if (auditsMeta.error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-lg"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                        <AlertCircle className="h-5 w-5 text-slate-700" />
                    </div>
                    <h3 className="font-semibold text-slate-900">Error Loading Audit Logs</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">{auditsMeta.error}</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUserAudits({ force: true })}
                    className="group border-slate-300"
                >
                    <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    Retry
                </Button>
            </motion.div>
        );
    }

    const hasActiveFilters = auditFilters.date || auditFilters.startDate || auditFilters.endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            onValueChange={handleAccordionChange}
            defaultValue="" // Changed from "audits" to "" to initially close
        >
            <AccordionItem value="audits" className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <AccordionTrigger className="hover:no-underline px-6 py-5 hover:bg-slate-50 transition-colors data-[state=open]:border-b data-[state=open]:border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Shield className="h-5 w-5 text-slate-700" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-base text-slate-900">Audit Logs</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Track your account activity and changes
                            </p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-6">
                    {/* Filters */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium flex items-center gap-2 text-sm text-slate-900">
                                <Filter className="h-4 w-4 text-slate-600" />
                                Filters
                            </h4>
                            <div className="flex items-center gap-2">
                                <AnimatePresence>
                                    {hasActiveFilters && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearFilters}
                                                className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                            >
                                                <X className="h-3 w-3 mr-1" />
                                                Clear
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <Button
                                    variant={isFilterOpen ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="h-8 text-xs border-slate-300"
                                >
                                    {isFilterOpen ? "Hide" : "Show"}
                                    <ChevronDown
                                        className={cn(
                                            "h-3.5 w-3.5 ml-1 transition-transform duration-200",
                                            isFilterOpen && "rotate-180"
                                        )}
                                    />
                                </Button>
                            </div>
                        </div>

                        {/* Active filters display */}
                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-3 overflow-hidden"
                                >
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {auditFilters.date && (
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border-slate-300 text-xs"
                                            >
                                                <CalendarIcon className="h-3 w-3" />
                                                {format(new Date(auditFilters.date), "MMM d, yyyy")}
                                            </Badge>
                                        )}
                                        {auditFilters.startDate && (
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border-slate-300 text-xs"
                                            >
                                                <CalendarIcon className="h-3 w-3" />
                                                From: {format(new Date(auditFilters.startDate), "MMM d, yyyy")}
                                            </Badge>
                                        )}
                                        {auditFilters.endDate && (
                                            <Badge
                                                variant="secondary"
                                                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border-slate-300 text-xs"
                                            >
                                                <CalendarIcon className="h-3 w-3" />
                                                To: {format(new Date(auditFilters.endDate), "MMM d, yyyy")}
                                            </Badge>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    variants={filterVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-4 pt-3">
                                        <Separator className="bg-slate-200" />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {/* Single Date */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium flex items-center gap-1.5 text-slate-700">
                                                    <CalendarIcon className="h-3 w-3 text-slate-500" />
                                                    Specific Date
                                                </label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal h-9 bg-white hover:bg-slate-50 border-slate-300 text-sm",
                                                                !date && "text-slate-500"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                            {date ? format(date, "PPP") : "Pick a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={startDate}
                                                            onSelect={(date) => {
                                                                if (!date) return; // <-- handle undefined
                                                                if (endDate && date > endDate) {
                                                                    setEndDate(date); // auto-adjust endDate if startDate goes beyond it
                                                                }
                                                                setStartDate(date);
                                                            }}
                                                            initialFocus
                                                            disabled={(date) => {
                                                                const d = new Date(date);
                                                                d.setHours(0, 0, 0, 0);

                                                                if (d > today) return true;
                                                                if (endDate && d > endDate) return true;
                                                                return false;
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            {/* Start Date */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium flex items-center gap-1.5 text-slate-700">
                                                    <CalendarDays className="h-3 w-3 text-slate-500" />
                                                    Start Date
                                                </label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal h-9 bg-white hover:bg-slate-50 border-slate-300 text-sm",
                                                                !startDate && "text-slate-500"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                            {startDate ? format(startDate, "PPP") : "Start date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        {/* Start Date */}
                                                        <Calendar
                                                            mode="single"
                                                            selected={startDate} //  highlight startDate
                                                            onSelect={(date) => {
                                                                if (!date) return;
                                                                // auto-adjust endDate if startDate goes beyond it
                                                                if (endDate && date > endDate) {
                                                                    setEndDate(date);
                                                                }
                                                                setStartDate(date); //  set startDate
                                                            }}
                                                            initialFocus
                                                            disabled={(date) => {
                                                                const d = new Date(date);
                                                                d.setHours(0, 0, 0, 0);

                                                                if (d > today) return true;       // prevent future dates
                                                                if (endDate && d > endDate) return true;  // cannot be after end date
                                                                return false;
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            {/* End Date */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-medium flex items-center gap-1.5 text-slate-700">
                                                    <CalendarDays className="h-3 w-3 text-slate-500" />
                                                    End Date
                                                </label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal h-9 bg-white hover:bg-slate-50 border-slate-300 text-sm",
                                                                !endDate && "text-slate-500"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                                            {endDate ? format(endDate, "PPP") : "End date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={endDate}
                                                            onSelect={setEndDate}
                                                            initialFocus
                                                            disabled={(date) => {
                                                                const d = new Date(date);
                                                                d.setHours(0, 0, 0, 0);

                                                                if (d > today) return true;        // no future dates
                                                                if (startDate && d < startDate) return true; // not before start
                                                                return false;
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                onClick={applyFilters}
                                                disabled={auditsMeta.loading}
                                                className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 text-white text-sm"
                                            >
                                                {auditsMeta.loading && (
                                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                                )}
                                                Apply Filters
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsFilterOpen(false)}
                                                className="flex-1 h-9 border-slate-300 text-sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Audit Logs Table */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
                                    <TableHead className="font-semibold text-slate-700 text-xs">Action</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-xs">Target</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-xs">Changes</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-xs">IP Address</TableHead>
                                    <TableHead className="font-semibold text-slate-700 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" />
                                            Timestamp
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {auditsMeta.loading && audits.length === 0 ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5}>
                                                <Skeleton className="h-14 w-full rounded bg-slate-100" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : audits.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <FileText className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 text-sm">No audit logs found</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Activity records will appear here when available
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    audits.map((log: AuditLog) => (
                                        <motion.tr
                                            key={log._id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                                        >
                                            <TableCell className="py-3.5">
                                                <Badge
                                                    className={cn(
                                                        "font-medium transition-all duration-200 flex items-center gap-1.5 w-fit text-xs",
                                                        getActionColor(log.action)
                                                    )}
                                                >
                                                    {getActionIcon(log.action)}
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                                                        <Database className="h-3.5 w-3.5 text-slate-600" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs font-medium text-slate-900">{log.targetModel}</span>
                                                        <span className="text-xs text-slate-500 font-mono">{log.target}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3.5">
                                                {log.changes ? (
                                                    <div className="text-xs space-y-1">
                                                        {Object.keys(log.changes.before || {}).length > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                                <Activity className="h-3 w-3" />
                                                                Modified
                                                            </span>
                                                        )}
                                                        {log.note && (
                                                            <span className="block text-slate-600 mt-1">
                                                                {log.note}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-500">{log.note || "—"}</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-3.5">
                                                <code className="text-xs px-2 py-1 rounded bg-slate-100 font-mono text-slate-700 border border-slate-200">
                                                    {log.ip || "—"}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-600 py-3.5 font-mono">
                                                {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}

                                {auditsMeta.loading && audits.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 border-t border-slate-100">
                                            <div className="flex items-center justify-center gap-2 text-slate-600">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm">Loading more...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!auditsMeta.loading && auditFilters.hasMore && audits.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-4 border-t border-slate-100">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => loadMoreAudits()}
                                                className="group h-8 text-xs border-slate-300"
                                            >
                                                <ChevronDown className="h-3.5 w-3.5 mr-1.5 group-hover:translate-y-0.5 transition-transform" />
                                                Load More
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Stats */}
                    {audits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-4 flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
                        >
                            <div className="flex items-center gap-2 text-xs">
                                <Database className="h-3.5 w-3.5 text-slate-600" />
                                <span className="text-slate-600">
                                    Showing <span className="font-semibold text-slate-900">{audits.length}</span> {audits.length === 1 ? 'record' : 'records'}
                                </span>
                            </div>
                            {auditsMeta.total && (
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-600">
                                        Total: <span className="font-semibold text-slate-900">{auditsMeta.total}</span>
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}