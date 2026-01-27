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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AdvertisingPriceForm,
  CreateAdvertisingPricePayload,
  UpdateAdvertisingPricePayload,
} from "@/types/advertising-settings.types";
import { PLACEMENT } from "@/constants/advertising.const";
import useAdvertisingSettingsStore from "@/store/advertisingSettings.store";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";
import { CURRENCY } from "@/constants/tour.const";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

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

const placements: Array<{ label: string; value: string; icon: React.ReactNode; color: string }> = [
  {
    label: "Landing banner",
    value: PLACEMENT.LANDING_BANNER,
    icon: <Layout className="h-4 w-4" />,
    color: "from-violet-500 to-purple-600"
  },
  {
    label: "Popup modal",
    value: PLACEMENT.POPUP_MODAL,
    icon: <MessageSquare className="h-4 w-4" />,
    color: "from-blue-500 to-cyan-600"
  },
  {
    label: "Email",
    value: PLACEMENT.EMAIL,
    icon: <Mail className="h-4 w-4" />,
    color: "from-pink-500 to-rose-600"
  },
  {
    label: "Sidebar",
    value: PLACEMENT.SIDEBAR,
    icon: <SidebarIcon className="h-4 w-4" />,
    color: "from-orange-500 to-amber-600"
  },
  {
    label: "Sponsored list",
    value: PLACEMENT.SPONSORED_LIST,
    icon: <List className="h-4 w-4" />,
    color: "from-emerald-500 to-teal-600"
  },
];

const durationOptions = [7, 14, 30, 60, 90, 180];

