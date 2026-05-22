// components/GuideSubscriptions/TierRow.tsx
"use client";

import React from "react";
import type { SubscriptionTierDTO, ID } from "@/types/site-settings/guide-subscription-settings.types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { GripVertical, Edit2, Copy, Trash2, Calendar, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism style tokens ──────────────────────────────────
const ROW_CARD =
    "group relative flex items-center gap-4 p-5 rounded-2xl " +
    "bg-[#E7E5E4] border border-white/60 " +
    "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] " +
    "hover:shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] " +
    "transition-all duration-300";

const DRAG_HANDLE =
    "p-2 rounded-xl cursor-grab active:cursor-grabbing text-[#1E2938]/30 " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200";

const TIER_TITLE =
    "text-lg font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] truncate";

const BADGE_ACTIVE =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const BADGE_INACTIVE =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#1E2938]/08 text-[#1E2938]/40 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const KEY_CHIP =
    "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#006666] " +
    "bg-[#E7E5E4] px-2.5 py-1 rounded-lg " +
    "shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]";

const PRICE_TEXT =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] flex items-center gap-1.5";

const CYCLE_BADGE =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs " +
    "font-[family-name:var(--font-jetbrains-mono)] " +
    "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const PERKS_BADGE =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs cursor-help " +
    "font-[family-name:var(--font-jetbrains-mono)] " +
    "bg-[#E7E5E4] text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const TIMESTAMP =
    "flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40";

const BTN_ICON =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-none " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const BTN_ICON_DELETE =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-none " +
    "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200";
// ─────────────────────────────────────────────────────────────

export interface TierRowProps {
    tier: SubscriptionTierDTO;
    index?: number;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onToggleActive: (id: ID, active: boolean) => Promise<void> | void;
}

export const TierRow: React.FC<TierRowProps> = ({
    tier,
    onEdit,
    onDuplicate,
    onDelete,
    onToggleActive,
}) => {
    const lastUpdated = tier.updatedAt
        ? `${formatDistanceToNow(new Date(tier.updatedAt))} ago`
        : "—";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={ROW_CARD}
        >
            {/* Drag Handle */}
            <div className={DRAG_HANDLE} title="Drag to reorder">
                <GripVertical size={20} />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: title, key, price, badges */}
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Title + status badge */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className={TIER_TITLE}>{tier.title}</h3>
                            {tier.active ? (
                                <span className={BADGE_ACTIVE}>
                                    <Sparkles size={11} />
                                    Active
                                </span>
                            ) : (
                                <span className={BADGE_INACTIVE}>Inactive</span>
                            )}
                        </div>

                        {/* Key + price row */}
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                            <span className={KEY_CHIP}>{tier.key}</span>
                            <span className={PRICE_TEXT}>
                                <FaBangladeshiTakaSign size={13} className="text-[#00A63D]" />
                                {tier.price} {tier.currency}
                            </span>
                        </div>

                        {/* Billing cycles + perks */}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            {tier.billingCycleDays.map((d) => (
                                <span key={d} className={CYCLE_BADGE}>
                                    <Calendar size={11} />
                                    {d}d
                                </span>
                            ))}
                            {Array.isArray(tier.perks) && tier.perks.length > 0 && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className={PERKS_BADGE}>
                                            <Sparkles size={11} />
                                            {tier.perks.length} perks
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-[#1E2938] text-white rounded-xl border-none shadow-lg">
                                        <ul className="space-y-1 py-1">
                                            {tier.perks.map((perk, idx) => (
                                                <li key={idx} className="text-xs font-[family-name:var(--font-jetbrains-mono)]">
                                                    • {perk}
                                                </li>
                                            ))}
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    {/* Right: timestamp, toggle, actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={TIMESTAMP}>
                            <Clock size={13} />
                            {lastUpdated}
                        </span>

                        <Switch
                            checked={tier.active}
                            onCheckedChange={async (v) =>
                                await onToggleActive(tier.key as unknown as ID, v)
                            }
                            aria-label={`Toggle active for ${tier.title}`}
                            className="data-[state=checked]:bg-[#006666]"
                        />

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onEdit}
                                        className={BTN_ICON}
                                        aria-label="Edit tier"
                                    >
                                        <Edit2 size={15} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1E2938] text-white rounded-xl border-none text-xs">
                                    Edit tier
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onDuplicate}
                                        className={BTN_ICON}
                                        aria-label="Duplicate tier"
                                    >
                                        <Copy size={15} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1E2938] text-white rounded-xl border-none text-xs">
                                    Duplicate tier
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onDelete}
                                        className={BTN_ICON_DELETE}
                                        aria-label="Delete tier"
                                    >
                                        <Trash2 size={15} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-[#1E2938] text-white rounded-xl border-none text-xs">
                                    Delete tier
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};