// src/components/enums/ValueEditorDialog.tsx
"use client";

import React, { JSX, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { EnumValueFormSchema, enumValueSchema } from "@/utils/validators/site-settings/enums-settings.validators";
import { EnumValueForm } from "@/types/site-settings/enum-settings.types";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertTriangle, Edit, Plus, X } from "lucide-react";
import { HiOutlineKey, HiOutlineTag, HiOutlineHashtag, HiOutlineSwitchHorizontal } from "react-icons/hi";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  overlay:
    "bg-[#E7E5E4] rounded-2xl overflow-hidden border border-white/60 " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] p-0",
  header: "flex items-center gap-3 px-6 pt-6 pb-5 border-b border-[#1E2938]/10",
  iconWell:
    "flex-none flex items-center justify-center w-10 h-10 rounded-xl bg-[#006666] " +
    "shadow-[3px_3px_7px_#004d4d,-2px_-2px_5px_#008080]",
  title:
    "text-base font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  closeBtn:
    "ml-auto p-1.5 rounded-xl text-[#1E2938]/40 bg-[#E7E5E4] " +
    "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "hover:text-[#1E2938] transition-all duration-200",
  body: "px-6 pt-5 pb-6 space-y-5",
  fieldLabel:
    "flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/60 mb-2",
  required: "text-[#FF2157]",
  input:
    "w-full px-4 py-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
    "placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
  inputWithIcon: "pl-10",
  inputError: "ring-2 ring-[#FF2157]/40 focus:ring-[#FF2157]/50",
  inputIconWrap:
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40",
  errorMsg:
    "mt-1.5 flex items-center gap-1.5 text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]",
  grid2: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  textarea:
    "w-full px-4 py-3 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm resize-none min-h-[80px] " +
    "placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200",
  // Active toggle row
  activeRow:
    "flex items-center justify-between gap-3 px-4 py-3 rounded-xl " +
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
  activeLabel:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] cursor-pointer",
  activeStatus:
    "flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",
  // Footer buttons
  footer: "flex flex-col sm:flex-row gap-3 pt-2",
  cancelBtn:
    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938] bg-[#E7E5E4] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
  submitBtn:
    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold " +
    "font-[family-name:var(--font-space-mono)] text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed",
};

const schema = enumValueSchema;

export default function ValueEditorDialog({
  open,
  onOpenChange,
  _id,
  defaultValue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  _id: string;
  defaultValue?: EnumValueForm;
}): JSX.Element {
  const { upsertValues, groups } = useEnumSettingsStore();
  const group = groups[_id]?.data;

  const form = useForm<EnumValueFormSchema>({
    resolver: zodResolver(schema),
    defaultValues:
      defaultValue ?? { key: "", label: "", value: "", description: "", active: true },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(
      defaultValue ?? { key: "", label: "", value: "", description: "", active: true }
    );
  }, [defaultValue, form]);

  function isUniqueKey(key: string): boolean {
    if (!group) return true;
    if (defaultValue?.key === key) return true;
    return !group.values.some((v) => v.key === key);
  }

  async function onSubmit(values: EnumValueFormSchema) {
    if (!isUniqueKey(values.key)) {
      form.setError("key", { message: "Key must be unique in group" });
      return;
    }
    await upsertValues({
      _id,
      name: group?.name ?? "",
      values: [{ ...values, active: values.active ?? true }],
      clientMutationId: undefined,
    });
    onOpenChange(false);
  }

  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const activeVal = form.watch("active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 bg-transparent border-none shadow-none">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18 }}
          className={S.overlay}
        >
          {/* Header */}
          <div className={S.header}>
            <div className={S.iconWell}>
              {defaultValue ? (
                <Edit className="w-4 h-4 text-white" />
              ) : (
                <Plus className="w-4 h-4 text-white" />
              )}
            </div>
            <h2 className={S.title}>
              {defaultValue ? `Edit "${defaultValue.key}"` : "Add New Value"}
            </h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
              className={S.closeBtn}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={form.handleSubmit(onSubmit)} className={S.body}>
            {/* Key */}
            <div>
              <label htmlFor="val-key" className={S.fieldLabel}>
                <HiOutlineKey className="w-3.5 h-3.5" />
                Key <span className={S.required}>*</span>
              </label>
              <div className="relative">
                <input
                  id="val-key"
                  {...form.register("key")}
                  disabled={!!defaultValue}
                  placeholder="unique_key"
                  aria-invalid={!!form.formState.errors.key}
                  className={`${S.input} ${S.inputWithIcon} ${form.formState.errors.key ? S.inputError : ""}`}
                />
                <span className={S.inputIconWrap}>
                  <HiOutlineHashtag className="w-4 h-4" />
                </span>
              </div>
              {form.formState.errors.key && (
                <p role="alert" className={S.errorMsg}>
                  <AlertTriangle size={12} />
                  {form.formState.errors.key.message}
                </p>
              )}
            </div>

            {/* Label + Value */}
            <div className={S.grid2}>
              <div>
                <label htmlFor="val-label" className={S.fieldLabel}>
                  <HiOutlineTag className="w-3.5 h-3.5" />
                  Label
                </label>
                <div className="relative">
                  <input
                    id="val-label"
                    {...form.register("label")}
                    placeholder="Display label"
                    className={`${S.input} ${S.inputWithIcon}`}
                  />
                  <span className={S.inputIconWrap}>
                    <HiOutlineTag className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="val-value" className={S.fieldLabel}>
                  <HiOutlineHashtag className="w-3.5 h-3.5" />
                  Value
                </label>
                <div className="relative">
                  <input
                    id="val-value"
                    {...form.register("value", { valueAsNumber: false })}
                    placeholder="Value"
                    className={`${S.input} ${S.inputWithIcon}`}
                  />
                  <span className={S.inputIconWrap}>
                    <HiOutlineHashtag className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <div className={S.activeRow}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="val-active"
                  {...form.register("active")}
                  defaultChecked
                  className="w-4 h-4 rounded accent-[#006666] cursor-pointer"
                />
                <label htmlFor="val-active" className={S.activeLabel}>
                  Active status
                </label>
              </div>
              <span className={S.activeStatus}>
                <HiOutlineSwitchHorizontal className="w-4 h-4" />
                {activeVal ? "Enabled" : "Disabled"}
              </span>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="val-description" className={S.fieldLabel}>
                Description
              </label>
              <textarea
                id="val-description"
                {...form.register("description")}
                placeholder="Optional description for admins"
                className={S.textarea}
              />
            </div>

            {/* Footer */}
            <div className={S.footer}>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className={S.cancelBtn}
              >
                <X size={15} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={form.formState.isSubmitting || hasErrors}
                className={S.submitBtn}
              >
                {defaultValue ? <Edit size={15} /> : <Plus size={15} />}
                {defaultValue ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}