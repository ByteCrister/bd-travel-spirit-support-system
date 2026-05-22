"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Image as ImageIcon, Loader2, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import type { GuideBannerEntity, ID } from "@/types/site-settings/guide-banner-settings.types";
import { useGuideBannersStore } from "@/store/guide/guide-bannerSetting.store";
import { buildAssetSrc, formatISODate } from "@/utils/helpers/guide-banner-settings";
import GuideBannerForm from "./GuideBannerForm";
import ConfirmDialog from "./ConfirmDialog";
import GuideBannerDetailsDrawer from "./GuideBannerDetailsDrawer";
import Image from "next/image";
import { RowActions } from "./RowActions";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_BADGE =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_MUTED =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#1E2938]/5 text-[#1E2938]/50 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";

interface GuideBannerRowProps {
    id: ID;
    index: number;
    entity?: GuideBannerEntity;
}

export default function GuideBannerRow({ id, entity }: GuideBannerRowProps) {
    const { operations, toggleActive, removeBanner } = useGuideBannersStore();
    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const activePending = useMemo<boolean>(() => operations["patch"]?.byId?.[String(id)]?.status === "pending", [operations, id]);
    const updatePending = useMemo<boolean>(() => operations["update"]?.byId?.[String(id)]?.status === "pending", [operations, id]);
    const deletePending = useMemo<boolean>(() => operations["delete"]?.byId?.[String(id)]?.status === "pending", [operations, id]);

    if (!entity) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                    <div className={`flex items-center justify-center gap-2 ${NEU_MUTED}`}>
                        <XCircle className="h-4 w-4" />
                        <span>Missing entity</span>
                    </div>
                </TableCell>
            </TableRow>
        );
    }

    const isTemp = String(entity._id).startsWith("temp:");
    const assetSrc = buildAssetSrc(entity.asset);

    return (
        <>
            <motion.tr
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="group hover:bg-[#dddbd9]/40 transition-colors"
            >
                {/* Thumbnail */}
                <TableCell className="align-middle py-3 pl-4">
                    <motion.div
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.2 }}
                        className="relative h-14 w-20 rounded-xl overflow-hidden shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff] flex-shrink-0"
                    >
                        {assetSrc ? (
                            <Image src={assetSrc} alt={entity.alt ?? ""} fill className="object-cover" sizes="80px" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#E7E5E4]">
                                <ImageIcon className="h-5 w-5 text-[#1E2938]/30" />
                            </div>
                        )}
                        {isTemp && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-[#1E2938]/40 backdrop-blur-sm flex items-center justify-center"
                            >
                                <Loader2 className="h-4 w-4 text-white animate-spin" />
                            </motion.div>
                        )}
                    </motion.div>
                </TableCell>

                {/* Alt / Caption */}
                <TableCell className="align-middle py-3">
                    <div className="space-y-0.5 max-w-[220px]">
                        <div className="flex items-center gap-2 flex-wrap">
                            {isTemp && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                                >
                                    <span className={NEU_BADGE_WARNING}>
                                        <Sparkles className="h-2.5 w-2.5" />
                                        Saving…
                                    </span>
                                </motion.div>
                            )}
                            <span className={`${NEU_MONO} text-sm font-semibold truncate group-hover:text-[#006666] transition-colors`}>
                                {entity.alt || (
                                    <span className="text-[#1E2938]/30 italic flex items-center gap-1 font-normal">
                                        <ImageIcon className="h-3 w-3" />
                                        No alt text
                                    </span>
                                )}
                            </span>
                        </div>
                        <p className={`${NEU_MUTED} line-clamp-1`}>
                            {entity.caption || <span className="italic">No caption</span>}
                        </p>
                    </div>
                </TableCell>

                {/* Order */}
                <TableCell className="align-middle py-3">
                    <span className={NEU_BADGE}>#{entity.order}</span>
                </TableCell>

                {/* Status */}
                <TableCell className="align-middle py-3">
                    <div className="flex items-center gap-2.5">
                        <motion.div animate={activePending ? { scale: [1, 1.08, 1] } : {}} transition={{ repeat: activePending ? Infinity : 0, duration: 0.9 }}>
                            <span className={entity.active ? NEU_BADGE_SUCCESS : NEU_BADGE_MUTED}>
                                {entity.active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {entity.active ? "Active" : "Inactive"}
                            </span>
                        </motion.div>
                        <div className="relative">
                            <Switch
                                checked={entity.active}
                                onCheckedChange={() => void toggleActive(id)}
                                disabled={activePending}
                                aria-label="Toggle active"
                            />
                            {activePending && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -inset-1 flex items-center justify-center">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#006666]" />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </TableCell>

                {/* Meta dates */}
                <TableCell className="align-middle py-3">
                    <div className="space-y-1">
                        <div className={`flex items-center gap-1.5 ${NEU_MUTED}`}>
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium text-[#1E2938]/60 text-xs">Updated:</span>
                            <span>{formatISODate(entity.updatedAt)}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 ${NEU_MUTED}`}>
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="font-medium text-[#1E2938]/60 text-xs">Created:</span>
                            <span>{formatISODate(entity.createdAt)}</span>
                        </div>
                    </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="align-middle py-3 pr-4">
                    <RowActions
                        updatePending={updatePending}
                        deletePending={deletePending}
                        setEditOpen={setEditOpen}
                        setDetailsOpen={setDetailsOpen}
                        setConfirmOpen={setConfirmOpen}
                    />
                </TableCell>
            </motion.tr>

            {editOpen && (
                <GuideBannerForm
                    mode="edit"
                    editId={id}
                    initial={{ asset: entity.asset, alt: entity.alt ?? "", caption: entity.caption ?? "", order: entity.order, active: entity.active }}
                    onClose={() => setEditOpen(false)}
                />
            )}

            <ConfirmDialog
                title="Remove banner?"
                description="This action cannot be undone."
                variant="danger"
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={async () => { await removeBanner(id); setConfirmOpen(false); }}
            />

            <GuideBannerDetailsDrawer id={id} open={detailsOpen} onClose={() => setDetailsOpen(false)} />
        </>
    );
}