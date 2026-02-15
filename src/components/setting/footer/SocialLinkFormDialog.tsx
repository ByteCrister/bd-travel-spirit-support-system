// src/components/settings/settings/footer/SocialLinkFormDialog.tsx
"use client";

import { motion } from "framer-motion";
import { X, Save, Link2, Tag, ExternalLink, Hash, ToggleLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SocialLinkForm, socialLinkSchema } from "@/utils/validators/site-settings/footer-settings.validator";
import { useFooterStore } from "@/store/site-settings/footerSettings.store";
import { IconComboBox } from "./IconComboBox";

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
                // Editing existing link
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
                // Adding new link
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
            <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-200/60 bg-white/95 p-0 shadow-2xl backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/95">
                {/* Header with gradient */}
                <DialogHeader className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/80 px-8 py-6 dark:border-slate-800/60 dark:from-slate-800/80 dark:via-indigo-950/50 dark:to-purple-950/80">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                            >
                                <Link2 className="h-6 w-6 text-white" />
                            </motion.div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {editingId ? "Edit Social Link" : "Add Social Link"}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                {/* Form Content */}
                <form className="space-y-6 px-8 py-6" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Key Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="key" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Tag className="h-4 w-4 text-blue-500" />
                            Key
                        </Label>
                        <Input
                            id="key"
                            {...form.register("key")}
                            className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="e.g., facebook, twitter"
                        />
                        {form.formState.errors.key && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                {form.formState.errors.key.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Label Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="label" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Tag className="h-4 w-4 text-indigo-500" />
                            Label
                        </Label>
                        <Input
                            id="label"
                            {...form.register("label")}
                            className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="Display name"
                        />
                    </motion.div>

                    {/* URL Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="url" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <ExternalLink className="h-4 w-4 text-purple-500" />
                            URL
                        </Label>
                        <Input
                            id="url"
                            {...form.register("url")}
                            className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="https://example.com/profile"
                        />
                        {form.formState.errors.url && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                {form.formState.errors.url.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Icon field */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2">
                        <Label htmlFor="icon" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Tag className="h-4 w-4 text-rose-500" />
                            Icon
                        </Label>

                        <IconComboBox
                            value={iconValue}
                            onChange={(v) => form.setValue("icon", v)}
                            placeholder="Select icon (react-icons name)"
                        />

                        <p className="text-xs text-slate-500 dark:text-slate-400">Choose a react-icons component name to use as the icon for this link</p>
                    </motion.div>

                    {/* Order Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="order" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Hash className="h-4 w-4 text-teal-500" />
                            Order
                        </Label>
                        <Input
                            id="order"
                            type="number"
                            min="0"
                            {...form.register("order", {
                                valueAsNumber: true,
                                validate: {
                                    nonNegative: (value) => value === null || value === undefined || value >= 0 || "Order cannot be negative"
                                }
                            })}
                            className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="Display order"
                        />
                        {form.formState.errors.order && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                {form.formState.errors.order.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Active Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                    >
                        <div className="flex items-center gap-3">
                            <ToggleLeft className="h-5 w-5 text-green-500" />
                            <div>
                                <Label htmlFor="active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Active Status
                                </Label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Enable or disable this link
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="active"
                            checked={!!form.watch("active")}
                            onCheckedChange={(v) => form.setValue("active", v)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                        />
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-end gap-3 pt-4"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                            className="gap-2 rounded-lg border-2 border-slate-300 px-6 font-semibold hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 font-semibold shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/40"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Link"}
                        </Button>
                    </motion.div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
