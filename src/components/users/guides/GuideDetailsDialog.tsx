// components/guide/GuideDetailsDialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  PendingGuideDTO,
  PendingGuideDocumentDTO,
} from "@/types/guide/pendingGuide.types";
import { GUIDE_STATUS, GUIDE_DOCUMENT_TYPE } from "@/constants/guide.const";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  FiCheckCircle,
  FiXCircle,
  FiMessageSquare,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiClock,
  FiUser,
  FiExternalLink,
  FiPause,
  FiLoader,
} from "react-icons/fi";
import { BsFileEarmarkPdf, BsFileEarmarkImage } from "react-icons/bs";
import { HiDocumentText } from "react-icons/hi";
import GuideDetailsActionConfirm from "./GuideDetailsActionConfirm";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_DIALOG_CONTENT =
  "sm:max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl " +
  "border border-white/60 bg-[#E7E5E4] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const NEU_DIALOG_HEADER =
  "border-b border-[#1E2938]/10 bg-[#E7E5E4] px-6 sm:px-8 pt-6 pb-5";

const NEU_AVATAR_FALLBACK =
  "bg-[#006666]/20 text-[#006666] font-[family-name:var(--font-space-mono)] font-bold text-lg";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60";

const NEU_BADGE_BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
  
const NEU_TEXTAREA =
  "min-h-[120px] resize-none rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 " +
  "placeholder:text-[#1E2938]/40 disabled:opacity-50 transition-all duration-200";

const NEU_CHAR_HINT =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40";

const NEU_SAVE_BTN =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm h-9 " +
  "font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#006666] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#007777] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "transition-all duration-200";

const NEU_DOC_BTN =
  "w-full flex items-center gap-3 p-4 rounded-xl " +
  "bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "text-left transition-all duration-200 group " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_DOC_ICON_WELL =
  "flex-shrink-0 p-2.5 rounded-lg bg-[#006666]/10 " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "group-hover:bg-[#006666]/20 transition-colors";

const NEU_FOOTER =
  "px-6 sm:px-8 py-5 bg-[#E7E5E4] border-t border-[#1E2938]/10";

const NEU_FOOTER_CLOSE =
  "inline-flex items-center rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
  "bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "transition-all duration-200";

