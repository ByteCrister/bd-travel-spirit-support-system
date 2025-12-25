"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/pendingGuide.types";
import { GUIDE_STATUS } from "@/constants/guide.const";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Icons
import { FiCheckCircle, FiXCircle, FiMessageSquare, FiMail, FiPhone, FiBriefcase, FiClock, FiUser, FiExternalLink } from "react-icons/fi";
import { BsFileEarmarkPdf, BsFileEarmarkImage } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import { GUIDE_DOCUMENT_TYPE } from "@/constants/guide.const";

type Props = {
    open: boolean;
    guide?: PendingGuideDTO;
    onClose: () => void;

    // actions
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    onComment: (id: string, comment: string) => void;
    onOpenDocument: (guide: PendingGuideDTO, doc: PendingGuideDocumentDTO) => void;
};

const statusVisual = {
    [GUIDE_STATUS.PENDING]: {
        label: "Pending",
        badge: "bg-amber-50 text-amber-700 border border-amber-200",
        dot: "bg-amber-500",
    },
    [GUIDE_STATUS.APPROVED]: {
        label: "Approved",
        badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dot: "bg-emerald-500",
    },
    [GUIDE_STATUS.REJECTED]: {
        label: "Rejected",
        badge: "bg-red-50 text-red-700 border border-red-200",
        dot: "bg-red-500",
    },
};

