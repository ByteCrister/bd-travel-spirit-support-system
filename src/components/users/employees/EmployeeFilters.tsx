"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Field } from "./primitives/Field";
import { EmployeesQuery } from "@/types/employee/employee.types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-space-mono)] px-4 py-2 " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_ICON =
  "rounded-xl w-10 h-10 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";

const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 h-12 pl-12 pr-4";

const NEU_BADGE_BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_ICON_WELL =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#006666]/10 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_DIVIDER =
  "h-px bg-gradient-to-r from-transparent via-[#1E2938]/10 to-transparent";

const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
// ───────────────────────────────────────────────────────────────

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
  pending: <Clock className="h-3.5 w-3.5" />,
  paid: <CheckCircle className="h-3.5 w-3.5" />,
  failed: <XCircle className="h-3.5 w-3.5" />,
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

  const debouncedUpdateSearch = useDebouncedCallback((searchTerm: string) => {
    setFilters({ search: searchTerm || undefined });
  }, 1000);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        await fetchEnums();
      } catch {
        console.warn("fetchEnums failed");
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

  const filters = useMemo(() => query.filters ?? {}, [query.filters]);

  const setFilters = useCallback(
    (patch: Partial<NonNullable<EmployeesQuery["filters"]>>) => {
      onChange({
        ...query,
        page: 1,
        filters: { ...(query.filters ?? {}), ...patch },
      });
    },
    [onChange, query],
  );

  const clearFilters = () => {
    debouncedUpdateSearch.cancel?.();
    setSearchValue("");
    onChange({ ...query, page: 1, filters: {} });
  };

  const activeFilterCount = useMemo(
    () =>
      Object.values(filters).filter(
        (v) =>
          v !== undefined &&
          v !== "" &&
          (Array.isArray(v) ? v.length > 0 : true),
      ).length,
    [filters],
  );

  const hasActiveFilters = activeFilterCount > 0;

  const filterChips = useMemo(() => {
    const chips: Array<{
      key: string;
      label: string;
      icon?: React.ReactNode;
      onRemove: () => void;
    }> = [];
    if (filters.statuses?.[0]) {
      const s = filters.statuses[0];
      chips.push({
        key: `status:${s}`,
        label: STATUS_LABELS[s] ?? s,
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
        icon: PAYMENT_STATUS_ICONS[p],
        onRemove: () => setFilters({ paymentStatuses: undefined }),
      });
    }
    if (filters.search) {
      chips.push({
        key: `search:${filters.search}`,
        label: `"${filters.search}"`,
        onRemove: () => {
          debouncedUpdateSearch.cancel?.();
          setSearchValue("");
          setFilters({ search: undefined });
        },
      });
    }
    if (filters.includeDeleted) {
      chips.push({
        key: "deleted:true",
        label: "Deleted Records",
        onRemove: () => setFilters({ includeDeleted: undefined }),
      });
    }
    return chips;
  }, [debouncedUpdateSearch, filters, setFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchValue(v);
    debouncedUpdateSearch(v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={NEU_CARD}>
        {/* ── Header ── */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={NEU_ICON_WELL}>
                <Filter className="h-5 w-5 text-[#006666]" aria-hidden="true" />
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className={`text-base ${NEU_HEADING}`}>
                    Filter Employees
                  </h2>
                  {hasActiveFilters && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#006666]/10 text-[#006666] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]"
                    >
                      <Sparkles className="h-3 w-3" />
                      {activeFilterCount}
                    </motion.span>
                  )}
                </div>
                <p className={NEU_MUTED}>
                  {hasActiveFilters
                    ? `${activeFilterCount} active ${activeFilterCount === 1 ? "filter" : "filters"} applied`
                    : "Refine and narrow down your employee search"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className={NEU_BTN_ICON}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </button>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <div className="flex flex-wrap gap-2">
                  {filterChips.map((chip, idx) => (
                    <motion.span
                      key={chip.key}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`${NEU_BADGE_BASE} pr-1`}
                    >
                      {chip.icon}
                      {chip.label}
                      <button
                        type="button"
                        onClick={chip.onRemove}
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-md bg-[#1E2938]/10 hover:bg-[#FF2157]/10 hover:text-[#FF2157] transition-colors"
                        aria-label={`Remove ${chip.label} filter`}
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Collapsible body ── */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className={`${NEU_DIVIDER} mx-6`} />

              <div className="px-6 py-6 space-y-6">
                {/* Search */}
                <Field
                  label="Quick Search"
                  hint="Search by name, email, phone, or department"
                >
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1E2938]/40 pointer-events-none"
                      aria-hidden="true"
                    />
                    {loading ? (
                      <div className={`${NEU_SKELETON} h-12 w-full`} />
                    ) : (
                      <Input
                        placeholder="Start typing to search…"
                        value={searchValue}
                        onChange={handleSearchChange}
                        className={NEU_INPUT}
                        aria-label="Search employees"
                      />
                    )}
                  </div>
                </Field>

                <div className={NEU_DIVIDER} />

                {/* Filter grid */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <NeuFilterSelect
                    label="Employment Status"
                    icon={<Activity className="h-4 w-4 text-[#006666]" />}
                    value={filters.statuses?.[0] ?? ""}
                    onValueChange={(v) =>
                      setFilters({
                        statuses: v ? [v as EmployeeStatus] : undefined,
                      })
                    }
                    options={
                      enums?.statuses?.map((s) => ({
                        value: s,
                        label: STATUS_LABELS[s],
                      })) ?? []
                    }
                    loading={!enums || loading}
                    placeholder="Select status"
                    disabled={loading}
                  />

                  <NeuFilterSelect
                    label="Contract Type"
                    icon={<FileText className="h-4 w-4 text-[#006666]" />}
                    value={filters.employmentTypes?.[0] ?? ""}
                    onValueChange={(v) =>
                      setFilters({
                        employmentTypes: v ? [v as EmploymentType] : undefined,
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

                  <NeuFilterSelect
                    label="Payment Status"
                    icon={<CreditCard className="h-4 w-4 text-[#006666]" />}
                    value={filters.paymentStatuses?.[0] ?? ""}
                    onValueChange={(v) =>
                      setFilters({
                        paymentStatuses: v ? [v as PayrollStatus] : undefined,
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

                {/* Include deleted toggle */}
                <Field
                  label="Advanced Options"
                  hint="Additional filtering preferences"
                >
                  <div
                    className={`${NEU_SURFACE_INSET} flex h-12 items-center justify-between px-4`}
                  >
                    <Label
                      htmlFor="include-deleted"
                      className="flex cursor-pointer items-center gap-2.5 font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF2157]/10">
                        <Trash2
                          className="h-4 w-4 text-[#FF2157]"
                          aria-hidden="true"
                        />
                      </span>
                      Include Deleted Records
                    </Label>
                    <Switch
                      id="include-deleted"
                      checked={!!filters.includeDeleted}
                      onCheckedChange={(checked) =>
                        setFilters({ includeDeleted: checked || undefined })
                      }
                      disabled={loading}
                      aria-label="Include deleted employees"
                    />
                  </div>
                </Field>

                <div className={NEU_DIVIDER} />

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {hasActiveFilters ? (
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#006666] opacity-60" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#006666]" />
                        </span>
                        <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]">
                          {activeFilterCount}{" "}
                          {activeFilterCount === 1 ? "filter" : "filters"}{" "}
                          active
                        </p>
                      </motion.div>
                    ) : (
                      <p className={NEU_MUTED}>No active filters</p>
                    )}
                    {loading && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#E7E5E4] text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Loading
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters || loading}
                    className={`${NEU_BTN_GHOST} hover:text-[#FF2157]`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Internal filter select ──────────────────────────────────────
function NeuFilterSelect({
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
  const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";

  return (
    <Field label={label}>
      {loading ? (
        <div className={`${NEU_SKELETON} h-11 w-full`} />
      ) : (
        <Select
          value={value || "__all__"}
          onValueChange={(v) => onValueChange(v === "__all__" ? "" : v)}
          disabled={disabled}
        >
          <SelectTrigger className="h-11 rounded-xl bg-[#E7E5E4] text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] border-none shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] focus:outline-none focus:ring-2 focus:ring-[#006666]/50 px-3 gap-2 transition-all duration-200">
            {icon && <span className="text-[#006666]">{icon}</span>}
            <SelectValue
              placeholder={placeholder || `Select ${label.toLowerCase()}`}
            />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-[#E7E5E4] border border-white/60 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
            <SelectItem
              value="__all__"
              className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 rounded-lg"
            >
              All {label}
            </SelectItem>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] rounded-lg"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
}
