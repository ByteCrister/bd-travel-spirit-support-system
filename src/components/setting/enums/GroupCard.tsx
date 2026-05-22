// src/components/enums/GroupCard.tsx
"use client";

import { EnumGroup } from "@/types/site-settings/enum-settings.types";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";
import React, { JSX } from "react";
import { motion } from "framer-motion";
import { Layers, Loader2 } from "lucide-react";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
    btnBase:
        "relative w-full text-left rounded-xl transition-all duration-200 overflow-hidden " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
    btnDefault:
        "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60 " +
        "hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] hover:-translate-y-0.5",
    btnSelected:
        "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border border-white/40",
    indicator:
        "absolute left-0 top-0 bottom-0 w-1 bg-[#006666] rounded-r",
    inner: "relative flex items-start gap-3 p-3.5",
    iconBase:
        "flex-none w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
    iconDefault:
        "bg-[#E7E5E4] text-[#1E2938]/50 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
    iconSelected:
        "bg-[#006666] text-white shadow-[inset_2px_2px_4px_#004d4d,inset_-1px_-1px_3px_#008080]",
    content: "flex-1 min-w-0",
    nameRow: "flex items-start justify-between gap-2 mb-1",
    nameDefault:
        "font-semibold text-sm leading-tight truncate text-[#1E2938] font-[family-name:var(--font-space-mono)]",
    nameSelected:
        "font-semibold text-sm leading-tight truncate text-[#006666] font-[family-name:var(--font-space-mono)]",
    countDefault:
        "flex-none text-xs font-bold px-2 py-0.5 rounded-lg font-[family-name:var(--font-space-mono)] " +
        "bg-[#E7E5E4] text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
    countSelected:
        "flex-none text-xs font-bold px-2 py-0.5 rounded-lg font-[family-name:var(--font-space-mono)] " +
        "bg-[#006666]/15 text-[#006666]",
    desc:
        "text-xs leading-relaxed line-clamp-2 font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",
    updatingBadge:
        "inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg text-xs font-bold " +
        "font-[family-name:var(--font-space-mono)] bg-[#FE9900]/10 text-[#FE9900] " +
        "shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]",
};

interface Props {
    group: EnumGroup;
    selected?: boolean;
    onSelect?: () => void;
    onOpen?: () => void;
}

export default function GroupCard({
    group,
    selected = false,
    onSelect,
}: Props): JSX.Element {
    const { groups } = useEnumSettingsStore();
    const state = groups[group.name];
    const optimisticCount = state?.optimistic ? Object.keys(state.optimistic).length : 0;
    const isUpdating = optimisticCount > 0;

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            aria-current={selected ? "true" : undefined}
            whileTap={{ scale: 0.98 }}
            className={`${S.btnBase} ${selected ? S.btnSelected : S.btnDefault}`}
        >
            {selected && (
                <motion.div
                    layoutId="selected-indicator"
                    className={S.indicator}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}

            <div className={S.inner}>
                {/* Icon */}
                <div className={`${S.iconBase} ${selected ? S.iconSelected : S.iconDefault}`}>
                    {isUpdating ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Layers size={16} strokeWidth={2.5} />
                    )}
                </div>

                {/* Content */}
                <div className={S.content}>
                    <div className={S.nameRow}>
                        <span className={selected ? S.nameSelected : S.nameDefault}>
                            {group.name}
                        </span>
                        <span className={selected ? S.countSelected : S.countDefault}>
                            {group.values.length}
                        </span>
                    </div>

                    <p className={S.desc}>
                        {group.description || "No description"}
                    </p>

                    {isUpdating && (
                        <span className={S.updatingBadge}>
                            <Loader2 size={10} className="animate-spin" />
                            Updating
                        </span>
                    )}
                </div>
            </div>
        </motion.button>
    );
}