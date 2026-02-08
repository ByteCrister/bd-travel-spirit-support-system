"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/guide/pendingGuide.types";
import { GUIDE_STATUS, GUIDE_DOCUMENT_TYPE } from "@/constants/guide.const";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { FiCheckCircle, FiXCircle, FiMessageSquare, FiMail, FiPhone, FiBriefcase, FiClock, FiUser, FiExternalLink, FiPause, FiLoader } from "react-icons/fi";
import { BsFileEarmarkPdf, BsFileEarmarkImage } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import GuideDetailsActionConfirm from "./GuideDetailsActionConfirm";

type Props = {
    open: boolean;
    guide?: PendingGuideDTO;
    onClose: () => void;
    onApprove: (id: string) => Promise<boolean>;
    onReject: (id: string, reason: string) => Promise<boolean>;
    onSuspend: (id: string, reason: string, until: Date) => Promise<boolean>;
    onUnsuspend: (id: string, reason: string) => Promise<boolean>;
    onComment: (id: string, comment: string) => Promise<boolean>;
    onOpenDocument: (guide: PendingGuideDTO, doc: PendingGuideDocumentDTO) => void;
};

type ActionType = "approve" | "reject" | "suspend" | "unsuspend";

const statusVisual = {
    [GUIDE_STATUS.PENDING]: {
        label: "Pending Review",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
    },
    [GUIDE_STATUS.APPROVED]: {
        label: "Approved",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
    },
    [GUIDE_STATUS.REJECTED]: {
        label: "Rejected",
        badge: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
    },
    [GUIDE_STATUS.SUSPENDED]: {
        label: "Suspended",
        badge: "bg-orange-50 text-orange-700 border-orange-200",
        dot: "bg-orange-500",
    },
};

