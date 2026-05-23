"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Key,
    AlertCircle,
} from "lucide-react";
import { useResetRequestsStore } from "@/store/employee/reset-requests.store";
import DenyDialog from "./DenyDialog";
import UpdatePasswordDialog from "./UpdatePasswordDialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";

// ─── Neumorphism Style Tokens ────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_DANGER =
    "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(255,33,87,0.4),-2px_-2px_6px_rgba(255,100,130,0.3)] " +
    "hover:bg-[#e0103f] hover:shadow-[0_4px_12px_rgba(255,33,87,0.5),-3px_-3px_8px_rgba(255,100,130,0.3)] " +
    "active:shadow-[inset_3px_3px_6px_rgba(180,0,30,0.4),inset_-2px_-2px_4px_rgba(255,100,130,0.2)] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL = "p-2 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY = "p-2 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_BADGE_PENDING =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DENIED =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
// ────────────────────────────────────────────────────────────

interface RequestDetailsDrawerProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    requestId: string;
}

/** Small detail row used in the info grid */
function DetailRow({
    icon,
    label,
    value,
    delay = 0,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={`${NEU_CARD_SM} flex items-start gap-3 p-4 hover:shadow-[6px_6px_14px_#c8c6c5,-6px_-6px_14px_#ffffff] transition-shadow duration-200`}
        >
            <div className={NEU_ICON_WELL}>{icon}</div>
            <div className="flex-1 min-w-0">
                <p className={`${NEU_LABEL} mb-1`}>{label}</p>
                <div className={`${NEU_MONO} text-sm font-medium truncate`}>{value}</div>
            </div>
        </motion.div>
    );
}

