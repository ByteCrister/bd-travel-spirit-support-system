// pages/GuideSubscriptionsPage.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { SubscriptionTierDTO, SubscriptionTierFormValues } from "@/types/site-settings/guide-subscription-settings.types";
import useGuideSubscriptionsStore from "@/store/guide/guide-subscription-setting.store";
import { toSubscriptionTierDTO } from "@/utils/helpers/guide-subscriptions.transform";
import { VersionBanner } from "./VersionBanner";
import { TierList } from "./TierList";
import { TierForm } from "./TierForm";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { UndoSnackbar } from "./UndoSnackbar";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, RefreshCw, Settings, TrendingUp, Package, AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

const breadcrumbItems = [
  { label: "Home", href: '/' },
  { label: "Guide Subscriptions", href: "/setting/guide-subscriptions" },
];

export default function GuideSubscriptionsPage() {
  const {
    list,
    loading,
    saving,
    lastFetchedAt,
    validations,
    error,
    fetchAll,
    upsertTier,
    removeTier,
    setDraft,
    clearError,
  } = useGuideSubscriptionsStore();

  const [editing, setEditing] = useState<SubscriptionTierDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; tier?: SubscriptionTierDTO }>({ open: false });
  const [undoVisible, setUndoVisible] = useState(false);

  useEffect(() => {
    fetchAll().catch(() => { });
  }, [fetchAll]);

  const stats = useMemo(() => ({
    total: list.length,
    active: list.filter(t => t.active).length,
    totalRevenue: list.reduce((sum, t) => sum + (t.active ? t.price : 0), 0),
  }), [list]);

  async function handleAdd() {
    setEditing(null);
    setShowForm(true);
    setDraft(null);
  }

  async function handleEdit(tier: SubscriptionTierDTO) {
    setEditing(tier);
    setShowForm(true);
    setDraft(tier);
  }

  async function internalSubmit(values: SubscriptionTierFormValues) {
    const dto = toSubscriptionTierDTO(values, editing ?? undefined);
    await upsertTier(dto);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete.tier) return;
    const id = confirmDelete.tier._id;
    setConfirmDelete({ open: false });
    await removeTier(id);
    setUndoVisible(true);
  }

  async function handleToggleActive(id: string, active: boolean) {
    const existing = list.find((t) => t.key === id);
    if (!existing) return;
    const payload = { ...existing, active };
    await upsertTier(payload);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Package className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Guide Subscriptions
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage subscription tiers and pricing for your guide products
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => fetchAll(true)}
                className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                Refresh
              </Button>
              <Button
                onClick={handleAdd}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Plus size={18} />
                Add Tier
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Tiers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Tiers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Potential MRR</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FaBangladeshiTakaSign size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </motion.div>

          <VersionBanner updatedAt={lastFetchedAt} />
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="border-red-200 dark:border-red-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearError()}
                    className="h-auto p-1 hover:bg-red-100 dark:hover:bg-red-900"
                  >
                    <X size={16} />
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tier List */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TierList
              tiers={list}
              loading={loading}
              onEdit={handleEdit}
              onDelete={(id) => {
                const tier = list.find((t) => t._id === id);
                setConfirmDelete({ open: true, tier });
              }}
              onToggleActive={(id, active) => handleToggleActive(id as string, active)}
            />
          </motion.div>

          {/* Editor Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="sticky top-6 space-y-4">
              {/* Editor Info Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Settings size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Editor Panel</h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {showForm
                    ? "Editing subscription tier. Make changes below."
                    : "Select a tier to edit or create a new one to get started."}
                </p>

                {!showForm && (
                  <Button
                    onClick={() => { setShowForm(true); setEditing(null); }}
                    className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus size={18} />
                    Create New Tier
                  </Button>
                )}
              </div>

              {/* Tier Form */}
              <AnimatePresence mode="wait">
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                      <h4 className="text-white font-semibold">
                        {editing ? "Edit Tier" : "Create New Tier"}
                      </h4>
                    </div>
                    <TierForm
                      initialValues={{
                        _id: editing?._id,
                        key: editing?.key,
                        title: editing?.title,
                        price: editing?.price,
                        currency: editing?.currency,
                        billingCycleDays: editing?.billingCycleDays,
                        perks: editing?.perks,
                        active: editing?.active,
                        createdAt: editing?.createdAt,
                        updatedAt: editing?.updatedAt,
                      }}
                      onCancel={() => { setShowForm(false); setEditing(null); }}
                      onSubmit={internalSubmit}
                      loading={saving}
                      validations={validations}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDeleteDialog
        open={confirmDelete.open}
        title={confirmDelete.tier?.title ?? "-"}
        keyName={confirmDelete.tier?.key ?? "-"}
        price={confirmDelete.tier?.price}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false })}
        loading={saving}
      />

      {undoVisible && (
        <UndoSnackbar
          message="Subscription removed"
          onUndo={async () => {
            await fetchAll(true);
            setUndoVisible(false);
          }}
        />
      )}
    </div>
  );
}