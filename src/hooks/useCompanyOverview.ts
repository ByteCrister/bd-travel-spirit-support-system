// hooks/useCompanyOverview.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { TourListItemDTO, SortableTourKeys } from "@/types/tour.types";
import { EmployeeListItemDTO } from "@/types/employee.types";
import { useCompanyDetailStore } from "@/store/company-detail.store";

export type TabKey = "tours" | "employees";

export type SortableEmployeeKeys =
    | "fullName"
    | "position"
    | "role"
    | "subRole"
    | "department"
    | "team"
    | "employmentType"
    | "status"
    | "dateOfJoining"
    | "dateOfLeaving"
    | "createdAt"
    | "updatedAt";

export function useCompanyOverview(companyId: string) {
    const {
        fetchCompany,
        fetchTours,
        fetchTourDetail,
        fetchEmployeeDetail,
        fetchEmployees,
        listCache,
        activeCacheKey,
        loading,
        error,
        companies,
    } = useCompanyDetailStore();

    // --- Loading states ---
    const isCompanyLoading = !!loading.company;
    const isToursLoading = !!loading.tours;
    const isEmployeesLoading = !!loading.employees;

    // --- Tabs ---
    const [activeTab, setActiveTab] = useState<TabKey>("tours");

    // --- Filters & Sorting ---
    const [search, setSearch] = useState<string>("");
    const [limit, setLimit] = useState<number>(10);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [sortKey, setSortKey] = useState<SortableTourKeys>("updatedAt");
    const [employeeSortKey, setEmployeeSortKey] =
        useState<SortableEmployeeKeys>("updatedAt");

    // --- Fetch company overview on mount ---
    useEffect(() => {
        fetchCompany(companyId).catch(() => { });
    }, [companyId, fetchCompany]);

    // --- Fetch tab data when tab changes ---
    useEffect(() => {
        const fetch = async () => {
            if (activeTab === "tours") {
                await fetchTours(companyId, { page: 1, limit, sort: sortKey, order: sortOrder });
            } else {
                await fetchEmployees(companyId, {
                    page: 1,
                    limit,
                    sort: employeeSortKey,
                    order: sortOrder,
                });
            }
        };
        fetch().catch(() => { });
    }, [activeTab, companyId]); // eslint-disable-line react-hooks/exhaustive-deps

    // --- Refetch on limit/sort changes ---
    useEffect(() => {
        const fetch = async () => {
            if (activeTab === "tours") {
                await fetchTours(companyId, { page: 1, limit, sort: sortKey, order: sortOrder });
            } else {
                await fetchEmployees(companyId, {
                    page: 1,
                    limit,
                    sort: employeeSortKey,
                    order: sortOrder,
                });
            }
        };
        fetch().catch(() => { });
    }, [limit, sortOrder, sortKey, employeeSortKey, activeTab, companyId, fetchTours, fetchEmployees]);

    // --- Get current cached lists ---
    const tourCacheKey = activeCacheKey.tours[companyId];
    const toursList = tourCacheKey ? listCache.tours[companyId]?.[tourCacheKey] : undefined;

    const employeeCacheKey = activeCacheKey.employees[companyId];
    const employeesList = employeeCacheKey
        ? listCache.employees[companyId]?.[employeeCacheKey]
        : undefined;

    // --- Client-side filtering for search ---
    const filteredTours: TourListItemDTO[] = useMemo(() => {
        const items = toursList?.items ?? [];
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((t) =>
            [t.title, t.slug, t.category, t.subCategory]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [toursList?.items, search]);

    const filteredEmployees: EmployeeListItemDTO[] = useMemo(() => {
        const items = employeesList?.items ?? [];
        if (!search.trim()) return items;
        const q = search.toLowerCase();

        return items.filter((e) =>
            [
                e.user?.name,          // from embedded user summary
                e.user?.email,
                e.user?.phone,
                e.subRole,
                e.position,
                e.employmentType,
                e.status,
            ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [employeesList?.items, search]);


    // --- Handlers ---
    const handleRefresh = async () => {
        if (activeTab === "tours") {
            await fetchTours(companyId, { page: 1, limit, sort: sortKey, order: sortOrder }, true);
        } else {
            await fetchEmployees(companyId, { page: 1, limit, sort: employeeSortKey, order: sortOrder }, true);
        }
    };

    const handleEmployeeSortKeyChange = (v: string) => {
        setEmployeeSortKey(v as SortableEmployeeKeys);
    };

    const handleFetchEmployeeDetail = async (employeeId: string, force?: boolean) => {
        return await fetchEmployeeDetail(companyId, employeeId, force);
    }
    const handleFetchTourDetail = async (employeeId: string, force?: boolean) => {
        return await fetchTourDetail(companyId, employeeId, force);
    }

    return {
        activeTab,
        setActiveTab,
        search,
        setSearch,
        limit,
        setLimit,
        sortOrder,
        setSortOrder,
        sortKey,
        setSortKey,
        employeeSortKey,
        handleEmployeeSortKeyChange,
        tourCacheKey,
        filteredTours,
        filteredEmployees,
        fetchTours,
        handleFetchTourDetail,
        toursList,
        fetchEmployees,
        handleFetchEmployeeDetail,
        employeesList,
        employeeCacheKey,
        loading,
        error,
        company: companies[companyId],
        handleRefresh,
        isCompanyLoading,
        isToursLoading,
        isEmployeesLoading,
    };
}
