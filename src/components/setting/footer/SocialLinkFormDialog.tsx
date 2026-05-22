// src/components/settings/settings/footer/SocialLinkFormDialog.tsx
"use client";

import { motion } from "framer-motion";
import { X, Save, Link2, Tag, ExternalLink, Hash, ToggleLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    SocialLinkForm,
    socialLinkSchema,
} from "@/utils/validators/site-settings/footer-settings.validator";
import { useFooterStore } from "@/store/site-settings/footerSettings.store";
import { IconComboBox } from "./IconComboBox";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_DIALOG_CONTENT =
    "max-h-[88vh] overflow-y-auto rounded-2xl p-0 border border-white/60 " +
    "bg-[#E7E5E4] shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff]";

const NEU_DIALOG_HEADER =
    "relative overflow-hidden border-b border-white/40 bg-[#E7E5E4] px-6 py-5 sm:px-8";

const NEU_ICON_WELL =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006666] " +
    "shadow-[3px_3px_6px_#004d4d,-2px_-2px_5px_#008080]";

const NEU_TITLE =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-xl";

const NEU_LABEL =
    "flex items-center gap-2 font-[family-name:var(--font-space-mono)] text-xs font-bold " +
    "text-[#1E2938]/60 uppercase tracking-widest";

const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/30 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 h-11 transition-all duration-200";

const NEU_ERROR =
    "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]";

const NEU_TOGGLE_ROW =
    "flex items-center justify-between rounded-xl bg-[#E7E5E4] p-4 " +
    "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_BTN_CANCEL =
    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/70 bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_SUBMIT =
    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm text-white " +
    "font-[family-name:var(--font-space-mono)] font-bold bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "disabled:opacity-50 disabled:cursor-not-allowed " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
// ─────────────────────────────────────────────────────────────

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function SocialLinkFormDialog({ open, onOpenChange }: Props) {
    const {
        entities,
        addOrUpdateSocialLink,
        saveStatus,
        editingSocialLinkId: editingId,
    } = useFooterStore();
    const saving = saveStatus === "loading";

    const initial = useMemo(() => {
        if (!editingId || !entities) return undefined;
        return entities.socialLinksById[editingId];
    }, [editingId, entities]);

    const form = useForm<SocialLinkForm>({
        resolver: zodResolver(socialLinkSchema),
        defaultValues: {
            id: initial?.id,
            key: initial?.key ?? "",
            label: initial?.label ?? "",
            icon: initial?.icon ?? null,
            url: initial?.url ?? "",
            active: initial?.active ?? true,
            order: initial?.order ?? null,
        },
        mode: "onBlur",
    });

    const iconValue = useWatch({
        control: form.control,
        name: "icon",
        defaultValue: initial?.icon ?? null,
    });

    useEffect(() => {
        if (open) {
            if (initial) {
                form.reset({
                    id: initial.id,
                    key: initial.key,
                    label: initial.label ?? "",
                    icon: initial.icon ?? null,
                    url: initial.url,
                    active: initial.active,
                    order: initial.order ?? null,
                });
            } else {
                form.reset({
                    id: undefined,
                    key: "",
                    label: "",
                    icon: null,
                    url: "",
                    active: true,
                    order: null,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initial]);

    async function onSubmit(values: SocialLinkForm) {
        const payload = {
            id: values.id,
            key: values.key!,
            label: values.label ?? null,
            icon: values.icon ?? null,
            url: values.url!,
            active: values.active ?? true,
            order: values.order ?? null,
        };
        const saved = await addOrUpdateSocialLink(payload);
        if (saved) onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={NEU_DIALOG_CONTENT}>
                {/* Header */}
                <DialogHeader className={NEU_DIALOG_HEADER}>
                    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#006666]/10 blur-3xl" />
                    <div className="relative flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -160 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 16 }}
                            className={NEU_ICON_WELL}
                        >
                            <Link2 className="h-5 w-5 text-white" />
                        </motion.div>
                        <DialogTitle className={NEU_TITLE}>
                            {editingId ? "Edit Social Link" : "Add Social Link"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Form */}
                <form
                    className="space-y-5 px-6 py-6 sm:px-8"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    {/* Key */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="key" className={NEU_LABEL}>
                            <Tag className="h-3.5 w-3.5 text-[#006666]" />
                            Key
                        </Label>
                        <Input
                            id="key"
                            {...form.register("key")}
                            className={NEU_INPUT}
                            placeholder="e.g., facebook, twitter"
                        />
                        {form.formState.errors.key && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU_ERROR}>
                                {form.formState.errors.key.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Label */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="label" className={NEU_LABEL}>
                            <Tag className="h-3.5 w-3.5 text-[#006666]" />
                            Label
                        </Label>
                        <Input
                            id="label"
                            {...form.register("label")}
                            className={NEU_INPUT}
                            placeholder="Display name"
                        />
                    </motion.div>

                    {/* URL */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="url" className={NEU_LABEL}>
                            <ExternalLink className="h-3.5 w-3.5 text-[#006666]" />
                            URL
                        </Label>
                        <Input
                            id="url"
                            {...form.register("url")}
                            className={NEU_INPUT}
                            placeholder="https://example.com/profile"
                        />
                        {form.formState.errors.url && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU_ERROR}>
                                {form.formState.errors.url.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="icon" className={NEU_LABEL}>
                            <Tag className="h-3.5 w-3.5 text-[#006666]" />
                            Icon
                        </Label>
                        <IconComboBox
                            value={iconValue}
                            onChange={(v) => form.setValue("icon", v)}
                            placeholder="Select icon (react-icons name)"
                        />
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                            Choose a react-icons component name for this link
                        </p>
                    </motion.div>

                    {/* Order */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="order" className={NEU_LABEL}>
                            <Hash className="h-3.5 w-3.5 text-[#006666]" />
                            Order
                        </Label>
                        <Input
                            id="order"
                            type="number"
                            min="0"
                            {...form.register("order", {
                                valueAsNumber: true,
                                validate: {
                                    nonNegative: (value) =>
                                        value === null ||
                                        value === undefined ||
                                        value >= 0 ||
                                        "Order cannot be negative",
                                },
                            })}
                            className={NEU_INPUT}
                            placeholder="Display order"
                        />
                        {form.formState.errors.order && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU_ERROR}>
                                {form.formState.errors.order.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Active Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                        className={NEU_TOGGLE_ROW}
                    >
                        <div className="flex items-center gap-3">
                            <ToggleLeft className="h-5 w-5 text-[#00A63D]" />
                            <div>
                                <Label
                                    htmlFor="active"
                                    className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]"
                                >
                                    Active Status
                                </Label>
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                    Enable or disable this link
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="active"
                            checked={!!form.watch("active")}
                            onCheckedChange={(v) => form.setValue("active", v)}
                            className="data-[state=checked]:bg-[#00A63D]"
                        />
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32 }}
                        className="flex justify-end gap-3 pt-2"
                    >
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                            className={NEU_BTN_CANCEL}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className={NEU_BTN_SUBMIT}>
                            <Save className="h-4 w-4" />
                            {saving ? "Saving…" : "Save Link"}
                        </button>
                    </motion.div>
                </form>
            </DialogContent>
        </Dialog>
    );
}