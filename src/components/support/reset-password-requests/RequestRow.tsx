"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ResetRequestEntity } from "@/types/employee/password-reset.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, CheckCircle2, XCircle } from "lucide-react";
import RequestDetailsDrawer from "./RequestDetailsDrawer";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";

interface RequestRowProps {
    entity: ResetRequestEntity;
}

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3 }
    }
};

export default function RequestRow({ entity }: RequestRowProps) {
    const { id, attributes } = entity;
    const [open, setOpen] = useState(false);

    const getStatusConfig = () => {
        switch (attributes.status) {
            case REQUEST_STATUS.PENDING:
                return {
                    badge: (
                        <Badge
                            variant="secondary"
                            className="gap-1.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                        >
                            <Clock className="w-3 h-3" />
                            Pending
                        </Badge>
                    ),
                    rowClass: "hover:bg-amber-50/50 dark:hover:bg-amber-950/10"
                };
            case REQUEST_STATUS.DENIED:
                return {
                    badge: (
                        <Badge
                            variant="destructive"
                            className="gap-1.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-900"
                        >
                            <XCircle className="w-3 h-3" />
                            Denied
                        </Badge>
                    ),
                    rowClass: "hover:bg-red-50/50 dark:hover:bg-red-950/10"
                };
            default:
                return {
                    badge: (
                        <Badge
                            variant="outline"
                            className="gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            Fulfilled
                        </Badge>
                    ),
                    rowClass: "hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10"
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <>
            <motion.tr
                variants={rowVariants}
                className={`border-b border-slate-200 dark:border-slate-800 transition-colors ${statusConfig.rowClass}`}
            >
                <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                            {attributes.requesterEmail}
                        </span>
                        {attributes.requesterMobile && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {attributes.requesterMobile}
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-3">
                    <span className="text-slate-700 dark:text-slate-300">
                        {attributes.requesterName || (
                            <span className="text-slate-400 dark:text-slate-600 italic">N/A</span>
                        )}
                    </span>
                </td>
                <td className="px-4 py-3">{statusConfig.badge}</td>
                <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            {new Date(attributes.requestedAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(attributes.requestedAt).toLocaleTimeString()}
                        </span>
                    </div>
                </td>
                <td className="px-4 py-3 text-right">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block"
                    >
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setOpen(true)}
                            className="gap-2 shadow-sm hover:shadow-md transition-all"
                        >
                            <Eye className="w-4 h-4" />
                            View
                        </Button>
                    </motion.div>
                </td>
            </motion.tr>

            <RequestDetailsDrawer open={open} onOpenChange={setOpen} requestId={id} />
        </>
    );
}