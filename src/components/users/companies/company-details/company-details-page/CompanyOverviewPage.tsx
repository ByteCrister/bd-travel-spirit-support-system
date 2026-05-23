"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineRefresh, MdBusiness, MdPeople, MdTour } from "react-icons/md";
import { CompanyAccordion } from "./CompanyAccordion";
import { FiltersBar } from "./FiltersBar";
import { ToursTable } from "../tours/ToursTable";
import { EmployeesTable } from "../employees/EmployeesTable";
import { useCompanyOverview } from "@/hooks/useCompanyOverview";
import { CompanyAccordionSkeleton } from "./CompanyAccordionSkeleton";
import { TableSkeleton } from "./TableSkeleton";
import { Breadcrumbs } from "../../../../global/Breadcrumbs";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_PAGE = "min-h-screen bg-[#E7E5E4] p-4 lg:p-6";

const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60";

const NEU_CARD_HEADER =
  "px-6 py-4 border-b border-[#c8c6c5]/50 flex items-center justify-between";

const NEU_HEADING =
  "font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight";

const NEU_AVATAR =
  "flex h-16 w-16 items-center justify-center rounded-2xl bg-[#006666] " +
  "shadow-[6px_6px_14px_#004d4d,-4px_-4px_10px_#008080]";

const NEU_REFRESH_BTN =
  "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#E7E5E4] text-[#1E2938] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_TAB_BAR =
  "inline-flex items-center gap-1 p-1 rounded-xl bg-[#E7E5E4] " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]";

const NEU_TAB =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold font-[family-name:var(--font-space-mono)] " +
  "text-[#1E2938]/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "hover:text-[#1E2938]";

const NEU_TAB_ACTIVE =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold font-[family-name:var(--font-space-mono)] " +
  "bg-[#006666] text-white " +
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none";

const NEU_COUNT_PILL =
  "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold " +
  "bg-white/20 font-[family-name:var(--font-jetbrains-mono)]";

const NEU_COUNT_PILL_INACTIVE =
  "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold " +
  "bg-[#E7E5E4] text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]";

const NEU_FILTER_WRAP =
  "rounded-xl bg-[#E7E5E4] p-4 shadow-[inset_2px_2px_6px_#c8c6c5,inset_-2px_-2px_6px_#ffffff]";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// ─────────────────────────────────────────────────────────────

type TabKey = "tours" | "employees";

interface Props {
  companyId: string;
}

export default function CompanyOverviewPage({ companyId }: Props) {
  const overview = useCompanyOverview(companyId);
  const breadcrumbItems = overview.breadcrumbs;

  const tabConfig: Record<
    TabKey,
    { icon: typeof MdTour; label: string; count?: number }
  > = {
    tours: {
      icon: MdTour,
      label: "Tours",
      count: overview.toursList?.total,
    },
    employees: {
      icon: MdPeople,
      label: "Employees",
      count: overview.employeesList?.total,
    },
  };

  return (
    <div className={NEU_PAGE}>
      <Breadcrumbs items={breadcrumbItems} className="p-4" />

      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className={NEU_AVATAR}>
              <MdBusiness className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className={`${NEU_HEADING} text-3xl`}>
                {overview.company?.companyName ?? "Company"}
              </h1>
              <p className={`${NEU_MUTED} mt-1`}>Overview &amp; management</p>
            </div>
          </div>

          <button
            onClick={overview.handleRefresh}
            className={NEU_REFRESH_BTN}
            aria-label="Refresh data"
          >
            <MdOutlineRefresh className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </motion.div>

        {/* Accordion */}
        <AnimatePresence mode="wait">
          <motion.div
            key="accordion"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {overview.isCompanyLoading || !overview.company ? (
              <CompanyAccordionSkeleton />
            ) : (
              <CompanyAccordion overview={overview.company} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Main Data Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1, ease: "easeOut" }}
          className={NEU_CARD}
        >
          {/* Card Header */}
          <div className={NEU_CARD_HEADER}>
            <h2 className={`${NEU_HEADING} text-lg`}>Company Data</h2>

            {/* Tab bar */}
            <div className={NEU_TAB_BAR} role="tablist">
              {(
                Object.entries(tabConfig) as [
                  TabKey,
                  (typeof tabConfig)[TabKey],
                ][]
              ).map(([key, config]) => {
                const Icon = config.icon;
                const isActive = overview.activeTab === key;
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => overview.setActiveTab(key)}
                    className={isActive ? NEU_TAB_ACTIVE : NEU_TAB}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{config.label}</span>
                    {config.count !== undefined && (
                      <span
                        className={
                          isActive ? NEU_COUNT_PILL : NEU_COUNT_PILL_INACTIVE
                        }
                      >
                        {config.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5">
            {/* Filters */}
            <div className={NEU_FILTER_WRAP}>
              <FiltersBar
                activeTab={overview.activeTab}
                search={overview.search}
                onSearch={overview.setSearch}
                limit={overview.limit}
                onLimitChange={overview.setLimit}
                sortKey={overview.sortKey}
                onSortKeyChange={overview.setSortKey}
                employeeSortKey={overview.employeeSortKey}
                onEmployeeSortKeyChange={overview.handleEmployeeSortKeyChange}
                sortOrder={overview.sortOrder}
                onSortOrderChange={overview.setSortOrder}
              />
            </div>

            {/* Tab panels */}
            <AnimatePresence mode="wait">
              {overview.activeTab === "tours" && (
                <motion.div
                  key={`tours-${overview.tourCacheKey ?? "empty"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  role="tabpanel"
                >
                  {overview.isToursLoading && !overview.toursList ? (
                    <TableSkeleton
                      columns={[
                        "Title",
                        "Status",
                        "Dates",
                        "Duration",
                        "Rating",
                        "Bookings",
                        "Featured",
                        "Updated",
                      ]}
                    />
                  ) : (
                    <ToursTable
                      companyId={companyId}
                      items={overview.filteredTours}
                      total={overview.toursList?.total ?? 0}
                      page={overview.toursList?.page ?? 1}
                      pages={overview.toursList?.pages ?? 1}
                      limit={overview.limit}
                      loading={!!overview.loading.tours}
                      error={overview.error.tours}
                      onPageChange={(page) =>
                        overview.fetchTours(companyId, {
                          page,
                          limit: overview.limit,
                          sort: overview.sortKey,
                          order: overview.sortOrder,
                        })
                      }
                    />
                  )}
                </motion.div>
              )}

              {overview.activeTab === "employees" && (
                <motion.div
                  key={`employees-${overview.employeeCacheKey ?? "empty"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  role="tabpanel"
                >
                  {overview.isEmployeesLoading && !overview.employeesList ? (
                    <TableSkeleton
                      columns={[
                        "Name",
                        "Email",
                        "Phone",
                        "Type",
                        "Salary",
                        "Status",
                        "Last Login",
                        "Joined",
                      ]}
                    />
                  ) : (
                    <EmployeesTable
                      fetchEmployeeDetail={overview.handleFetchEmployeeDetail}
                      items={overview.filteredEmployees}
                      total={overview.employeesList?.total ?? 0}
                      page={overview.employeesList?.page ?? 1}
                      pages={overview.employeesList?.pages ?? 1}
                      limit={overview.limit}
                      loading={!!overview.loading.employees}
                      error={overview.error.employees}
                      onPageChange={(page) =>
                        overview.fetchEmployees(companyId, {
                          page,
                          limit: overview.limit,
                          sort: overview.employeeSortKey,
                          order: overview.sortOrder,
                        })
                      }
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
