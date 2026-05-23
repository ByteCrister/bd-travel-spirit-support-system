// components/guide/GuideDetailsActionConfirm.tsx
"use client";

import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiPause,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_DIALOG_CONTENT =
  "sm:max-w-md p-0 rounded-2xl border border-white/60 bg-[#E7E5E4] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const NEU_BODY = "p-6 space-y-5";

const NEU_ICON_WELL =
  "p-3 rounded-xl border-2 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const NEU_HEADING =
  "text-xl font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_DESCRIPTION =
  "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60";

const NEU_LABEL =
  "block text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] mb-1.5";

const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] px-3 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 " +
  "disabled:opacity-50 transition-all duration-200";

const NEU_INPUT_ERROR = "focus:ring-[#FF2157]/50";

const NEU_TEXTAREA =
  "min-h-[100px] resize-none rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 " +
  "placeholder:text-[#1E2938]/40 disabled:opacity-50 transition-all duration-200";

const NEU_FOOTER = "flex items-center gap-3 pt-2";

const NEU_BTN_GHOST =
  "flex-1 rounded-xl py-2.5 text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "transition-all duration-200";

// ─────────────────────────────────────────────────────────────────────────────

type ActionType = "approve" | "reject" | "suspend" | "unsuspend";

const actionConfig = {
  approve: {
    title: "Approve Guide",
    description: "This guide will be marked as approved and visible to users.",
    icon: FiCheckCircle,
    iconColor: "text-[#00A63D]",
    iconBg: "bg-[#00A63D]/10",
    iconBorder: "border-[#00A63D]/20",
    confirmBg:
      "bg-[#00A63D] shadow-[4px_4px_8px_#007a2d,-2px_-2px_6px_#00cc4a] " +
      "hover:bg-[#009935] hover:shadow-[6px_6px_12px_#007a2d,-3px_-3px_8px_#00cc4a] " +
      "active:shadow-[inset_3px_3px_6px_#007a2d,inset_-2px_-2px_4px_#00cc4a] " +
      "focus-visible:ring-[#00A63D]/50",
    buttonText: "Approve Guide",
  },
  reject: {
    title: "Reject Guide",
    description: "This guide will be rejected and the applicant notified.",
    icon: FiXCircle,
    iconColor: "text-[#FF2157]",
    iconBg: "bg-[#FF2157]/10",
    iconBorder: "border-[#FF2157]/20",
    confirmBg:
      "bg-[#FF2157] shadow-[4px_4px_8px_#cc1a45,-2px_-2px_6px_#ff4d75] " +
      "hover:bg-[#e01f4f] hover:shadow-[6px_6px_12px_#cc1a45,-3px_-3px_8px_#ff4d75] " +
      "active:shadow-[inset_3px_3px_6px_#cc1a45,inset_-2px_-2px_4px_#ff4d75] " +
      "focus-visible:ring-[#FF2157]/50",
    buttonText: "Reject Guide",
  },
  suspend: {
    title: "Suspend Guide",
    description:
      "This guide will be temporarily suspended until the specified date.",
    icon: FiPause,
    iconColor: "text-[#FE9900]",
    iconBg: "bg-[#FE9900]/10",
    iconBorder: "border-[#FE9900]/20",
    confirmBg:
      "bg-[#FE9900] shadow-[4px_4px_8px_#c27500,-2px_-2px_6px_#ffb833] " +
      "hover:bg-[#e68900] hover:shadow-[6px_6px_12px_#c27500,-3px_-3px_8px_#ffb833] " +
      "active:shadow-[inset_3px_3px_6px_#c27500,inset_-2px_-2px_4px_#ffb833] " +
      "focus-visible:ring-[#FE9900]/50",
    buttonText: "Suspend Guide",
  },
  unsuspend: {
    title: "Unsuspend Guide",
    description: "This guide will be reactivated and made available again.",
    icon: FiCheckCircle,
    iconColor: "text-[#006666]",
    iconBg: "bg-[#006666]/10",
    iconBorder: "border-[#006666]/20",
    confirmBg:
      "bg-[#006666] shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
      "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
      "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
      "focus-visible:ring-[#006666]/50",
    buttonText: "Unsuspend Guide",
  },
};

