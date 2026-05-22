// src/components/enums/GroupDetail.tsx
"use client";

import React, { JSX, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import GroupDetailSkeleton from "./skeletons/GroupDetailSkeleton";
import ErrorBar from "./ErrorBar";
import ValuesSection from "./ValuesSection";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";
import { EnumGroupFormSchema, enumGroupSchema } from "@/utils/validators/site-settings/enums-settings.validators";
import { CheckCircle2, Database, Edit, Package, RefreshCw, X, FileText } from "lucide-react";
import { showToast } from "@/components/global/showToast";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  section: "relative p-5 h-full",
  // Empty state
  emptyWrap:
    "flex flex-col items-center justify-center h-full min-h-[500px] p-8 text-center",
  emptyIcon:
    "mb-5 p-6 rounded-3xl bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]",
  emptyTitle:
    "text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] mb-2",
  emptyMsg:
    "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 max-w-xs leading-relaxed",
  // Header
  headerWrap:
    "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-5 border-b border-[#1E2938]/10",
  titleRow: "flex items-center gap-3 mb-2",
  iconWell:
    "p-2.5 rounded-xl bg-[#006666] shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080]",
  groupName:
    "text-2xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight",
  description:
    "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60 leading-relaxed mb-3",
  metaRow: "flex flex-wrap items-center gap-2",
  metaBadge:
    "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold " +
    "font-[family-name:var(--font-space-mono)] bg-[#E7E5E4] text-[#1E2938]/70 " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  activeBadge:
    "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold " +
    "font-[family-name:var(--font-space-mono)] bg-[#00A63D]/10 text-[#00A63D] " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  actionRow: "flex gap-2 flex-none",
  refreshBtn:
    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938] bg-[#E7E5E4] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
  editBtn:
    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold " +
    "font-[family-name:var(--font-space-mono)] text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
  cancelBtn:
    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold " +
    "font-[family-name:var(--font-space-mono)] text-[#FF2157] bg-[#E7E5E4] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200",
  // Edit form
  formWrap:
    "rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] p-6 space-y-5",
  fieldLabel:
    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/60 mb-2",
  labelIcon: "p-1.5 rounded-lg bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  input:
    "w-full px-4 py-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
    "placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
  inputHint:
    "mt-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40",
  saveBtn:
    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold " +
    "font-[family-name:var(--font-space-mono)] text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
  cancelFormBtn:
    "px-4 py-2.5 rounded-xl text-sm font-bold font-[family-name:var(--font-space-mono)] " +
    "text-[#1E2938] bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200",
};

export default function GroupDetail({ selected }: { selected: string | null }): JSX.Element {
  const { fetchGroup, updateGroup, groups } = useEnumSettingsStore();
  const groupState = selected ? groups[selected] : undefined;
  const [editing, setEditing] = useState(false);

  const status = groupState?.status ?? "idle";
  const error = groupState?.error ?? null;
  const data = groupState?.data ?? null;

  const form = useForm<EnumGroupFormSchema>({
    resolver: zodResolver(enumGroupSchema),
    defaultValues: {
      _id: data?._id,
      name: data?.name ?? "",
      description: data?.description ?? undefined,
      values: data?.values ?? [],
    },
  });

  useEffect(() => {
    form.reset({
      _id: data?._id,
      name: data?.name ?? "",
      description: data?.description ?? undefined,
      values: data?.values ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ── Empty ─────────────────────────────────────────────────
  if (!selected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={S.emptyWrap}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={S.emptyIcon}
        >
          <Package className="w-14 h-14 text-[#1E2938]/30" strokeWidth={1.5} />
        </motion.div>
        <h3 className={S.emptyTitle}>No Group Selected</h3>
        <p className={S.emptyMsg}>
          Select a group from the sidebar to view and manage its details and values.
        </p>
      </motion.div>
    );
  }

  if (status === "loading" && !data) return <GroupDetailSkeleton />;
  if (error) return <ErrorBar message={error} onRetry={() => void fetchGroup(selected, { force: true })} />;

  const onSave: SubmitHandler<EnumGroupFormSchema> = async (values) => {
    const payload = {
      _id: data?._id ?? "",
      name: data?.name ?? "",
      description: values.description ?? "",
      values: data?.values ?? [],
    } as const;
    try {
      await updateGroup(payload);
      setEditing(false);
      showToast.success("Updated", "Group details updated successfully");
    } catch {
      // handled by store
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={S.section}
    >
      {/* Header */}
      <div className={S.headerWrap}>
        <div className="flex-1 min-w-0">
          <div className={S.titleRow}>
            <div className={S.iconWell}>
              <Database className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <h2 className={S.groupName}>{data?.name}</h2>
          </div>

          <p className={S.description}>
            {data?.description || "No description provided"}
          </p>

          <div className={S.metaRow}>
            <span className={S.metaBadge}>
              <Package size={12} />
              {data?.values?.length ?? 0} values
            </span>
            <span className={S.activeBadge}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A63D]" />
              Active
            </span>
          </div>
        </div>

        <div className={S.actionRow}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => void fetchGroup(selected, { force: true })}
            className={S.refreshBtn}
          >
            <RefreshCw size={13} />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setEditing((s) => !s)}
            className={editing ? S.cancelBtn : S.editBtn}
          >
            {editing ? (
              <>
                <X size={13} />
                Cancel
              </>
            ) : (
              <>
                <Edit size={13} />
                Edit Info
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.form
            key="edit-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            onSubmit={form.handleSubmit(onSave)}
            className={S.formWrap}
          >
            {/* Name (disabled) */}
            <div>
              <label className={S.fieldLabel}>
                <span className={S.labelIcon}>
                  <Database size={12} className="text-[#006666]" />
                </span>
                Group Name
              </label>
              <input
                {...form.register("name")}
                disabled
                className={S.input}
              />
              <p className={S.inputHint}>Group name cannot be changed</p>
            </div>

            {/* Description */}
            <div>
              <label className={S.fieldLabel}>
                <span className={S.labelIcon}>
                  <FileText size={12} className="text-[#006666]" />
                </span>
                Description
              </label>
              <input
                {...form.register("description")}
                placeholder="Enter group description…"
                className={S.input}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={form.formState.isSubmitting}
                className={S.saveBtn}
              >
                <CheckCircle2 size={15} />
                Save Changes
              </motion.button>
              <button
                type="button"
                onClick={() => { form.reset(); setEditing(false); }}
                className={S.cancelFormBtn}
              >
                Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="values-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <ValuesSection _id={selected} values={data?.values ?? []} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}