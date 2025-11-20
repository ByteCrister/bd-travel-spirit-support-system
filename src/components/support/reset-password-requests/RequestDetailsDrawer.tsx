"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    Sparkles,
} from "lucide-react";
import { useResetRequestsStore } from "@/store/reset-requests.store";
import DenyDialog from "./DenyDialog";
import UpdatePasswordDialog from "./UpdatePasswordDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { REQUEST_STATUS } from "@/constants/reset-password-request.const";

interface RequestDetailsDrawerProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    requestId: string;
}

export default function RequestDetailsDrawer({
    open,
    onOpenChange,
    requestId,
}: RequestDetailsDrawerProps) {
    const {
        fetchById,
        denyRequest,
        updatePassword,
        entities,
        isFetchingById,
        error,
    } = useResetRequestsStore();

    const [denyOpen, setDenyOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

    useEffect(() => {
        if (open) fetchById(requestId).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, requestId]);

    const dto = entities[requestId]?.attributes;

    const getStatusConfig = () => {
        if (!dto) return null;

        switch (dto.status) {
            case REQUEST_STATUS.PENDING:
                return {
                    icon: <Clock className="w-5 h-5" />,
                    badge: (
                        <Badge className="gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-lg shadow-amber-500/30">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                        </Badge>
                    ),
                    gradient: "from-amber-500/20 via-orange-500/20 to-red-500/20",
                };
            case REQUEST_STATUS.DENIED:
                return {
                    icon: <XCircle className="w-5 h-5" />,
                    badge: (
                        <Badge className="gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-lg shadow-red-500/30">
                            <XCircle className="w-3.5 h-3.5" />
                            Denied
                        </Badge>
                    ),
                    gradient: "from-red-500/20 via-rose-500/20 to-pink-500/20",
                };
            default:
                return {
                    icon: <CheckCircle2 className="w-5 h-5" />,
                    badge: (
                        <Badge className="gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Fulfilled
                        </Badge>
                    ),
                    gradient: "from-emerald-500/20 via-teal-500/20 to-cyan-500/20",
                };
        }
    };

    const statusConfig = getStatusConfig();

    if (isFetchingById && !dto) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950">
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
                            <div className="absolute inset-0 blur-xl bg-violet-500/30 animate-pulse" />
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                                Loading request details
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Please wait a moment...
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error && !dto) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-16 gap-4"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-xl shadow-red-500/30">
                            <AlertCircle className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                Failed to fetch request
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {error.message}
                            </p>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!dto) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border-slate-200 dark:border-slate-800">
                {/* Decorative gradient overlay */}
                <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${statusConfig?.gradient} opacity-30 pointer-events-none`} />

                <DialogHeader className="relative">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                Request Details
                            </DialogTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Review and manage this password reset request
                            </p>
                        </div>
                        {statusConfig?.badge}
                    </div>
                </DialogHeader>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6 py-4 relative"
                >
                    {/* Requester Information */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                Requester Information
                            </h3>
                        </div>
                        <div className="grid gap-3">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                className="group relative overflow-hidden flex items-start gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-950/50">
                                    <Mail className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0 relative">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                        Email Address
                                    </p>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                        {dto.requesterEmail}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="group relative overflow-hidden flex items-start gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-fuchsia-300 dark:hover:border-fuchsia-700 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/5 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-2 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-950/50">
                                    <User className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                                </div>
                                <div className="flex-1 relative">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                        Full Name
                                    </p>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                        {dto.requesterName || (
                                            <span className="text-slate-400 dark:text-slate-500 italic font-normal">
                                                Not provided
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                                className="group relative overflow-hidden flex items-start gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950/50">
                                    <Phone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div className="flex-1 relative">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                        Mobile Number
                                    </p>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                        {dto.requesterMobile || (
                                            <span className="text-slate-400 dark:text-slate-500 italic font-normal">
                                                Not provided
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

                    {/* Request Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-fuchsia-500" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                Request Details
                            </h3>
                        </div>
                        <div className="grid gap-3">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50"
                            >
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                                        Requested At
                                    </p>
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                                        {new Date(dto.requestedAt).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>

                            {dto.description && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800"
                                >
                                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950/50">
                                        <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                            Description
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {dto.description}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {dto.reason && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="relative overflow-hidden flex items-start gap-3 p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-900/50 rounded-xl shadow-lg shadow-red-500/10"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/50 relative">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1 relative">
                                        <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">
                                            DENIAL REASON
                                        </p>
                                        <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed font-medium">
                                            {dto.reason}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

                    {/* Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-cyan-500" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                Actions
                            </h3>
                        </div>
                        <AnimatePresence mode="wait">
                            {dto.status === "pending" ? (
                                <motion.div
                                    key="pending-actions"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-wrap gap-3"
                                >
                                    <Button
                                        variant="destructive"
                                        onClick={() => setDenyOpen(true)}
                                        className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Deny Request
                                    </Button>
                                    <Button
                                        onClick={() => setUpdateOpen(true)}
                                        className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25"
                                    >
                                        <Key className="w-4 h-4" />
                                        Update Password
                                    </Button>
                                </motion.div>
                            ) : dto.status === "denied" ? (
                                <motion.div
                                    key="denied-actions"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <Button
                                        onClick={() => setUpdateOpen(true)}
                                        className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-lg shadow-violet-500/25"
                                    >
                                        <Key className="w-4 h-4" />
                                        Update Password
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="fulfilled-actions"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                        Request has been fulfilled
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

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