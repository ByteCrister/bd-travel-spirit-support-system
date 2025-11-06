'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, MapPin, TrendingUp, AlertCircle, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CompanyToolbar } from '@/components/users/companies/CompanyToolbar';
import { CompanyTable } from '@/components/users/companies/CompanyTable';
import { CompanyPagination } from '@/components/users/companies/CompanyPagination';
import { CompanySkeleton } from '@/components/users/companies/CompanySkeleton';
import { useCompanyStore } from '@/store/company.store';
import { Breadcrumbs } from '../../global/Breadcrumbs';

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Companies", href: "/companies" },
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

    const statsCards = [
        {
            title: 'Total Companies',
            value: stats?.totalCompanies ?? 0,
            icon: Building2,
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50',
            darkBgGradient: 'dark:from-blue-950/50 dark:to-cyan-950/50',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            title: 'Total Employees',
            value: stats?.totalEmployees ?? 0,
            icon: Users,
            gradient: 'from-violet-500 to-purple-500',
            bgGradient: 'from-violet-50 to-purple-50',
            darkBgGradient: 'dark:from-violet-950/50 dark:to-purple-950/50',
            iconBg: 'bg-violet-100 dark:bg-violet-900/30',
            iconColor: 'text-violet-600 dark:text-violet-400'
        },
        {
            title: 'Total Tours',
            value: stats?.totalTours ?? 0,
            icon: MapPin,
            gradient: 'from-emerald-500 to-teal-500',
            bgGradient: 'from-emerald-50 to-teal-50',
            darkBgGradient: 'dark:from-emerald-950/50 dark:to-teal-950/50',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            iconColor: 'text-emerald-600 dark:text-emerald-400'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            Companies
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 ml-14">
                        Manage and monitor your organization&apos;s companies
                    </p>
                </motion.div>

                {/* Stats Cards */}
                {stats && (
                    <motion.div
                        className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {statsCards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="group relative"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
                                    <div className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br ${card.bgGradient} ${card.darkBgGradient} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-3 flex-1">
                                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    {card.title}
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                                        {card.value.toLocaleString()}
                                                    </p>
                                                    <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                                </div>
                                            </div>
                                            <div className={`${card.iconBg} p-3 rounded-lg transition-transform duration-300 group-hover:scale-110`}>
                                                <Icon className={`w-6 h-6 ${card.iconColor}`} />
                                            </div>
                                        </div>
                                        {/* Decorative gradient line */}
                                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Toolbar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mb-6"
                >
                    <CompanyToolbar />
                </motion.div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6"
                    >
                        <Alert
                            variant="destructive"
                            role="alert"
                            className="relative border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30"
                        >
                            <AlertCircle className="h-5 w-5" />
                            <AlertTitle className="font-semibold">Error</AlertTitle>
                            <AlertDescription className="mt-1">{error}</AlertDescription>
                            <button
                                type="button"
                                aria-label="Dismiss error"
                                className="absolute top-3 right-3 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                onClick={clearError}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </Alert>
                    </motion.div>
                )}

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
                >
                    {loading ? (
                        <CompanySkeleton />
                    ) : (
                        <CompanyTable rows={pageEntry?.rows ?? []} />
                    )}
                </motion.div>

                {/* Pagination */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="mt-6"
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