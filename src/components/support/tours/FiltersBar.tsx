// components/support/tours/FiltersBar.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    MODERATION_STATUS,
    TOUR_STATUS,
    TRAVEL_TYPE,
    DIFFICULTY_LEVEL,
    DIVISION,
    DISTRICT,
    Division,
    District,
    TravelType,
    DifficultyLevel,
    ModerationStatus,
    TourStatus,
} from "@/constants/tour.const";
// import type { TourFilterOptions } from "@/types/tour/tour.types";
import { useTourApproval } from "@/store/tour-approval.store";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { ComboBox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelectComboBox } from "@/components/ui/multi-select-combobox";
import { cn } from "@/lib/utils";
import {
    Search,
    Filter,
    X,
    ChevronDown,
    RefreshCw,
    Layers,
    Settings,
    Sparkles,
    ListFilter,
} from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "transition-all duration-200";
const NEU_BADGE_PRIMARY =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_ICON_WELL_PRIMARY =
    "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Animation variants ────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const advancedFiltersVariants: Variants = {
    hidden: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Helpers ───────────────────────────────────────────────────
const enumToOptions = <T extends string>(enumObj: Record<string, T>) =>
    Object.values(enumObj).map((value) => ({ label: value, value }));

export default function FiltersBar() {
    const { filters, pagination, setFilters, clearFilters, fetchTours } =
        useTourApproval();

    const [localSearch, setLocalSearch] = useState<string>(filters?.search || "");
    const [localDivision, setLocalDivision] = useState<Division[]>(filters?.division || []);
    const [localDistrict, setLocalDistrict] = useState<District[]>(filters?.district || []);
    const [localTourType, setLocalTourType] = useState<TravelType[]>(filters?.tourType || []);
    const [localDifficulty, setLocalDifficulty] = useState<DifficultyLevel[]>(filters?.difficulty || []);
    const [localStatus, setLocalStatus] = useState<TourStatus[]>(filters?.status || []);
    const [localModerationStatus, setLocalModerationStatus] = useState<ModerationStatus[]>(
        filters?.moderationStatus || [MODERATION_STATUS.PENDING]
    );
    const [localLimit, setLocalLimit] = useState<number>(pagination.limit || 10);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showAllFilters, setShowAllFilters] = useState(false);

    const moderationOptions = useMemo(() => enumToOptions(MODERATION_STATUS), []);
    const statusOptions = useMemo(() => enumToOptions(TOUR_STATUS), []);
    const divisionOptions = useMemo(() => enumToOptions(DIVISION), []);
    const districtOptions = useMemo(() => enumToOptions(DISTRICT), []);
    const tourTypeOptions = useMemo(() => enumToOptions(TRAVEL_TYPE), []);
    const difficultyOptions = useMemo(() => enumToOptions(DIFFICULTY_LEVEL), []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (localSearch) count++;
        if (localDivision.length > 0) count++;
        if (localDistrict.length > 0) count++;
        if (localTourType.length > 0) count++;
        if (localDifficulty.length > 0) count++;
        if (localStatus.length > 0) count++;
        if (localModerationStatus.length > 0) count++;
        return count;
    }, [localSearch, localDivision, localDistrict, localTourType, localDifficulty, localStatus, localModerationStatus]);

    const debouncedSetFilters = useDebouncedCallback((searchValue: string) => {
        if (searchValue !== filters?.search) {
            setFilters({ ...filters, search: searchValue || undefined });
        }
    }, 300);

    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
        debouncedSetFilters(value);
    };

    const applyFilters = useCallback(() => {
        setFilters({
            search: localSearch || undefined,
            division: localDivision.length > 0 ? localDivision : undefined,
            district: localDistrict.length > 0 ? localDistrict : undefined,
            tourType: localTourType.length > 0 ? localTourType : undefined,
            difficulty: localDifficulty.length > 0 ? localDifficulty : undefined,
            status: localStatus.length > 0 ? localStatus : undefined,
            moderationStatus: localModerationStatus.length > 0 ? localModerationStatus : undefined,
        });
    }, [localSearch, localDivision, localDistrict, localTourType, localDifficulty, localStatus, localModerationStatus, setFilters]);

    useEffect(() => { setLocalLimit(pagination.limit || 10); }, [pagination.limit]);

    const handleLimitChange = (value: number) => {
        setLocalLimit(value);
        fetchTours(filters || {}, 1, value);
    };

    const clearAllFilters = () => {
        setLocalSearch("");
        setLocalDivision([]);
        setLocalDistrict([]);
        setLocalTourType([]);
        setLocalDifficulty([]);
        setLocalStatus([]);
        setLocalModerationStatus([MODERATION_STATUS.PENDING]);
        clearFilters();
    };

    const renderMultiSelect = <T extends string>(
        label: string,
        options: { label: string; value: T }[],
        selectedValues: T[],
        setSelectedValues: (values: T[]) => void,
        icon?: React.ReactNode
    ) => (
        <div className="w-full space-y-2">
            <label className={cn(NEU_LABEL, "flex items-center gap-2")}>
                {icon}
                {label}
            </label>
            <MultiSelectComboBox<T>
                options={options}
                value={selectedValues}
                placeholder={`Select ${label.toLowerCase()}…`}
                onChange={setSelectedValues}
            />
            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedValues.map((value) => (
                        <span key={value} className={NEU_BADGE}>
                            {value}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(NEU_CARD, "overflow-hidden")}
            aria-label="Filters and search"
        >
            <div className="p-5 md:p-6 space-y-5">
                {/* ── Header ─────────────────────────────────────────── */}
                <div className={cn("flex items-center justify-between pb-4 border-b", NEU_DIVIDER)}>
                    <div className="flex items-center gap-3">
                        <div className={cn(NEU_ICON_WELL_PRIMARY, "w-10 h-10 flex items-center justify-center")}>
                            <Filter className="w-5 h-5 text-[#006666]" />
                        </div>
                        <div>
                            <h2 className={cn(NEU_HEADING, "text-base")}>Filters & Search</h2>
                            <p className={cn(NEU_MUTED, "text-xs")}>Refine your tour results</p>
                        </div>
                    </div>

                    <AnimatePresence>
                        {activeFiltersCount > 0 && (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={NEU_BADGE_PRIMARY}
                            >
                                <Sparkles className="w-3 h-3" />
                                {activeFiltersCount} active
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Main filters row ───────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-4 space-y-2">
                        <label className={cn(NEU_LABEL, "flex items-center gap-2")}>
                            <Search className="w-3.5 h-3.5" />
                            Search Tours
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E2938]/40 pointer-events-none" />
                            <input
                                className={cn(NEU_INPUT, "w-full pl-10 pr-9 py-2.5")}
                                placeholder="Title, slug, author…"
                                value={localSearch}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            {localSearch && (
                                <button
                                    onClick={() => handleSearchChange("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 hover:text-[#FF2157] transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className={cn(NEU_MUTED, "text-xs flex items-center gap-1")}>
                            <RefreshCw className="w-3 h-3" />
                            Auto-updates as you type
                        </p>
                    </div>

                    {/* Moderation Status */}
                    <div className="lg:col-span-3">
                        {renderMultiSelect<ModerationStatus>(
                            "Moderation",
                            moderationOptions,
                            localModerationStatus,
                            setLocalModerationStatus,
                            <ListFilter className="w-3.5 h-3.5" />
                        )}
                    </div>

                    {/* Tour Status */}
                    <div className="lg:col-span-3">
                        {renderMultiSelect<TourStatus>(
                            "Status",
                            statusOptions,
                            localStatus,
                            setLocalStatus,
                            <Settings className="w-3.5 h-3.5" />
                        )}
                    </div>

                    {/* Per Page */}
                    <div className="lg:col-span-2 space-y-2">
                        <label className={cn(NEU_LABEL, "flex items-center gap-2")}>
                            <Layers className="w-3.5 h-3.5" />
                            Per Page
                        </label>
                        <ComboBox
                            options={[
                                { label: "10", value: "10" },
                                { label: "25", value: "25" },
                                { label: "50", value: "50" },
                            ]}
                            value={String(localLimit)}
                            placeholder="10"
                            onChange={(value) => handleLimitChange(Number(value))}
                        />
                    </div>
                </div>

                {/* ── Action buttons ─────────────────────────────────── */}
                <div className={cn("flex flex-wrap items-center gap-3 pt-4 border-t", NEU_DIVIDER)}>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={cn(NEU_BTN_GHOST, "h-9 px-4 flex items-center gap-2 text-sm")}
                    >
                        <Filter className="w-4 h-4" />
                        {showAdvancedFilters ? "Hide" : "Show"} Advanced
                        <motion.span
                            animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.span>
                    </button>

                    <button
                        onClick={applyFilters}
                        className={cn(NEU_BTN_PRIMARY, "h-9 px-4 flex items-center gap-2 text-sm")}
                    >
                        <Sparkles className="w-4 h-4" />
                        Apply Filters
                    </button>

                    <button
                        onClick={clearAllFilters}
                        className={cn(NEU_BTN_DANGER, "h-9 px-4 flex items-center gap-2 text-sm")}
                    >
                        <X className="w-4 h-4" />
                        Clear All
                    </button>

                    <div className="flex-1" />

                    <div className={cn(NEU_SURFACE_INSET_SM, "px-3 py-1.5 rounded-xl")}>
                        <span className={NEU_MUTED}>
                            Showing{" "}
                            <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]">
                                {pagination.limit}
                            </span>{" "}
                            per page
                        </span>
                    </div>
                </div>

                {/* ── Advanced filters ───────────────────────────────── */}
                <AnimatePresence>
                    {showAdvancedFilters && (
                        <motion.div
                            variants={advancedFiltersVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="overflow-hidden"
                        >
                            <div className={cn("pt-5 border-t space-y-5", NEU_DIVIDER)}>
                                <div className="flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-[#006666]" />
                                    <h3 className={cn(NEU_HEADING, "text-sm")}>Advanced Filters</h3>
                                    <span className={cn(NEU_BADGE, "ml-1")}>Optional</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {renderMultiSelect<Division>("Division", divisionOptions, localDivision, setLocalDivision)}
                                    {renderMultiSelect<District>("District", districtOptions, localDistrict, setLocalDistrict)}
                                    {renderMultiSelect<TravelType>("Tour Type", tourTypeOptions, localTourType, setLocalTourType)}
                                    {renderMultiSelect<DifficultyLevel>("Difficulty", difficultyOptions, localDifficulty, setLocalDifficulty)}
                                </div>

                                {/* Show all toggle */}
                                <div className={cn(NEU_SURFACE_INSET_SM, "flex items-center gap-3 p-4 rounded-xl")}>
                                    <Checkbox
                                        id="show-all-filters"
                                        checked={showAllFilters}
                                        onCheckedChange={(checked) => setShowAllFilters(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="show-all-filters"
                                        className={cn(NEU_MUTED, "cursor-pointer")}
                                    >
                                        Show less common filters
                                    </label>
                                </div>

                                <div className={cn("flex justify-end pt-4 border-t", NEU_DIVIDER)}>
                                    <button
                                        onClick={applyFilters}
                                        className={cn(NEU_BTN_PRIMARY, "h-9 px-4 flex items-center gap-2 text-sm")}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Apply Advanced Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom accent line */}
            <div className="h-0.5 w-full bg-[#006666]/30" />
        </motion.section>
    );
}