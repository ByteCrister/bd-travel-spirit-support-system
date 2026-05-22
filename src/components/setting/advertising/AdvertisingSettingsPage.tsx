"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import AdsToolbar from "./AdsToolbar";
import AdsTable from "./AdsTable";
import PriceFormModal from "./PriceFormModal";
import BulkEditDrawer from "./BulkEditDrawer";
import ConfirmDialog from "./ConfirmDialog";
import PageSkeleton from "./skeletons/PageSkeleton";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import useAdvertisingSettingsStore from "@/store/site-settings/advertisingSettings.store";
import { CreateAdvertisingPricePayload } from "@/types/advertising/advertising-settings.types";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

// ── Neumorphism style constants ───────────────────────────────
const S = {
    page: "min-h-screen bg-[#E7E5E4] p-4 lg:p-6 xl:p-8",
    inner: "max-w-7xl mx-auto space-y-6",
    header: "flex items-center justify-between",
    iconWell:
        "h-12 w-12 rounded-xl bg-[#006666] flex items-center justify-center " +
        "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080]",
    heading:
        "text-2xl lg:text-3xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight",
    subtext:
        "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mt-1",
    statsCard:
        "hidden md:flex items-center gap-4 rounded-2xl bg-[#E7E5E4] px-5 py-3 " +
        "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] border border-white/60",
    statValue:
        "text-2xl font-bold font-[family-name:var(--font-space-mono)]",
    statLabel:
        "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mt-0.5",
    divider: "h-8 w-px bg-[#1E2938]/10",
    toolbarWrap:
        "rounded-2xl bg-[#E7E5E4] p-5 " +
        "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60",
};

const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Advertising", href: "/setting/advertising" },
];

const AdvertisingSettingsPage: React.FC = () => {
    const {
        pricingRows: rows,
        loading,
        selectedIds,
        fetchConfig,
        deletePrice,
        toggleSelect,
        clearSelection,
        lastError,
    } = useAdvertisingSettingsStore();

    const [createEditOpen, setCreateEditOpen] = useState(false);
    const [editing, setEditing] = useState<undefined | { id: string }>(undefined);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const selectedCount = selectedIds.size;
    const selectedRows = useMemo(
        () => rows.filter((r) => selectedIds.has(r.id)),
        [rows, selectedIds]
    );

    useEffect(() => {
        fetchConfig().catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading && !rows.length) return <PageSkeleton />;
    if (lastError && !rows.length)
        return <ErrorState onRetry={() => fetchConfig().catch(() => { })} />;

    return (
        <div className={S.page}>
            <Breadcrumbs items={breadcrumbItems} />
            <div className={S.inner}>
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={S.header}
                >
                    <div className="flex items-center gap-3">
                        <div className={S.iconWell}>
                            <HiSparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className={S.heading}>Advertising Settings</h1>
                            <p className={S.subtext}>
                                Manage pricing and placements for your advertising platform
                            </p>
                        </div>
                    </div>

                    {rows.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={S.statsCard}
                        >
                            <div className="text-center">
                                <div className={`${S.statValue} text-[#006666]`}>{rows.length}</div>
                                <div className={S.statLabel}>Total</div>
                            </div>
                            <div className={S.divider} />
                            <div className="text-center">
                                <div className={`${S.statValue} text-[#00A63D]`}>
                                    {rows.filter((r) => r.active).length}
                                </div>
                                <div className={S.statLabel}>Active</div>
                            </div>
                            <div className={S.divider} />
                            <div className="text-center">
                                <div className={`${S.statValue} text-[#1E2938]/40`}>
                                    {rows.filter((r) => !r.active).length}
                                </div>
                                <div className={S.statLabel}>Inactive</div>
                            </div>
                        </motion.div>
                    )}
                </motion.header>

                {/* Toolbar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={S.toolbarWrap}
                >
                    <AdsToolbar
                        selectedCount={selectedCount}
                        onNew={() => { setEditing(undefined); setCreateEditOpen(true); }}
                        onBulkEdit={() => setBulkOpen(true)}
                        onDelete={() => setConfirmOpen(true)}
                        onRefresh={() => fetchConfig().catch(() => { })}
                    />
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {rows.length === 0 ? (
                        <EmptyState onCreate={() => setCreateEditOpen(true)} />
                    ) : (
                        <AdsTable
                            rows={rows}
                            loading={loading}
                            selectedIds={selectedIds}
                            onToggleSelect={(id) => toggleSelect(id)}
                            onEdit={(row) => { setEditing({ id: row.id }); setCreateEditOpen(true); }}
                            onDelete={(id) => { setConfirmOpen(true); setEditing({ id }); }}
                            onToggleActive={(id) =>
                                useAdvertisingSettingsStore.getState().toggleActive(id).catch(() => { })
                            }
                        />
                    )}
                </motion.div>

                {/* Modals */}
                <PriceFormModal
                    open={createEditOpen}
                    onClose={() => { setCreateEditOpen(false); setEditing(undefined); }}
                    initial={editing ? rows.find((r) => r.id === editing.id) : undefined}
                    mode={editing ? "edit" : "create"}
                    onSubmit={async (payload) => {
                        if ("id" in payload && payload.id) {
                            await useAdvertisingSettingsStore.getState().updatePrice(payload);
                        } else {
                            await useAdvertisingSettingsStore.getState().createPrice(
                                payload as CreateAdvertisingPricePayload
                            );
                        }
                    }}
                />

                <BulkEditDrawer
                    open={bulkOpen}
                    onClose={() => setBulkOpen(false)}
                    selectedRows={selectedRows}
                    onSubmit={(payload) =>
                        useAdvertisingSettingsStore.getState().bulkUpdate(payload).then(() => { }).catch((err) => { throw err; })
                    }
                />

                <ConfirmDialog
                    open={confirmOpen}
                    title={
                        selectedCount > 0
                            ? `Delete ${selectedCount} selected price${selectedCount > 1 ? "s" : ""}`
                            : "Delete price"
                    }
                    description={
                        selectedCount > 0
                            ? `This will permanently remove ${selectedCount} entries. This action cannot be undone.`
                            : "This will permanently remove the selected price. This action cannot be undone."
                    }
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={async () => {
                        try {
                            if (selectedCount > 0) {
                                const ids = Array.from(selectedIds);
                                await useAdvertisingSettingsStore.getState().bulkUpdate({ updates: [], removeIds: ids });
                                clearSelection();
                            } else if (editing) {
                                await deletePrice(editing.id);
                            }
                        } finally {
                            setConfirmOpen(false);
                            setEditing(undefined);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default AdvertisingSettingsPage;