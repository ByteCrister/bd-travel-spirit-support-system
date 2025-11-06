"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationControls({
  page,
  pages,
  limit,
  onPageChange,
  onLimitChange,
  loading,
}: {
  page: number;
  pages: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  loading: boolean;
}) {
  const limits = [10, 20, 50, 100];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-white p-4 md:flex-row md:items-center md:justify-between shadow-sm">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Rows per page</span>
        <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
          <SelectTrigger className="h-9 w-28 rounded-md border border-blue-200 px-3 text-sm shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <SelectValue placeholder={String(limit)} />
          </SelectTrigger>
          <SelectContent className="w-28">
            {limits.map((l) => (
              <SelectItem key={l} value={String(l)}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="hidden text-sm text-gray-400 md:inline">•</span>
        <span className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-medium text-gray-900">
            {Math.min(limit, (pages - 1) * limit + limit)}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900">{pages * limit}</span>
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={loading || page <= 1}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden md:inline">Previous</span>
        </Button>

        <div className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 bg-transparent">
          <span className="sr-only">Current page</span>
          <span className="text-sm text-gray-500">Page</span>{" "}
          <span className="mx-1 inline-flex min-w-[2rem] items-center justify-center rounded bg-blue-100 px-2 py-1 font-medium text-blue-600">
            {page}
          </span>{" "}
          <span className="text-sm text-gray-500">of</span>{" "}
          <span className="ml-1 font-medium text-gray-900">{pages}</span>
        </div>

        <Button
          onClick={() => onPageChange(Math.min(pages, page + 1))}
          disabled={loading || page >= pages}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <span className="hidden md:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