export function GuideDetailsDialog({
    open,
    guide,
    onClose,
    onApprove,
    onReject,
    onSuspend,
    onUnsuspend,
    onComment,
    onOpenDocument,
}: Props) {
    const [localComment, setLocalComment] = useState<string>("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSavingComment, setIsSavingComment] = useState(false);

    useEffect(() => {
        setLocalComment(guide?.reviewComment ?? "");
    }, [guide]);

    const statusUI = useMemo(() => (guide ? statusVisual[guide.status] : null), [guide]);

    const openConfirm = (action: ActionType) => {
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    const handleConfirmAction = async (payload?: { reason?: string; until?: Date }) => {
        if (!guide || !confirmAction) return;

        setIsProcessing(true);

        try {
            switch (confirmAction) {
                case "approve":
                    await onApprove(guide._id);
                    break;

                case "reject":
                    await onReject(guide._id, payload?.reason ?? "");
                    break;

                case "suspend":
                    const success = await onSuspend(
                        guide._id,
                        payload?.reason ?? "",
                        payload?.until ?? new Date()
                    );
                    if (!success) {
                        console.error("Suspend action failed");
                        return;
                    } else {
                        onClose()
                    }
                    break;

                case "unsuspend":
                    const unsuspendSuccess = await onUnsuspend(
                        guide._id,
                        payload?.reason ?? ""
                    );
                    if (!unsuspendSuccess) {
                        console.error("Unsuspend action failed");
                        return;
                    } else {
                        onClose()
                    }
                    break;
            }

            setConfirmOpen(false);
            setConfirmAction(null);
        } catch (error) {
            console.error("Action failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveComment = async () => {
        if (!guide) return;

        setIsSavingComment(true);
        try {
            await onComment(guide._id, localComment.trim());
        } catch (error) {
            console.error("Failed to save comment:", error);
        } finally {
            setIsSavingComment(false);
        }
    };

    if (!guide) {
        return (
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Guide Details</DialogTitle>
                        <DialogDescription>Loading selected guide...</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const isPending = guide.status === GUIDE_STATUS.PENDING;
    const isApproved = guide.status === GUIDE_STATUS.APPROVED;
    const isSuspended = guide.status === GUIDE_STATUS.SUSPENDED;

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent
                    className="sm:max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]"
                    aria-describedby={undefined}
                >
                    {/* Fixed Header */}
                    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b-2 border-gray-200 shadow-sm">
                        <DialogHeader className="px-8 pt-6 pb-5">
                            <DialogTitle className="sr-only">Guide Details</DialogTitle>
                            <DialogDescription className="sr-only">
                                Review the guide&apos;s application, documents, and take actions.
                            </DialogDescription>

                            <div className="flex items-start gap-5">
                                <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white text-lg font-bold">
                                        {guide.name?.substring(0, 2)?.toUpperCase() || "GU"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-gray-900 truncate">{guide.name}</h3>
                                        {statusUI && (
                                            <Badge className={cn("px-3 py-1 text-xs font-semibold border-2", statusUI.badge)}>
                                                <span className={cn("inline-block h-2 w-2 rounded-full mr-2", statusUI.dot)} />
                                                {statusUI.label}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                                        <FiBriefcase className="h-4 w-4 text-blue-600" />
                                        <span className="truncate font-semibold">{guide.companyName}</span>
                                    </div>

                                    {isSuspended && guide.suspendedUntil && (
                                        <div className="mt-4 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3 shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FiPause className="h-4 w-4 text-orange-600" />
                                                <p className="text-sm font-bold text-orange-800">
                                                    Guide Suspended
                                                </p>
                                            </div>
                                            <p className="text-sm text-orange-700">
                                                Until:{" "}
                                                <span className="font-semibold">
                                                    {format(new Date(guide.suspendedUntil), "MMMM dd, yyyy")}
                                                </span>
                                            </p>
                                            {guide.suspensionReason && (
                                                <p className="text-xs text-orange-600 mt-2 bg-orange-100 rounded-lg px-2 py-1">
                                                    <strong>Reason:</strong> {guide.suspensionReason}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="px-8 pb-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <InfoCard icon={<FiMail className="h-4 w-4" />} label="Email" value={guide.email} />
                                <InfoCard icon={<FiPhone className="h-4 w-4" />} label="Phone" value={guide.phone || "Not provided"} />
                                <InfoCard
                                    icon={<FiClock className="h-4 w-4" />}
                                    label="Applied"
                                    value={guide.appliedAt ? format(new Date(guide.appliedAt), "MMM dd, yyyy") : "N/A"}
                                />
                                <InfoCard
                                    icon={<FiUser className="h-4 w-4" />}
                                    label="Reviewer"
                                    value={guide.reviewer || "Unassigned"}
                                />
                                <InfoCard
                                    icon={<FiClock className="h-4 w-4" />}
                                    label="Reviewed"
                                    value={guide.reviewedAt ? format(new Date(guide.reviewedAt), "MMM dd, yyyy") : "Pending"}
                                />
                                <InfoCard
                                    icon={<FiBriefcase className="h-4 w-4" />}
                                    label="Status"
                                    value={statusUI?.label || "Unknown"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <ScrollArea className="flex-1 overflow-y-auto">
                        <div className="px-8 py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Section title="Biography" icon={<FiUser className="h-4 w-4" />}>
                                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                            {guide.bio || "No biography provided."}
                                        </p>
                                        {guide.social && (
                                            <a
                                                href={guide.social}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                            >
                                                <FiExternalLink className="h-4 w-4" />
                                                View Social Profile
                                            </a>
                                        )}
                                    </Section>

                                    <Section title="Review Comments" icon={<FiMessageSquare className="h-4 w-4" />}>
                                        <div className="space-y-3">
                                            <Textarea
                                                value={localComment}
                                                onChange={(e) => setLocalComment(e.target.value)}
                                                placeholder="Add internal notes or comments about this guide..."
                                                className="min-h-[120px] resize-none focus:ring-2 focus:ring-blue-300 border-2"
                                                disabled={isSavingComment}
                                            />
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-xs text-gray-500">
                                                    These comments are for internal review only
                                                </p>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="gap-2 shadow-sm hover:shadow font-semibold"
                                                    onClick={handleSaveComment}
                                                    disabled={isSavingComment}
                                                >
                                                    {isSavingComment ? (
                                                        <>
                                                            <FiLoader className="h-4 w-4 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiMessageSquare className="h-4 w-4" />
                                                            Save Comment
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Section>
                                </div>

                                {/* Right Column - Documents */}
                                <div className="lg:col-span-1">
                                    <Section title="Documents" icon={<HiDocumentText className="h-4 w-4" />}>
                                        <div className="space-y-3">
                                            {(!guide.documents || guide.documents.length === 0) && (
                                                <div className="text-center py-12 px-4">
                                                    <HiDocumentText className="h-14 w-14 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        No documents uploaded
                                                    </p>
                                                </div>
                                            )}

                                            <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
                                                {(guide.documents || []).map((doc, idx) => (
                                                    <motion.button
                                                        key={`${idx}-${doc.fileName}`}
                                                        whileHover={{ scale: 1.02, x: 3 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => onOpenDocument(guide, doc)}
                                                        className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left shadow-sm hover:shadow-md group"
                                                    >
                                                        <div className="flex-shrink-0 p-2.5 rounded-lg bg-blue-100 border-2 border-blue-200 group-hover:bg-blue-200 group-hover:border-blue-400 transition-colors">
                                                            {doc.fileType === GUIDE_DOCUMENT_TYPE.PDF ? (
                                                                <BsFileEarmarkPdf className="h-6 w-6 text-blue-600" />
                                                            ) : (
                                                                <BsFileEarmarkImage className="h-6 w-6 text-blue-600" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                                                {doc.fileName || "Document"}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {doc.uploadedAt ? format(new Date(doc.uploadedAt), "MMM dd, yyyy") : "No date"}
                                                            </p>
                                                        </div>
                                                        <FiExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </Section>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <Separator className="shadow-sm" />

                    {/* Fixed Footer */}
                    <DialogFooter className="px-8 py-5 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2 border-gray-200">
                        <div className="w-full flex flex-wrap items-center gap-3">
                            <Button variant="ghost" onClick={onClose} className="font-semibold">
                                Close
                            </Button>

                            <div className="flex-1" />

                            {isPending && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => openConfirm("reject")}
                                        className="border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 font-semibold shadow-sm"
                                    >
                                        <FiXCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => openConfirm("approve")}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg"
                                    >
                                        <FiCheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                    </Button>
                                </>
                            )}

                            {isApproved && (
                                <Button
                                    variant="outline"
                                    onClick={() => openConfirm("suspend")}
                                    className="border-2 border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-400 font-semibold shadow-sm"
                                >
                                    <FiPause className="h-4 w-4 mr-2" />
                                    Suspend
                                </Button>
                            )}

                            {isSuspended && (
                                <Button
                                    onClick={() => openConfirm("unsuspend")}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg"
                                >
                                    <FiCheckCircle className="h-4 w-4 mr-2" />
                                    Unsuspend
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {confirmAction && (
                <GuideDetailsActionConfirm
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    action={confirmAction}
                    onConfirm={handleConfirmAction}
                    isLoading={isProcessing}
                />
            )}
        </>
    );
}

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2.5">
                {icon && <span className="text-blue-600">{icon}</span>}
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {title}
                </h4>
            </div>
            <div className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                {children}
            </div>
        </div>
    );
}

function InfoCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
            <span className="text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wide text-gray-500 font-bold mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-bold text-gray-900 truncate">{value || "-"}</p>
            </div>
        </div>
    );
}