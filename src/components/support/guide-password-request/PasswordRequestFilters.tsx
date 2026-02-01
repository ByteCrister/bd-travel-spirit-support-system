// components/guide-password-request/PasswordRequestFilters.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  CalendarIcon, 
  X, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Rows3
} from "lucide-react";
import { format } from "date-fns";
import { SORT_OPTIONS, STATUS_OPTIONS, usePasswordRequestStore } from "@/store/guide/guide-password-request.store";

// Add page limit options
const PAGE_LIMIT_OPTIONS = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

export function PasswordRequestFilters() {
  const { filters, setFilters, resetFilters, pagination, setLimit } = usePasswordRequestStore();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const hasActiveFilters = 
    filters.search || 
    filters.status !== "ALL" || 
    filters.dateRange.start || 
    filters.dateRange.end;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 p-6 border border-slate-200 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
            <Filter className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Filters & Sorting
          </h3>
          {hasActiveFilters && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
            >
              {[
                filters.search,
                filters.status !== "ALL",
                filters.dateRange.start,
                filters.dateRange.end
              ].filter(Boolean).length}
            </motion.span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-8 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          disabled={!hasActiveFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Filter Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9 border-slate-300 focus:border-slate-400 focus:ring-slate-400 transition-colors"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ 
              status: value as typeof filters.status 
            })}
          >
            <SelectTrigger className="border-slate-300 focus:border-slate-400 focus:ring-slate-400">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Date Range</label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-slate-300 hover:bg-slate-50 transition-colors",
                  !filters.dateRange.start && !filters.dateRange.end && "text-slate-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                {filters.dateRange.start && filters.dateRange.end ? (
                  <span className="text-slate-900">
                    {format(filters.dateRange.start, "MMM d")} - {format(filters.dateRange.end, "MMM d, yyyy")}
                  </span>
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange.start || undefined,
                  to: filters.dateRange.end || undefined,
                }}
                onSelect={(range) => 
                  setFilters({ 
                    dateRange: { 
                      start: range?.from || null, 
                      end: range?.to || null 
                    } 
                  })
                }
                initialFocus
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Sort By</label>
          <div className="flex gap-2">
            <Select
              value={filters.sortBy.field}
              onValueChange={(value) => setFilters({ 
                sortBy: { 
                  ...filters.sortBy, 
                  field: value as typeof filters.sortBy.field 
                } 
              })}
            >
              <SelectTrigger className="border-slate-300 focus:border-slate-400 focus:ring-slate-400">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => 
                setFilters({ 
                  sortBy: { 
                    ...filters.sortBy, 
                    order: filters.sortBy.order === "asc" ? "desc" : "asc" 
                  } 
                })
              }
              className="border-slate-300 hover:bg-slate-100 transition-colors shrink-0"
            >
              <motion.div
                animate={{ rotate: filters.sortBy.order === "asc" ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowUpDown className="h-4 w-4 text-slate-600" />
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <Rows3 className="h-4 w-4 text-slate-500" />
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Items per page
            </label>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger className="w-[130px] border-slate-300 focus:border-slate-400 focus:ring-slate-400">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Results count */}
          <div className="text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            Showing{" "}
            <span className="font-medium text-slate-900">
              {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
            </span>
            {" "}to{" "}
            <span className="font-medium text-slate-900">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            {" "}of{" "}
            <span className="font-medium text-slate-900">
              {pagination.total}
            </span>
            {" "}requests
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.page > 1) {
                setFilters({});
                usePasswordRequestStore.getState().setPage(pagination.page - 1);
              }
            }}
            disabled={pagination.page === 1}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {/* Page indicator */}
          <div className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md min-w-[80px] text-center">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (pagination.page < pagination.totalPages) {
                usePasswordRequestStore.getState().setPage(pagination.page + 1);
              }
            }}
            disabled={pagination.page === pagination.totalPages}
            className="border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}