"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  EmployeesListResponse,
  EmployeesQuery,
  EmployeeSortKey,
} from "@/types/employee/employee.types";
import { Plus } from "lucide-react";
import { EmployeeSummary } from "./EmployeeSummary";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { PaginationControls } from "./PaginationControls";
import { Breadcrumbs } from "../../global/Breadcrumbs";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { useEmployeeStore } from "@/store/employee/employee.store";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-white " +
  "bg-[#006666] " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "transition-all duration-200";

const NEU_PAGE_WRAPPER = "space-y-6 p-4 sm:p-6 lg:p-8";

const NEU_HEADER_ROW =
  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

// ─────────────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const router = useRouter();
  const store = useEmployeeStore();
  const [retryLoading, setRetryLoading] = useState<string | null>(null);

  const [query, setQuery] = useState<EmployeesQuery>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    filters: {},
  });
  const [list, setList] = useState<EmployeesListResponse | null>(null);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Employees", href: "/users/employees" },
  ];

  // Hydrate list using cache-first logic inside store
  useEffect(() => {
    let mounted = true;
    store
      .fetchEmployees(query)
      .then((res) => mounted && setList(res))
      .catch(() => mounted && setList(null));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const summary = useMemo(() => {
    const docs = list?.docs ?? [];
    const total = list?.total ?? 0;
    const active = docs.filter((d) => d.status === "active").length;
    const onLeave = docs.filter((d) => d.status === "onLeave").length;
    const suspended = docs.filter((d) => d.status === "suspended").length;
    const terminated = docs.filter((d) => d.status === "terminated").length;
    return { total, active, onLeave, suspended, terminated };
  }, [list]);

  const onRowClick = async (id: string) => {
    router.push(`/users/employees/${encodeId(encodeURIComponent(id))}`);
  };

  const onSort = (sortBy: EmployeeSortKey, sortOrder: "asc" | "desc") =>
    setQuery((q) => ({ ...q, sortBy, sortOrder }));

  const onPageChange = (page: number) => setQuery((q) => ({ ...q, page }));

  const onLimitChange = (limit: number) =>
    setQuery((q) => ({ ...q, limit, page: 1 }));

  const handleRetryPayment = async (employeeId: string) => {
    setRetryLoading(employeeId);
    await store.retryEmployeeSalaryPayment(employeeId);
    setRetryLoading(null);
  };

  return (
    <div className={NEU_PAGE_BG}>
      <div className={NEU_PAGE_WRAPPER}>
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <div className={NEU_HEADER_ROW}>
          <h1 className={`text-2xl sm:text-3xl ${NEU_HEADING}`}>Employees</h1>

          <button
            onClick={() => router.push(`/users/employees/add-employee`)}
            className={NEU_BTN_PRIMARY}
            aria-label="Add new employee"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Employee
          </button>
        </div>

        {/* Summary Cards */}
        <EmployeeSummary summary={summary} loading={store.loadingList} />

        {/* Filters */}
        <EmployeeFilters
          query={query}
          onChange={setQuery}
          loading={store.loadingList}
          fetchEnums={store.fetchEnums}
        />

        {/* Table */}
        <EmployeeTable
          list={list}
          loading={store.loadingList}
          onRowClick={onRowClick}
          onSort={onSort}
          sortBy={query.sortBy ?? "createdAt"}
          sortOrder={query.sortOrder ?? "desc"}
          onRetryPayment={handleRetryPayment}
          retryLoading={retryLoading || undefined}
        />

        {/* Pagination */}
        <PaginationControls
          page={list?.page ?? query.page ?? 1}
          pages={list?.pages ?? 1}
          limit={query.limit ?? 20}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          loading={store.loadingList}
        />
      </div>
    </div>
  );
}
