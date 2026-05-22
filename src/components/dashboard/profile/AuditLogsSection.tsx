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
import { Separator } from "@/components/ui/separator";
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

// ── Style tokens (neu design system) ──────────────────────────
const STYLES = {
    // Accordion
    accordionItem:
        "rounded-2xl overflow-hidden " +
        "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
        "border border-white/60 bg-[#E7E5E4]",
    accordionTrigger:
        "px-5 sm:px-6 py-4 sm:py-5 hover:no-underline hover:bg-[#006666]/[0.04] " +
        "transition-colors data-[state=open]:border-b data-[state=open]:border-[#1E2938]/10",
    accordionContent: "px-4 sm:px-6 pb-6 pt-5",

    // Trigger inner
    iconWell:
        "shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#006666]/10 " +
        "flex items-center justify-center " +
        "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
    triggerTitle:
        "font-[family-name:var(--font-space-mono)] font-bold text-sm sm:text-base text-[#1E2938]",
    triggerSub:
        "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-0.5",

    // Filter panel
    filterPanel:
        "mb-5 rounded-2xl bg-[#E7E5E4] p-4 " +
        "shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] " +
        "border border-white/40",
    filterHeader: "flex items-center justify-between",
    filterLabel:
        "flex items-center gap-2 text-xs font-bold uppercase tracking-widest " +
        "font-[family-name:var(--font-space-mono)] text-[#1E2938]/60",

    // Buttons
    btnPrimary:
        "flex-1 h-9 rounded-xl bg-[#006666] text-white text-xs " +
        "font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
        "shadow-[3px_3px_6px_#004d4d,-2px_-2px_5px_#008080] " +
        "hover:bg-[#007777] hover:shadow-[5px_5px_10px_#004d4d,-3px_-3px_7px_#008080] " +
        "active:shadow-[inset_2px_2px_5px_#004d4d] " +
        "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
    btnGhost:
        "flex-1 h-9 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-xs " +
        "font-[family-name:var(--font-space-mono)] " +
        "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
        "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
        "transition-all duration-200",
    btnIcon:
        "h-7 px-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938]/60 text-xs " +
        "font-[family-name:var(--font-space-mono)] flex items-center gap-1 " +
        "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] " +
        "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-1px_-1px_3px_#ffffff] " +
        "transition-all duration-200",
    btnToggle: (open: boolean) =>
        `h-7 px-2.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] flex items-center gap-1 transition-all duration-200 ${open
            ? "bg-[#006666] text-white shadow-[inset_2px_2px_5px_#004d4d]"
            : "bg-[#E7E5E4] text-[#1E2938]/70 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]"
        }`,

    // Active filter badge
    filterBadge:
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
        "font-[family-name:var(--font-space-mono)] font-bold " +
        "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",

    // Popover trigger button
    popoverTrigger: (hasValue: boolean) =>
        cn(
            "w-full justify-start text-left font-normal h-9 rounded-xl border-none text-xs " +
            "font-[family-name:var(--font-jetbrains-mono)] " +
            "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
            "focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200",
            !hasValue && "text-[#1E2938]/40"
        ),

    // Filter labels
    fieldLabel:
        "text-xs font-bold uppercase tracking-widest " +
        "font-[family-name:var(--font-space-mono)] text-[#1E2938]/50 " +
        "flex items-center gap-1.5 mb-1.5",

    // Table container
    tableWrap:
        "rounded-2xl overflow-hidden " +
        "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] " +
        "border border-white/60",
    tableHeader:
        "font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-widest " +
        "text-[#1E2938]/50 bg-[#E7E5E4] border-b border-[#1E2938]/10",
    tableRow:
        "bg-[#E7E5E4] border-b border-[#1E2938]/[0.06] last:border-0 " +
        "hover:bg-[#006666]/[0.04] transition-colors duration-150",

    // Target cell icon
    targetIcon:
        "shrink-0 h-7 w-7 rounded-lg bg-[#E7E5E4] flex items-center justify-center " +
        "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
    targetModel:
        "text-xs font-bold text-[#1E2938] font-[family-name:var(--font-space-mono)]",
    targetId:
        "text-xs text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] truncate max-w-[120px]",

    // IP code
    ipCode:
        "text-xs px-2 py-0.5 rounded-lg " +
        "bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-1px_-1px_3px_#ffffff] " +
        "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70",

    // Timestamp
    timestamp:
        "text-xs text-[#1E2938]/50 font-[family-name:var(--font-jetbrains-mono)] whitespace-nowrap",

    // Empty / error states
    emptyWrap: "flex flex-col items-center gap-3 py-14",
    emptyIcon:
        "h-14 w-14 rounded-2xl bg-[#E7E5E4] flex items-center justify-center " +
        "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]",
    emptyTitle:
        "font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]",
    emptyDesc:
        "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 mt-1 text-center",

    // Stats footer
    statRow:
        "mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 " +
        "px-4 py-3 rounded-xl " +
        "bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
        "border border-white/40",
    statText:
        "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",
    statValue: "font-bold text-[#1E2938]",

    // Error card
    errorCard:
        "p-5 rounded-2xl bg-[#E7E5E4] " +
        "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
        "border border-white/60",
    errorIcon:
        "h-10 w-10 rounded-xl bg-[#FF2157]/10 flex items-center justify-center " +
        "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]",
    errorTitle:
        "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm",
    errorMsg:
        "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-1 mb-4",
} as const;

