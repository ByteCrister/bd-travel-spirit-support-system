// components/GuideSubscriptions/TierRow.tsx
"use client";
import React from "react";
import type { SubscriptionTierDTO, ID } from "@/types/guide-subscription-settings.types";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { GripVertical, Edit2, Copy, Trash2, DollarSign, Calendar, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";

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
    const lastUpdated = tier.updatedAt ? `${formatDistanceToNow(new Date(tier.updatedAt))} ago` : "—";
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="group relative flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300"
        >
            {/* Drag Handle */}
            <div className="flex items-center">
                <div
                    className="p-2 rounded-lg cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Drag to reorder"
                >
                    <GripVertical size={20} />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    {/* Title and Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {tier.title}
                            </h3>
                            {tier.active ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
                                    <Sparkles size={12} className="mr-1" />
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                                    Inactive
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {tier.key}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {tier.price} {tier.currency}
                                </span>
                            </div>
                        </div>

                        {/* Billing Cycles and Perks */}
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            {tier.billingCycleDays.map((d) => (
                                <Badge 
                                    key={d} 
                                    variant="secondary"
                                    className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                >
                                    <Calendar size={12} className="mr-1" />
                                    {d}d cycle
                                </Badge>
                            ))}
                            {Array.isArray(tier.perks) && tier.perks.length > 0 && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge 
                                            variant="outline"
                                            className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800 cursor-help"
                                        >
                                            <Sparkles size={12} className="mr-1" />
                                            {tier.perks.length} perks
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <ul className="space-y-1">
                                            {tier.perks.map((perk, idx) => (
                                                <li key={idx} className="text-sm">• {perk}</li>
                                            ))}
                                        </ul>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={14} />
                            <span>{lastUpdated}</span>
                        </div>

                        <Switch
                            checked={tier.active}
                            onCheckedChange={async (v) => {
                                await onToggleActive(tier.key as unknown as ID, v);
                            }}
                            aria-label={`Toggle active for ${tier.title}`}
                            className="data-[state=checked]:bg-green-600"
                        />

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={onEdit} 
                                        className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-300"
                                        aria-label="Edit tier"
                                    >
                                        <Edit2 size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit tier</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={onDuplicate} 
                                        className="h-9 w-9 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900 dark:hover:text-purple-300"
                                        aria-label="Duplicate tier"
                                    >
                                        <Copy size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Duplicate tier</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={onDelete} 
                                        className="h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-300"
                                        aria-label="Delete tier"
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete tier</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};