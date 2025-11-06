// components/guide/GuideFilters.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GUIDE_STATUS } from "@/constants/guide.const";
import { QueryParams } from "@/store/guide.store";
import { Search, X } from "lucide-react";

// React Icons
import { HiFilter } from "react-icons/hi";
import { BiSortAlt2 } from "react-icons/bi";
import { AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import { MdClear } from "react-icons/md";
import { FiClock, FiCheckCircle, FiXCircle, FiList } from "react-icons/fi";
import { BsCircleFill } from "react-icons/bs";

type Props = {
  query: QueryParams;
  onChange: (partial: Partial<QueryParams>) => void;
  onPageSizeChange: (pageSize: number) => void
  loading?: boolean;
};

export function GuideFilters({ query, onChange, onPageSizeChange, loading }: Props) {
  const [search, setSearch] = useState(query.search ?? "");

  // Debounce search updates
  useEffect(() => {
    const t = setTimeout(() => {
      onChange({ search: search || undefined, page: 1 });
    }, 300);
    return () => clearTimeout(t);
  }, [onChange, search]);

  const hasActiveFilters = query.status || query.search;

  const clearFilters = () => {
    setSearch("");
    onChange({
      search: undefined,
      status: undefined,
      page: 1
    });
  };

  return (
    <div className="space-y-5">
      {/* Animated Header with Gradient */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur opacity-20 animate-pulse" />
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-lg shadow-lg">
              <HiFilter className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              Smart Filters
              {hasActiveFilters && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 animate-in fade-in zoom-in duration-200">
                  <BsCircleFill className="h-1.5 w-1.5" />
                  Active
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Refine your search with advanced filters
            </p>
          </div>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 px-3 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
          >
            <MdClear className="h-4 w-4 mr-1.5 group-hover:rotate-90 transition-transform duration-300" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Grid with Enhanced Styling */}
      <div className="grid gap-5 md:grid-cols-12 items-end">
        {/* Search with Gradient Border */}
        <div className="md:col-span-4">
          <Label
            htmlFor="search"
            className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5 text-blue-500" />
            Search Query
          </Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <Input
                id="search"
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10 h-11 w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Search guides"
                disabled={loading}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all duration-200"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Status Filter */}
        <div className="md:col-span-2">
          <Label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <FiClock className="h-3.5 w-3.5 text-amber-500" />
              <FiCheckCircle className="h-3.5 w-3.5 text-emerald-500" />
              <FiXCircle className="h-3.5 w-3.5 text-red-500" />
            </div>
            Status Filter
          </Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            <Select
              value={query.status ?? "all"}
              onValueChange={(val) =>
                onChange({
                  status: val === "all" ? undefined : (val as GUIDE_STATUS),
                  page: 1
                })
              }
              disabled={loading}
            >
              <SelectTrigger className="relative h-11 w-full border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-xl border-gray-200">
                <SelectItem value="all" className="rounded-md">
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
                    <span className="font-medium">All Statuses</span>
                  </div>
                </SelectItem>
                <SelectItem value={GUIDE_STATUS.PENDING} className="rounded-md">
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-300" />
                    <FiClock className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-medium">Pending</span>
                  </div>
                </SelectItem>
                <SelectItem value={GUIDE_STATUS.APPROVED} className="rounded-md">
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
                    <FiCheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-medium">Approved</span>
                  </div>
                </SelectItem>
                <SelectItem value={GUIDE_STATUS.REJECTED} className="rounded-md">
                  <div className="flex items-center gap-2.5 py-1">
                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-sm shadow-red-300" />
                    <FiXCircle className="h-3.5 w-3.5 text-red-600" />
                    <span className="font-medium">Rejected</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sort By with Icon */}
        <div className="md:col-span-2">
          <Label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <BiSortAlt2 className="h-4 w-4 text-indigo-500" />
            Sort By
          </Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            <Select
              value={query.sortBy}
              onValueChange={(val) =>
                onChange({ sortBy: val as QueryParams["sortBy"], page: 1 })
              }
              disabled={loading}
            >
              <SelectTrigger className="relative h-11 w-full border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-xl border-gray-200">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="companyName">Company</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="appliedAt">Applied Date</SelectItem>
                <SelectItem value="reviewedAt">Reviewed Date</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Order with Dynamic Icon */}
        <div className="md:col-span-2">
          <Label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            {query.sortDir === "asc" ? (
              <AiOutlineSortAscending className="h-4 w-4 text-purple-500" />
            ) : (
              <AiOutlineSortDescending className="h-4 w-4 text-purple-500" />
            )}
            Order
          </Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            <Select
              value={query.sortDir}
              onValueChange={(val) =>
                onChange({ sortDir: val as "asc" | "desc", page: 1 })
              }
              disabled={loading}
            >
              <SelectTrigger className="relative h-11 w-full border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-xl border-gray-200">
                <SelectItem value="asc" className="rounded-md">
                  <div className="flex items-center gap-2 py-1">
                    <AiOutlineSortAscending className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Ascending</span>
                  </div>
                </SelectItem>
                <SelectItem value="desc" className="rounded-md">
                  <div className="flex items-center gap-2 py-1">
                    <AiOutlineSortDescending className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Descending</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Per Page Select - NEW */}
        <div className="md:col-span-2">
          <Label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <FiList className="h-3.5 w-3.5 text-teal-500" />
            Per Page
          </Label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            <Select
              value={query.pageSize.toString()}
              onValueChange={(val) =>
                onPageSizeChange(Number(val))
              }
              disabled={loading}
            >
              <SelectTrigger className="relative h-11 w-full border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-xl border-gray-200">
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={n.toString()} className="rounded-md">
                    <div className="flex items-center gap-2 py-1">
                      <span className="font-medium">{n} items</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}