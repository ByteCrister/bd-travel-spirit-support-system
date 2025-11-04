// app/guide/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SortByTypes, SortDirTypes, useGuideStore } from "@/store/useGuideStore";
import { GuideFilters } from "@/components/guide/GuideFilters";
import { GuideKPI } from "@/components/guide/GuideKPI";
import { GuideTable } from "@/components/guide/GuideTable";
import { GuideViewer } from "@/components/guide/GuideViewer";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/pendingGuide.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Breadcrumbs } from "../global/Breadcrumbs";

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Guide", href: "/guide" },
];

export default function Guide() {
    const {
        guides,
        total,
        counts,
        loading,
        error,
        query,
        fetch,
        approve,
        reject,
        updateReviewComment,
    } = useGuideStore();

    const [selectedDoc, setSelectedDoc] = useState<{ guide?: PendingGuideDTO; doc?: PendingGuideDocumentDTO } | null>(null);
    const mountedRef = useRef(false);

    const handleQueryChange = useCallback(
        (partial: Partial<typeof query>) => {
            fetch(false, partial);
        },
        [fetch]
    );

    const handlePageChange = useCallback(
        (page: number) => {
            fetch(false, { page });
        },
        [fetch]
    );

    const handlePageSizeChange = useCallback(
        (pageSize: number) => {
            fetch(false, { pageSize, page: 1 });
        },
        [fetch]
    );

    const handleSortChange = useCallback(
        (sortBy: SortByTypes, sortDir: SortDirTypes) => {
            fetch(false, { sortBy: sortBy ?? "createdAt", sortDir, page: 1 });
        },
        [fetch]
    );

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        fetch(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
            <Breadcrumbs className="p-4" items={breadcrumbItems} />
            {/* Enhanced Topbar */}
            <div className="border-b bg-white/80 backdrop-blur-sm top-0 z-10 shadow-sm">
                <div className="mx-auto max-w-7xl px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Guide Requests
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage and review guide applications
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="hover:bg-gray-50 transition-colors shadow-sm border-gray-300"
                            onClick={() => fetch(true)}
                            disabled={loading}
                            aria-label="Refresh"
                        >
                            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <GuideFilters
                        query={query}
                        onChange={handleQueryChange}
                        onPageSizeChange={handlePageSizeChange}
                        loading={loading}
                    />
                </div>

                {/* KPI Cards */}
                <div className="grid gap-5 md:grid-cols-4 mb-6">
                    <GuideKPI title="Total Requests" value={counts.total} loading={loading} />
                    <GuideKPI title="Pending Review" value={counts.pending} loading={loading} variant="yellow" />
                    <GuideKPI title="Approved" value={counts.approved} loading={loading} variant="green" />
                    <GuideKPI title="Rejected" value={counts.rejected} loading={loading} variant="red" />
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <GuideTable
                        guides={guides}
                        loading={loading}
                        error={error}
                        sortBy={query.sortBy}
                        sortDir={query.sortDir}
                        onSortChange={handleSortChange}
                        onApprove={(id) => approve(id)}
                        onReject={(id, reason) => reject(id, reason)}
                        onComment={(id, comment) => updateReviewComment(id, comment)}
                        onOpenDocument={(guide, doc) => setSelectedDoc({ guide, doc })}
                        page={query.page}
                        pageSize={query.pageSize}
                        total={total}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            {/* Document Viewer */}
            <GuideViewer
                open={!!selectedDoc}
                guide={selectedDoc?.guide}
                doc={selectedDoc?.doc}
                onClose={() => setSelectedDoc(null)}
            />

            {/* Enhanced Error Notification */}
            {error && (
                <div
                    role="alert"
                    className={cn(
                        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
                        "rounded-lg bg-red-600 text-white px-6 py-4 shadow-2xl",
                        "border border-red-700 min-w-[320px] max-w-md",
                        "animate-in slide-in-from-bottom-4 duration-300"
                    )}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}