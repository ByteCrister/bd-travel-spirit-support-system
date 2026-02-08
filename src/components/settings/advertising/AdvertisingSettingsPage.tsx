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

const AdvertisingSettingsPage: React.FC = () => {
    const {
        pricingRows: rows,
        loading,
        selectedIds,
        fetchConfig,
        deletePrice,
        toggleSelect,
        clearSelection,
        lastError
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

    if (loading && !rows.length) {
        return <PageSkeleton />;
    }

    if (lastError && !rows.length) {
        return <ErrorState onRetry={() => fetchConfig().catch(() => { })} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <HiSparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                Advertising Settings
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">
                                Manage pricing and placements for your advertising platform
                            </p>
                        </div>
                    </div>

                    {rows.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="hidden md:flex items-center gap-4 bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200"
                        >
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">{rows.length}</div>
                                <div className="text-xs text-slate-500">Total</div>
                            </div>
                            <div className="h-8 w-px bg-slate-200" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {rows.filter(r => r.active).length}
                                </div>
                                <div className="text-xs text-slate-500">Active</div>
                            </div>
                        </motion.div>
                    )}
                </motion.header>

                {/* Toolbar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
                >
                    <AdsToolbar
                        selectedCount={selectedCount}
                        onNew={() => {
                            setEditing(undefined);
                            setCreateEditOpen(true);
                        }}
                        onBulkEdit={() => setBulkOpen(true)}
                        onDelete={() => setConfirmOpen(true)}
                        onRefresh={() => fetchConfig().catch(() => { })}
                    />
                </motion.div>

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {rows.length === 0 ? (
                        <EmptyState onCreate={() => setCreateEditOpen(true)} />
                    ) : (
                        <AdsTable
                            rows={rows}
                            loading={loading}
                            selectedIds={selectedIds}
                            onToggleSelect={(id) => toggleSelect(id)}
                            onEdit={(row) => {
                                setEditing({ id: row.id });
                                setCreateEditOpen(true);
                            }}
                            onDelete={(id) => {
                                setConfirmOpen(true);
                                setEditing({ id });
                            }}
                            onToggleActive={(id) =>
                                useAdvertisingSettingsStore
                                    .getState()
                                    .toggleActive(id)
                                    .catch(() => { })
                            }
                        />
                    )}
                </motion.div>

                {/* Modals */}
                <PriceFormModal
                    open={createEditOpen}
                    onClose={() => {
                        setCreateEditOpen(false);
                        setEditing(undefined);
                    }}
                    initial={
                        editing ? rows.find((r) => r.id === editing.id) : undefined
                    }
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
                        useAdvertisingSettingsStore
                            .getState()
                            .bulkUpdate(payload)
                            .then(() => { })
                            .catch((err) => {
                                throw err;
                            })
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
                                await useAdvertisingSettingsStore.getState().bulkUpdate({
                                    updates: [],
                                    removeIds: ids,
                                });
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