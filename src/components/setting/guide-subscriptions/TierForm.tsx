// components/GuideSubscriptions/TierForm.tsx
"use client";

import React, { useEffect } from "react";
import { useForm, FieldPath } from "react-hook-form";
import type {
  SubscriptionTierFormValues,
  ValidationError,
} from "@/types/site-settings/guide-subscription-settings.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Currency } from "@/types/site-settings/guide-subscription-settings.types";
import { format } from "date-fns";
import { mapValidationErrors } from "@/utils/helpers/guide-subscriptions.transform";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Code, AlertCircle, Check, X, RefreshCw } from "lucide-react";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism style tokens ──────────────────────────────────
const FORM_WRAP = "p-6 space-y-6";

const FIELD_LABEL =
  "flex items-center gap-2 text-xs font-bold uppercase tracking-widest " +
  "font-[family-name:var(--font-space-mono)] text-[#1E2938]/55";

const NEU_INPUT =
  "w-full px-3 py-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/35 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_INPUT_ERROR =
  "w-full px-3 py-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/35 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "ring-2 ring-[#FF2157]/50 focus:outline-none transition-all duration-200";

const ERROR_MSG =
  "flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157] mt-1";

const BILLING_BTN_BASE =
  "relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full " +
  "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "border-[#1E2938]/10 hover:border-[#006666]/40";

const BILLING_BTN_ACTIVE =
  "relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full " +
  "bg-[#E7E5E4] border-[#006666] " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const BILLING_LABEL =
  "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]";

const BILLING_DAYS =
  "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/45 mt-0.5";

const CHECK_DOT =
  "absolute top-2 right-2 w-5 h-5 bg-[#006666] rounded-full flex items-center justify-center " +
  "shadow-[2px_2px_4px_#004d4d]";

const PERK_TAG =
  "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "bg-[#E7E5E4] text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const ACTIVE_TOGGLE_ROW =
  "flex items-center justify-between p-4 rounded-xl " +
  "bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]";

const TIMESTAMP_TEXT =
  "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40";

const DIVIDER = "border-t border-[#1E2938]/08";

const BTN_CANCEL =
  "gap-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border-none " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200 px-4 py-2";

const BTN_SAVE =
  "gap-2 rounded-xl bg-[#006666] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] border-none " +
  "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d] " +
  "transition-all duration-200 px-4 py-2";

const SELECT_TRIGGER_STYLE =
  "h-10 rounded-xl bg-[#E7E5E4] text-[#1E2938] border-none " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
  "focus:ring-2 focus:ring-[#006666]/50";
// ─────────────────────────────────────────────────────────────

const billingOptions = [
  { days: 7, label: "Weekly" },
  { days: 30, label: "Monthly" },
  { days: 90, label: "Quarterly" },
  { days: 365, label: "Yearly" },
];

export interface TierFormProps {
  initialValues?: Partial<SubscriptionTierFormValues> & {
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  onCancel: () => void;
  onSubmit: (values: SubscriptionTierFormValues & { note?: string }) => Promise<void>;
  loading?: boolean;
  validations?: ValidationError[];
}

export const TierForm: React.FC<TierFormProps> = ({
  initialValues,
  onCancel,
  onSubmit,
  loading,
  validations,
}) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SubscriptionTierFormValues>({
    defaultValues: {
      _id: initialValues?._id ?? undefined,
      key: initialValues?.key ?? "",
      title: initialValues?.title ?? "",
      price: initialValues?.price ?? 0,
      currency: initialValues?.currency ?? Currency.BDT,
      billingCycleDays: initialValues?.billingCycleDays ?? [30],
      perks: initialValues?.perks ?? [],
      active: initialValues?.active ?? true,
    },
  });

  useEffect(() => {
    if (!validations || validations.length === 0) return;
    const map = mapValidationErrors(validations);
    Object.entries(map).forEach(([field, message]) => {
      setError(field as FieldPath<SubscriptionTierFormValues>, { type: "server", message });
    });
  }, [validations, setError]);

  const billing = watch("billingCycleDays");
  const perks = watch("perks");
  const active = watch("active");

  async function onInternalSubmit(raw: SubscriptionTierFormValues & { note?: string }) {
    if (!raw.key || raw.key.trim().length === 0) {
      setError("key", { type: "client", message: "Key is required" });
      return;
    }
    if (!/^[a-z0-9-_]+$/i.test(raw.key)) {
      setError("key", { type: "client", message: "Key must be alphanumeric, dash or underscore" });
      return;
    }
    if (!raw.title || raw.title.trim().length === 0) {
      setError("title", { type: "client", message: "Title is required" });
      return;
    }
    const priceNum = Number(raw.price);
    if (Number.isNaN(priceNum)) {
      setError("price", { type: "client", message: "Price must be a number" });
      return;
    }
    if (priceNum < 0) {
      setError("price", { type: "client", message: "Price cannot be negative" });
      return;
    }
    if (!Number.isFinite(priceNum)) {
      setError("price", { type: "client", message: "Price must be a valid number" });
      return;
    }
    if (priceNum > 1000000) {
      setError("price", { type: "client", message: "Price is unusually high — please lower it" });
      return;
    }
    if (!Array.isArray(raw.billingCycleDays) || raw.billingCycleDays.length === 0) {
      setError("billingCycleDays", { type: "client", message: "At least one billing cycle is required" });
      return;
    }
    if (raw.billingCycleDays.some((v) => !Number.isInteger(Number(v)) || Number(v) <= 0)) {
      setError("billingCycleDays", { type: "client", message: "Billing cycles must be positive integers (days)" });
      return;
    }
    await onSubmit(raw);
  }

  return (
    <form onSubmit={handleSubmit(onInternalSubmit)} className={FORM_WRAP}>
      {/* Key */}
      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>
          <Code size={13} />
          Key (Unique Identifier)
        </label>
        <input
          {...register("key")}
          placeholder="e.g., basic-monthly"
          className={errors.key ? NEU_INPUT_ERROR : NEU_INPUT}
        />
        {errors.key && (
          <p className={ERROR_MSG}>
            <AlertCircle size={12} />
            {errors.key.message}
          </p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>Display Title</label>
        <input
          {...register("title")}
          placeholder="e.g., Basic Plan"
          className={errors.title ? NEU_INPUT_ERROR : NEU_INPUT}
        />
        {errors.title && (
          <p className={ERROR_MSG}>
            <AlertCircle size={12} />
            {errors.title.message}
          </p>
        )}
      </div>

      {/* Price & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={FIELD_LABEL}>
            <FaBangladeshiTakaSign size={13} className="text-[#00A63D]" />
            Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            {...register("price")}
            placeholder="9.99"
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e") e.preventDefault();
            }}
            className={errors.price ? NEU_INPUT_ERROR : NEU_INPUT}
          />
          {errors.price && (
            <p className={ERROR_MSG}>
              <AlertCircle size={12} />
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={FIELD_LABEL}>Currency</label>
          <Select
            value={watch("currency")}
            onValueChange={(v) => setValue("currency", v as Currency | string)}
          >
            <SelectTrigger className={SELECT_TRIGGER_STYLE}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#E7E5E4] border-white/60 rounded-xl shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]">
              <SelectItem
                value={Currency.BDT}
                className="font-[family-name:var(--font-space-mono)] text-sm"
              >
                🇧🇩 BDT
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Cycles */}
      <div className="space-y-2.5">
        <label className={FIELD_LABEL}>
          <Calendar size={13} className="text-[#006666]" />
          Billing Cycles
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {billingOptions.map(({ days, label }) => {
            const isSelected = billing?.includes(days);
            return (
              <motion.button
                key={days}
                type="button"
                whileTap={{ scale: 0.97 }}
                className={isSelected ? BILLING_BTN_ACTIVE : BILLING_BTN_BASE}
                onClick={() => {
                  const current = new Set<number>(billing);
                  if (current.has(days)) current.delete(days);
                  else current.add(days);
                  setValue("billingCycleDays", Array.from(current));
                }}
              >
                {isSelected && (
                  <span className={CHECK_DOT}>
                    <Check size={11} className="text-white" />
                  </span>
                )}
                <div className={BILLING_LABEL}>{label}</div>
                <div className={BILLING_DAYS}>{days} days</div>
              </motion.button>
            );
          })}
        </div>
        {errors.billingCycleDays && (
          <p className={ERROR_MSG}>
            <AlertCircle size={12} />
            {errors.billingCycleDays.message}
          </p>
        )}
      </div>

      {/* Perks */}
      <div className="space-y-1.5">
        <label className={FIELD_LABEL}>
          <Sparkles size={13} className="text-[#006666]" />
          Perks (comma separated)
        </label>
        <input
          type="text"
          placeholder="e.g., Unlimited guides, Priority support"
          value={Array.isArray(perks) ? perks.join(", ") : ""}
          onChange={(e) =>
            setValue(
              "perks",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          className={NEU_INPUT}
        />
        {perks && perks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {perks.map((perk, idx) => (
              <span key={idx} className={PERK_TAG}>
                {perk}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Active Toggle */}
      <div className={ACTIVE_TOGGLE_ROW}>
        <div>
          <p className="text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]">
            Active Status
          </p>
          <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/45 mt-0.5">
            {active ? "Visible to customers" : "Hidden from customers"}
          </p>
        </div>
        <Switch
          checked={active}
          onCheckedChange={(v) => setValue("active", v)}
          className="data-[state=checked]:bg-[#006666]"
        />
      </div>

      {/* Timestamp */}
      {initialValues?._id && initialValues.updatedAt && (
        <div className={`pt-4 ${DIVIDER}`}>
          <p className={TIMESTAMP_TEXT}>
            Last saved: {format(new Date(initialValues.updatedAt), "PPpp")}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className={`flex items-center gap-3 justify-end pt-4 ${DIVIDER}`}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={BTN_CANCEL}
        >
          <span className="flex items-center gap-2">
            <X size={15} />
            Cancel
          </span>
        </button>
        <button type="submit" disabled={loading} className={BTN_SAVE}>
          {loading ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={15} />
              </motion.div>
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check size={15} />
              Save Tier
            </span>
          )}
        </button>
      </div>
    </form>
  );
};