// components/employees/EmployeeFilters.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

import { Field } from "./primitives/Field";
import { Skeleton } from "./primitives/Skeleton";

import {
    EmployeesQuery,
    EmployeeRole,
    EmployeeSubRole,
    EmployeeStatus,
    EmploymentType,
    EmployeePosition,
    PositionCategory,
} from "@/types/employee.types";

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
    EMPLOYEE_POSITIONS,
    EMPLOYEE_ROLE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
} from "@/constants/employee.const";

import { motion, AnimatePresence } from "framer-motion";

import {
    Search,
    Filter,
    X,
    ChevronDown,
    Users,
    Briefcase,
    UserCheck,
    Building2,
    Trash2,
    Activity,
    FileText,
    Loader2,
} from "lucide-react";

type EnumsShape = {
    roles?: EmployeeRole[];
    subRoles?: EmployeeSubRole[];
    statuses?: EmployeeStatus[];
    employmentTypes?: EmploymentType[];
    departments?: string[];
    positions?: EmployeePosition[];
    positionCategories?: PositionCategory[];
};

const ROLE_LABELS: Record<EmployeeRole, string> = {
    assistant: "Assistant",
    support: "Support",
};

const SUB_ROLE_LABELS: Record<EmployeeSubRole, string> = {
    product: "Product",
    order: "Order",
    support: "Support",
    marketing: "Marketing",
    finance: "Finance",
    analytics: "Analytics",
    hr: "HR",
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

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                await fetchEnums();
            } catch {
                console.warn("fetchEnums failed, using static enums");
            }

            if (!mounted) return;

            const derivedPositions = Object.values(EMPLOYEE_POSITIONS).flatMap((arr) => arr) as EmployeePosition[];
            const derivedCategories = Object.keys(EMPLOYEE_POSITIONS) as PositionCategory[];

            setEnums({
                roles: Object.values(EMPLOYEE_ROLE),
                subRoles: Object.values(EMPLOYEE_SUB_ROLE),
                statuses: Object.values(EMPLOYEE_STATUS),
                employmentTypes: Object.values(EMPLOYMENT_TYPE),
                positions: derivedPositions,
                positionCategories: derivedCategories,
                departments: undefined,
            });
        };

        void load();

        return () => {
            mounted = false;
        };
    }, [fetchEnums]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const filters = query.filters ?? {};

    const setFilters = (patch: Partial<NonNullable<EmployeesQuery["filters"]>>) =>
        onChange({ ...query, page: 1, filters: { ...(query.filters ?? {}), ...patch } });

    const clearFilters = () => onChange({ ...query, page: 1, filters: {} });

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

        if (filters.roles?.[0]) {
            const r = filters.roles[0];
            chips.push({
                key: `role:${r}`,
                label: ROLE_LABELS[r] ?? r,
                onRemove: () => setFilters({ roles: undefined }),
            });
        }

        if (filters.subRoles?.[0]) {
            const sr = filters.subRoles[0];
            chips.push({
                key: `subRole:${sr}`,
                label: SUB_ROLE_LABELS[sr] ?? sr,
                onRemove: () => setFilters({ subRoles: undefined }),
            });
        }

        if (filters.positionCategories?.[0]) {
            const pc = filters.positionCategories[0];
            chips.push({
                key: `posCat:${pc}`,
                label: pc.charAt(0).toUpperCase() + pc.slice(1),
                onRemove: () => setFilters({ positionCategories: undefined, positions: undefined }),
            });
        }

        if (filters.positions?.[0]) {
            const p = filters.positions[0];
            chips.push({
                key: `position:${p}`,
                label: p,
                onRemove: () => setFilters({ positions: undefined }),
            });
        }

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

        if (filters.departments?.[0]) {
            const d = filters.departments[0];
            chips.push({
                key: `dept:${d}`,
                label: d,
                onRemove: () => setFilters({ departments: undefined }),
            });
        }

        if (filters.search) {
            chips.push({
                key: `search:${filters.search}`,
                label: `"${filters.search}"`,
                onRemove: () => setFilters({ search: undefined }),
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            <Card className="rounded-2xl border-border/50 bg-gradient-to-br from-background/70 to-background/40 shadow-sm shadow-black/5 backdrop-blur-sm transition-shadow hover:shadow-md">
                <CardHeader className="space-y-4 pb-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Filter className="h-4.5 w-4.5" aria-hidden="true" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <CardTitle className="text-base font-semibold tracking-tight">
                                        Filter Employees
                                    </CardTitle>
                                    {hasActiveFilters && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium">
                                                {activeFilterCount}
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>
                                <CardDescription className="text-sm text-muted-foreground">
                                    {hasActiveFilters
                                        ? `${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"}`
                                        : "Refine employee search results"}
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded((v) => !v)}
                            className="h-9 w-9 shrink-0 rounded-xl transition-all hover:bg-accent"
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
                        >
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            >
                                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            </motion.div>
                        </Button>
                    </div>

                    <AnimatePresence mode="wait">
                        {hasActiveFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    {filterChips.map((chip, idx) => (
                                        <motion.div
                                            key={chip.key}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                                        >
                                            <Badge
                                                variant={chip.variant ?? "secondary"}
                                                className="h-7 gap-1.5 rounded-full pl-2.5 pr-1.5 text-xs"
                                            >
                                                {chip.label}
                                                <button
                                                    type="button"
                                                    className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-background/80 transition-colors"
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
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                            <CardContent className="space-y-7 pt-6 pb-6">
                                <Field label="Quick Search" hint="Search by name, email, phone, or department">
                                    <div className="relative group">
                                        <Search
                                            className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary"
                                            aria-hidden="true"
                                        />
                                        {loading ? (
                                            <Skeleton className="h-11 w-full rounded-xl" />
                                        ) : (
                                            <Input
                                                placeholder="Start typing to search..."
                                                value={filters.search ?? ""}
                                                onChange={(e) => setFilters({ search: e.target.value || undefined })}
                                                className="h-11 rounded-xl border-border/50 bg-background/60 pl-10 pr-4 text-sm shadow-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                                                aria-label="Search employees"
                                            />
                                        )}
                                    </div>
                                </Field>

                                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    <ShadcnFilterSelect
                                        label="Employee Role"
                                        icon={<Users className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.roles?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({ roles: value ? [value as EmployeeRole] : undefined })
                                        }
                                        options={enums?.roles?.map((r) => ({ value: r, label: ROLE_LABELS[r] })) ?? []}
                                        loading={!enums || loading}
                                        placeholder="Select role"
                                        disabled={loading}
                                    />

                                    <ShadcnFilterSelect
                                        label="Department Sub-role"
                                        icon={<Briefcase className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.subRoles?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({ subRoles: value ? [value as EmployeeSubRole] : undefined })
                                        }
                                        options={enums?.subRoles?.map((r) => ({ value: r, label: SUB_ROLE_LABELS[r] })) ?? []}
                                        loading={!enums || loading}
                                        placeholder="Select sub-role"
                                        disabled={loading}
                                    />

                                    <ShadcnFilterSelect
                                        label="Position Category"
                                        icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.positionCategories?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({
                                                positionCategories: value ? [value as PositionCategory] : undefined,
                                                positions: undefined,
                                            })
                                        }
                                        options={
                                            enums?.positionCategories?.map((c) => ({
                                                value: c,
                                                label: c.charAt(0).toUpperCase() + c.slice(1),
                                            })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select category"
                                        disabled={loading}
                                    />

                                    <ShadcnFilterSelect
                                        label="Specific Position"
                                        icon={<UserCheck className="h-4 w-4" aria-hidden="true" />}
                                        value={filters.positions?.[0] ?? ""}
                                        onValueChange={(value) =>
                                            setFilters({ positions: value ? [value as EmployeePosition] : undefined })
                                        }
                                        options={
                                            filteredPositions(enums, filters.positionCategories)?.map((p) => ({
                                                value: p,
                                                label: p,
                                            })) ?? []
                                        }
                                        loading={!enums || loading}
                                        placeholder="Select position"
                                        disabled={loading}
                                    />

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

                                    {enums?.departments?.length ? (
                                        <ShadcnFilterSelect
                                            label="Department"
                                            icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
                                            value={filters.departments?.[0] ?? ""}
                                            onValueChange={(value) =>
                                                setFilters({ departments: value ? [value] : undefined })
                                            }
                                            options={enums.departments.map((d) => ({ value: d, label: d }))}
                                            loading={!enums || loading}
                                            placeholder="Select department"
                                            disabled={loading}
                                        />
                                    ) : (
                                        <Field label="Department" hint="Filter by department name">
                                            {loading ? (
                                                <Skeleton className="h-10 w-full rounded-xl" />
                                            ) : (
                                                <div className="relative group">
                                                    <Building2
                                                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                                                        aria-hidden="true"
                                                    />
                                                    <Input
                                                        placeholder="e.g., Operations"
                                                        value={filters.departments?.[0] ?? ""}
                                                        onChange={(e) =>
                                                            setFilters({
                                                                departments: e.target.value ? [e.target.value] : undefined,
                                                            })
                                                        }
                                                        className="h-10 rounded-xl border-border/50 bg-background/60 pl-9 text-sm shadow-none transition-all hover:border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                                                        aria-label="Department"
                                                    />
                                                </div>
                                            )}
                                        </Field>
                                    )}

                                    <Field label="Deleted Records" hint="Include soft-deleted employees">
                                        <div className="group flex h-10 items-center justify-between rounded-xl border border-border/50 bg-background/60 px-3.5 transition-all hover:border-border hover:bg-accent/40">
                                            <Label
                                                htmlFor="include-deleted"
                                                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                                            >
                                                <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                                Include Deleted
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
                                        </div>
                                    </Field>
                                </div>

                                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-2.5">
                                        {hasActiveFilters ? (
                                            <>
                                                <div className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                <p className="text-sm text-foreground">
                                                    {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} active
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No filters applied</p>
                                        )}
                                        {loading && (
                                            <Badge variant="secondary" className="h-6 gap-1.5 px-2 text-xs">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Loading
                                            </Badge>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        disabled={!hasActiveFilters || loading}
                                        className="h-9 gap-2 rounded-xl border-border/50 text-sm font-medium shadow-none transition-all hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                        Clear Filters
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
                <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
                <Select
                    value={value || "__all__"}
                    onValueChange={(v) => onValueChange(v === "__all__" ? "" : v)}
                    disabled={disabled}
                >
                    <SelectTrigger className="h-10 gap-2 rounded-xl border-border/50 bg-background/60 text-sm shadow-none transition-all hover:border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                        {icon && <span className="text-muted-foreground">{icon}</span>}
                        <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] rounded-xl border-border/50">
                        <SelectItem value="__all__" className="rounded-lg text-sm">
                            <span className="text-muted-foreground">All {label}</span>
                        </SelectItem>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="rounded-lg text-sm">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </Field>
    );
}

function filteredPositions(enums: EnumsShape | null, categories?: PositionCategory[]): EmployeePosition[] {
    if (!enums?.positions) return [];
    if (!categories || categories.length === 0) return enums.positions;

    const set = new Set<EmployeePosition>();
    for (const cat of categories) {
        for (const p of EMPLOYEE_POSITIONS[cat] ?? []) set.add(p as EmployeePosition);
    }
    return Array.from(set);
}