const PriceFormModal: React.FC<Props> = ({
  open,
  onClose,
  initial,
  mode,
  onSubmit,
}) => {
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

  const selectedPlacement = placements.find(p => p.value === watchedPlacement);

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
    if (!open) {
      reset();
    }
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
        const payload: UpdateAdvertisingPricePayload = {
          id: data.id,
          ...common,
        };
        await onSubmit(payload);
      } else {
        const payload: CreateAdvertisingPricePayload = common;
        await onSubmit(payload);
      }

      onClose();
    } catch (rawErr: unknown) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err: any = rawErr;
        if (err && err.response && err.response.data && typeof err.response.data === "object") {
          const data = err.response.data;
          if (data.errors && typeof data.errors === "object") {
            const fieldErrors = data.errors as Record<string, string>;
            Object.keys(fieldErrors).forEach((k) => {
              setError(k as keyof AdvertisingPriceForm, { message: fieldErrors[k] });
            });
            return;
          }
        }
      } catch {
        // ignore
      }

      const message = extractErrorMessage(rawErr);
      showToast.error("Failed to save price", message);
    }
  });

  const toggleDuration = (duration: number) => {
    const current = watchedDurations || [];
    const newDurations = current.includes(duration)
      ? current.filter((d) => d !== duration)
      : [...current, duration].sort((a, b) => a - b);
    setValue("allowedDurationsDays", newDurations);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${selectedPlacement?.color || "from-emerald-500 to-emerald-600"
                } flex items-center justify-center shadow-lg`}
            >
              {selectedPlacement ? (
                <div className="text-white">{selectedPlacement.icon}</div>
              ) : (
                <Tag className="h-6 w-6 text-white" />
              )}
            </motion.div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {mode === "create" ? "Create New Price" : "Edit Price"}
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                {mode === "create"
                  ? "Add a new advertising placement price configuration"
                  : "Update advertising placement details and pricing"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6 mt-6" noValidate>
          {/* Title Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="space-y-3"
          >
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <HiCheckCircle className="h-4 w-4 text-emerald-600" />
              Title
            </Label>
            <Input
              type="text"
              placeholder="Enter title"
              className="h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              {...register("title", {
                required: "Title is required",
                validate: (value: string) => {

                  const trimmed = value.trim();
                  if (!trimmed) return "Title is required";

                  // Check uniqueness for the same placement
                  const placementValue = watch("placement")?.trim();
                  if (!placementValue) return true; // skip if placement not selected yet

                  const exists = pricingRows.some(
                    (r) =>
                      r.title?.trim().toLowerCase() === trimmed.toLowerCase() &&
                      r.placement === placementValue &&
                      r.id !== initial?.id // ignore current row
                  );
                  return exists ? "Title already exists for this placement" : true;
                },
                setValueAs: (v: string) => v.trim(),
              })}
              aria-invalid={!!errors.title}
            />
            <AnimatePresence>
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 flex items-center gap-1 font-medium"
                  role="alert"
                >
                  <HiX className="h-4 w-4" />
                  {errors.title.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Placement Selection - Card Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Tag className="h-4 w-4 text-emerald-600" />
              Placement Type
            </Label>
            <Controller
              name="placement"
              control={control}
              rules={{
                required: "Placement is required",
                validate: (value: string) => {
                  if (!value) return "Placement is required";

                  // Check uniqueness against existing pricingRows
                  const trimmedValue = value.trim();
                  const conflict = pricingRows.find(
                    (row) =>
                      row.placement === trimmedValue &&
                      row.id !== watch("id") // exclude current editing row
                  );
                  if (conflict) return "This placement is already used";

                  return true;
                },
              }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-14 border-2 border-slate-200 hover:border-emerald-300 transition-all">
                    <SelectValue placeholder="Select a placement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {placements.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-3 py-1">
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center`}
                          >
                            <div className="text-white">{p.icon}</div>
                          </div>
                          <span className="font-medium">{p.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <AnimatePresence>
              {errors.placement && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 flex items-center gap-1 font-medium"
                  role="alert"
                >
                  <HiX className="h-4 w-4" />
                  {errors.placement.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Price and Currency - Enhanced Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="col-span-2 space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FaBangladeshiTakaSign className="h-4 w-4 text-emerald-600" />
                Price Amount
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="^(0|[1-9]\d*)(\.\d{1,2})?$"
                  placeholder="99.99"
                  className="h-14 pl-10 text-lg font-semibold border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  {...register("price", {
                    required: "Price is required",
                    validate: (v: string | number) => {
                      const s = String(v).trim();
                      if (s === "") return "Price is required";
                      const ok = /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(s);
                      return ok ? true : "Enter a valid price (no leading zeros, up to 2 decimals)";
                    },
                    setValueAs: (v: string) => {
                      const s = String(v).trim();
                      return s === "" ? undefined : Number(s);
                    },
                  })}
                  aria-invalid={!!errors.price}
                  onBlur={(e) => {
                    const raw = e.currentTarget.value.trim();
                    if (!raw) return;
                    if (/^0+[1-9]/.test(raw)) {
                      const normalized = raw.replace(/^0+/, "");
                      e.currentTarget.value = normalized;
                    }
                  }}
                />
                <FaBangladeshiTakaSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <AnimatePresence>
                {errors.price && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1 font-medium"
                    role="alert"
                  >
                    <HiX className="h-4 w-4" />
                    {errors.price.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700">Currency</Label>
              <Controller
                name="currency"
                control={control}
                rules={{ required: "Currency is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-14 border-2 border-slate-200 hover:border-emerald-300 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CURRENCY.BDT}>🇧🇩 BDT</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <AnimatePresence>
                {errors.currency && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1 font-medium"
                    role="alert"
                  >
                    <HiX className="h-4 w-4" />
                    {errors.currency.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Default Duration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <HiCalendar className="h-4 w-4 text-emerald-600" />
              Default Duration (Days)
            </Label>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              max={30}
              placeholder="30"
              className="h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              {...register("defaultDurationDays", {
                setValueAs: (v: string | number | undefined) => {
                  if (v === "" || v === undefined || v === null) return undefined;
                  const s = String(v).trim();
                  const cleaned = s.replace(/^\+/, "");
                  const n = Number(cleaned);
                  if (Number.isNaN(n)) return undefined;
                  return Math.trunc(n);
                },
                validate: (v: unknown) => {
                  if (v === undefined || v === null || v === "") return true;
                  const s = String(v).trim();

                  if (!/^[0-9]+$/.test(s)) return "Must be a whole number";
                  if (/^0[0-9]+$/.test(s)) return "No leading zeros allowed (e.g., use 9, not 09)";

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
                  const clamped = Math.min(30, Math.max(1, Math.trunc(n)));
                  e.currentTarget.value = String(clamped);
                }
              }}
            />

            <p className="text-xs text-slate-500 flex items-center gap-1">
              <HiCalendar className="h-3 w-3" />
              Leave empty for no default duration
            </p>
            <AnimatePresence>
              {errors.defaultDurationDays && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-600 flex items-center gap-1 font-medium"
                  role="alert"
                >
                  <HiX className="h-4 w-4" />
                  {errors.defaultDurationDays.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Allowed Durations - Enhanced Chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold text-slate-700">Allowed Durations</Label>
            <div className="grid grid-cols-3 gap-3">
              {durationOptions.map((duration) => {
                const isSelected = (watchedDurations || []).includes(duration);
                return (
                  <motion.button
                    key={duration}
                    type="button"
                    onClick={() => toggleDuration(duration)}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`
                      relative h-16 rounded-xl border-2 transition-all shadow-sm
                      ${isSelected
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-emerald-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                      }
                    `}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                          className="absolute -top-2 -right-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full p-1 shadow-lg"
                        >
                          <HiCheckCircle className="h-4 w-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`text-2xl font-bold ${isSelected ? "text-emerald-700" : "text-slate-700"}`}>
                        {duration}
                      </span>
                      <span className={`text-xs font-medium ${isSelected ? "text-emerald-600" : "text-slate-500"}`}>
                        days
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Select one or more allowed duration options for this placement
            </p>
          </motion.div>

          {/* Active Status - Enhanced Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200"
          >
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {watch("active") ? (
                  <HiEye className="h-4 w-4 text-emerald-600" />
                ) : (
                  <HiEyeOff className="h-4 w-4 text-slate-400" />
                )}
                Active Status
              </Label>
              <p className="text-xs text-slate-600">
                {watch("active")
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
                  className="data-[state=checked]:bg-emerald-600 scale-110"
                />
              )}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 pt-6 border-t-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 hover:bg-slate-50 border-2"
            >
              <HiX className="mr-2 h-5 w-5" />
              Cancel
            </Button>

            <motion.div
              whileHover={{ scale: saving ? 1 : 1.02 }}
              whileTap={{ scale: saving ? 1 : 0.98 }}
              className="flex-1"
            >
              <Button
                type="submit"
                disabled={saving}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
              >
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiCheck className="mr-2 h-5 w-5" />
                    {mode === "create" ? "Create Price" : "Save Changes"}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PriceFormModal;