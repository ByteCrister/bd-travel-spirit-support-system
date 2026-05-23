"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ResetRequestEntity } from "@/types/employee/password-reset.types";
import { Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import RequestDetailsDrawer from "./RequestDetailsDrawer";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";
import { TableCell } from "@/components/ui/table";

// ─── Neumorphism Style Tokens ────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_BTN_ICON =
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
// ────────────────────────────────────────────────────────────

interface RequestRowProps {
    entity: ResetRequestEntity;
}

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

export default function RequestRow({ entity }: RequestRowProps) {
    const { id, attributes } = entity;
    const [open, setOpen] = useState(false);

    const getStatusConfig = () => {
        switch (attributes.status) {
            case REQUEST_STATUS.PENDING:
                return {
                    badge: (
                        <span className={NEU_BADGE_WARNING}>
                            <Clock className="w-3 h-3" />
                            Pending
                        </span>
                    ),
                    rowHover: "hover:bg-[#FE9900]/5",
                };
            case REQUEST_STATUS.DENIED:
                return {
                    badge: (
                        <span className={NEU_BADGE_DANGER}>
                            <XCircle className="w-3 h-3" />
                            Denied
                        </span>
                    ),
                    rowHover: "hover:bg-[#FF2157]/5",
                };
            default:
                return {
                    badge: (
                        <span className={NEU_BADGE_SUCCESS}>
                            <CheckCircle2 className="w-3 h-3" />
                            Fulfilled
                        </span>
                    ),
                    rowHover: "hover:bg-[#00A63D]/5",
                };
        }
    };

    const { badge, rowHover } = getStatusConfig();

    return (
        <>
            <motion.tr
                variants={rowVariants}
                className={`${NEU_SURFACE} border-b border-[#1E2938]/8 transition-colors duration-150 ${rowHover}`}
            >
                {/* Email + mobile */}
                <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                        <span className={`${NEU_MONO} text-sm font-medium`}>
                            {attributes.requesterEmail}
                        </span>
                        {attributes.requesterMobile && (
                            <span className={NEU_MUTED}>{attributes.requesterMobile}</span>
                        )}
                    </div>
                </TableCell>

                {/* Name */}
                <TableCell className="px-4 py-3">
                    <span className={`${NEU_MONO} text-sm`}>
                        {attributes.requesterName || (
                            <span className="italic text-[#1E2938]/30">N/A</span>
                        )}
                    </span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-4 py-3">{badge}</TableCell>

                {/* Requested at */}
                <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                        <span className={`${NEU_MONO} text-sm`}>
                            {new Date(attributes.requestedAt).toLocaleDateString()}
                        </span>
                        <span className={NEU_MUTED}>
                            {new Date(attributes.requestedAt).toLocaleTimeString()}
                        </span>
                    </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-4 py-3 text-right">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpen(true)}
                        aria-label={`View request from ${attributes.requesterEmail}`}
                        className={`${NEU_BTN_ICON} ml-auto`}
                    >
                        <Eye className="w-4 h-4" />
                    </motion.button>
                </TableCell>
            </motion.tr>

            <RequestDetailsDrawer open={open} onOpenChange={setOpen} requestId={id} />
        </>
    );
}