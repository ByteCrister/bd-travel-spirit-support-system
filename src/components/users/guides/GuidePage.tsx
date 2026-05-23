// src/components/users/guides/GuidePage.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SortByTypes, SortDirTypes, useGuideStore } from "@/store/guide/guide.store";
import { GuideFilters } from "@/components/users/guides/GuideFilters";
import { GuideKPI } from "@/components/users/guides/GuideKPI";
import { GuideTable } from "@/components/users/guides/GuideTable";
import { GuideViewer } from "@/components/users/guides/GuideViewer";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/guide/pendingGuide.types";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { Breadcrumbs } from "../../global/Breadcrumbs";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_PAGE_BG =
    "min-h-screen bg-[#E7E5E4]";

const NEU_TOPBAR =
    "bg-[#E7E5E4] border-b border-[#1E2938]/10 " +
    "shadow-[0_2px_8px_#c8c6c5] sticky top-0 z-10";

const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_BTN_GHOST =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938] " +
    "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-50 disabled:cursor-not-allowed " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "transition-all duration-200";

const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
    "border border-white/60";

const NEU_SECTION_WRAPPER = "mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6";

// ─────────────────────────────────────────────────────────────────────────────

const breadcrumbItems = [
    { label: "Home", href: "/" },
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

    const [selectedDoc, setSelectedDoc] = useState<{
        guide?: PendingGuideDTO;
        doc?: PendingGuideDocumentDTO;
    } | null>(null);
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
        <div className={NEU_PAGE_BG}>
            {/* Topbar */}
            <div className={NEU_TOPBAR}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
                    <Breadcrumbs items={breadcrumbItems} className="mb-3" />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className={`text-2xl sm:text-3xl ${NEU_HEADING}`}>
                                Guide Requests
                            </h1>
                            <p className={`mt-1 ${NEU_MUTED}`}>
                                Manage and review guide applications
                            </p>
                        </div>
                        <button
                            onClick={() => fetch(true)}
                            disabled={loading}
                            aria-label="Refresh guide list"
                            className={NEU_BTN_GHOST}
                        >
                            <RefreshCw
                                className={cn("h-4 w-4", loading && "animate-spin")}
                                aria-hidden="true"
                            />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={NEU_SECTION_WRAPPER}>
                {/* Filters */}
                <div className={`${NEU_CARD} p-5 sm:p-6`}>
                    <GuideFilters
                        query={query}
                        onChange={handleQueryChange}
                        onPageSizeChange={handlePageSizeChange}
                        loading={loading}
                    />
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <GuideKPI
                        title="Total Requests"
                        value={counts.total}
                        loading={loading}
                    />
                    <GuideKPI
                        title="Pending Review"
                        value={counts.pending}
                        loading={loading}
                        variant="yellow"
                    />
                    <GuideKPI
                        title="Approved"
                        value={counts.approved}
                        loading={loading}
                        variant="green"
                    />
                    <GuideKPI
                        title="Rejected"
                        value={counts.rejected}
                        loading={loading}
                        variant="red"
                    />
                </div>

                {/* Table */}
                <div className={`${NEU_CARD} overflow-hidden`}>
                    <GuideTable
                        guides={guides}
                        loading={loading}
                        error={error}
                        sortBy={query.sortBy}
                        sortDir={query.sortDir}
                        onSortChange={handleSortChange}
                        onApprove={async (id) => await approve(id)}
                        onReject={async (id, reason) => await reject(id, reason)}
                        onSuspend={async (id, reason, until) =>
                            await suspend(id, reason, until)
                        }
                        onUnsuspend={async (id, reason) => await unsuspend(id, reason)}
                        onComment={async (id, comment) =>
                            await updateReviewComment(id, comment)
                        }
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