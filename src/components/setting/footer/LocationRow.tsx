// src/components/settings/settings/footer/LocationRow.tsx
"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, MapPin, GripVertical, Navigation } from "lucide-react";
import type { LocationEntryDTO } from "@/types/site-settings/footer-settings.types";
import { useFooterStore } from "@/store/site-settings/footerSettings.store";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_ROW =
    "group relative rounded-xl bg-[#E7E5E4] p-4 " +
    "shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60 " +
    "hover:shadow-[6px_6px_14px_#c8c6c5,-6px_-6px_14px_#ffffff] " +
    "transition-all duration-200";

const NEU_ACCENT_BAR =
    "absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#006666] " +
    "opacity-0 group-hover:opacity-100 transition-opacity duration-200";

const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm";

const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";

const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]";

const NEU_BADGE_SECONDARY =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938]/50 shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]";

const NEU_BADGE_OUTLINE =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-jetbrains-mono)] " +
    "bg-[#006666]/10 text-[#006666] shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]";

const NEU_BTN_EDIT =
    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/70 bg-[#E7E5E4] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_DELETE =
    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] bg-[#E7E5E4] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "transition-all duration-200 focus-visible:outline-none";

const NEU_DIALOG_BTN_CONFIRM =
    "rounded-xl bg-[#FF2157] px-4 py-2 text-sm font-[family-name:var(--font-space-mono)] font-bold text-white " +
    "shadow-[3px_3px_6px_rgba(255,33,87,0.4)] hover:bg-[#e01a4a] transition-all duration-200";
// ─────────────────────────────────────────────────────────────

type Props = {
    location: LocationEntryDTO;
    onEdit: () => void;
};

export function LocationRow({ location, onEdit }: Props) {
    const { setEditingLocationId, deleteLocation, saveStatus } = useFooterStore();
    const saving = saveStatus === "loading";

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.18 }}
            className={NEU_ROW}
        >
            <div className={NEU_ACCENT_BAR} />

            <div className="flex items-center justify-between gap-3">
                {/* Left: drag + content */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    {/* Drag handle */}
                    <div className="shrink-0 cursor-grab text-[#1E2938]/30 hover:text-[#006666] transition-colors">
                        <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Icon well */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E7E5E4] shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                        <MapPin className="h-4 w-4 text-[#006666]" />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 space-y-1.5">
                        <p className={NEU_LABEL}>
                            {location.city ?? location.region ?? location.country}
                        </p>
                        <p className={NEU_MUTED}>
                            {location.country}
                            {location.region ? ` • ${location.region}` : ""}
                            {location.city ? ` • ${location.city}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className={location.active ? NEU_BADGE_SUCCESS : NEU_BADGE_SECONDARY}>
                                {location.active ? "Active" : "Inactive"}
                            </span>
                            <span className={NEU_BADGE_OUTLINE}>
                                <Navigation className="h-3 w-3" />
                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </span>
                            {location.slug && (
                                <span className={NEU_BADGE_OUTLINE}>{location.slug}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: actions */}
                <div className="flex shrink-0 items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                            setEditingLocationId(location.id);
                            onEdit();
                        }}
                        className={NEU_BTN_EDIT}
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                    </motion.button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                disabled={saving}
                                className={NEU_BTN_DELETE}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                            </motion.button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-white/60">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]">
                                    Delete Location
                                </AlertDialogTitle>
                                <AlertDialogDescription className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60">
                                    Are you sure you want to delete{" "}
                                    <span className="font-bold text-[#1E2938]">
                                        {location.city ?? location.region ?? location.country}
                                    </span>
                                    ? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl bg-[#E7E5E4] font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/70 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] border-0 transition-all duration-200">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteLocation(location.id)}
                                    className={NEU_DIALOG_BTN_CONFIRM}
                                >
                                    Confirm Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </motion.div>
    );
}