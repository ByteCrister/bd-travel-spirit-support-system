"use client";
export default function EmployeeDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Breadcrumbs Skeleton */}
                <div className="flex items-center space-x-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <div className="h-4 w-20 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                            {i < 2 && (
                                <div className="mx-2 text-slate-400 dark:text-slate-600">/</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Header Card Skeleton */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                {/* Avatar Skeleton */}
                                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 overflow-hidden animate-pulse">
                                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700"></div>
                                </div>

                                <div className="text-white">
                                    {/* Name Skeleton */}
                                    <div className="h-8 w-48 bg-white/30 rounded-lg animate-pulse mb-3"></div>

                                    {/* Status Skeleton */}
                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="h-6 w-24 bg-white/30 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons Skeleton */}
                            <div className="flex gap-3">
                                <div className="h-10 w-32 bg-white/30 rounded-lg animate-pulse"></div>
                                <div className="h-10 w-24 bg-white/30 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-2">
                    <div className="grid grid-cols-3 lg:grid-cols-10 gap-2">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Content Skeleton - Overview Tab (default) */}
                <div className="space-y-6">
                    {/* Personal Information & Employment Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Personal Information Card Skeleton */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-5 w-5 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse"></div>
                                <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                                        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Avatar Upload Skeleton */}
                            <div className="mt-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="h-5 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse mb-3"></div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                    <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Employment Card Skeleton */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-5 w-5 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse"></div>
                                <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                            </div>

                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                                        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Compensation & Important Dates Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Compensation Card Skeleton */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-5 w-5 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse"></div>
                                <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                            </div>

                            <div className="space-y-4">
                                <div className="relative overflow-hidden rounded-lg animate-pulse">
                                    <div className="p-6 text-center">
                                        <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
                                        <div className="h-12 w-48 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
                                        <div className="h-6 w-16 bg-slate-300 dark:bg-slate-700 rounded mx-auto"></div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
                                        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Dates Card Skeleton */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-5 w-5 bg-slate-300 dark:bg-slate-700 rounded-full animate-pulse"></div>
                                <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                            </div>

                            <div className="space-y-5">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                        <div className="mt-1 p-2 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse">
                                            <div className="h-4 w-4"></div>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-24 bg-slate-300 dark:bg-slate-700 rounded animate-pulse"></div>
                                            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}