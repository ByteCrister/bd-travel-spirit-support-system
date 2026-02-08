"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Field } from "./primitives/Field";
import { Skeleton } from "./primitives/Skeleton";

import {
    EmployeesQuery,
} from "@/types/employee/employee.types";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    EMPLOYEE_ROLE,
    EMPLOYEE_STATUS,
    EmployeeRole,
    EmployeeStatus,
    EMPLOYMENT_TYPE,
    EmploymentType,
    PAYROLL_STATUS,
    PayrollStatus,
} from "@/constants/employee.const";

import { motion, AnimatePresence } from "framer-motion";

import {
    Search,
    Filter,
    X,
    ChevronDown,
    Trash2,
    Activity,
    FileText,
    Loader2,
    Sparkles,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

type EnumsShape = {
    roles?: EmployeeRole[];
    statuses?: EmployeeStatus[];
    employmentTypes?: EmploymentType[];
    paymentStatuses?: PayrollStatus[];
};

const STATUS_LABELS: Record<EmployeeStatus, string> = {
    active: "Active",
    onLeave: "On Leave",
    suspended: "Suspended",
    terminated: "Terminated",
};

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    intern: "Intern",
};

const PAYMENT_STATUS_LABELS: Record<PayrollStatus, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
};

const PAYMENT_STATUS_ICONS: Record<PayrollStatus, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    paid: <CheckCircle className="h-4 w-4" />,
    failed: <XCircle className="h-4 w-4" />,
};

const PAYMENT_STATUS_VARIANTS: Record<PayrollStatus, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    paid: "default",
    failed: "destructive",
};

const STATUS_VARIANTS: Record<EmployeeStatus, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    onLeave: "secondary",
    suspended: "destructive",
    terminated: "outline",
};

