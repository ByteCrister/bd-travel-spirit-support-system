"use client";

import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Image as IMGicon, Hash, ToggleLeft, Info, Zap } from "lucide-react";
import type { GuideBannerQueryParams } from "@/types/site-settings/guide-banner-settings.types";
import { useGuideBannersStore } from "@/store/guide/guide-bannerSetting.store";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import GuideBannerRow from "./GuideBannerRow";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 overflow-hidden";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_BADGE =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_PRIMARY =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const TABLE_HEAD_COLS = [
    { icon: IMGicon, iconColor: "text-[#006666]", label: "Thumbnail" },
    { icon: Info, iconColor: "text-[#006666]", label: "Alt / Caption" },
    { icon: Hash, iconColor: "text-[#1E2938]/50", label: "Order" },
    { icon: ToggleLeft, iconColor: "text-[#FE9900]", label: "Status" },
    { icon: Zap, iconColor: "text-[#1E2938]/50", label: "Meta" },
] as const;

interface GuideBannerListProps {
    query?: GuideBannerQueryParams;
}

export default function GuideBannerList({ query }: GuideBannerListProps) {
    const { normalized } = useGuideBannersStore();
    const ids = normalized.allIds;
    const byId = normalized.byId;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
            <div className={NEU_CARD}>
                {/* Panel header */}
                <div className={`px-5 py-4 border-b ${NEU_DIVIDER} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <div className={`${NEU_SURFACE_INSET_SM} p-2 rounded-xl`}>
                            <GripVertical className="w-4 h-4 text-[#006666]" />
                        </div>
                        <div>
                            <h3 className={`${NEU_HEADING} text-base`}>Guide Banners</h3>
                            <p className={`${NEU_MUTED} mt-0.5`}>
                                Drag &amp; drop to reorder · {ids.length} {ids.length === 1 ? "banner" : "banners"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <DndContext sensors={sensors}>
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className={`bg-[#E7E5E4] border-b ${NEU_DIVIDER} hover:bg-[#E7E5E4]`}>
                                        {TABLE_HEAD_COLS.map(({ icon: Icon, iconColor, label }) => (
                                            <TableHead key={label} className="py-3">
                                                <div className={`flex items-center gap-1.5 ${NEU_LABEL}`}>
                                                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                                                    {label}
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="py-3 text-right pr-4">
                                            <span className={NEU_LABEL}>Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody aria-live="polite">
                                    <AnimatePresence mode="popLayout">
                                        {ids.map((id, index) => (
                                            <GuideBannerRow key={id} id={id} index={index} entity={byId[id]} />
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Footer */}
                <div className={`px-5 py-3 border-t ${NEU_DIVIDER} flex flex-wrap items-center gap-3 justify-between`}>
                    <div className="flex items-center gap-3">
                        <span className={NEU_BADGE}>
                            <GripVertical className="w-3 h-3" />
                            Drag to reorder
                        </span>
                        {query?.sortBy && (
                            <span className={NEU_BADGE_PRIMARY}>Sorted by: {query.sortBy}</span>
                        )}
                        {query?.active !== undefined && (
                            <span className={NEU_BADGE_PRIMARY}>Filter: {query.active ? "Active" : "Inactive"}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00A63D] animate-pulse" />
                        <span className={NEU_MUTED}>Real-time updates enabled</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}