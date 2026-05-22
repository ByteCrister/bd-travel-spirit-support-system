// app/guide-password-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { PasswordRequestDto } from "@/types/guide/guide-forgot-password.types";
import { RefreshCw, AlertCircle, Shield } from "lucide-react";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";
import { PasswordRequestStats } from "./PasswordRequestStats";
import { PasswordRequestFilters } from "./PasswordRequestFilters";
import { PasswordRequestsTable } from "./PasswordRequestsTable";
import { PasswordRequestDialog } from "./PasswordRequestDialog";
import { cn } from "@/lib/utils";
import {
  NEU_PAGE_BG,
  NEU_CARD,
  NEU_BTN_GHOST,
  NEU_HEADING,
  NEU_MUTED,
  NEU_ICON_WELL_PRIMARY,
  NEU_SURFACE_INSET,
  NEU_DIVIDER,
} from "@/styles/neu.styles";

// ── Local style constants ────────────────────────────────────────────────────
const PAGE_CONTAINER = "container mx-auto py-8 px-4 space-y-6 max-w-7xl";
const SECTION_CARD = cn(NEU_CARD, "overflow-hidden");
const CARD_HEADER = cn("px-6 py-5 flex items-center justify-between border-b", NEU_DIVIDER);
const CARD_TITLE = cn(NEU_HEADING, "text-base");
const CARD_DESC = cn(NEU_MUTED, "text-xs mt-0.5");

// ── Animation variants ───────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function GuidePasswordRequestsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    fetchRequests,
    fetchStats,
    error,
    clearError,
    isFetching,
    filters,
    pagination,
    selectRequest,
  } = usePasswordRequestStore();

  // Initial data fetch
  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  // Fetch on filter/pagination change
  useEffect(() => {
    fetchRequests();
  }, [filters, pagination.page, pagination.limit, fetchRequests]);

  const handleSelectRequest = (request: PasswordRequestDto) => {
    selectRequest(request);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchRequests(true);
    fetchStats(true);
  };

  return (
    <div className={NEU_PAGE_BG}>
      <motion.div
        className={PAGE_CONTAINER}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Page Header ───────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className={NEU_ICON_WELL_PRIMARY}>
              <Shield className="h-6 w-6 text-[#006666]" />
            </div>
            <div>
              <h1 className={cn(NEU_HEADING, "text-2xl sm:text-3xl")}>
                Password Reset Requests
              </h1>
              <p className={cn(NEU_MUTED, "mt-0.5")}>
                Manage and review guide password reset requests
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={cn(
              NEU_BTN_GHOST,
              "px-4 py-2.5 text-sm flex items-center gap-2 shrink-0",
              isFetching && "opacity-60 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </button>
        </motion.div>

        {/* ── Error Banner ──────────────────────────────────── */}
        {error && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              NEU_SURFACE_INSET,
              "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#FF2157]/20"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="h-4 w-4 text-[#FF2157] shrink-0" />
              <span className={cn(NEU_MUTED, "text-[#FF2157]/80 truncate")}>{error}</span>
            </div>
            <button
              onClick={clearError}
              className={cn(
                NEU_BTN_GHOST,
                "px-3 py-1.5 text-xs text-[#FF2157] shrink-0 flex items-center gap-1"
              )}
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* ── Stats Section ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className={SECTION_CARD}>
          <div className={CARD_HEADER}>
            <div>
              <h2 className={CARD_TITLE}>Overview</h2>
              <p className={CARD_DESC}>Real-time statistics for password reset requests</p>
            </div>
          </div>
          <div className="p-6">
            <PasswordRequestStats />
          </div>
        </motion.div>

        {/* ── Filters Section ───────────────────────────────── */}
        <motion.div variants={itemVariants}>
          <PasswordRequestFilters />
        </motion.div>

        {/* ── Table Section ─────────────────────────────────── */}
        <motion.div variants={itemVariants} className={SECTION_CARD}>
          <div className={CARD_HEADER}>
            <div>
              <h2 className={CARD_TITLE}>Requests</h2>
              <p className={CARD_DESC}>Click any row to view detailed information</p>
            </div>
          </div>
          <PasswordRequestsTable onSelectRequest={handleSelectRequest} />
        </motion.div>

        {/* ── Detail Dialog ─────────────────────────────────── */}
        <PasswordRequestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </motion.div>
    </div>
  );
}