"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiX,
  HiCheck,
  HiCalendar,
  HiCheckCircle,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import {
  Layout,
  MessageSquare,
  Mail,
  Sidebar as SidebarIcon,
  List,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AdvertisingPriceForm,
  CreateAdvertisingPricePayload,
  UpdateAdvertisingPricePayload,
} from "@/types/advertising/advertising-settings.types";
import { PLACEMENT } from "@/constants/advertising.const";
import useAdvertisingSettingsStore from "@/store/site-settings/advertisingSettings.store";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";
import { CURRENCY } from "@/constants/tour.const";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  dialogContent:
    "sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#E7E5E4] border-none " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",

  iconWell:
    "h-14 w-14 rounded-2xl bg-[#006666] flex items-center justify-center flex-shrink-0 " +
    "shadow-[4px_4px_10px_#004d4d,-2px_-2px_6px_#008080]",

  modalTitle:
    "text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
  modalDesc:
    "mt-1 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",

  form: "space-y-6 mt-6",

  fieldLabel:
    "flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938]/60",

  input:
    "w-full h-12 rounded-xl px-4 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] " +
    "bg-[#E7E5E4] placeholder:text-[#1E2938]/30 " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200",

  inputWithIcon:
    "w-full h-12 rounded-xl pl-10 pr-4 text-sm font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938] " +
    "bg-[#E7E5E4] placeholder:text-[#1E2938]/30 " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200",

  errorMsg:
    "flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157] mt-1.5",

  hint:
    "flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 mt-1.5",

  // Placement card
  placementCard:
    "relative h-14 rounded-xl flex items-center gap-3 px-3 cursor-pointer " +
    "bg-[#E7E5E4] transition-all duration-200 " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
  placementCardActive:
    "relative h-14 rounded-xl flex items-center gap-3 px-3 cursor-pointer " +
    "bg-[#006666] transition-all duration-200 " +
    "shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080]",

  // Duration chip
  durationChip:
    "relative h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer " +
    "bg-[#E7E5E4] transition-all duration-200 " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
  durationChipActive:
    "relative h-16 rounded-xl flex flex-col items-center justify-center cursor-pointer " +
    "bg-[#E7E5E4] transition-all duration-200 " +
    "shadow-[inset_3px_3px_6px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",

  // Active toggle row
  toggleRow:
    "flex items-center justify-between p-4 rounded-xl " +
    "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]",

  // Footer buttons
  btnCancel:
    "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "transition-all duration-200",
  btnSubmit:
    "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "transition-all duration-200",
};

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: AdvertisingPriceForm | undefined;
  mode: Mode;
  onSubmit: (
    payload: CreateAdvertisingPricePayload | UpdateAdvertisingPricePayload
  ) => Promise<void>;
}

const placements = [
  { label: "Landing banner", value: PLACEMENT.LANDING_BANNER, icon: <Layout className="h-4 w-4" /> },
  { label: "Popup modal", value: PLACEMENT.POPUP_MODAL, icon: <MessageSquare className="h-4 w-4" /> },
  { label: "Email", value: PLACEMENT.EMAIL, icon: <Mail className="h-4 w-4" /> },
  { label: "Sidebar", value: PLACEMENT.SIDEBAR, icon: <SidebarIcon className="h-4 w-4" /> },
  { label: "Sponsored list", value: PLACEMENT.SPONSORED_LIST, icon: <List className="h-4 w-4" /> },
];

const durationOptions = [7, 14, 30, 60, 90, 180];

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <motion.p
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={S.errorMsg}
      role="alert"
    >
      <HiX className="h-3.5 w-3.5 flex-shrink-0" />
      {message}
    </motion.p>
  ) : null;

