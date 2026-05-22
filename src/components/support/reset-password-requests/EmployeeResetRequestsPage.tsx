"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { RefreshCw, Shield, AlertCircle } from "lucide-react";
import { useResetRequestsStore } from "@/store/employee/reset-requests.store";
import RequestList from "./RequestList";

// ─── Neumorphism Style Tokens ────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
// ────────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function EmployeeResetRequestsPage() {
  const { fetchList, currentQuery, loading, error } = useResetRequestsStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchList(currentQuery).catch(() => {});
    return () => { hasFetched.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchList(currentQuery);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <motion.div
      className={`${NEU_PAGE_BG} p-4 lg:p-6 xl:p-8`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.header className="mb-8" variants={itemVariants}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={NEU_ICON_WELL_PRIMARY}>
                  <Shield className="w-6 h-6 text-[#006666]" />
                </div>
                <h1 className={`text-2xl lg:text-3xl ${NEU_HEADING}`}>
                  Password Reset Requests
                </h1>
              </div>
              <p className={`${NEU_MUTED} ml-[52px]`}>
                Manage employee password reset requests
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className={`${NEU_BTN_GHOST} flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div
                className={`${NEU_SURFACE_INSET} rounded-2xl border border-[#FF2157]/20 p-4 flex items-center gap-3`}
              >
                <AlertCircle className="w-5 h-5 text-[#FF2157] flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#FF2157]">
                    Error loading requests
                  </p>
                  <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 mt-0.5">
                    {error.message}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* ── Divider ─────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-[#1E2938]/10 to-transparent" />
        </motion.div>

        {/* ── Main content ────────────────────────────────────── */}
        <motion.main variants={itemVariants}>
          <div className={`${NEU_CARD} overflow-hidden`}>
            <RequestList />
          </div>
        </motion.main>

      </div>
    </motion.div>
  );
}