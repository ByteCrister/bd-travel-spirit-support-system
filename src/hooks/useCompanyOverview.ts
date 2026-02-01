// hooks/useCompanyOverview.ts
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { TourListItemDTO, SortableTourKeys } from "@/types/tour.types";
import { EmployeeListItemDTO } from "@/types/employee.types";
import { useCompanyDetailStore } from "@/store/company/company-detail.store";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback"; // Add this import

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

    const [breadcrumbs, setBreadcrumbs] = useState([
        { label: "Home", href: '/' },
        { label: "Companies", href: "/users/companies" },
        { label: companies?.[companyId]?.companyName?.toLocaleUpperCase() ?? "-", href: `/users/companies/${encodeURIComponent(encodeId(companyId))}` },
    ])

    // --- Fetch data function ---
    const fetchData = useCallback(async () => {
        if (activeTab === "tours") {
            await fetchTours(companyId, { 
                page: 1, 
                limit, 
                search,
                sort: sortKey, 
                order: sortOrder,
            });
        } else {
            await fetchEmployees(companyId, {
                page: 1,
                limit,
                search, 
                sort: employeeSortKey,
                order: sortOrder,
            });
        }
    }, [activeTab, fetchTours, companyId, limit, search, sortKey, sortOrder, fetchEmployees, employeeSortKey]);

    // Create debounced fetch function using the custom hook
    const debouncedFetchData = useDebouncedCallback(fetchData, 300);

    // --- Fetch company overview on mount ---
    useEffect(() => {
        fetchCompany(companyId).catch(() => { });
        setBreadcrumbs([
            { label: "Home", href: '/' },
            { label: "Companies", href: "/users/companies" },
            { label: companies?.[companyId]?.companyName?.toLocaleUpperCase() ?? "-", href: `/users/companies/${encodeURIComponent(encodeId(companyId))}` },
        ])
    }, [companies, companyId, fetchCompany]);

    // --- Initial fetch and refetch when tab changes ---
    useEffect(() => {
        fetchData().catch(() => { });
    }, [fetchData, activeTab]);

    // --- Refetch when search, limit, or sort changes ---
    useEffect(() => {
        // Call the debounced function
        debouncedFetchData();
        
        // Clean up the debounced call on unmount
        return () => {
            debouncedFetchData.cancel?.();
        };
    }, [debouncedFetchData]);

    // --- Search handler with immediate UI update ---
    const handleSearchChange = useCallback((value: string) => {
        // Update search state immediately for UI
        setSearch(value);
        
        // The debouncedFetchData will be called automatically by the useEffect above
        // because search state changes and triggers the useEffect dependency
    }, []);

    // --- Get current cached lists ---
    const tourCacheKey = activeCacheKey?.tours?.[companyId];
    const toursList = tourCacheKey ? listCache?.tours?.[companyId]?.[tourCacheKey] : undefined;

    const employeeCacheKey = activeCacheKey?.employees?.[companyId];
    const employeesList = employeeCacheKey
        ? listCache?.employees?.[companyId]?.[employeeCacheKey]
        : undefined;

    // --- Client-side filtering for search (optional, or remove if you want server-side only) ---
    // If you want server-side search, you'll need to modify the API to accept search param
    const filteredTours: TourListItemDTO[] = useMemo(() => {
        const items = toursList?.items ?? [];
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((t) =>
            [t.title, t.slug]
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
                e.user?.name,
                e.user?.email,
                e.user?.phone,
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
    const handleFetchTourDetail = async (tourId: string, force?: boolean) => {
        return await fetchTourDetail(companyId, tourId, force);
    }

    return {
        activeTab,
        setActiveTab,
        search,
        setSearch: handleSearchChange, // Use the new handler
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
        company: companies?.[companyId],
        breadcrumbs,
        handleRefresh,
        isCompanyLoading,
        isToursLoading,
        isEmployeesLoading,
    };
}