export function EmployeeFilters({
    query,
    onChange,
    loading,
    fetchEnums,
}: {
    query: EmployeesQuery;
    onChange: (q: EmployeesQuery) => void;
    loading: boolean;
    fetchEnums: (force?: boolean) => Promise<unknown>;
}) {
    const [enums, setEnums] = useState<EnumsShape | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchValue, setSearchValue] = useState(query.filters?.search ?? "");
    // Create debounced function to update filters with search value
    const debouncedUpdateSearch = useDebouncedCallback(
        (searchTerm: string) => {
            setFilters({ search: searchTerm || undefined });
        },
        1000 // 1000ms delay
    );

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                await fetchEnums();
            } catch {
                console.warn("fetchEnums failed, using static enums");
            }

            if (!mounted) return;

            setEnums({
                roles: Object.values(EMPLOYEE_ROLE),
                statuses: Object.values(EMPLOYEE_STATUS),
                employmentTypes: Object.values(EMPLOYMENT_TYPE),
                paymentStatuses: Object.values(PAYROLL_STATUS),
            });
        };

        void load();

        return () => {
            mounted = false;
        };
    }, [fetchEnums]);

    const filters = useMemo(
        () => query.filters ?? {},
        [query.filters]
    );

    const setFilters = useCallback(
        (patch: Partial<NonNullable<EmployeesQuery["filters"]>>) => {
            onChange({
                ...query,
                page: 1,
                filters: { ...(query.filters ?? {}), ...patch },
            });
        },
        [onChange, query]
    );

    const clearFilters = () => {
        // Cancel any pending debounced calls
        debouncedUpdateSearch.cancel?.();
        setSearchValue("");
        onChange({ ...query, page: 1, filters: {} });
    };

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(
            (v) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
        ).length;
    }, [filters]);

    const hasActiveFilters = activeFilterCount > 0;

    const filterChips = useMemo(() => {
        const chips: Array<{
            key: string;
            label: string;
            variant?: "default" | "secondary" | "destructive" | "outline";
            onRemove: () => void;
        }> = [];

        if (filters.statuses?.[0]) {
            const s = filters.statuses[0];
            chips.push({
                key: `status:${s}`,
                label: STATUS_LABELS[s] ?? s,
                variant: STATUS_VARIANTS[s],
                onRemove: () => setFilters({ statuses: undefined }),
            });
        }

        if (filters.employmentTypes?.[0]) {
            const t = filters.employmentTypes[0];
            chips.push({
                key: `type:${t}`,
                label: EMPLOYMENT_TYPE_LABELS[t] ?? t,
                onRemove: () => setFilters({ employmentTypes: undefined }),
            });
        }

        if (filters.paymentStatuses?.[0]) {
            const p = filters.paymentStatuses[0];
            chips.push({
                key: `payment:${p}`,
                label: PAYMENT_STATUS_LABELS[p] ?? p,
                variant: PAYMENT_STATUS_VARIANTS[p],
                onRemove: () => setFilters({ paymentStatuses: undefined }),
            });
        }

        if (filters.search) {
            chips.push({
                key: `search:${filters.search}`,
                label: `"${filters.search}"`,
                onRemove: () => {
                    // Cancel pending debounced calls
                    debouncedUpdateSearch.cancel?.();
                    setSearchValue("");
                    setFilters({ search: undefined });
                },
            });
        }

        if (filters.includeDeleted) {
            chips.push({
                key: `deleted:true`,
                label: "Deleted Records",
                variant: "outline",
                onRemove: () => setFilters({ includeDeleted: undefined }),
            });
        }

        return chips;
    }, [debouncedUpdateSearch, filters.employmentTypes, filters.includeDeleted, filters.paymentStatuses, filters.search, filters.statuses, setFilters]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        debouncedUpdateSearch(value);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
        >
            {/* Ambient glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <Card className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-background via-background/95 to-background/90 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:border-border/60 hover:shadow-2xl">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent pointer-events-none" />

                <CardHeader className="relative space-y-5 pb-6 pt-7 px-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                            <motion.div
                                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/20"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <Filter className="relative h-5 w-5 text-primary" aria-hidden="true" />
                            </motion.div>

                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                                        Filter Employees
                                    </CardTitle>
                                    {hasActiveFilters && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="h-6 px-2.5 text-xs font-semibold shadow-sm bg-primary/15 text-primary border-primary/20"
                                            >
                                                <Sparkles className="h-3 w-3 mr-1" />
                                                {activeFilterCount}
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>
                                <CardDescription className="text-sm text-muted-foreground/80 font-medium">
                                    {hasActiveFilters
                                        ? `${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"} applied`
                                        : "Refine and narrow down your employee search"}
                                </CardDescription>
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded((v) => !v)}
                            className="h-10 w-10 shrink-0 rounded-2xl transition-all duration-300 hover:bg-accent/50 hover:scale-105"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
                        >
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <ChevronDown className="h-5 w-5" aria-hidden="true" />
                            </motion.div>
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {hasActiveFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {filterChips.map((chip, idx) => (
                                        <motion.div
                                            key={chip.key}
                                            initial={{ scale: 0.85, opacity: 0, y: -10 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            exit={{ scale: 0.85, opacity: 0, y: -10 }}
                                            transition={{
                                                delay: idx * 0.04,
                                                duration: 0.25,
                                                ease: [0.4, 0, 0.2, 1]
                                            }}
                                        >
                                            <Badge
                                                variant={chip.variant ?? "secondary"}
                                                className="h-8 gap-2 rounded-full pl-3.5 pr-2 text-xs font-medium shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:scale-105"
                                            >
                                                {chip.key.startsWith('payment:') && (
                                                    <span className="flex items-center">
                                                        {PAYMENT_STATUS_ICONS[chip.key.split(':')[1] as PayrollStatus]}
                                                    </span>
                                                )}
                                                {chip.label}
                                                <button
                                                    type="button"
                                                    className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/60 hover:bg-background transition-colors"
                                                    aria-label={`Remove ${chip.label} filter`}
                                                    onClick={chip.onRemove}
                                                >
                                                    <X className="h-3 w-3" aria-hidden="true" />
                                                </button>
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardHeader>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <div className="mx-7 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                            <CardContent className="relative space-y-8 pt-8 pb-7 px-7">
                                {/* Search field with enhanced styling */}
                                <Field label="Quick Search" hint="Search by name, email, phone, or department">
                                    <div className="relative group">
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
                                        <Search
                                            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110"
                                            aria-hidden="true"
                                        />
                                        {loading ? (
                                            <Skeleton className="h-12 w-full rounded-2xl" />
                                        ) : (
                                            <Input
                                                placeholder="Start typing to search..."
                                                value={searchValue}
                                                onChange={handleSearchChange}
                                                className="relative h-12 rounded-2xl border border-border/40 bg-background/80 pl-12 pr-4 text-sm font-medium shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground/50 hover:border-border/60 hover:shadow-md focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10"
                                                aria-label="Search employees"
                                            />
                                        )}
                                    </div>
                                </Field>

                                <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                                {/* Filter grid with improved spacing */}
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                                    <ShadcnFilterSelect
                                        label="Employment Status"
                                        icon={<Activity className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.statuses?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({ statuses: value ? [value as EmployeeStatus] : undefined })
                                        }
                                        options={
                                            enums?.statuses?.map((s) => ({ value: s, label: STATUS_LABELS[s] })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select status"
                                        disabled={loading}
                                    />

                                    <ShadcnFilterSelect
                                        label="Contract Type"
                                        icon={<FileText className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.employmentTypes?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({
                                                employmentTypes: value ? [value as EmploymentType] : undefined,
                                            })
                                        }
                                        options={
                                            enums?.employmentTypes?.map((t) => ({
                                                value: t,
                                                label: EMPLOYMENT_TYPE_LABELS[t],
                                            })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select type"
                                        disabled={loading}
                                    />

                                    <ShadcnFilterSelect
                                        label="Payment Status"
                                        icon={<CreditCard className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.paymentStatuses?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({
                                                paymentStatuses: value ? [value as PayrollStatus] : undefined,
                                            })
                                        }
                                        options={
                                            enums?.paymentStatuses?.map((p) => ({
                                                value: p,
                                                label: PAYMENT_STATUS_LABELS[p],
                                            })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select payment status"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Enhanced deleted records toggle */}
                                <Field label="Advanced Options" hint="Additional filtering preferences">
                                    <motion.div
                                        className="group relative flex h-12 items-center justify-between rounded-2xl border border-border/40 bg-background/80 px-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md"
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <Label
                                            htmlFor="include-deleted"
                                            className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive/15">
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </div>
                                            Include Deleted Records
                                        </Label>
                                        <Switch
                                            id="include-deleted"
                                            checked={!!filters.includeDeleted}
                                            onCheckedChange={(checked) =>
                                                setFilters({ includeDeleted: checked || undefined })
                                            }
                                            disabled={loading}
                                            aria-checked={!!filters.includeDeleted}
                                            aria-label="Include deleted employees"
                                        />
                                    </motion.div>
                                </Field>

                                <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                                {/* Footer with status and clear button */}
                                <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters ? (
                                            <motion.div
                                                className="flex items-center gap-3"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                            >
                                                <div className="relative flex h-2.5 w-2.5">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                                                </div>
                                                <p className="text-sm font-semibold text-foreground">
                                                    {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <p className="text-sm font-medium text-muted-foreground/70">No active filters</p>
                                        )}
                                        {loading && (
                                            <Badge variant="secondary" className="h-7 gap-2 px-3 text-xs font-semibold shadow-sm">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Loading
                                            </Badge>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters || loading}
                                        className="h-10 gap-2.5 rounded-xl border-border/40 px-5 text-sm font-semibold shadow-sm transition-all duration-300 hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive hover:shadow-md disabled:opacity-40"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                        Clear All Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}

function ShadcnFilterSelect({
    label,
    icon,
    value,
    onValueChange,
    options,
    loading,
    placeholder,
    disabled,
}: {
    label: string;
    icon?: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string }[];
    loading?: boolean;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <Field label={label}>
            {loading ? (
                <Skeleton className="h-11 w-full rounded-2xl" />
            ) : (
                <Select
                    value={value || "__all__"}
                    onValueChange={(v) => onValueChange(v === "__all__" ? "" : v)}
                    disabled={disabled}
                >
                    <SelectTrigger className="h-11 gap-2.5 rounded-2xl border border-border/40 bg-background/80 px-4 text-sm font-medium shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-border/60 hover:shadow-md focus:border-primary/50 focus:ring-4 focus:ring-primary/10">
                        {icon && <span className="text-muted-foreground/70 transition-colors group-hover:text-foreground">{icon}</span>}
                        <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[320px] rounded-2xl border border-border/40 bg-background/95 backdrop-blur-xl">
                        <SelectItem value="__all__" className="rounded-xl text-sm font-medium">
                            <span className="text-muted-foreground">All {label}</span>
                        </SelectItem>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="rounded-xl text-sm font-medium">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </Field>
    );
}