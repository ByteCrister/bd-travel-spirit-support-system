"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Users, MapPin, AlertCircle, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CompanyToolbar } from "@/components/users/companies/CompanyToolbar";
import { CompanyTable } from "@/components/users/companies/CompanyTable";
import { CompanyPagination } from "@/components/users/companies/CompanyPagination";
import { CompanySkeleton } from "@/components/users/companies/CompanySkeleton";
import { useCompanyStore } from "@/store/company/company.store";
import { Breadcrumbs } from "../../global/Breadcrumbs";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_CARD_HOVER =
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";

const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// ─────────────────────────────────────────────────────────────

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Companies", href: "/companies" },
];

const STAT_CARDS = [
  {
    title: "Total Companies",
    key: "totalCompanies" as const,
    icon: Building2,
    accent: "#006666",
    iconBg: "bg-[#006666]/10",
    iconColor: "text-[#006666]",
  },
  {
    title: "Total Employees",
    key: "totalEmployees" as const,
    icon: Users,
    accent: "#FE9900",
    iconBg: "bg-[#FE9900]/10",
    iconColor: "text-[#FE9900]",
  },
  {
    title: "Total Tours",
    key: "totalTours" as const,
    icon: MapPin,
    accent: "#00A63D",
    iconBg: "bg-[#00A63D]/10",
    iconColor: "text-[#00A63D]",
  },
];

export default function CompanyPage() {
  const {
    params,
    loading,
    error,
    stats,
    fetchCompanies,
    getCurrentPage,
    clearError,
  } = useCompanyStore();

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.search, params.sortBy, params.sortDir, params.page, params.limit]);

  const pageEntry = getCurrentPage();

  return (
    <div className={NEU_PAGE_BG}>
      {/* Breadcrumbs */}
      <Breadcrumbs className="p-4 lg:p-6" items={breadcrumbItems} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* ── Page Header ─────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4"
        >
          <div
            className={`${NEU_ICON_WELL_PRIMARY} flex items-center justify-center`}
          >
            <Building2 className="w-6 h-6 text-[#006666]" />
          </div>
          <div>
            <h1 className={`${NEU_HEADING} text-2xl sm:text-3xl`}>Companies</h1>
            <p className={NEU_MUTED}>
              Manage and monitor your organisation&apos;s companies
            </p>
          </div>
        </motion.header>

        {/* ── Stat Cards ──────────────────────────────────── */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {STAT_CARDS.map((card, i) => {
              const Icon = card.icon;
              const value = stats[card.key] ?? 0;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
                  className={`${NEU_CARD} ${NEU_CARD_HOVER} p-6 flex items-center gap-5`}
                >
                  <div
                    className={`${card.iconBg} shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] rounded-xl p-3 flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/50 uppercase tracking-widest mb-1">
                      {card.title}
                    </p>
                    <p className="font-[family-name:var(--font-space-mono)] text-3xl font-bold text-[#1E2938]">
                      {value.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Toolbar ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <CompanyToolbar />
        </motion.div>

        {/* ── Error Alert ─────────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Alert
              variant="destructive"
              role="alert"
              className={`relative ${NEU_CARD} border-[#FF2157]/20 bg-[#FF2157]/5`}
            >
              <AlertCircle className="h-5 w-5 text-[#FF2157]" />
              <AlertTitle className="font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157]">
                Error
              </AlertTitle>
              <AlertDescription className="mt-1 font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70">
                {error}
              </AlertDescription>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={clearError}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[#FF2157]/10 transition-colors"
              >
                <X className="w-4 h-4 text-[#FF2157]" />
              </button>
            </Alert>
          </motion.div>
        )}

        {/* ── Table ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className={`${NEU_CARD} overflow-hidden`}
        >
          {loading ? (
            <CompanySkeleton />
          ) : (
            <CompanyTable rows={pageEntry?.rows ?? []} />
          )}
        </motion.div>

        {/* ── Pagination ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <CompanyPagination
            page={pageEntry?.page ?? 1}
            pages={pageEntry?.pages ?? 1}
          />
        </motion.div>
      </div>
    </div>
  );
}
