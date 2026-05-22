"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import {
    Image as ImageIcon, Hash, Calendar, Clock, CheckCircle2, XCircle,
    AlertCircle, Code2, Loader2, FileText, Tag, BarChart3,
} from "lucide-react";
import type { RequestError, ID } from "@/types/site-settings/guide-banner-settings.types";
import { useGuideBannersStore } from "@/store/guide/guide-bannerSetting.store";
import { buildAssetSrc, formatISODate } from "@/utils/helpers/guide-banner-settings";
import Image from "next/image";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/50 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_MUTED =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#1E2938]/5 text-[#1E2938]/50 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER =
    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FF2157]/10 text-[#FF2157]";
const NEU_ICON_WELL = "p-2 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

interface GuideBannerDetailsDrawerProps {
    id: ID;
    open: boolean;
    onClose: () => void;
}

export default function GuideBannerDetailsDrawer({ id, open, onClose }: GuideBannerDetailsDrawerProps) {
    const { normalized, fetchById, operations } = useGuideBannersStore();
    const entity = normalized.byId[String(id)];

    useEffect(() => {
        if (open && !entity) void fetchById(id);
    }, [open, entity, fetchById, id]);

    const devError: RequestError | null | undefined =
        operations["fetchById"]?.byId?.[String(id)]?.error ?? operations["update"]?.byId?.[String(id)]?.error;

    const assetSrc = buildAssetSrc(entity?.asset);

    return (
        <Drawer open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
            <DrawerContent aria-label="Banner details" className={`max-h-[90vh] border-0 ${NEU_SURFACE}`}>
                {/* Drawer header */}
                <DrawerHeader className={`border-b ${NEU_DIVIDER} px-6 py-4`}>
                    <DrawerTitle className={`flex items-center gap-2.5 ${NEU_HEADING} text-lg`}>
                        <div className={NEU_ICON_WELL}>
                            <FileText className="h-4 w-4 text-[#006666]" />
                        </div>
                        Banner Details
                    </DrawerTitle>
                    <DrawerDescription className={`${NEU_MUTED} mt-1`}>
                        Complete information about this guide banner
                    </DrawerDescription>
                </DrawerHeader>

                {entity ? (
                    <div className="p-6 space-y-5 overflow-y-auto">

                        {/* Image preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={NEU_CARD_SM}>
                                <div className={`flex items-center gap-2 px-4 pt-4 pb-3 border-b ${NEU_DIVIDER}`}>
                                    <ImageIcon className="h-4 w-4 text-[#006666]" />
                                    <h3 className={`${NEU_HEADING} text-sm`}>Image Preview</h3>
                                </div>
                                <div className={`relative w-full aspect-video rounded-b-xl overflow-hidden ${NEU_SURFACE_INSET} flex items-center justify-center`}>
                                    {assetSrc ? (
                                        <Image
                                            src={assetSrc}
                                            alt={entity.alt ?? ""}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                            sizes="(max-width: 768px) 100vw, 400px"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 px-4 text-center">
                                            <ImageIcon className="h-8 w-8 text-[#1E2938]/20" />
                                            <p className={`${NEU_MUTED} text-xs break-all max-w-xs`}>{String(entity.asset ?? "—")}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Status pill */}
                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: 0.08 }}
                        >
                            <span className={entity.active ? NEU_BADGE_SUCCESS : NEU_BADGE_MUTED}>
                                {entity.active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                {entity.active ? "Active Banner" : "Inactive Banner"}
                            </span>
                        </motion.div>

                        <Separator className={NEU_DIVIDER} />

                        {/* Details grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.12 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {/* Left: ID + Order + Dates */}
                            <div className={`${NEU_CARD_SM} p-4 space-y-4`}>
                                <DetailRow icon={<Hash className="h-4 w-4 text-[#006666]" />} label="Banner ID">
                                    <span className={`${NEU_MONO} text-xs font-semibold truncate`}>{String(entity._id)}</span>
                                </DetailRow>
                                <Separator className={NEU_DIVIDER} />
                                <DetailRow icon={<BarChart3 className="h-4 w-4 text-[#006666]" />} label="Order">
                                    <span className={`${NEU_MONO} text-sm font-bold`}>#{entity.order}</span>
                                </DetailRow>
                                <Separator className={NEU_DIVIDER} />
                                <DetailRow icon={<Calendar className="h-4 w-4 text-[#006666]" />} label="Created">
                                    <span className={`${NEU_MONO} text-sm font-semibold`}>{formatISODate(entity.createdAt)}</span>
                                </DetailRow>
                                <Separator className={NEU_DIVIDER} />
                                <DetailRow icon={<Clock className="h-4 w-4 text-[#006666]" />} label="Last Updated">
                                    <span className={`${NEU_MONO} text-sm font-semibold`}>{formatISODate(entity.updatedAt)}</span>
                                </DetailRow>
                            </div>

                            {/* Right: Alt, Caption, Asset */}
                            <div className={`${NEU_CARD_SM} p-4 space-y-4`}>
                                <DetailRow icon={<Tag className="h-4 w-4 text-[#006666]" />} label="Alt Text">
                                    {entity.alt ? (
                                        <span className={`${NEU_MONO} text-sm font-semibold break-words`}>{entity.alt}</span>
                                    ) : (
                                        <span className={`${NEU_MUTED} italic`}>No alt text provided</span>
                                    )}
                                </DetailRow>
                                <Separator className={NEU_DIVIDER} />
                                <DetailRow icon={<FileText className="h-4 w-4 text-[#006666]" />} label="Caption">
                                    {entity.caption ? (
                                        <span className={`${NEU_MONO} text-sm font-semibold break-words`}>{entity.caption}</span>
                                    ) : (
                                        <span className={`${NEU_MUTED} italic`}>No caption provided</span>
                                    )}
                                </DetailRow>
                                <Separator className={NEU_DIVIDER} />
                                <DetailRow icon={<ImageIcon className="h-4 w-4 text-[#006666]" />} label="Asset ID">
                                    <span className={`${NEU_SURFACE_INSET_SM} ${NEU_MONO} text-xs p-2 rounded-lg block break-all`}>{assetSrc}</span>
                                </DetailRow>
                            </div>
                        </motion.div>

                        {/* Developer info accordion */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <div className={NEU_CARD_SM}>
                                <details className="group">
                                    <summary className={`cursor-pointer px-4 py-3 flex items-center gap-2 ${NEU_HEADING} text-sm hover:bg-[#dddbd9]/40 transition-colors rounded-xl`}>
                                        <Code2 className="h-4 w-4 text-[#006666]" />
                                        Developer Information
                                        <AlertCircle className="h-3.5 w-3.5 ml-auto text-[#1E2938]/40 group-open:rotate-180 transition-transform duration-200" />
                                    </summary>
                                    <div className={`px-4 pb-4 border-t ${NEU_DIVIDER} pt-4`}>
                                        {devError ? (
                                            <div className="space-y-3">
                                                <div className={`flex items-center gap-2 text-[#FF2157] font-[family-name:var(--font-space-mono)] font-bold text-sm`}>
                                                    <AlertCircle className="h-4 w-4" />
                                                    Error Details
                                                </div>
                                                {devError.status !== undefined && (
                                                    <span className={NEU_BADGE_DANGER}>HTTP {devError.status}</span>
                                                )}
                                                {devError.code && (
                                                    <div>
                                                        <p className={`${NEU_LABEL} mb-1`}>Error Code</p>
                                                        <code className={`${NEU_SURFACE_INSET_SM} ${NEU_MONO} text-xs p-2 rounded-lg block`}>{devError.code}</code>
                                                    </div>
                                                )}
                                                {devError.message && (
                                                    <div>
                                                        <p className={`${NEU_LABEL} mb-1`}>Message</p>
                                                        <p className={`${NEU_SURFACE_INSET_SM} ${NEU_MUTED} text-xs p-2 rounded-lg`}>{devError.message}</p>
                                                    </div>
                                                )}
                                                {devError.traceId && (
                                                    <div>
                                                        <p className={`${NEU_LABEL} mb-1`}>Trace ID</p>
                                                        <code className={`${NEU_SURFACE_INSET_SM} ${NEU_MONO} text-xs p-2 rounded-lg block break-all`}>{devError.traceId}</code>
                                                    </div>
                                                )}
                                                {devError.details && (
                                                    <div>
                                                        <p className={`${NEU_LABEL} mb-1`}>Additional Details</p>
                                                        <pre className="text-xs overflow-auto bg-[#1E2938] text-[#00A63D] p-3 rounded-xl max-h-40 font-[family-name:var(--font-jetbrains-mono)]">
                                                            {JSON.stringify(devError.details, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`flex items-center gap-2 text-[#00A63D] ${NEU_MUTED}`}>
                                                <CheckCircle2 className="h-4 w-4" />
                                                No errors detected. All systems operational.
                                            </div>
                                        )}
                                    </div>
                                </details>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="p-12 flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-[#006666]" />
                        <p className={NEU_MUTED}>Loading banner details…</p>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}

/* ── Small helper for detail rows ─────────────────────────── */
function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/50 uppercase tracking-widest mb-1">{label}</p>
                {children}
            </div>
        </div>
    );
}