// components/support/tours/Pagination.tsx
"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTourApproval } from "@/store/tour-approval.store";

export default function Pagination() {
  const { pagination, fetchTours, prefetchNextPage, filters, isLoading } =
    useTourApproval();

  const goTo = (page: number) => {
    fetchTours(filters || {}, page, pagination.limit);
    prefetchNextPage(filters || {}, page, pagination.limit);
  };

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const current = pagination.page;
    const total = pagination.totalPages || 1;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(total);
    }

    return pages;
  }, [pagination.page, pagination.totalPages]);

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-4"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results Info */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {pagination.total > 0 ? startItem : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
            <span className="font-semibold text-gray-900">{pagination.total}</span>{" "}
            results
          </div>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            </motion.div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* First Page Button */}
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            onClick={() => goTo(1)}
            disabled={pagination.page <= 1 || isLoading}
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Button */}
          <button
            className="inline-flex items-center justify-center gap-1 px-3 h-9 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            onClick={() => goTo(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, idx) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex items-center justify-center w-9 h-9 text-gray-500"
                  >
                    •••
                  </span>
                );
              }

              const isActive = pageNum === pagination.page;

              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  onClick={() => goTo(pageNum as number)}
                  disabled={isLoading || isActive}
                >
                  {pageNum}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            className="inline-flex items-center justify-center gap-1 px-3 h-9 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            onClick={() =>
              goTo(Math.min(pagination.totalPages || 1, pagination.page + 1))
            }
            disabled={
              pagination.page >= (pagination.totalPages || 1) || isLoading
            }
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page Button */}
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
            onClick={() => goTo(pagination.totalPages || 1)}
            disabled={
              pagination.page >= (pagination.totalPages || 1) || isLoading
            }
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Page Indicator */}
      <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
        <div className="text-center text-sm text-gray-600">
          Page{" "}
          <span className="font-semibold text-gray-900">{pagination.page}</span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">
            {pagination.totalPages || 1}
          </span>
        </div>
      </div>
    </motion.section>
  );
}