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
import type { TourFilterOptions } from "@/types/tour/tour.types";
import { useTourApproval } from "@/store/tour-approval.store";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { ComboBox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelectComboBox } from "@/components/ui/multi-select-combobox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

// Helper function to convert enums to ComboBox options
const enumToOptions = <T extends string>(enumObj: Record<string, T>) => {
    return Object.values(enumObj).map(value => ({
        label: value,
        value,
    }));
};

const containerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

const advancedFiltersVariants: Variants = {
    hidden: {
        height: 0,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: "easeInOut",
        },
    },
    visible: {
        height: "auto",
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

export default function FiltersBar() {
    const {
        filters,
        pagination,
        setFilters,
        clearFilters,
        fetchTours,
    } = useTourApproval();

    // Local state for all filter fields
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

    // Prepare options for comboboxes
    const moderationOptions = useMemo(() => enumToOptions(MODERATION_STATUS), []);
    const statusOptions = useMemo(() => enumToOptions(TOUR_STATUS), []);
    const divisionOptions = useMemo(() => enumToOptions(DIVISION), []);
    const districtOptions = useMemo(() => enumToOptions(DISTRICT), []);
    const tourTypeOptions = useMemo(() => enumToOptions(TRAVEL_TYPE), []);
    const difficultyOptions = useMemo(() => enumToOptions(DIFFICULTY_LEVEL), []);

    // Calculate active filters count
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

    // Apply filters immediately for search with debouncing
    const debouncedSetFilters = useDebouncedCallback((searchValue: string) => {
        if (searchValue !== filters?.search) {
            const newFilters: Partial<TourFilterOptions> = {
                ...filters,
                search: searchValue || undefined,
            };
            setFilters(newFilters);
        }
    }, 300);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setLocalSearch(value);
        debouncedSetFilters(value);
    };

    // Apply all other filters
    const applyFilters = useCallback(() => {
        const newFilters: Partial<TourFilterOptions> = {
            search: localSearch || undefined,
            division: localDivision.length > 0 ? localDivision : undefined,
            district: localDistrict.length > 0 ? localDistrict : undefined,
            tourType: localTourType.length > 0 ? localTourType : undefined,
            difficulty: localDifficulty.length > 0 ? localDifficulty : undefined,
            status: localStatus.length > 0 ? localStatus : undefined,
            moderationStatus: localModerationStatus.length > 0 ? localModerationStatus : undefined,
        };
        setFilters(newFilters);
    }, [localSearch, localDivision, localDistrict, localTourType, localDifficulty, localStatus, localModerationStatus, setFilters]);

    useEffect(() => {
        setLocalLimit(pagination.limit || 10);
    }, [pagination.limit]);

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

    // Render a multi-select combobox for array filters
    const renderMultiSelect = <T extends string>(
        label: string,
        options: { label: string; value: T }[],
        selectedValues: T[],
        setSelectedValues: (values: T[]) => void,
        icon?: React.ReactNode
    ) => (
        <div className="w-full space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                {icon}
                {label}
            </label>
            <MultiSelectComboBox<T>
                options={options}
                value={selectedValues}
                placeholder={`Select ${label.toLowerCase()}...`}
                onChange={setSelectedValues}
            />
            {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {selectedValues.map((value) => (
                        <Badge
                            key={value}
                            variant="secondary"
                            className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"
                        >
                            {value}
                        </Badge>
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
            className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-200"
        >
            {/* Decorative background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 pointer-events-none" />

            <div className="relative p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                            <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Filters & Search</h2>
                            <p className="text-xs text-slate-600">Refine your tour search</p>
                        </div>
                    </div>

                    {/* Active Filters Badge */}
                    {activeFiltersCount > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2"
                        >
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 shadow-md">
                                <Sparkles className="w-3 h-3 mr-1.5" />
                                {activeFiltersCount} Active Filter{activeFiltersCount !== 1 ? 's' : ''}
                            </Badge>
                        </motion.div>
                    )}
                </div>

                {/* Main Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    {/* Search Input */}
                    <div className="lg:col-span-4 space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Search className="w-4 h-4" />
                            Search Tours
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white hover:border-slate-300"
                                placeholder="Search by title, slug, author..."
                                value={localSearch}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            {localSearch && (
                                <button
                                    onClick={() => handleSearchChange("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
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
                            <ListFilter className="w-4 h-4" />
                        )}
                    </div>

                    {/* Tour Status */}
                    <div className="lg:col-span-3">
                        {renderMultiSelect<TourStatus>(
                            "Status",
                            statusOptions,
                            localStatus,
                            setLocalStatus,
                            <Settings className="w-4 h-4" />
                        )}
                    </div>

                    {/* Per Page Selector */}
                    <div className="lg:col-span-2 space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Layers className="w-4 h-4" />
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

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200">
                    <Button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        variant="outline"
                        className="border-2 hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    >
                        <Filter className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        {showAdvancedFilters ? "Hide" : "Show"} Advanced
                        <motion.div
                            animate={{ rotate: showAdvancedFilters ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-2"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </Button>

                    <Button
                        onClick={applyFilters}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Apply Filters
                    </Button>

                    <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Summary */}
                    <div className="text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                        Showing <span className="font-semibold text-slate-900">{pagination.limit}</span> results per page
                    </div>
                </div>

                {/* Advanced Filters Section */}
                <AnimatePresence>
                    {showAdvancedFilters && (
                        <motion.div
                            variants={advancedFiltersVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="overflow-hidden"
                        >
                            <div className="pt-6 border-t border-slate-200 space-y-6">
                                {/* Advanced Filters Header */}
                                <div className="flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-base font-bold text-slate-900">Advanced Filters</h3>
                                    <Badge variant="outline" className="ml-2">
                                        Optional
                                    </Badge>
                                </div>

                                {/* Advanced Filters Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Division Filter */}
                                    {renderMultiSelect<Division>(
                                        "Division",
                                        divisionOptions,
                                        localDivision,
                                        setLocalDivision
                                    )}

                                    {/* District Filter */}
                                    {renderMultiSelect<District>(
                                        "District",
                                        districtOptions,
                                        localDistrict,
                                        setLocalDistrict
                                    )}

                                    {/* Tour Type Filter */}
                                    {renderMultiSelect<TravelType>(
                                        "Tour Type",
                                        tourTypeOptions,
                                        localTourType,
                                        setLocalTourType
                                    )}

                                    {/* Difficulty Filter */}
                                    {renderMultiSelect<DifficultyLevel>(
                                        "Difficulty",
                                        difficultyOptions,
                                        localDifficulty,
                                        setLocalDifficulty
                                    )}
                                </div>

                                {/* Show All Filters Toggle */}
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <Checkbox
                                        id="show-all-filters"
                                        checked={showAllFilters}
                                        onCheckedChange={(checked) => setShowAllFilters(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="show-all-filters"
                                        className="text-sm font-medium text-slate-700 cursor-pointer"
                                    >
                                        Show less common filters
                                    </label>
                                </div>

                                {/* Apply Advanced Filters Button */}
                                <div className="flex justify-end pt-4 border-t border-slate-200">
                                    <Button
                                        onClick={applyFilters}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Apply Advanced Filters
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Accent Line */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        </motion.section>
    );
}