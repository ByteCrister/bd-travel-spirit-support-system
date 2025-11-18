// components/GuideSubscriptions/TierForm.tsx
"use client";
import React, { useEffect } from "react";
import { useForm, FieldPath } from "react-hook-form";
import type {
  SubscriptionTierFormValues,
  ValidationError,
} from "@/types/guide-subscription-settings.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/types/guide-subscription-settings.types";
import { format } from "date-fns";
import { mapValidationErrors } from "@/utils/helpers/guide-subscriptions.transform";
import { motion } from "framer-motion";
import { DollarSign, Calendar, Sparkles, Code, AlertCircle, Check, X, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface TierFormProps {
  initialValues?: Partial<SubscriptionTierFormValues> & { _id?: string; createdAt?: string; updatedAt?: string };
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
      key: initialValues?.key ?? "",
      title: initialValues?.title ?? "",
      price: initialValues?.price ?? 0,
      currency: initialValues?.currency ?? Currency.USD,
      billingCycleDays: initialValues?.billingCycleDays ?? [30],
      perks: initialValues?.perks ?? [],
      active: initialValues?.active ?? true,
      metadata: initialValues?.metadata ?? {},
    },
  });

  useEffect(() => {
    if (!validations || validations.length === 0) return;
    const map = mapValidationErrors(validations);
    Object.entries(map).forEach(([field, message]) => {
      const name = field as FieldPath<SubscriptionTierFormValues>;
      setError(name, { type: "server", message });
    });
  }, [validations, setError]);

  const billing = watch("billingCycleDays");
  const perks = watch("perks");
  const active = watch("active");

  async function onInternalSubmit(raw: SubscriptionTierFormValues & { note?: string }) {
    const nameKey: FieldPath<SubscriptionTierFormValues> = "key";
    const nameTitle: FieldPath<SubscriptionTierFormValues> = "title";
    const namePrice: FieldPath<SubscriptionTierFormValues> = "price";
    const nameBilling: FieldPath<SubscriptionTierFormValues> = "billingCycleDays";

    if (!raw.key || raw.key.trim().length === 0) {
      setError(nameKey, { type: "client", message: "Key is required" });
      return;
    }
    if (!/^[a-z0-9-_]+$/i.test(raw.key)) {
      setError(nameKey, { type: "client", message: "Key must be alphanumeric, dash or underscore" });
      return;
    }
    if (!raw.title || raw.title.trim().length === 0) {
      setError(nameTitle, { type: "client", message: "Title is required" });
      return;
    }

    const priceNum = Number(raw.price);
    if (Number.isNaN(priceNum)) {
      setError(namePrice, { type: "client", message: "Price is required and must be a number" });
      return;
    }
    if (!isFinite(priceNum) || priceNum < 0) {
      setError(namePrice, { type: "client", message: "Price must be a finite number >= 0" });
      return;
    }

    if (!Array.isArray(raw.billingCycleDays) || raw.billingCycleDays.length === 0) {
      setError(nameBilling, { type: "client", message: "At least one billing cycle is required" });
      return;
    }
    if (raw.billingCycleDays.some((v) => !Number.isInteger(Number(v)) || Number(v) <= 0)) {
      setError(nameBilling, { type: "client", message: "Billing cycles must be positive integers (days)" });
      return;
    }

    await onSubmit(raw);
  }

  const billingOptions = [
    { days: 7, label: 'Weekly' },
    { days: 30, label: 'Monthly' },
    { days: 90, label: 'Quarterly' },
    { days: 365, label: 'Yearly' },
  ];

  return (
    <form onSubmit={handleSubmit(onInternalSubmit)} className="p-6 space-y-6">
      {/* Key Field */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Code size={14} className="text-gray-500" />
          Key (Unique Identifier)
        </Label>
        <Input 
          {...register("key")} 
          placeholder="e.g., basic-monthly"
          className={`font-mono ${errors.key ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {errors.key && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle size={14} />
            <AlertDescription className="text-xs">{errors.key.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Display Title</Label>
        <Input 
          {...register("title")} 
          placeholder="e.g., Basic Plan"
          className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.title && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle size={14} />
            <AlertDescription className="text-xs">{errors.title.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Price & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign size={14} className="text-green-600" />
            Price
          </Label>
          <Input 
            type="number" 
            step="0.01" 
            {...register("price")} 
            placeholder="9.99"
            className={errors.price ? 'border-red-500 focus:ring-red-500' : ''}
          />
          {errors.price && (
            <p className="text-xs text-red-600">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Currency</Label>
          <Select value={watch("currency")} onValueChange={(v) => setValue("currency", v as Currency | string)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Currency.USD}>🇺🇸 USD</SelectItem>
              <SelectItem value={Currency.EUR}>🇪🇺 EUR</SelectItem>
              <SelectItem value={Currency.GBP}>🇬🇧 GBP</SelectItem>
              <SelectItem value={Currency.BDT}>🇧🇩 BDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Billing Cycles */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Calendar size={14} className="text-blue-600" />
          Billing Cycles
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {billingOptions.map(({ days, label }) => {
            const isSelected = billing?.includes(days);
            return (
              <motion.button
                key={days}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => {
                  const current = new Set<number>(billing);
                  if (current.has(days)) {
                    current.delete(days);
                  } else {
                    current.add(days);
                  }
                  setValue("billingCycleDays", Array.from(current));
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{days} days</div>
                </div>
              </motion.button>
            );
          })}
        </div>
        {errors.billingCycleDays && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle size={14} />
            <AlertDescription className="text-xs">{errors.billingCycleDays.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Perks */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles size={14} className="text-purple-600" />
          Perks (comma separated)
        </Label>
        <Input
          placeholder="e.g., Unlimited guides, Priority support, Custom branding"
          value={Array.isArray(perks) ? perks.join(", ") : ""}
          onChange={(e) =>
            setValue(
              "perks",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />
        {perks && perks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {perks.map((perk, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {perk}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Active Status</Label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {active ? 'Tier is visible to customers' : 'Tier is hidden from customers'}
          </p>
        </div>
        <Switch
          checked={active}
          onCheckedChange={(v) => setValue("active", v)}
          className="data-[state=checked]:bg-green-600"
        />
      </div>

      {/* Metadata */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2">
          <Code size={14} />
          Advanced: Metadata (JSON)
        </summary>
        <div className="mt-3">
          <Textarea
            className="font-mono text-xs"
            rows={6}
            value={JSON.stringify(watch("metadata") ?? {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setValue("metadata", parsed);
              } catch {
                // swallow invalid JSON until submit
              }
            }}
          />
        </div>
      </details>

      {/* Timestamps */}
      {initialValues?._id && initialValues.updatedAt && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last saved: {format(new Date(initialValues.updatedAt), "PPpp")}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={loading}
          className="gap-2"
        >
          <X size={16} />
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={16} />
              </motion.div>
              Saving...
            </>
          ) : (
            <>
              <Check size={16} />
              Save Tier
            </>
          )}
        </Button>
      </div>
    </form>
  );
};