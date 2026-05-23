"use client";

import React from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Loader2, Edit2, Info, Trash2 } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold text-xs " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:bg-[#007777] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "active:shadow-[inset_2px_2px_5px_#004d4d,inset_-1px_-1px_3px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";
const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#006666] font-[family-name:var(--font-space-mono)] text-xs " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "active:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-1px_-1px_4px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] text-xs " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "transition-all duration-200 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none";

type RowActionsProps = {
    updatePending?: boolean;
    deletePending?: boolean;
    setEditOpen: (v: boolean) => void;
    setDetailsOpen: (v: boolean) => void;
    setConfirmOpen: (v: boolean) => void;
};

export const RowActions: React.FC<RowActionsProps> = ({
    updatePending = false,
    deletePending = false,
    setEditOpen,
    setDetailsOpen,
    setConfirmOpen,
}) => {
    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                {/* Edit */}
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="shrink-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setEditOpen(true)}
                                disabled={updatePending}
                                className={`${NEU_BTN_PRIMARY} flex items-center gap-1.5 px-3 py-2`}
                                aria-label="Edit banner"
                            >
                                {updatePending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Edit2 className="h-3.5 w-3.5" />
                                )}
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            {updatePending ? "Saving…" : "Edit banner"}
                        </TooltipContent>
                    </Tooltip>
                </motion.div>

                {/* Details */}
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setDetailsOpen(true)}
                                className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-3 py-2`}
                                aria-label="View details"
                            >
                                <Info className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Details</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">View details</TooltipContent>
                    </Tooltip>
                </motion.div>

                {/* Delete — visible md+ */}
                <div className="hidden md:block">
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={deletePending}
                                    className={`${NEU_BTN_DANGER} flex items-center gap-1.5 px-3 py-2`}
                                    aria-label="Delete banner"
                                >
                                    {deletePending ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                    <span className="hidden lg:inline">Delete</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                                {deletePending ? "Deleting…" : "Delete banner"}
                            </TooltipContent>
                        </Tooltip>
                    </motion.div>
                </div>
            </div>
        </TooltipProvider>
    );
};