const NEU_FOOTER_ACTION_REJECT =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] " +
  "bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "hover:bg-[#FF2157]/5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/40 " +
  "transition-all duration-200";

const NEU_FOOTER_ACTION_APPROVE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#00A63D] " +
  "shadow-[4px_4px_8px_#007a2d,-2px_-2px_6px_#00cc4a] " +
  "hover:bg-[#009935] hover:shadow-[6px_6px_12px_#007a2d,-3px_-3px_8px_#00cc4a] " +
  "active:shadow-[inset_3px_3px_6px_#007a2d,inset_-2px_-2px_4px_#00cc4a] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A63D]/50 " +
  "transition-all duration-200";

const NEU_FOOTER_ACTION_SUSPEND =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold text-[#FE9900] " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "hover:bg-[#FE9900]/5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE9900]/40 " +
  "transition-all duration-200";

const NEU_FOOTER_ACTION_UNSUSPEND =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#006666] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#007777] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "transition-all duration-200";

const NEU_SUSPENSION_BOX =
  "mt-4 rounded-xl px-4 py-3 bg-[#FE9900]/10 " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  guide?: PendingGuideDTO;
  onClose: () => void;
  onApprove: (id: string) => Promise<boolean>;
  onReject: (id: string, reason: string) => Promise<boolean>;
  onSuspend: (id: string, reason: string, until: Date) => Promise<boolean>;
  onUnsuspend: (id: string, reason: string) => Promise<boolean>;
  onComment: (id: string, comment: string) => Promise<boolean>;
  onOpenDocument: (
    guide: PendingGuideDTO,
    doc: PendingGuideDocumentDTO,
  ) => void;
};

type ActionType = "approve" | "reject" | "suspend" | "unsuspend";

const statusVisual = {
  [GUIDE_STATUS.PENDING]: {
    label: "Pending Review",
    badge: "bg-[#FE9900]/10 text-[#FE9900]",
    dot: "bg-[#FE9900]",
  },
  [GUIDE_STATUS.APPROVED]: {
    label: "Approved",
    badge: "bg-[#00A63D]/10 text-[#00A63D]",
    dot: "bg-[#00A63D]",
  },
  [GUIDE_STATUS.REJECTED]: {
    label: "Rejected",
    badge: "bg-[#FF2157]/10 text-[#FF2157]",
    dot: "bg-[#FF2157]",
  },
  [GUIDE_STATUS.SUSPENDED]: {
    label: "Suspended",
    badge: "bg-[#FE9900]/10 text-[#FE9900]",
    dot: "bg-[#FE9900]",
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
  const [localComment, setLocalComment] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    setLocalComment(guide?.reviewComment ?? "");
  }, [guide]);

  const statusUI = useMemo(
    () => (guide ? statusVisual[guide.status] : null),
    [guide],
  );

  const openConfirm = (action: ActionType) => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async (payload?: {
    reason?: string;
    until?: Date;
  }) => {
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
        case "suspend": {
          const ok = await onSuspend(
            guide._id,
            payload?.reason ?? "",
            payload?.until ?? new Date(),
          );
          if (!ok) {
            console.error("Suspend failed");
            return;
          }
          onClose();
          break;
        }
        case "unsuspend": {
          const ok = await onUnsuspend(guide._id, payload?.reason ?? "");
          if (!ok) {
            console.error("Unsuspend failed");
            return;
          }
          onClose();
          break;
        }
      }
      setConfirmOpen(false);
      setConfirmAction(null);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveComment = async () => {
    if (!guide) return;
    setIsSavingComment(true);
    try {
      await onComment(guide._id, localComment.trim());
    } catch (err) {
      console.error("Failed to save comment:", err);
    } finally {
      setIsSavingComment(false);
    }
  };

  // Loading state
  if (!guide) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className={NEU_DIALOG_CONTENT}>
          <DialogHeader>
            <DialogTitle className="sr-only">Guide Details</DialogTitle>
            <DialogDescription className="sr-only">Loading…</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <FiLoader
              className="h-8 w-8 animate-spin text-[#006666]"
              aria-label="Loading"
            />
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
          className={NEU_DIALOG_CONTENT}
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className={NEU_DIALOG_HEADER}>
            <DialogHeader>
              <DialogTitle className="sr-only">Guide Details</DialogTitle>
              <DialogDescription className="sr-only">
                Review the guide&apos;s application, documents, and take
                actions.
              </DialogDescription>
            </DialogHeader>

            {/* Guide identity */}
            <div className="flex items-start gap-5">
              <Avatar className="h-16 w-16 ring-4 ring-[#1E2938]/10 flex-shrink-0">
                <AvatarFallback className={NEU_AVATAR_FALLBACK}>
                  {guide.name?.substring(0, 2)?.toUpperCase() || "GU"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                  <h3 className={cn("text-2xl truncate", NEU_HEADING)}>
                    {guide.name}
                  </h3>
                  {statusUI && (
                    <span className={cn(NEU_BADGE_BASE, statusUI.badge)}>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full flex-shrink-0",
                          statusUI.dot,
                        )}
                        aria-hidden="true"
                      />
                      {statusUI.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <FiBriefcase
                    className="h-4 w-4 text-[#006666] flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className={cn(NEU_MUTED, "font-bold truncate")}>
                    {guide.companyName}
                  </span>
                </div>

                {/* Suspension notice */}
                {isSuspended && guide.suspendedUntil && (
                  <div className={NEU_SUSPENSION_BOX} role="alert">
                    <div className="flex items-center gap-2 mb-1">
                      <FiPause
                        className="h-4 w-4 text-[#FE9900]"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#FE9900]">
                        Guide Suspended
                      </p>
                    </div>
                    <p className={NEU_MUTED}>
                      Until:{" "}
                      <span className="font-bold text-[#1E2938]">
                        {format(
                          new Date(guide.suspendedUntil),
                          "MMMM dd, yyyy",
                        )}
                      </span>
                    </p>
                    {guide.suspensionReason && (
                      <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#FE9900] mt-1.5">
                        <strong>Reason:</strong> {guide.suspensionReason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info cards */}
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
              <InfoCard
                icon={<FiMail className="h-4 w-4" />}
                label="Email"
                value={guide.email}
              />
              <InfoCard
                icon={<FiPhone className="h-4 w-4" />}
                label="Phone"
                value={guide.phone || "Not provided"}
              />
              <InfoCard
                icon={<FiClock className="h-4 w-4" />}
                label="Applied"
                value={
                  guide.appliedAt
                    ? format(new Date(guide.appliedAt), "MMM dd, yyyy")
                    : "N/A"
                }
              />
              <InfoCard
                icon={<FiUser className="h-4 w-4" />}
                label="Reviewer"
                value={guide.reviewer || "Unassigned"}
              />
              <InfoCard
                icon={<FiClock className="h-4 w-4" />}
                label="Reviewed"
                value={
                  guide.reviewedAt
                    ? format(new Date(guide.reviewedAt), "MMM dd, yyyy")
                    : "Pending"
                }
              />
              <InfoCard
                icon={<FiBriefcase className="h-4 w-4" />}
                label="Status"
                value={statusUI?.label || "Unknown"}
              />
            </div>
          </div>

          {/* Scrollable body */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-6 sm:px-8 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left col — biography + comment */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Biography */}
                  <Section
                    title="Biography"
                    icon={<FiUser className="h-4 w-4" />}
                  >
                    <p className="text-sm leading-relaxed font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/80 whitespace-pre-wrap">
                      {guide.bio || "No biography provided."}
                    </p>
                    {guide.social && (
                      <a
                        href={guide.social}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#006666] hover:underline transition-colors"
                      >
                        <FiExternalLink
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        View Social Profile
                      </a>
                    )}
                  </Section>

                  {/* Review comment */}
                  <Section
                    title="Review Comments"
                    icon={<FiMessageSquare className="h-4 w-4" />}
                  >
                    <div className="space-y-3">
                      <Textarea
                        value={localComment}
                        onChange={(e) => setLocalComment(e.target.value)}
                        placeholder="Add internal notes or comments about this guide…"
                        className={NEU_TEXTAREA}
                        disabled={isSavingComment}
                        aria-label="Internal review comment"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <p className={NEU_CHAR_HINT}>Internal use only</p>
                        <button
                          onClick={handleSaveComment}
                          disabled={isSavingComment}
                          className={NEU_SAVE_BTN}
                          aria-label="Save review comment"
                        >
                          {isSavingComment ? (
                            <>
                              <FiLoader
                                className="h-4 w-4 animate-spin"
                                aria-hidden="true"
                              />
                              Saving…
                            </>
                          ) : (
                            <>
                              <FiMessageSquare
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              Save Comment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Section>
                </div>

                {/* Right col — documents */}
                <div className="lg:col-span-1">
                  <Section
                    title="Documents"
                    icon={<HiDocumentText className="h-4 w-4" />}
                  >
                    {!guide.documents || guide.documents.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <HiDocumentText
                          className="h-12 w-12 text-[#1E2938]/20 mx-auto mb-3"
                          aria-hidden="true"
                        />
                        <p className={NEU_MUTED}>No documents uploaded</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                        {(guide.documents || []).map((doc, idx) => (
                          <motion.button
                            key={`${idx}-${doc.fileName}`}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onOpenDocument(guide, doc)}
                            className={NEU_DOC_BTN}
                            aria-label={`Open ${doc.fileName}`}
                          >
                            <div className={NEU_DOC_ICON_WELL}>
                              {doc.fileType === GUIDE_DOCUMENT_TYPE.PDF ? (
                                <BsFileEarmarkPdf
                                  className="h-5 w-5 text-[#FF2157]"
                                  aria-hidden="true"
                                />
                              ) : (
                                <BsFileEarmarkImage
                                  className="h-5 w-5 text-[#006666]"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] truncate group-hover:text-[#006666] transition-colors">
                                {doc.fileName || "Document"}
                              </p>
                              <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mt-0.5">
                                {doc.uploadedAt
                                  ? format(
                                      new Date(doc.uploadedAt),
                                      "MMM dd, yyyy",
                                    )
                                  : "No date"}
                              </p>
                            </div>
                            <FiExternalLink
                              className="h-4 w-4 text-[#1E2938]/30 group-hover:text-[#006666] flex-shrink-0 transition-colors"
                              aria-hidden="true"
                            />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </Section>
                </div>
              </div>
            </div>
          </ScrollArea>

          <Separator className="border-[#1E2938]/10" />

          {/* Footer */}
          <DialogFooter className={NEU_FOOTER}>
            <div className="w-full flex flex-wrap items-center gap-3">
              <button
                onClick={onClose}
                className={NEU_FOOTER_CLOSE}
                aria-label="Close dialog"
              >
                Close
              </button>

              <div className="flex-1" />

              {isPending && (
                <>
                  <button
                    onClick={() => openConfirm("reject")}
                    className={NEU_FOOTER_ACTION_REJECT}
                    aria-label="Reject this guide"
                  >
                    <FiXCircle className="h-4 w-4" aria-hidden="true" />
                    Reject
                  </button>
                  <button
                    onClick={() => openConfirm("approve")}
                    className={NEU_FOOTER_ACTION_APPROVE}
                    aria-label="Approve this guide"
                  >
                    <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
                    Approve
                  </button>
                </>
              )}

              {isApproved && (
                <button
                  onClick={() => openConfirm("suspend")}
                  className={NEU_FOOTER_ACTION_SUSPEND}
                  aria-label="Suspend this guide"
                >
                  <FiPause className="h-4 w-4" aria-hidden="true" />
                  Suspend
                </button>
              )}

              {isSuspended && (
                <button
                  onClick={() => openConfirm("unsuspend")}
                  className={NEU_FOOTER_ACTION_UNSUSPEND}
                  aria-label="Unsuspend this guide"
                >
                  <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
                  Unsuspend
                </button>
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#006666]">{icon}</span>}
        <h4 className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest">
          {title}
        </h4>
      </div>
      <div className="rounded-xl bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] p-5">
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
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]">
      <span className="text-[#006666] flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-[family-name:var(--font-space-mono)] font-bold uppercase tracking-widest text-[#1E2938]/50 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938] truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