// ── Badge helpers ──────────────────────────────────────────────
const ACTION_BADGE: Record<string, string> = {
    create:
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
        "font-[family-name:var(--font-space-mono)] font-bold " +
        "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    update:
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
        "font-[family-name:var(--font-space-mono)] font-bold " +
        "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    delete:
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
        "font-[family-name:var(--font-space-mono)] font-bold " +
        "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    read:
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
        "font-[family-name:var(--font-space-mono)] font-bold " +
        "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
};

// ── Framer variants ────────────────────────────────────────────
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 400, damping: 28 },
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

// ── Component ─────────────────────────────────────────────────
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

    // Sync local date state with store filters
    useEffect(() => {
        const parse = (v: string | undefined) => {
            if (!v) return undefined;
            const d = new Date(v);
            return isNaN(d.getTime()) ? undefined : d;
        };
        setDate(parse(auditFilters.date));
        setStartDate(parse(auditFilters.startDate));
        setEndDate(parse(auditFilters.endDate));
    }, [auditFilters.date, auditFilters.startDate, auditFilters.endDate]);

    const handleAccordionChange = useCallback(
        async (value: string) => {
            if (value === "audits" && (auditsMeta.stale || audits.length === 0)) {
                await fetchUserAudits();
            }
        },
        [audits.length, auditsMeta.stale, fetchUserAudits]
    );

    const applyFilters = useCallback(async () => {
        const filters: AuditDateFilter = {};
        if (date) {
            filters.date = date.toISOString();
        } else {
            if (startDate) filters.startDate = startDate.toISOString();
            if (endDate) filters.endDate = endDate.toISOString();
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
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
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
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [handleScroll]);

    const getActionBadgeClass = (action: AuditAction) =>
        ACTION_BADGE[action.toLowerCase()] ?? ACTION_BADGE.read;

    const getActionIcon = (action: AuditAction) => {
        switch (action.toLowerCase()) {
            case AUDIT_ACTION.CREATE: return <TrendingUp className="h-3 w-3" />;
            case AUDIT_ACTION.UPDATE: return <Activity className="h-3 w-3" />;
            case AUDIT_ACTION.DELETE: return <X className="h-3 w-3" />;
            default: return <Shield className="h-3 w-3" />;
        }
    };

    // ── Error state ────────────────────────────────────────────
    if (auditsMeta.error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={STYLES.errorCard}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className={STYLES.errorIcon}>
                        <AlertCircle className="h-5 w-5 text-[#FF2157]" />
                    </div>
                    <h3 className={STYLES.errorTitle}>Error Loading Audit Logs</h3>
                </div>
                <p className={STYLES.errorMsg}>{auditsMeta.error}</p>
                <button
                    onClick={() => fetchUserAudits({ force: true })}
                    className={
                        "group flex items-center gap-2 h-9 px-4 rounded-xl text-xs " +
                        "font-[family-name:var(--font-space-mono)] font-bold " +
                        "bg-[#E7E5E4] text-[#1E2938] " +
                        "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
                        "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
                        "transition-all duration-200"
                    }
                >
                    <RefreshCw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                    Retry
                </button>
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
            defaultValue=""
        >
            <AccordionItem value="audits" className={STYLES.accordionItem}>

                {/* ── Trigger ─────────────────────────────────── */}
                <AccordionTrigger className={STYLES.accordionTrigger}>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className={STYLES.iconWell}>
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#006666]" />
                        </div>
                        <div className="text-left">
                            <h3 className={STYLES.triggerTitle}>Audit Logs</h3>
                            <p className={STYLES.triggerSub}>
                                Track your account activity and changes
                            </p>
                        </div>
                    </div>
                </AccordionTrigger>

                {/* ── Content ──────────────────────────────────── */}
                <AccordionContent className={STYLES.accordionContent}>

                    {/* Filter Panel */}
                    <div className={STYLES.filterPanel}>
                        <div className={STYLES.filterHeader}>
                            <span className={STYLES.filterLabel}>
                                <Filter className="h-3.5 w-3.5" />
                                Filters
                            </span>

                            <div className="flex items-center gap-2">
                                <AnimatePresence>
                                    {hasActiveFilters && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.88 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.88 }}
                                        >
                                            <button
                                                onClick={clearFilters}
                                                className={STYLES.btnIcon}
                                                aria-label="Clear filters"
                                            >
                                                <X className="h-3 w-3" />
                                                Clear
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={STYLES.btnToggle(isFilterOpen)}
                                    aria-expanded={isFilterOpen}
                                >
                                    {isFilterOpen ? "Hide" : "Show"}
                                    <ChevronDown
                                        className={cn(
                                            "h-3 w-3 transition-transform duration-200",
                                            isFilterOpen && "rotate-180"
                                        )}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Active filter pills */}
                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex flex-wrap gap-2 pt-3">
                                        {auditFilters.date && (
                                            <span className={STYLES.filterBadge}>
                                                <CalendarIcon className="h-3 w-3" />
                                                {format(new Date(auditFilters.date), "MMM d, yyyy")}
                                            </span>
                                        )}
                                        {auditFilters.startDate && (
                                            <span className={STYLES.filterBadge}>
                                                <CalendarIcon className="h-3 w-3" />
                                                From: {format(new Date(auditFilters.startDate), "MMM d, yyyy")}
                                            </span>
                                        )}
                                        {auditFilters.endDate && (
                                            <span className={STYLES.filterBadge}>
                                                <CalendarIcon className="h-3 w-3" />
                                                To: {format(new Date(auditFilters.endDate), "MMM d, yyyy")}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Expanded filter inputs */}
                        <AnimatePresence>
                            {isFilterOpen && (
                                <motion.div
                                    variants={filterVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-4">
                                        <Separator className="bg-[#1E2938]/10" />

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {/* Specific Date */}
                                            <div>
                                                <label className={STYLES.fieldLabel}>
                                                    <CalendarIcon className="h-3 w-3" />
                                                    Specific Date
                                                </label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button className={STYLES.popoverTrigger(!!date)}>
                                                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                                                            {date ? format(date, "PPP") : "Pick a date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={startDate}
                                                            onSelect={(d) => {
                                                                if (!d) return;
                                                                if (endDate && d > endDate) setEndDate(d);
                                                                setStartDate(d);
                                                            }}
                                                            initialFocus
                                                            disabled={(d) => {
                                                                const n = new Date(d);
                                                                n.setHours(0, 0, 0, 0);
                                                                if (n > today) return true;
                                                                if (endDate && n > endDate) return true;
                                                                return false;
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            {/* Start Date */}
                                            <div>
                                                <label className={STYLES.fieldLabel}>
                                                    <CalendarDays className="h-3 w-3" />
                                                    Start Date
                                                </label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button className={STYLES.popoverTrigger(!!startDate)}>
                                                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                                                            {startDate ? format(startDate, "PPP") : "Start date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={startDate}
                                                            onSelect={(d) => {
                                                                if (!d) return;
                                                                if (endDate && d > endDate) setEndDate(d);
                                                                setStartDate(d);
                                                            }}
                                                            initialFocus
                                                            disabled={(d) => {
                                                                const n = new Date(d);
                                                                n.setHours(0, 0, 0, 0);
                                                                if (n > today) return true;
                                                                if (endDate && n > endDate) return true;
                                                                return false;
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            {/* End Date */}
                                            <div>
                                                <label className={STYLES.fieldLabel}>
                                                    <CalendarDays className="h-3 w-3" />
                                                    End Date
                                                </label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button className={STYLES.popoverTrigger(!!endDate)}>
                                                            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
                                                            {endDate ? format(endDate, "PPP") : "End date"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={endDate}
                                                            onSelect={setEndDate}
                                                            initialFocus
                                                            disabled={(d) => {
                                                                const n = new Date(d);
                                                                n.setHours(0, 0, 0, 0);
                                                                if (n > today) return true;
                                                                if (startDate && n < startDate) return true;
                                                                return false;
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-1">
                                            <button
                                                onClick={applyFilters}
                                                disabled={auditsMeta.loading}
                                                className={STYLES.btnPrimary}
                                            >
                                                {auditsMeta.loading && (
                                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                )}
                                                Apply Filters
                                            </button>
                                            <button
                                                onClick={() => setIsFilterOpen(false)}
                                                className={STYLES.btnGhost}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Table ──────────────────────────────────── */}
                    <div className={STYLES.tableWrap}>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className={cn(STYLES.tableHeader, "hover:bg-transparent")}>
                                        <TableHead className={STYLES.tableHeader}>Action</TableHead>
                                        <TableHead className={STYLES.tableHeader}>Target</TableHead>
                                        <TableHead className={STYLES.tableHeader}>Changes</TableHead>
                                        <TableHead className={STYLES.tableHeader}>IP Address</TableHead>
                                        <TableHead className={STYLES.tableHeader}>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="h-3 w-3" />
                                                Timestamp
                                            </span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {/* Loading skeletons */}
                                    {auditsMeta.loading && audits.length === 0 &&
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <TableRow key={i} className={STYLES.tableRow}>
                                                <TableCell colSpan={5}>
                                                    <div className="h-12 w-full rounded-xl bg-[#d0cecd] animate-pulse" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }

                                    {/* Empty state */}
                                    {!auditsMeta.loading && audits.length === 0 && (
                                        <TableRow className="bg-[#E7E5E4] hover:bg-[#E7E5E4]">
                                            <TableCell colSpan={5}>
                                                <div className={STYLES.emptyWrap}>
                                                    <div className={STYLES.emptyIcon}>
                                                        <FileText className="h-6 w-6 text-[#1E2938]/30" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={STYLES.emptyTitle}>No audit logs found</p>
                                                        <p className={STYLES.emptyDesc}>
                                                            Activity records will appear here when available
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Data rows */}
                                    {audits.map((log: AuditLog) => (
                                        <motion.tr
                                            key={log._id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className={STYLES.tableRow}
                                        >
                                            <TableCell className="py-3.5 pl-4">
                                                <span className={getActionBadgeClass(log.action)}>
                                                    {getActionIcon(log.action)}
                                                    {log.action}
                                                </span>
                                            </TableCell>

                                            <TableCell className="py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={STYLES.targetIcon}>
                                                        <Database className="h-3.5 w-3.5 text-[#006666]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={STYLES.targetModel}>{log.targetModel}</p>
                                                        <p className={STYLES.targetId}>{log.target}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-3.5">
                                                {log.changes ? (
                                                    <div className="space-y-1">
                                                        {Object.keys(log.changes.before || {}).length > 0 && (
                                                            <span
                                                                className={
                                                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs " +
                                                                    "font-[family-name:var(--font-space-mono)] font-bold " +
                                                                    "bg-[#FE9900]/10 text-[#FE9900] " +
                                                                    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]"
                                                                }
                                                            >
                                                                <Activity className="h-3 w-3" />
                                                                Modified
                                                            </span>
                                                        )}
                                                        {log.note && (
                                                            <p className="text-xs text-[#1E2938]/50 font-[family-name:var(--font-jetbrains-mono)] mt-1">
                                                                {log.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)]">
                                                        {log.note || "—"}
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="py-3.5">
                                                <code className={STYLES.ipCode}>
                                                    {log.ip || "—"}
                                                </code>
                                            </TableCell>

                                            <TableCell className={cn(STYLES.timestamp, "py-3.5 pr-4")}>
                                                {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                                            </TableCell>
                                        </motion.tr>
                                    ))}

                                    {/* Inline loading more */}
                                    {auditsMeta.loading && audits.length > 0 && (
                                        <TableRow className={STYLES.tableRow}>
                                            <TableCell colSpan={5} className="py-5 text-center">
                                                <span className="inline-flex items-center gap-2 text-xs text-[#1E2938]/50 font-[family-name:var(--font-jetbrains-mono)]">
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#006666]" />
                                                    Loading more…
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Load More button */}
                                    {!auditsMeta.loading && auditFilters.hasMore && audits.length > 0 && (
                                        <TableRow className={cn(STYLES.tableRow, "border-0")}>
                                            <TableCell colSpan={5} className="py-4 text-center">
                                                <button
                                                    onClick={() => loadMoreAudits()}
                                                    className={
                                                        "group inline-flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs " +
                                                        "font-[family-name:var(--font-space-mono)] font-bold text-[#006666] " +
                                                        "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
                                                        "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
                                                        "transition-all duration-200"
                                                    }
                                                >
                                                    <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                                                    Load More
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* ── Stats footer ───────────────────────────── */}
                    {audits.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={STYLES.statRow}
                        >
                            <span className={STYLES.statText}>
                                Showing{" "}
                                <span className={STYLES.statValue}>{audits.length}</span>{" "}
                                {audits.length === 1 ? "record" : "records"}
                            </span>
                            {auditsMeta.total != null && (
                                <span className={STYLES.statText}>
                                    Total:{" "}
                                    <span className={STYLES.statValue}>{auditsMeta.total}</span>
                                </span>
                            )}
                        </motion.div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}