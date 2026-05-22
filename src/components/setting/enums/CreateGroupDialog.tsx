// src/components/enums/CreateGroupDialog.tsx
"use client";

import { JSX } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Plus, X, ClipboardList, Info } from "lucide-react";

import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EnumGroupFormSchema, enumGroupSchema } from "@/utils/validators/site-settings/enums-settings.validators";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
    overlay: "bg-[#E7E5E4] rounded-2xl overflow-hidden shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-0",
    header:
        "flex items-start gap-3 px-6 pt-6 pb-5 border-b border-[#1E2938]/10",
    iconWell:
        "flex-none flex items-center justify-center w-10 h-10 rounded-xl bg-[#006666] " +
        "shadow-[3px_3px_7px_#004d4d,-2px_-2px_5px_#008080]",
    titleText:
        "text-base font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]",
    subtitle:
        "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mt-0.5",
    closeBtn:
        "ml-auto p-1.5 rounded-xl text-[#1E2938]/50 bg-[#E7E5E4] " +
        "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
        "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
        "hover:text-[#1E2938] transition-all duration-200",
    body: "px-6 pt-5 pb-6 space-y-5",
    fieldLabel:
        "flex items-center gap-2 text-xs font-bold uppercase tracking-widest " +
        "font-[family-name:var(--font-space-mono)] text-[#1E2938]/60 mb-2",
    required: "text-[#FF2157] ml-1",
    input:
        "w-full px-4 py-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
        "placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] " +
        "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
        "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200",
    inputError:
        "focus:ring-[#FF2157]/50 ring-2 ring-[#FF2157]/40",
    errorMsg:
        "mt-1.5 flex items-center gap-1.5 text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]",
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
            values: (values.values ?? []).map((v) => ({
                key: v.key.trim(),
                value: v.value ?? v.key,
                label: v.label?.trim() ?? `label: ${v.key}`,
                description: v.description?.trim() ?? null,
                active: v.active ?? true,
            })),
        };
        try {
            const g = await createGroup(payload);
            onOpenChange(false);
            if (onCreated) onCreated(g.name);
            form.reset({ name: "", description: "", values: [] });
        } catch {
            // createGroup shows toast
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] p-0 bg-transparent border-none shadow-none">
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className={S.overlay}
                >
                    {/* Header */}
                    <div className={S.header}>
                        <div className={S.iconWell}>
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className={S.titleText}>Create new group</h2>
                            <p className={S.subtitle}>
                                Groups help you organize enum values for feature flags and settings.
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label="Close dialog"
                            onClick={() => onOpenChange(false)}
                            className={S.closeBtn}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={form.handleSubmit(onSubmit)} className={S.body}>
                        {/* Name */}
                        <div>
                            <label htmlFor="create-name" className={S.fieldLabel}>
                                <ClipboardList size={12} />
                                Name
                                <span className={S.required}>* not changeable</span>
                            </label>
                            <input
                                id="create-name"
                                placeholder="group_key_name"
                                {...form.register("name")}
                                aria-invalid={!!form.formState.errors.name}
                                autoFocus
                                className={`${S.input} ${form.formState.errors.name ? S.inputError : ""}`}
                            />
                            {form.formState.errors.name && (
                                <p role="alert" className={S.errorMsg}>
                                    <Info size={12} />
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="create-description" className={S.fieldLabel}>
                                <Info size={12} />
                                Description
                            </label>
                            <input
                                id="create-description"
                                placeholder="Optional description for admins"
                                {...form.register("description")}
                                className={S.input}
                            />
                            {form.formState.errors.description && (
                                <p role="alert" className={S.errorMsg}>
                                    <Info size={12} />
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={S.footer}>
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className={S.cancelBtn}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={S.submitBtn}
                            >
                                <Plus size={15} />
                                Create group
                            </button>
                        </div>
                    </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}