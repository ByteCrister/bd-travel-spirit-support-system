"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    EmployeesListResponse,
    EmployeesQuery,
    EmployeeSortKey,
} from "@/types/employee.types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEmployeeStore } from "@/store/employee.store";
import { EmployeeSummary } from "./EmployeeSummary";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { PaginationControls } from "./PaginationControls";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { Breadcrumbs } from "../../global/Breadcrumbs";
import { useRouter } from "next/navigation";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";


export default function EmployeesPage() {
    const router = useRouter();
    const store = useEmployeeStore();
    const [query, setQuery] = useState<EmployeesQuery>({
        page: 1,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
        filters: {},
    });
    const [list, setList] = useState<EmployeesListResponse | null>(null);
    const [openAdd, setOpenAdd] = useState(false);
    const breadcrumbItems = [
        { label: "Home", href: '/' },
        { label: "Employees", href: "/users/employees" },
    ];

    // Hydrate list, using cache-first logic already inside store.
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
    }, [query]); // store deps internal to hook

    const summary = useMemo(() => {
        const docs = list?.docs ?? [];
        const total = list?.total ?? 0;
        const active = docs.filter((d) => d.status === "active").length;
        const onLeave = docs.filter((d) => d.status === "onLeave").length;
        const suspended = docs.filter((d) => d.status === "suspended").length;
        const terminated = docs.filter((d) => d.status === "terminated").length;
        return { total, active, onLeave, suspended, terminated };
    }, [list]);

    // Open detail dialog with fresh fetch (cache-aware in store)
    const onRowClick = async (id: string) => {
        router.push(`/users/employees/${encodeId(encodeURIComponent(id))}`);
    };

    const onSort = (sortBy: EmployeeSortKey, sortOrder: "asc" | "desc") =>
        setQuery((q) => ({ ...q, sortBy, sortOrder }));

    const onPageChange = (page: number) => setQuery((q) => ({ ...q, page }));

    const onLimitChange = (limit: number) => setQuery((q) => ({ ...q, limit, page: 1 }));

    return (
        <div className="space-y-6">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold h-display tracking-tight text-foreground">
                    Employees
                </h1>
                <Button
                    onClick={() => setOpenAdd(true)}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium btn-elevated bg-[#2563EB] text-white shadow-sm hover:bg-[#1D4ED8] hover:shadow-md active:translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:ring-offset-1"
                    aria-label="Add new employee"
                >
                    <Plus className="h-4 w-4" />
                    Add employee
                </Button>
            </div>

            <EmployeeSummary summary={summary} loading={store.loadingList} />

            <EmployeeFilters
                query={query}
                onChange={setQuery}
                loading={store.loadingList}
                fetchEnums={store.fetchEnums}
            />

            <EmployeeTable
                list={list}
                loading={store.loadingList}
                onRowClick={onRowClick}
                onSort={onSort}
                sortBy={query.sortBy ?? "createdAt"}
                sortOrder={query.sortOrder ?? "desc"}
            />

            <PaginationControls
                page={list?.page ?? query.page ?? 1}
                pages={list?.pages ?? 1}
                limit={query.limit ?? 20}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
                loading={store.loadingList}
            />

            <AddEmployeeDialog
                open={openAdd}
                onOpenChange={setOpenAdd}
                onCreate={store.createEmployee}
                fetchEnums={store.fetchEnums}
            />
        </div>
    );
}
