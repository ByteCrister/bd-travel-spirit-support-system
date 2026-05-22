// pages/GuideSubscriptionsPage.tsx
"use client";

import  { useEffect, useMemo, useState } from "react";
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
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

// ── Neumorphism style tokens ──────────────────────────────────
const PAGE_BG = "min-h-screen bg-[#E7E5E4] p-4 lg:p-6 xl:p-8";

const PAGE_INNER = "max-w-7xl mx-auto space-y-8";

const PAGE_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-3xl lg:text-4xl text-[#1E2938] tracking-tight";

const PAGE_SUBHEAD =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 mt-1";

const ICON_WELL_PRIMARY =
  "p-3 rounded-xl bg-[#006666]/10 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const BTN_REFRESH =
  "gap-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border-none px-4 py-2 " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed " +
  "transition-all duration-200 flex items-center";

const BTN_ADD =
  "gap-2 rounded-xl bg-[#006666] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] border-none px-4 py-2 " +
  "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d] " +
  "transition-all duration-200 flex items-center";

const STAT_CARD =
  "rounded-2xl p-5 bg-[#E7E5E4] border border-white/60 " +
  "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]";

const STAT_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-widest text-[#1E2938]/50";

const STAT_VALUE =
  "font-[family-name:var(--font-space-mono)] font-bold text-3xl text-[#1E2938] mt-1.5";

const STAT_ICON_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const STAT_ICON_SUCCESS =
  "p-2.5 rounded-xl bg-[#00A63D]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const STAT_ICON_WARNING =
  "p-2.5 rounded-xl bg-[#FE9900]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const ERROR_BANNER =
  "flex items-center gap-3 px-5 py-4 rounded-2xl " +
  "bg-[#E7E5E4] border border-[#FF2157]/20 " +
  "shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]";

const ERROR_MSG =
  "flex-1 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]";

const EDITOR_CARD =
  "rounded-2xl bg-[#E7E5E4] border border-white/60 p-6 " +
  "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]";

const EDITOR_TITLE =
  "font-[family-name:var(--font-space-mono)] font-bold text-lg text-[#1E2938]";

const EDITOR_BODY =
  "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mb-4";

const FORM_CARD =
  "rounded-2xl bg-[#E7E5E4] border border-white/60 overflow-hidden " +
  "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]";

const FORM_CARD_HEADER =
  "px-5 py-3.5 bg-[#006666]";

const FORM_CARD_TITLE =
  "font-[family-name:var(--font-space-mono)] font-bold text-sm text-white";

const BTN_CREATE =
  "w-full gap-2 rounded-xl bg-[#006666] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] border-none px-4 py-2.5 " +
  "hover:bg-[#007777] transition-all duration-200 flex items-center justify-center";

const BTN_DISMISS =
  "rounded-lg w-7 h-7 flex items-center justify-center bg-[#E7E5E4] " +
  "text-[#FF2157] border-none " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "transition-all duration-200";
// ─────────────────────────────────────────────────────────────

const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Guide Subscriptions", href: "/setting/guide-subscriptions" },
];

export default function GuideSubscriptionsPage() {
  const {
    list, loading, saving, lastFetchedAt, validations, error,
    fetchAll, upsertTier, removeTier, setDraft, clearError,
  } = useGuideSubscriptionsStore();

  const [editing, setEditing] = useState<SubscriptionTierDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; tier?: SubscriptionTierDTO }>({ open: false });
  const [undoVisible, setUndoVisible] = useState(false);

  useEffect(() => { fetchAll().catch(() => { }); }, [fetchAll]);

  const stats = useMemo(() => ({
    total: list.length,
    active: list.filter((t) => t.active).length,
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
    await upsertTier({ ...existing, active });
  }

  return (
    <div className={PAGE_BG}>
      <Breadcrumbs items={breadcrumbItems} />
      <div className={PAGE_INNER}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-4">
              <span className={ICON_WELL_PRIMARY}>
                <Package size={26} className="text-[#006666]" />
              </span>
              <div>
                <h1 className={PAGE_HEADING}>Guide Subscriptions</h1>
                <p className={PAGE_SUBHEAD}>
                  Manage subscription tiers and pricing for your guide products
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchAll(true)}
                disabled={loading}
                className={BTN_REFRESH}
              >
                <RefreshCw size={15} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button onClick={handleAdd} className={BTN_ADD}>
                <Plus size={16} className="mr-2" />
                Add Tier
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            {/* Total */}
            <div className={STAT_CARD}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={STAT_LABEL}>Total Tiers</p>
                  <p className={STAT_VALUE}>{stats.total}</p>
                </div>
                <span className={STAT_ICON_PRIMARY}>
                  <Package size={22} className="text-[#006666]" />
                </span>
              </div>
            </div>

            {/* Active */}
            <div className={STAT_CARD}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={STAT_LABEL}>Active Tiers</p>
                  <p className={STAT_VALUE}>{stats.active}</p>
                </div>
                <span className={STAT_ICON_SUCCESS}>
                  <TrendingUp size={22} className="text-[#00A63D]" />
                </span>
              </div>
            </div>

            {/* MRR */}
            <div className={STAT_CARD}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={STAT_LABEL}>Potential MRR</p>
                  <p className={STAT_VALUE}>{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <span className={STAT_ICON_WARNING}>
                  <FaBangladeshiTakaSign size={22} className="text-[#FE9900]" />
                </span>
              </div>
            </div>
          </motion.div>

          <VersionBanner updatedAt={lastFetchedAt} />
        </motion.div>

        {/* ── Error Banner ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={ERROR_BANNER}
            >
              <AlertCircle size={16} className="text-[#FF2157] shrink-0" />
              <span className={ERROR_MSG}>{error}</span>
              <button onClick={() => clearError()} className={BTN_DISMISS}>
                <X size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tier List */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
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
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="sticky top-6 space-y-4">
              {/* Info card */}
              <div className={EDITOR_CARD}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={ICON_WELL_PRIMARY}>
                    <Settings size={18} className="text-[#006666]" />
                  </span>
                  <h3 className={EDITOR_TITLE}>Editor Panel</h3>
                </div>
                <p className={EDITOR_BODY}>
                  {showForm
                    ? "Editing subscription tier. Make changes below."
                    : "Select a tier to edit or create a new one to get started."}
                </p>
                {!showForm && (
                  <button
                    onClick={() => { setShowForm(true); setEditing(null); }}
                    className={BTN_CREATE}
                  >
                    <Plus size={16} className="mr-2" />
                    Create New Tier
                  </button>
                )}
              </div>

              {/* Tier Form */}
              <AnimatePresence mode="wait">
                {showForm && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, scale: 0.97, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 16 }}
                    transition={{ duration: 0.2 }}
                    className={FORM_CARD}
                  >
                    <div className={FORM_CARD_HEADER}>
                      <p className={FORM_CARD_TITLE}>
                        {editing ? "Edit Tier" : "Create New Tier"}
                      </p>
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

      {/* ── Dialogs ── */}
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