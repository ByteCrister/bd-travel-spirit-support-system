// src/components/enums/CreateGroupDialog.tsx
"use client";

import React, { JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { HiOutlinePlusCircle, HiOutlineX } from "react-icons/hi";

import useEnumSettingsStore from "@/store/enumSettings.store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EnumGroupFormSchema, enumGroupSchema } from "@/utils/validators/enums-settings.validators";
import { ClipboardList, Info } from "lucide-react";

export default function CreateGroupDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: (name: string) => void;
}): JSX.Element {
    const { createGroup } = useEnumSettingsStore();

    const form = useForm<EnumGroupFormSchema>({
        resolver: zodResolver(enumGroupSchema),
        defaultValues: { name: "", description: "", values: [] },
        mode: "onBlur",
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: EnumGroupFormSchema) {
        const payload = {
            name: values.name.trim(),
            description: values.description?.trim() ?? null,
            values: values.values ?? [],
        };

        try {
            const g = await createGroup(payload);
            onOpenChange(false);
            if (onCreated) onCreated(g.name);
            form.reset({ name: "", description: "", values: [] });
        } catch {
            // createGroup will show toast; keep form state for user correction
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.996 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.16 }}
                    className="bg-white dark:bg-slate-900 rounded-lg shadow-md"
                >
                    <DialogHeader className="p-5 border-b dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-11 h-11 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                                <HiOutlinePlusCircle className="w-5 h-5" />
                            </div>

                            <div>
                                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Create new group
                                </DialogTitle>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Groups help you organize enum values for feature flags and settings.
                                </p>
                            </div>

                            <div className="ml-auto">
                                <button
                                    type="button"
                                    aria-label="Close dialog"
                                    onClick={() => onOpenChange(false)}
                                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <HiOutlineX className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                        <div>
                            <label htmlFor="name" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 gap-2">
                                <ClipboardList className="w-4 h-4 text-slate-400" />
                                Name <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                id="name"
                                placeholder="group_key_name"
                                {...form.register("name")}
                                aria-invalid={!!form.formState.errors.name}
                                className="mt-2"
                                autoFocus
                            />
                            {form.formState.errors.name && (
                                <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="description" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 gap-2">
                                <Info className="w-4 h-4 text-slate-400" />
                                Description
                            </label>
                            <Input
                                id="description"
                                placeholder="Optional description for admins"
                                {...form.register("description")}
                                className="mt-2"
                            />
                            {form.formState.errors.description && (
                                <p role="alert" className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="flex-1 flex items-center justify-center gap-2"
                                disabled={isSubmitting}
                            >
                                <HiOutlinePlusCircle className="w-4 h-4" />
                                Create group
                            </Button>
                        </DialogFooter>
                    </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