const PriceFormModal: React.FC<Props> = ({ open, onClose, initial, mode, onSubmit }) => {
  const { saving, pricingRows } = useAdvertisingSettingsStore();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
    setError,
  } = useForm<AdvertisingPriceForm>({
    defaultValues: {
      id: undefined,
      title: "",
      placement: "",
      price: 1,
      currency: CURRENCY.BDT,
      defaultDurationDays: "",
      allowedDurationsDays: [],
      active: true,
    },
  });

  const watchedDurations = watch("allowedDurationsDays");
  const watchedPlacement = watch("placement");
  const isActive = watch("active");
  const selectedPlacement = placements.find((p) => p.value === watchedPlacement);

  useEffect(() => {
    if (open && initial) {
      setValue("id", initial.id);
      setValue("title", initial.title);
      setValue("placement", initial.placement);
      setValue("price", initial.price);
      setValue("currency", initial.currency || "USD");
      setValue("defaultDurationDays", initial.defaultDurationDays ?? "");
      setValue("allowedDurationsDays", initial.allowedDurationsDays ?? []);
      setValue("active", initial.active);
    }
    if (!open) reset();
  }, [open, initial, setValue, reset]);

  const submit = handleSubmit(async (data) => {
    try {
      const common = {
        title: data.title,
        placement: data.placement as typeof PLACEMENT[keyof typeof PLACEMENT],
        price: Number(data.price),
        currency: data.currency || undefined,
        defaultDurationDays:
          data.defaultDurationDays === "" || data.defaultDurationDays === undefined
            ? undefined
            : Number(data.defaultDurationDays),
        allowedDurationsDays: Array.isArray(data.allowedDurationsDays)
          ? data.allowedDurationsDays.map((v) => Number(v))
          : [],
        active: Boolean(data.active),
      };

      if (mode === "edit" && data.id) {
        await onSubmit({ id: data.id, ...common } as UpdateAdvertisingPricePayload);
      } else {
        await onSubmit(common as CreateAdvertisingPricePayload);
      }
      onClose();
    } catch (rawErr: unknown) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = rawErr;
        if (err?.response?.data?.errors && typeof err.response.data.errors === "object") {
          const fieldErrors = err.response.data.errors as Record<string, string>;
          Object.keys(fieldErrors).forEach((k) =>
            setError(k as keyof AdvertisingPriceForm, { message: fieldErrors[k] })
          );
          return;
        }
      } catch { /* ignore */ }
      showToast.error("Failed to save price", extractErrorMessage(rawErr));
    }
  });

  const toggleDuration = (duration: number) => {
    const current = watchedDurations || [];
    const next = current.includes(duration)
      ? current.filter((d) => d !== duration)
      : [...current, duration].sort((a, b) => a - b);
    setValue("allowedDurationsDays", next);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className={S.dialogContent}>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={S.iconWell}
            >
              {selectedPlacement ? (
                <div className="text-white">{selectedPlacement.icon}</div>
              ) : (
                <Tag className="h-6 w-6 text-white" />
              )}
            </motion.div>
            <div>
              <DialogTitle className={S.modalTitle}>
                {mode === "create" ? "Create New Price" : "Edit Price"}
              </DialogTitle>
              <DialogDescription className={S.modalDesc}>
                {mode === "create"
                  ? "Add a new advertising placement price configuration"
                  : "Update advertising placement details and pricing"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={submit} className={S.form} noValidate>
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <label className={S.fieldLabel}>
              <HiCheckCircle className="h-4 w-4 text-[#006666]" />
              Title
            </label>
            <input
              type="text"
              placeholder="Enter title"
              className={S.input}
              {...register("title", {
                required: "Title is required",
                validate: (value: string) => {
                  const trimmed = value.trim();
                  if (!trimmed) return "Title is required";
                  const placementValue = watch("placement")?.trim();
                  if (!placementValue) return true;
                  const exists = pricingRows.some(
                    (r) =>
                      r.title?.trim().toLowerCase() === trimmed.toLowerCase() &&
                      r.placement === placementValue &&
                      r.id !== initial?.id
                  );
                  return exists ? "Title already exists for this placement" : true;
                },
                setValueAs: (v: string) => v.trim(),
              })}
              aria-invalid={!!errors.title}
            />
            <AnimatePresence><FieldError message={errors.title?.message} /></AnimatePresence>
          </motion.div>

          {/* Placement — card grid */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <label className={S.fieldLabel}>
              <Tag className="h-4 w-4 text-[#006666]" />
              Placement Type
            </label>
            <Controller
              name="placement"
              control={control}
              rules={{
                required: "Placement is required",
                validate: (value: string) => {
                  if (!value) return "Placement is required";
                  const conflict = pricingRows.find(
                    (row) => row.placement === value.trim() && row.id !== watch("id")
                  );
                  return conflict ? "This placement is already used" : true;
                },
              }}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {placements.map((p) => {
                    const active = field.value === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => field.onChange(p.value)}
                        className={active ? S.placementCardActive : S.placementCard}
                        aria-pressed={active}
                      >
                        <div className={`${active ? "text-white" : "text-[#006666]"}`}>
                          {p.icon}
                        </div>
                        <span
                          className={`text-xs font-bold font-[family-name:var(--font-space-mono)] truncate
                            ${active ? "text-white" : "text-[#1E2938]"}`}
                        >
                          {p.label}
                        </span>
                        {active && (
                          <HiCheck className="ml-auto h-4 w-4 text-white flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            <AnimatePresence><FieldError message={errors.placement?.message} /></AnimatePresence>
          </motion.div>

          {/* Price + Currency */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="col-span-2">
              <label className={S.fieldLabel}>
                <FaBangladeshiTakaSign className="h-4 w-4 text-[#006666]" />
                Price Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="^(0|[1-9]\d*)(\.\d{1,2})?$"
                  placeholder="99.99"
                  className={S.inputWithIcon}
                  {...register("price", {
                    required: "Price is required",
                    validate: (v: string | number) => {
                      const s = String(v).trim();
                      if (s === "") return "Price is required";
                      return /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(s)
                        ? true
                        : "Enter a valid price (up to 2 decimals)";
                    },
                    setValueAs: (v: string) => {
                      const s = String(v).trim();
                      return s === "" ? undefined : Number(s);
                    },
                  })}
                  aria-invalid={!!errors.price}
                  onBlur={(e) => {
                    const raw = e.currentTarget.value.trim();
                    if (raw && /^0+[1-9]/.test(raw)) {
                      e.currentTarget.value = raw.replace(/^0+/, "");
                    }
                  }}
                />
                <FaBangladeshiTakaSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/30" />
              </div>
              <AnimatePresence><FieldError message={errors.price?.message} /></AnimatePresence>
            </div>

            <div>
              <label className={S.fieldLabel}>Currency</label>
              <Controller
                name="currency"
                control={control}
                rules={{ required: "Currency is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12 rounded-xl bg-[#E7E5E4] border-none font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] focus:ring-2 focus:ring-[#006666]/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CURRENCY.BDT}>🇧🇩 BDT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <AnimatePresence><FieldError message={errors.currency?.message} /></AnimatePresence>
            </div>
          </motion.div>

          {/* Default Duration */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className={S.fieldLabel}>
              <HiCalendar className="h-4 w-4 text-[#006666]" />
              Default Duration (Days)
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              placeholder="30"
              className={S.input}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              {...register("defaultDurationDays", {
                setValueAs: (v: string | number | undefined) => {
                  if (v === "" || v === undefined || v === null) return undefined;
                  const s = String(v).trim().replace(/^\+/, "");
                  const n = Number(s);
                  return Number.isNaN(n) ? undefined : Math.trunc(n);
                },
                validate: (v: unknown) => {
                  if (v === undefined || v === null || v === "") return true;
                  const s = String(v).trim();
                  if (!/^[0-9]+$/.test(s)) return "Must be a whole number";
                  if (/^0[0-9]+$/.test(s)) return "No leading zeros allowed";
                  const n = Number(s);
                  if (!Number.isInteger(n)) return "Must be a whole number";
                  if (n < 1 || n > 30) return "Must be between 1 and 30 days";
                  return true;
                },
              })}
              aria-invalid={!!errors.defaultDurationDays}
              onBlur={(e) => {
                const raw = e.currentTarget.value.trim();
                if (!raw) return;
                const normalized = raw.replace(/^0+([1-9]\d*)$/, "$1");
                const n = Number(normalized);
                if (!Number.isNaN(n)) {
                  e.currentTarget.value = String(Math.min(30, Math.max(1, Math.trunc(n))));
                }
              }}
            />
            <p className={S.hint}>
              <HiCalendar className="h-3 w-3" />
              Leave empty for no default duration
            </p>
            <AnimatePresence><FieldError message={errors.defaultDurationDays?.message} /></AnimatePresence>
          </motion.div>

          {/* Allowed Durations */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className={S.fieldLabel}>Allowed Durations</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {durationOptions.map((duration) => {
                const isSelected = (watchedDurations || []).includes(duration);
                return (
                  <motion.button
                    key={duration}
                    type="button"
                    onClick={() => toggleDuration(duration)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className={isSelected ? S.durationChipActive : S.durationChip}
                    aria-pressed={isSelected}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1.5 -right-1.5 bg-[#006666] rounded-full p-0.5 shadow"
                        >
                          <HiCheckCircle className="h-3.5 w-3.5 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span
                      className={`text-lg font-bold font-[family-name:var(--font-space-mono)] leading-none
                        ${isSelected ? "text-[#006666]" : "text-[#1E2938]"}`}
                    >
                      {duration}
                    </span>
                    <span
                      className={`text-xs font-[family-name:var(--font-jetbrains-mono)] mt-0.5
                        ${isSelected ? "text-[#006666]/70" : "text-[#1E2938]/40"}`}
                    >
                      days
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <p className={S.hint}>Select one or more allowed duration options</p>
          </motion.div>

          {/* Active Status */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className={S.toggleRow}>
              <div>
                <label className={S.fieldLabel}>
                  {isActive
                    ? <><HiEye className="inline h-4 w-4 text-[#006666] mr-1" />Active Status</>
                    : <><HiEyeOff className="inline h-4 w-4 text-[#1E2938]/30 mr-1" />Active Status</>}
                </label>
                <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mt-0.5">
                  {isActive
                    ? "This price is visible and available for use"
                    : "This price is hidden and not available"}
                </p>
              </div>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-[#006666]"
                  />
                )}
              />
            </div>
          </motion.div>

          {/* Footer actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 pt-4 border-t border-[#1E2938]/10"
          >
            <button type="button" onClick={onClose} className={S.btnCancel}>
              <HiX className="h-4 w-4" />
              Cancel
            </button>

            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.97 }}
              className={S.btnSubmit}
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HiCheck className="h-4 w-4" />
                  {mode === "create" ? "Create Price" : "Save Changes"}
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PriceFormModal;