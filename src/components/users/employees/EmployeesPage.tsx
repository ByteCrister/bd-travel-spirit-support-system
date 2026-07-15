"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  EmployeesListResponse,
  EmployeesQuery,
  EmployeeSortKey,
  EmployeeListItemDTO,
} from "@/types/employee/employee.types";
import { Plus, Banknote, X } from "lucide-react";
import { EmployeeSummary } from "./EmployeeSummary";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { PaginationControls } from "./PaginationControls";
import ManualPayrollConfirmDialog from "./ManualPayrollConfirmDialog";
import { Breadcrumbs } from "../../global/Breadcrumbs";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { useEmployeeStore } from "@/store/employee/employee.store";
import {
  getPayableManualEmployees,
  sumPayrollAmount,
} from "@/utils/helpers/manual-payroll.helpers";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-white " +
  "bg-[#006666] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#007777] hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "transition-all duration-200";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";

const NEU_BULK_BAR =
  "flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#006666]/10 " +
  "border border-[#006666]/20 px-4 py-3 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_PAGE_WRAPPER = "space-y-6 p-4 sm:p-6 lg:p-8";

const NEU_HEADER_ROW =
  "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

// ─────────────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const router = useRouter();
  const store = useEmployeeStore();
  const [retryLoading, setRetryLoading] = useState<string | null>(null);
  const [manualPayLoading, setManualPayLoading] = useState<string | null>(null);
  const [bulkPayLoading, setBulkPayLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payDialogEmployees, setPayDialogEmployees] = useState<EmployeeListItemDTO[]>([]);

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

  const refreshList = async () => {
    const res = await store.fetchEmployees(query, true);
    setList(res);
  };

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

  const selectedEmployees = useMemo(() => {
    const docs = list?.docs ?? [];
    return docs.filter((d) => selectedIds.has(d.id));
  }, [list?.docs, selectedIds]);

  const payableOnPage = useMemo(
    () => getPayableManualEmployees(list?.docs ?? []),
    [list?.docs]
  );

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
    try {
      await store.retryEmployeeSalaryPayment(employeeId);
      await refreshList();
    } finally {
      setRetryLoading(null);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const openPayDialog = (employees: EmployeeListItemDTO[]) => {
    setPayDialogEmployees(employees);
    setPayDialogOpen(true);
  };

  const handleManualPaySingle = (employee: EmployeeListItemDTO) => {
    openPayDialog([employee]);
  };

  const handleBulkPaySelected = () => {
    if (selectedEmployees.length === 0) return;
    openPayDialog(selectedEmployees);
  };

  const handleSelectAllPayable = () => {
    const ids = payableOnPage.map((e) => e.id);
    setSelectedIds(new Set(ids));
  };

  const handleConfirmManualPay = async (manualReference?: string) => {
    const employees = payDialogEmployees;
    if (employees.length === 0) return;

    if (employees.length === 1) {
      setManualPayLoading(employees[0].id);
      try {
        await store.markManualPayrollPaid(employees[0].id, { manualReference });
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(employees[0].id);
          return next;
        });
        await refreshList();
      } finally {
        setManualPayLoading(null);
      }
      return;
    }

    setBulkPayLoading(true);
    try {
      await store.bulkMarkManualPayrollPaid({
        employeeIds: employees.map((e) => e.id),
        manualReference,
      });
      setSelectedIds(new Set());
      await refreshList();
    } finally {
      setBulkPayLoading(false);
    }
  };

  const { total: selectedTotal, currency: selectedCurrency } =
    sumPayrollAmount(selectedEmployees);

  return (
    <div className={NEU_PAGE_BG}>
      <div className={NEU_PAGE_WRAPPER}>
        <Breadcrumbs items={breadcrumbItems} />

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

        <EmployeeSummary summary={summary} loading={store.loadingList} />

        <EmployeeFilters
          query={query}
          onChange={setQuery}
          loading={store.loadingList}
          fetchEnums={store.fetchEnums}
        />

        {selectedIds.size > 0 && (
          <div className={NEU_BULK_BAR}>
            <div className="space-y-0.5">
              <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#006666]">
                {selectedIds.size} manual employee{selectedIds.size !== 1 ? "s" : ""} selected
              </p>
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60">
                Total: {selectedCurrency} {selectedTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleBulkPaySelected}
                disabled={bulkPayLoading}
                className={NEU_BTN_PRIMARY}
              >
                <Banknote className="h-4 w-4" />
                {bulkPayLoading ? "Processing…" : `Pay Selected (${selectedIds.size})`}
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className={NEU_BTN_GHOST}
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        )}

        {payableOnPage.length > 0 && selectedIds.size === 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSelectAllPayable}
              className={NEU_BTN_GHOST}
            >
              Select all manual due ({payableOnPage.length})
            </button>
          </div>
        )}

        <EmployeeTable
          list={list}
          loading={store.loadingList}
          onRowClick={onRowClick}
          onSort={onSort}
          sortBy={query.sortBy ?? "createdAt"}
          sortOrder={query.sortOrder ?? "desc"}
          onRetryPayment={handleRetryPayment}
          retryLoading={retryLoading || undefined}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onManualPay={handleManualPaySingle}
          manualPayLoading={manualPayLoading || undefined}
        />

        <PaginationControls
          page={list?.page ?? query.page ?? 1}
          pages={list?.pages ?? 1}
          limit={query.limit ?? 20}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          loading={store.loadingList}
        />
      </div>

      <ManualPayrollConfirmDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        employees={payDialogEmployees}
        onConfirm={handleConfirmManualPay}
      />
    </div>
  );
}
