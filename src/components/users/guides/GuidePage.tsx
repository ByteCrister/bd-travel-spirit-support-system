// app/guide/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SortByTypes, SortDirTypes, useGuideStore } from "@/store/guide.store";
import { GuideFilters } from "@/components/users/guides/GuideFilters";
import { GuideKPI } from "@/components/users/guides/GuideKPI";
import { GuideTable } from "@/components/users/guides/GuideTable";
import { GuideViewer } from "@/components/users/guides/GuideViewer";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/pendingGuide.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Breadcrumbs } from "../../global/Breadcrumbs";

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Guide", href: "/users/guides" },
];

export default function GuidePage() {
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
        suspend,
        unsuspend,
        updateReviewComment,
    } = useGuideStore();

    const [selectedDoc, setSelectedDoc] = useState<{ guide?: PendingGuideDTO; doc?: PendingGuideDocumentDTO } | null>(null);
    const mountedRef = useRef(false);

    const handleQueryChange = useCallback(
        async (partial: Partial<typeof query>) => {
            await fetch(false, partial);
        },
        [fetch]
    );

    const handlePageChange = useCallback(
        async (page: number) => {
            await fetch(false, { page });
        },
        [fetch]
    );

    const handlePageSizeChange = useCallback(
        async (pageSize: number) => {
            await fetch(false, { pageSize, page: 1 });
        },
        [fetch]
    );

    const handleSortChange = useCallback(
        async (sortBy: SortByTypes, sortDir: SortDirTypes) => {
            await fetch(false, { sortBy: sortBy ?? "createdAt", sortDir, page: 1 });
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
                        onApprove={async (id) => await approve(id)}
                        onReject={async (id, reason) => await reject(id, reason)}
                        onSuspend={async (id, reason, until) => await suspend(id, reason, until)}
                        onUnsuspend={async (id, reason) => await unsuspend(id, reason)}
                        onComment={async (id, comment) => await updateReviewComment(id, comment)}
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
        </div>
    );
}