export function GuideDetailsDialog({
    open,
    guide,
    onClose,
    onApprove,
    onReject,
    onComment,
    onOpenDocument,
}: Props) {
    const [localComment, setLocalComment] = useState<string>("");
    const [rejectReason, setRejectReason] = useState<string>("");

    useEffect(() => {
        setLocalComment(guide?.reviewComment ?? "");
        setRejectReason("");
    }, [guide]);

    const statusUI = useMemo(() => (guide ? statusVisual[guide.status] : null), [guide]);

    if (!guide) {
        return (
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Guide details</DialogTitle>
                        <DialogDescription>Loading selected guide...</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );
    }

    const canAct = guide.status === GUIDE_STATUS.PENDING;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="sm:max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]"
                aria-describedby={undefined}
            >
                {/* Fixed Header */}
                <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50 border-b border-gray-200 shadow-sm">
                    <DialogHeader className="px-6 pt-5 pb-4">
                        <DialogTitle className="sr-only">Guide details</DialogTitle>
                        <DialogDescription className="sr-only">
                            Review the guide&apos;s application, documents, and take actions.
                        </DialogDescription>

                        <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 ring-2 ring-blue-100 shadow-sm">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-base font-bold">
                                    {guide.name?.substring(0, 2)?.toUpperCase() || "GU"}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-gray-900 truncate">{guide.name}</h3>
                                    {statusUI && (
                                        <Badge className={cn("px-2.5 py-1 text-xs font-semibold", statusUI.badge)}>
                                            <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1.5", statusUI.dot)} />
                                            {statusUI.label}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FiBriefcase className="h-3.5 w-3.5" />
                                    <span className="truncate font-medium">{guide.companyName}</span>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-6 pb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                            <InfoItem icon={<FiMail className="h-3.5 w-3.5" />} label="Email" value={guide.email} />
                            <InfoItem icon={<FiPhone className="h-3.5 w-3.5" />} label="Phone" value={guide.phone || "-"} />
                            <InfoItem
                                icon={<FiClock className="h-3.5 w-3.5" />}
                                label="Applied"
                                value={guide.appliedAt ? format(new Date(guide.appliedAt), "MMM dd, yyyy") : "-"}
                            />
                            <InfoItem
                                icon={<FiUser className="h-3.5 w-3.5" />}
                                label="Reviewer"
                                value={guide.reviewer || "-"}
                            />
                            <InfoItem
                                icon={<FiClock className="h-3.5 w-3.5" />}
                                label="Reviewed"
                                value={guide.reviewedAt ? format(new Date(guide.reviewedAt), "MMM dd, yyyy") : "-"}
                            />
                            <InfoItem
                                icon={<FiBriefcase className="h-3.5 w-3.5" />}
                                label="Status"
                                value={statusUI?.label || "-"}
                            />
                        </div>
                    </div>
                </div>

                {/* Scrollable Body */}
                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="px-6 py-5">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Left: Bio and Comment */}
                            <div className="lg:col-span-2 space-y-5">
                                <Section title="Biography" icon={<FiUser className="h-4 w-4" />}>
                                    <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                        {guide.bio || "No biography provided."}
                                    </p>
                                    {guide.social && (
                                        <a
                                            href={guide.social}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                                        >
                                            <FiExternalLink className="h-3.5 w-3.5" />
                                            View social profile
                                        </a>
                                    )}
                                </Section>

                                <Section title="Review Comment" icon={<FiMessageSquare className="h-4 w-4" />}>
                                    <div className="space-y-3">
                                        <Textarea
                                            value={localComment}
                                            onChange={(e) => setLocalComment(e.target.value)}
                                            placeholder="Add a note for the reviewer or applicant..."
                                            className="min-h-[100px] resize-none focus:ring-2 focus:ring-blue-200"
                                        />
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-xs text-gray-500">Comments are stored per guide review.</p>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="gap-2 shadow-sm hover:shadow"
                                                onClick={() => onComment(guide._id, localComment.trim())}
                                            >
                                                <FiMessageSquare className="h-3.5 w-3.5" />
                                                Save Comment
                                            </Button>
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Right: Documents */}
                            <div className="lg:col-span-1">
                                <Section title="Documents" icon={<HiDocumentText className="h-4 w-4" />}>
                                    <div className="space-y-2">
                                        {(guide.documents || []).length === 0 && (
                                            <div className="text-center py-8 px-4">
                                                <HiDocumentText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm text-gray-500 font-medium">No documents uploaded</p>
                                            </div>
                                        )}

                                        <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1">
                                            {(guide.documents || []).map((doc, idx) => (
                                                <motion.button
                                                    key={`${idx}-${doc.fileName}`}
                                                    whileHover={{ scale: 1.01, x: 2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => onOpenDocument(guide, doc)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left shadow-sm hover:shadow group"
                                                >
                                                    <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 transition-colors">
                                                        {doc.fileType === GUIDE_DOCUMENT_TYPE.PDF ? (
                                                            <BsFileEarmarkPdf className="h-5 w-5 text-blue-600" />
                                                        ) : (
                                                            <BsFileEarmarkImage className="h-5 w-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                                            {doc.fileName || "Document"}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {doc.uploadedAt ? format(new Date(doc.uploadedAt), "MMM dd, yyyy") : "No date"}
                                                        </p>
                                                    </div>
                                                    <FiExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
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
                <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Optional rejection reason..."
                                className={cn(
                                    "w-full h-10 rounded-lg border border-gray-300 bg-white px-3.5 text-sm shadow-sm",
                                    "focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all",
                                    "placeholder:text-gray-400"
                                )}
                                aria-label="Rejection reason"
                                disabled={!canAct}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">
                                Close
                            </Button>
                            <Button
                                variant="outline"
                                className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm"
                                disabled={!canAct}
                                onClick={() => onApprove(guide._id)}
                            >
                                <FiCheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                variant="outline"
                                className="border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 shadow-sm"
                                disabled={!canAct}
                                onClick={() => onReject(guide._id, rejectReason.trim())}
                            >
                                <FiXCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Section({
    title,
    icon,
    children
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                {icon && <span className="text-gray-600">{icon}</span>}
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h4>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                {children}
            </div>
        </div>
    );
}

function InfoItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value?: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm hover:shadow transition-shadow">
            <span className="text-blue-600 flex-shrink-0">{icon}</span>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{value || "-"}</p>
            </div>
        </div>
    );
}