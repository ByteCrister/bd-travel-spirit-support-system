// app/companies/[companyId]/CompanyOverviewPage.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MdOutlineRefresh, MdBusiness, MdPeople, MdTour } from "react-icons/md";
import { CompanyAccordion } from "./CompanyAccordion";
import { FiltersBar } from "./FiltersBar";
import { ToursTable } from ".././tours/ToursTable";
import { EmployeesTable } from ".././employees/EmployeesTable";
import { useCompanyOverview } from "@/hooks/useCompanyOverview";
import { CompanyAccordionSkeleton } from "./CompanyAccordionSkeleton";
import { FiltersBarSkeleton } from "./FiltersBarSkeleton";
import { TableSkeleton } from "./TableSkeleton";
import { Breadcrumbs } from "../../global/Breadcrumbs";


type TabKey = "tours" | "employees";

interface Props {
    companyId: string;
}

export default function CompanyOverviewPage({ companyId }: Props) {
    const overview = useCompanyOverview(companyId);
    const breadcrumbItems = [
        { label: "Home", href: '/' },
        { label: "Companies", href: "/companies" },
        { label: overview.company?.companyName?.toLocaleUpperCase() ?? "-", href: `/companies/${companyId}` },
    ];

    const tabConfig = {
        tours: {
            icon: MdTour,
            label: "Tours",
            count: overview.toursList?.total,
        },
        employees: {
            icon: MdPeople,
            label: "Employees",
            count: overview.employeesList?.total,
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Breadcrumbs items={breadcrumbItems} className="p-4" />
            <div className="mx-auto max-w-[1400px] space-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
                                <MdBusiness className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
                                    {overview.company?.companyName ?? "Company"}
                                </h1>
                                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Company ID: {companyId}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={overview.handleRefresh}
                            className="gap-2 h-9 px-4"
                        >
                            <MdOutlineRefresh className="h-4 w-4" />
                            <span className="hidden sm:inline">Refresh</span>
                        </Button>
                    </div>
                </motion.div>

                {/* Company Details Accordion */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key="accordion"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {overview.isCompanyLoading || !overview.company ? (
                            <CompanyAccordionSkeleton />
                        ) : (
                            <CompanyAccordion overview={overview.company} />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                >
                    <Card className="border-border shadow-sm">
                        <CardHeader className="border-b border-border bg-muted/30 pb-4">
                            <CardTitle className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-foreground">
                                    Company Data
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="gap-1.5 rounded-md border border-border/50 bg-background px-3 py-1 font-medium shadow-sm"
                                >
                                    {overview.activeTab === "tours" ? (
                                        <>
                                            <MdTour className="h-3.5 w-3.5" />
                                            <span>Tours</span>
                                        </>
                                    ) : (
                                        <>
                                            <MdPeople className="h-3.5 w-3.5" />
                                            <span>Employees</span>
                                        </>
                                    )}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Tabs
                                value={overview.activeTab}
                                onValueChange={(v) => overview.setActiveTab(v as TabKey)}
                                className="space-y-6"
                            >
                                {/* Tabs Navigation */}
                                <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1">
                                    {Object.entries(tabConfig).map(([key, config]) => {
                                        const Icon = config.icon;
                                        const isActive = overview.activeTab === key;
                                        return (
                                            <TabsTrigger
                                                key={key}
                                                value={key}
                                                className="relative inline-flex items-center justify-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{config.label}</span>
                                                {config.count !== undefined && (
                                                    <span className={`ml-1 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${isActive
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'bg-muted-foreground/10 text-muted-foreground'
                                                        }`}>
                                                        {config.count}
                                                    </span>
                                                )}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>

                                {/* Filters Bar */}
                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                    {((overview.activeTab === "tours" && overview.isToursLoading) ||
                                        (overview.activeTab === "employees" && overview.isEmployeesLoading)) ? (
                                        <FiltersBarSkeleton />
                                    ) : (
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
                                    )}
                                </div>

                                {/* Tours Tab Content */}
                                <TabsContent value="tours" className="mt-0 space-y-4">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`tours-${overview.tourCacheKey ?? "empty"}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {overview.isToursLoading && !overview.toursList ? (
                                                <TableSkeleton
                                                    columns={["Title", "Status", "Dates", "Duration", "Rating", "Bookings", "Featured", "Updated"]}
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
                                                    onPageChange={(page) => overview.fetchTours(companyId, {
                                                        page,
                                                        limit: overview.limit,
                                                        sort: overview.sortKey,
                                                        order: overview.sortOrder
                                                    })}
                                                />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </TabsContent>

                                {/* Employees Tab Content */}
                                <TabsContent value="employees" className="mt-0 space-y-4">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`employees-${overview.employeeCacheKey ?? "empty"}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {overview.isEmployeesLoading && !overview.employeesList ? (
                                                <TableSkeleton
                                                    columns={["Name", "Role", "Sub-role", "Position", "Department", "Status", "Joined", "Updated"]}
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
                                                    onPageChange={(page) => overview.fetchEmployees(companyId, {
                                                        page,
                                                        limit: overview.limit,
                                                        sort: overview.employeeSortKey,
                                                        order: overview.sortOrder
                                                    })}

                                                />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}