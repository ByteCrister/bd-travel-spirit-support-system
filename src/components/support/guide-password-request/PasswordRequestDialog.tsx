// components/guide-password-request/PasswordRequestDialog.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Clock,
  User,
  Key,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";
import { FORGOT_PASSWORD_STATUS } from "@/constants/guide-forgot-password.const";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { showToast } from "@/components/global/showToast";
import {
  NEU_BTN_PRIMARY,
  NEU_BTN_GHOST,
  NEU_BTN_DANGER,
  NEU_INPUT,
  NEU_HEADING,
  NEU_LABEL,
  NEU_MUTED,
  NEU_SURFACE_INSET,
  NEU_SURFACE_INSET_SM,
  NEU_SURFACE_RAISED,
  NEU_DIVIDER,
  NEU_BADGE_SUCCESS,
  NEU_BADGE_WARNING,
  NEU_BADGE_DANGER,
  NEU_BADGE,
  NEU_ICON_WELL,
  NEU_ICON_WELL_PRIMARY,
} from "@/styles/neu.styles";

// ── Local style constants ────────────────────────────────────────────────────
const INFO_ROW = "flex items-center gap-3";
const INFO_VALUE = "text-sm font-bold text-[#1E2938] font-[family-name:var(--font-space-mono)]";
const INFO_SUB = "text-xs text-[#1E2938]/50 font-[family-name:var(--font-jetbrains-mono)]";

const STATUS_BADGE_MAP = {
  [FORGOT_PASSWORD_STATUS.PENDING]: { cls: NEU_BADGE_WARNING, label: "Pending" },
  [FORGOT_PASSWORD_STATUS.APPROVED]: { cls: NEU_BADGE_SUCCESS, label: "Approved" },
  [FORGOT_PASSWORD_STATUS.REJECTED]: { cls: NEU_BADGE_DANGER, label: "Rejected" },
  [FORGOT_PASSWORD_STATUS.EXPIRED]: { cls: NEU_BADGE, label: "Expired" },
};

