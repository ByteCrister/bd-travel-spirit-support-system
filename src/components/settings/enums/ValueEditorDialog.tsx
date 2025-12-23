// src/components/enums/ValueEditorDialog.tsx
"use client";

import React, { JSX, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { EnumValueFormSchema, enumValueSchema } from "@/utils/validators/enums-settings.validators";
import { EnumValueForm } from "@/types/enum-settings.types";
import useEnumSettingsStore from "@/store/enumSettings.store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Edit, Edit2, Plus, X } from "lucide-react";
import { HiOutlineKey, HiOutlineTag, HiOutlineHashtag, HiOutlineSwitchHorizontal } from "react-icons/hi";

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

    await upsertValues({ _id, name: group?.name ?? "", values: [{ ...values, active: values.active ?? true }], clientMutationId: undefined });

    onOpenChange(false);
  }

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className="bg-white dark:bg-slate-900 shadow-lg rounded-lg"
        >
          <DialogHeader className="p-5 border-b dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                {defaultValue ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <DialogTitle className="text-lg font-semibold">
                {defaultValue ? `Edit "${defaultValue.key}"` : "Add New Value"}
              </DialogTitle>
              <div className="ml-auto">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => onOpenChange(false)}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Key */}
            <div>
              <label htmlFor="key" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 gap-2">
                <HiOutlineKey className="w-4 h-4 text-slate-400" />
                Key <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2 relative">
                <Input
                  id="key"
                  {...form.register("key")}
                  disabled={!!defaultValue}
                  placeholder="unique_key"
                  aria-invalid={!!form.formState.errors.key}
                  className={`pl-10 transition-all ${form.formState.errors.key ? "border-rose-500" : ""}`}
                />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <HiOutlineHashtag className="w-4 h-4" />
                </div>
              </div>
              {form.formState.errors.key && (
                <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {form.formState.errors.key.message}
                </p>
              )}
            </div>

            {/* Label & Value side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="label" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 gap-2">
                  <HiOutlineTag className="w-4 h-4 text-slate-400" />
                  Label
                </label>
                <div className="mt-2 relative">
                  <Input
                    id="label"
                    {...form.register("label")}
                    placeholder="Display label"
                    className="pl-10 transition-all"
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="value" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 gap-2">
                  <HiOutlineHashtag className="w-4 h-4 text-slate-400" />
                  Value
                </label>
                <div className="mt-2 relative">
                  <Input
                    id="value"
                    {...form.register("value", { valueAsNumber: false })}
                    placeholder="Value"
                    className="pl-10 transition-all"
                  />
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <HiOutlineHashtag className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">

              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <Checkbox id="active" {...form.register("active")} defaultChecked />
                  <label htmlFor="active" className="text-sm font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                    Active status
                  </label>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <HiOutlineSwitchHorizontal className="w-4 h-4" />
                  <span>{form.watch("active") ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                id="description"
                {...form.register("description")}
                placeholder="Optional description for admins"
                className="mt-2 w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 transition-all min-h-[80px] resize-none"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2"
                disabled={form.formState.isSubmitting || hasErrors}
              >
                {defaultValue ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {defaultValue ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