function GuideDetailsActionConfirm({
  open,
  onOpenChange,
  action,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ActionType;
  onConfirm: (payload?: { reason?: string; until?: Date }) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");
  const [isValid, setIsValid] = useState(false);

  const config = actionConfig[action];
  const requireReason =
    action === "reject" || action === "suspend" || action === "unsuspend";
  const requireDate = action === "suspend";

  useEffect(() => {
    if (requireReason && requireDate) {
      setIsValid(reason.trim().length > 0 && !!until);
    } else if (requireReason) {
      setIsValid(reason.trim().length > 0);
    } else {
      setIsValid(true);
    }
  }, [reason, until, requireReason, requireDate]);

  useEffect(() => {
    if (!open) {
      setReason("");
      setUntil("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!isValid || isLoading) return;
    const payload: { reason?: string; until?: Date } = {};
    if (requireReason) payload.reason = reason.trim();
    if (requireDate) payload.until = new Date(until);
    onConfirm(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={NEU_DIALOG_CONTENT}>
        <div className={NEU_BODY}>
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className={cn(NEU_ICON_WELL, config.iconBg, config.iconBorder)}
            >
              <config.icon
                className={cn("h-6 w-6", config.iconColor)}
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <DialogTitle className={NEU_HEADING}>{config.title}</DialogTitle>
              <DialogDescription className={cn(NEU_DESCRIPTION, "mt-1")}>
                {config.description}
              </DialogDescription>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {requireDate && (
              <div>
                <label htmlFor="suspend-until" className={NEU_LABEL}>
                  Suspend Until{" "}
                  <span className="text-[#FF2157]" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="suspend-until"
                  type="date"
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={isLoading}
                  aria-required="true"
                  className={cn(
                    NEU_INPUT,
                    !until && requireDate && NEU_INPUT_ERROR,
                  )}
                />
                {!until && requireDate && (
                  <p
                    className="mt-1.5 text-xs text-[#FF2157] flex items-center gap-1 font-[family-name:var(--font-jetbrains-mono)]"
                    role="alert"
                  >
                    <FiAlertCircle className="h-3 w-3" aria-hidden="true" />
                    Please select a date
                  </p>
                )}
              </div>
            )}

            {requireReason && (
              <div>
                <label htmlFor="action-reason" className={NEU_LABEL}>
                  Reason{" "}
                  <span className="text-[#FF2157]" aria-hidden="true">
                    *
                  </span>
                </label>
                <Textarea
                  id="action-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Provide a reason for ${action}ing this guide…`}
                  className={cn(
                    NEU_TEXTAREA,
                    reason.trim().length === 0 &&
                      requireReason &&
                      NEU_INPUT_ERROR,
                  )}
                  disabled={isLoading}
                  aria-required="true"
                />
                {reason.trim().length === 0 && requireReason && (
                  <p
                    className="mt-1.5 text-xs text-[#FF2157] flex items-center gap-1 font-[family-name:var(--font-jetbrains-mono)]"
                    role="alert"
                  >
                    <FiAlertCircle className="h-3 w-3" aria-hidden="true" />
                    Please provide a reason
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={NEU_FOOTER}>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={NEU_BTN_GHOST}
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid || isLoading}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm inline-flex items-center justify-center gap-2 ",
                "font-[family-name:var(--font-space-mono)] font-bold text-white ",
                "disabled:opacity-50 disabled:cursor-not-allowed ",
                "focus-visible:outline-none focus-visible:ring-2 ",
                "transition-all duration-200 ",
                config.confirmBg,
              )}
              aria-label={config.buttonText}
            >
              {isLoading ? (
                <>
                  <FiLoader
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Processing…
                </>
              ) : (
                <>
                  <config.icon className="h-4 w-4" aria-hidden="true" />
                  {config.buttonText}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GuideDetailsActionConfirm;