interface PasswordRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordRequestDialog({
  open,
  onOpenChange,
}: PasswordRequestDialogProps) {
  const { selectedRequest, approveRequest, rejectRequest, isUpdating, selectRequest } =
    usePasswordRequestStore();

  const [rejectionReason, setRejectionReason] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!selectedRequest) return null;

  const isPending = selectedRequest.status === FORGOT_PASSWORD_STATUS.PENDING;
  const isExpired = selectedRequest.status === FORGOT_PASSWORD_STATUS.EXPIRED;
  const expiryPast = new Date(selectedRequest.expiresAt) < new Date();
  const badgeCfg =
    STATUS_BADGE_MAP[selectedRequest.status as keyof typeof STATUS_BADGE_MAP] ||
    STATUS_BADGE_MAP[FORGOT_PASSWORD_STATUS.EXPIRED];

  const handleGeneratePassword = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedPassword(generateStrongPassword(12));
      setIsGenerating(false);
      showToast.success("Password Generated", "A secure password has been generated.");
    }, 300);
  };

  const handleApprove = async () => {
    if (!generatedPassword) {
      showToast.warning("Provide a Password!", "Please generate a valid password.");
      return;
    }
    await approveRequest(selectedRequest.id, generatedPassword, sendEmail);
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast.warning("Provide a reason!", "Please provide a reason to reject.");
      return;
    }
    await rejectRequest(selectedRequest.id, rejectionReason);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setRejectionReason("");
    setGeneratedPassword("");
    setSendEmail(true);
    setTimeout(() => selectRequest(null), 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto p-0",
          "bg-[#E7E5E4] border-white/60",
          "shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
          "rounded-2xl"
        )}
      >
        {/* ── Dialog Header ─────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/40">
          <DialogTitle className="flex items-center gap-3">
            <div className={NEU_ICON_WELL_PRIMARY}>
              <Key className="h-5 w-5 text-[#006666]" />
            </div>
            <span className={cn(NEU_HEADING, "text-lg")}>Password Reset Request</span>
          </DialogTitle>
        </DialogHeader>

        {/* ── Body ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 py-5 space-y-5"
        >
          {/* User card */}
          <div className={cn(NEU_SURFACE_INSET, "p-4 rounded-2xl")}>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 ring-2 ring-white/70 shadow-[2px_2px_6px_#c8c6c5] shrink-0">
                <AvatarImage src={selectedRequest.user.avatarUrl || undefined} />
                <AvatarFallback className="bg-[#006666] text-white font-bold text-base font-[family-name:var(--font-space-mono)]">
                  {selectedRequest.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-3">
                {/* Name + status badge */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className={cn(NEU_HEADING, "text-base")}>
                      {selectedRequest.user.name}
                    </h3>
                    <p className={cn(NEU_MUTED, "flex items-center gap-1.5 mt-0.5")}>
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{selectedRequest.user.email}</span>
                    </p>
                  </div>
                  <span className={cn(badgeCfg.cls, "px-3 py-1 shrink-0")}>
                    {badgeCfg.label}
                  </span>
                </div>

                {/* Date grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={INFO_ROW}>
                    <div className={NEU_ICON_WELL}>
                      <Calendar className="h-3.5 w-3.5 text-[#006666]" />
                    </div>
                    <div>
                      <p className={INFO_SUB}>Created</p>
                      <p className={INFO_VALUE}>
                        {format(new Date(selectedRequest.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className={INFO_ROW}>
                    <div
                      className={cn(
                        NEU_ICON_WELL,
                        expiryPast && "bg-[#FF2157]/10"
                      )}
                    >
                      <Clock
                        className={cn(
                          "h-3.5 w-3.5",
                          expiryPast ? "text-[#FF2157]" : "text-[#1E2938]/50"
                        )}
                      />
                    </div>
                    <div>
                      <p className={INFO_SUB}>Expires</p>
                      <p
                        className={cn(
                          INFO_VALUE,
                          expiryPast && "text-[#FF2157]"
                        )}
                      >
                        {format(new Date(selectedRequest.expiresAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className={NEU_LABEL}>Reason for Password Reset</label>
            <Textarea
              value={selectedRequest.reason}
              readOnly
              className={cn(NEU_INPUT, "resize-none min-h-[76px] w-full py-2.5 px-3")}
            />
          </div>

          {/* ── Action section: only for pending non-expired ── */}
          {isPending && !isExpired && (
            <>
              <div className={cn("border-t", NEU_DIVIDER)} />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* Generate password header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <div className={NEU_ICON_WELL_PRIMARY}>
                      <ShieldCheck className="h-4 w-4 text-[#006666]" />
                    </div>
                    <span className={cn(NEU_HEADING, "text-base")}>
                      Generate New Password
                    </span>
                  </div>
                  <button
                    onClick={handleGeneratePassword}
                    disabled={isGenerating}
                    className={cn(
                      NEU_BTN_GHOST,
                      "px-4 py-2 text-sm flex items-center gap-2",
                      isGenerating && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", isGenerating && "animate-spin")}
                    />
                    {isGenerating ? "Generating…" : "Generate Password"}
                  </button>
                </div>

                {/* Success banner */}
                <AnimatePresence>
                  {generatedPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div
                        className={cn(
                          NEU_SURFACE_INSET_SM,
                          "p-4 rounded-xl border border-[#00A63D]/20"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-[#00A63D]" />
                          <span className={cn(NEU_LABEL, "text-[#00A63D]")}>
                            Password Generated
                          </span>
                        </div>
                        <p className={cn(NEU_MUTED, "text-[#00A63D]/80")}>
                          A secure {generatedPassword.length}-character password is
                          ready. It will be sent via email when you approve.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Send email toggle */}
                <div
                  className={cn(
                    NEU_SURFACE_RAISED,
                    "flex items-center justify-between p-4 rounded-xl"
                  )}
                >
                  <div className="space-y-0.5 flex-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1E2938] font-[family-name:var(--font-space-mono)]">
                      <Mail className="h-4 w-4 text-[#006666]" />
                      Send Email Notification
                    </label>
                    <p className={NEU_MUTED}>
                      Email the new password securely to the user
                    </p>
                  </div>
                  <Switch
                    checked={sendEmail}
                    onCheckedChange={setSendEmail}
                    className="data-[state=checked]:bg-[#006666]"
                  />
                </div>

                {/* No-email warning */}
                {!sendEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      NEU_SURFACE_INSET_SM,
                      "flex items-start gap-2 p-3 rounded-xl border border-[#FE9900]/20"
                    )}
                  >
                    <AlertCircle className="h-4 w-4 text-[#FE9900] mt-0.5 shrink-0" />
                    <p className={cn(NEU_MUTED, "text-[#FE9900]/80")}>
                      The password will be updated without notification. Communicate it
                      via a secure channel.
                    </p>
                  </motion.div>
                )}

                {/* Rejection reason */}
                <div className="space-y-2">
                  <label className={NEU_LABEL}>
                    Rejection Reason{" "}
                    <span className="normal-case opacity-50">(required to reject)</span>
                  </label>
                  <Textarea
                    placeholder="Provide a detailed reason for rejection…"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className={cn(
                      NEU_INPUT,
                      "resize-none min-h-[72px] w-full py-2.5 px-3"
                    )}
                  />
                </div>
              </motion.div>
            </>
          )}

          {/* ── Existing rejection reason ── */}
          {selectedRequest.status === FORGOT_PASSWORD_STATUS.REJECTED &&
            selectedRequest.rejectionReason && (
              <div className="space-y-2">
                <label className={cn(NEU_LABEL, "text-[#FF2157]")}>
                  Rejection Reason
                </label>
                <div
                  className={cn(
                    NEU_SURFACE_INSET,
                    "p-4 rounded-xl border border-[#FF2157]/15"
                  )}
                >
                  <p className={cn(NEU_MUTED, "text-[#FF2157]/80")}>
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              </div>
            )}

          {/* ── Reviewer info ── */}
          {selectedRequest.reviewer?.reviewedById && (
            <div
              className={cn(
                NEU_SURFACE_INSET_SM,
                "flex items-center gap-3 p-4 rounded-xl"
              )}
            >
              <div className={NEU_ICON_WELL}>
                <User className="h-4 w-4 text-[#006666]" />
              </div>
              <div>
                <p className={cn(NEU_LABEL, "mb-0.5")}>Reviewed By</p>
                <p className={INFO_VALUE}>{selectedRequest.reviewer.reviewerName}</p>
                <p className={INFO_SUB}>{selectedRequest.reviewer.reviewerEmail}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Footer ────────────────────────────────────────── */}
        <DialogFooter
          className={cn(
            "flex flex-col gap-2 sm:flex-row sm:gap-2 px-6 py-4",
            "border-t border-white/40"
          )}
        >
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className={cn(
              NEU_BTN_GHOST,
              "w-full sm:w-auto px-5 py-2.5 text-sm flex items-center justify-center gap-2",
              isUpdating && "opacity-50 cursor-not-allowed"
            )}
          >
            Cancel
          </button>

          {isPending && !isExpired && (
            <>
              <button
                onClick={handleReject}
                disabled={isUpdating || !rejectionReason.trim()}
                className={cn(
                  NEU_BTN_DANGER,
                  "w-full sm:w-auto px-5 py-2.5 text-sm flex items-center justify-center gap-2",
                  (isUpdating || !rejectionReason.trim()) &&
                  "opacity-40 cursor-not-allowed"
                )}
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject Request
              </button>

              <button
                onClick={handleApprove}
                disabled={isUpdating || !generatedPassword}
                className={cn(
                  NEU_BTN_PRIMARY,
                  "w-full sm:w-auto px-5 py-2.5 text-sm flex items-center justify-center gap-2",
                  (isUpdating || !generatedPassword) &&
                  "opacity-40 cursor-not-allowed shadow-none"
                )}
              >
                {isUpdating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve &amp; {sendEmail ? "Send Email" : "Update Password"}
              </button>
            </>
          )}

          {(isExpired || !isPending) && (
            <button
              onClick={handleClose}
              className={cn(
                NEU_BTN_PRIMARY,
                "w-full sm:w-auto px-5 py-2.5 text-sm flex items-center justify-center gap-2"
              )}
            >
              Close
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}