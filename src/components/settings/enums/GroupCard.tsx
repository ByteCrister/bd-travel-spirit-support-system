"use client";

import { Badge } from "@/components/ui/badge";
import useEnumSettingsStore from "@/store/enumSettings.store";
import { EnumGroup } from "@/types/enum-settings.types";
import React, { JSX } from "react";
import { motion } from "framer-motion";
import { Layers, Loader2 } from "lucide-react";

interface Props {
    group: EnumGroup;
    selected?: boolean;
    onSelect?: () => void;
    onOpen?: () => void;
}

export default function GroupCard({ group, selected = false, onSelect }: Props): JSX.Element {
    const { groups } = useEnumSettingsStore();
    const state = groups[group.name];
    const optimisticCount = state?.optimistic ? Object.keys(state.optimistic).length : 0;
    const isUpdating = optimisticCount > 0;

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            aria-current={selected ? "true" : undefined}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`
                relative w-full text-left p-4 rounded-xl transition-all duration-300 overflow-hidden
                ${selected
                    ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-500/40 shadow-md"
                    : "bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:border-slate-300 hover:shadow-md hover:bg-white/80"
                }
            `}
        >
            {/* Selected indicator */}
            {selected && (
                <motion.div
                    layoutId="selected-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-r"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}

            {/* Gradient overlay for selected state */}
            {selected && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            )}

            <div className="relative flex items-start gap-3">
                {/* Icon */}
                <motion.div
                    className={`
                        flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                        ${selected
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                            : "bg-slate-100 text-slate-600"
                        }
                    `}
                    animate={isUpdating ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isUpdating ? Infinity : 0, ease: "linear" }}
                >
                    {isUpdating ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Layers size={18} strokeWidth={2.5} />
                    )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className={`
                            font-semibold text-sm leading-tight truncate
                            ${selected ? "text-blue-900" : "text-slate-900"}
                        `}>
                            {group.name}
                        </h3>
                        <span className={`
                            flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full
                            ${selected
                                ? "bg-blue-500/20 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }
                        `}>
                            {group.values.length}
                        </span>
                    </div>

                    <p className={`
                        text-xs leading-relaxed line-clamp-2 mb-2
                        ${selected ? "text-blue-700/80" : "text-slate-600"}
                    `}>
                        {group.description || "No description"}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                        {isUpdating && (
                            <Badge
                                variant="outline"
                                className={`
                                    text-xs px-2 py-0.5 font-medium animate-pulse
                                    ${selected
                                        ? "border-blue-400 text-blue-700 bg-blue-50/50"
                                        : "border-amber-300 text-amber-700 bg-amber-50/50"
                                    }
                                `}
                            >
                                <Loader2 size={10} className="mr-1 animate-spin" />
                                Updating
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </motion.button>
    );
}