export default function RequestDetailsDrawer({
    open,
    onOpenChange,
    requestId,
}: RequestDetailsDrawerProps) {
    const { fetchById, denyRequest, updatePassword, entities, isFetchingById, error } =
        useResetRequestsStore();

    const [denyOpen, setDenyOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    useEffect(() => {
        if (open) fetchById(requestId).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, requestId]);

    const dto = entities[requestId]?.attributes;

    // ── Status config ──────────────────────────────────────────
    const getStatusConfig = () => {
        if (!dto) return null;
        switch (dto.status) {
            case REQUEST_STATUS.PENDING:
                return {
                    badge: (
                        <span className={NEU_BADGE_PENDING}>
                            <Clock className="w-3.5 h-3.5" /> Pending Review
                        </span>
                    ),
                };
            case REQUEST_STATUS.DENIED:
                return {
                    badge: (
                        <span className={NEU_BADGE_DENIED}>
                            <XCircle className="w-3.5 h-3.5" /> Denied
                        </span>
                    ),
                };
            default:
                return {
                    badge: (
                        <span className={NEU_BADGE_SUCCESS}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Fulfilled
                        </span>
                    ),
                };
        }
    };

    const statusConfig = getStatusConfig();

    // ── Loading state ──────────────────────────────────────────
    if (isFetchingById && !dto) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={`sm:max-w-2xl ${NEU_SURFACE} border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-2xl`}
                >
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className={`${NEU_ICON_WELL_PRIMARY} p-4`}>
                            <Loader2 className="w-8 h-8 text-[#006666] animate-spin" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className={`${NEU_HEADING} text-base`}>Loading request details</p>
                            <p className={NEU_MUTED}>Please wait a moment…</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // ── Error state ────────────────────────────────────────────
    if (error && !dto) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className={`sm:max-w-2xl ${NEU_SURFACE} border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-2xl`}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16 gap-4"
                    >
                        <div className="p-4 rounded-2xl bg-[#FF2157]/10 shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff]">
                            <AlertCircle className="w-8 h-8 text-[#FF2157]" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className={`${NEU_HEADING} text-base`}>Failed to fetch request</p>
                            <p className={NEU_MUTED}>{error.message}</p>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!dto) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`sm:max-w-2xl max-h-[90vh] overflow-y-auto ${NEU_SURFACE} border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-2xl p-6`}
            >
                {/* ── Dialog header ──────────────────────────────────── */}
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                            <DialogTitle className={`text-xl ${NEU_HEADING}`}>
                                Request Details
                            </DialogTitle>
                            <p className={NEU_MUTED}>Review and manage this password reset request</p>
                        </div>
                        {statusConfig?.badge}
                    </div>
                </DialogHeader>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-6 pt-4"
                >
                    {/* ── Section: Requester info ─────────────────────── */}
                    <div className="space-y-3">
                        <p className={NEU_LABEL}>Requester Information</p>
                        <div className="grid gap-3">
                            <DetailRow
                                icon={<Mail className="w-4 h-4 text-[#006666]" />}
                                label="Email Address"
                                value={dto.requesterEmail}
                                delay={0.1}
                            />
                            <DetailRow
                                icon={<User className="w-4 h-4 text-[#006666]" />}
                                label="Full Name"
                                value={
                                    dto.requesterName || (
                                        <span className="italic text-[#1E2938]/30">Not provided</span>
                                    )
                                }
                                delay={0.15}
                            />
                            <DetailRow
                                icon={<Phone className="w-4 h-4 text-[#006666]" />}
                                label="Mobile Number"
                                value={
                                    dto.requesterMobile || (
                                        <span className="italic text-[#1E2938]/30">Not provided</span>
                                    )
                                }
                                delay={0.2}
                            />
                        </div>
                    </div>

                    {/* ── Divider ────────────────────────────────────────── */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#1E2938]/10 to-transparent" />

                    {/* ── Section: Request details ────────────────────── */}
                    <div className="space-y-3">
                        <p className={NEU_LABEL}>Request Details</p>
                        <div className="grid gap-3">
                            <DetailRow
                                icon={<Calendar className="w-4 h-4 text-[#006666]" />}
                                label="Requested At"
                                value={new Date(dto.requestedAt).toLocaleString()}
                                delay={0.25}
                            />

                            {dto.description && (
                                <motion.div
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`${NEU_CARD_SM} flex items-start gap-3 p-4`}
                                >
                                    <div className={NEU_ICON_WELL}>
                                        <FileText className="w-4 h-4 text-[#006666]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`${NEU_LABEL} mb-1`}>Description</p>
                                        <p className={`${NEU_MONO} text-sm leading-relaxed`}>
                                            {dto.description}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {dto.reason && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.35 }}
                                    className={`${NEU_SURFACE_INSET} rounded-xl flex items-start gap-3 p-4 border border-[#FF2157]/15`}
                                >
                                    <div className="p-2 rounded-xl bg-[#FF2157]/10">
                                        <AlertCircle className="w-4 h-4 text-[#FF2157]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`${NEU_LABEL} text-[#FF2157] mb-1`}>Denial Reason</p>
                                        <p className={`${NEU_MONO} text-sm leading-relaxed`}>{dto.reason}</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* ── Divider ────────────────────────────────────────── */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#1E2938]/10 to-transparent" />

                    {/* ── Section: Actions ───────────────────────────── */}
                    <div className="space-y-3">
                        <p className={NEU_LABEL}>Actions</p>

                        <AnimatePresence mode="wait">
                            {dto.status === REQUEST_STATUS.PENDING ? (
                                <motion.div
                                    key="pending-actions"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex flex-wrap gap-3"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setDenyOpen(true)}
                                        className={`${NEU_BTN_DANGER} flex items-center gap-2 px-5 py-2.5 text-sm`}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Deny Request
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setUpdateOpen(true)}
                                        className={`${NEU_BTN_PRIMARY} flex items-center gap-2 px-5 py-2.5 text-sm`}
                                    >
                                        <Key className="w-4 h-4" />
                                        Update Password
                                    </motion.button>
                                </motion.div>
                            ) : dto.status === REQUEST_STATUS.DENIED ? (
                                <motion.div
                                    key="denied-actions"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setUpdateOpen(true)}
                                        className={`${NEU_BTN_PRIMARY} flex items-center gap-2 px-5 py-2.5 text-sm`}
                                    >
                                        <Key className="w-4 h-4" />
                                        Update Password
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="fulfilled-actions"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`${NEU_SURFACE_INSET_SM} rounded-xl flex items-center gap-3 p-4`}
                                >
                                    <div className="p-2 rounded-xl bg-[#00A63D]/10">
                                        <CheckCircle2 className="w-4 h-4 text-[#00A63D]" />
                                    </div>
                                    <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#00A63D]">
                                        Request has been fulfilled
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ── Sub-dialogs ───────────────────────────────────── */}
                <DenyDialog
                    open={denyOpen}
                    onOpenChange={setDenyOpen}
                    onConfirm={(reason) =>
                        denyRequest({ requestId: dto._id, reason }).then(() => {
                            setDenyOpen(false);
                            onOpenChange(false);
                        })
                    }
                />
                <UpdatePasswordDialog
                    open={updateOpen}
                    onOpenChange={setUpdateOpen}
                    onConfirm={(newPassword, notify) =>
                        updatePassword({
                            requestId: dto._id,
                            newPassword,
                            notifyRequester: notify,
                        }).then(() => {
                            setUpdateOpen(false);
                            onOpenChange(false);
                        })
                    }
                />
            </DialogContent>
        </Dialog>
    );
}