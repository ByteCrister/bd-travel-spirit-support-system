// components/guide/GuideModals.tsx
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiAlertCircle, FiMessageSquare, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_DIALOG_CONTENT =
  "sm:max-w-[540px] p-0 gap-0 overflow-hidden rounded-2xl " +
  "border border-white/60 bg-[#E7E5E4] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const NEU_DIALOG_HEADER_REJECT =
  "px-6 py-5 border-b border-[#1E2938]/10 bg-[#E7E5E4] flex items-start gap-4";

const NEU_DIALOG_HEADER_COMMENT =
  "px-6 py-5 border-b border-[#1E2938]/10 bg-[#E7E5E4] flex items-start gap-4";

const NEU_ICON_WELL_REJECT =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl " +
  "bg-[#FF2157]/10 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const NEU_ICON_WELL_COMMENT =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl " +
  "bg-[#006666]/10 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const NEU_HEADING =
  "text-xl font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_DESCRIPTION =
  "mt-1 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60";

const NEU_LABEL =
  "text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]";

const NEU_TEXTAREA =
  "min-h-[120px] resize-none rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200 " +
  "placeholder:text-[#1E2938]/40";

const NEU_TEXTAREA_ERROR = "focus:ring-[#FF2157]/50";

const NEU_CHAR_COUNT =
  "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40";

const NEU_INFO_BOX =
  "rounded-xl px-4 py-3 text-sm font-[family-name:var(--font-jetbrains-mono)] " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_FOOTER =
  "border-t border-[#1E2938]/10 bg-[#E7E5E4] px-6 py-4 flex-row justify-end gap-3";

const NEU_BTN_GHOST =
  "min-w-[100px] rounded-xl px-4 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "transition-all duration-200";

const NEU_BTN_DANGER =
  "min-w-[100px] rounded-xl px-4 py-2.5 text-sm inline-flex items-center gap-2 " +
  "font-[family-name:var(--font-space-mono)] font-bold text-white " +
  "bg-[#FF2157] shadow-[4px_4px_8px_#cc1a45,-2px_-2px_6px_#ff4d75] " +
  "hover:bg-[#e01f4f] hover:shadow-[6px_6px_12px_#cc1a45,-3px_-3px_8px_#ff4d75] " +
  "active:shadow-[inset_3px_3px_6px_#cc1a45,inset_-2px_-2px_4px_#ff4d75] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/50 " +
  "transition-all duration-200";

const NEU_BTN_PRIMARY =
  "min-w-[100px] rounded-xl px-4 py-2.5 text-sm inline-flex items-center gap-2 " +
  "font-[family-name:var(--font-space-mono)] font-bold text-white " +
  "bg-[#006666] shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "transition-all duration-200";

// ─────────────────────────────────────────────────────────────────────────────

type BaseProps = { open: boolean; onClose: () => void };
type RejectProps = BaseProps & { onSubmit: (reason: string) => void };
type CommentProps = BaseProps & { onSubmit: (comment: string) => void };

export function RejectReasonModal({ open, onClose, onSubmit }: RejectProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    onSubmit(value.trim());
    setValue("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setValue("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className={NEU_DIALOG_CONTENT}>
        {/* Header */}
        <DialogHeader className={cn(NEU_DIALOG_HEADER_REJECT, "space-y-0")}>
          <div className={NEU_ICON_WELL_REJECT}>
            <FiAlertCircle
              className="h-6 w-6 text-[#FF2157]"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 pt-0.5">
            <DialogTitle className={NEU_HEADING}>
              Reject Application
            </DialogTitle>
            <DialogDescription className={NEU_DESCRIPTION}>
              Provide a clear reason to help the applicant understand the
              decision.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="reject-reason" className={NEU_LABEL}>
              Reason for Rejection{" "}
              <span className="text-[#FF2157]" aria-hidden="true">
                *
              </span>
            </label>
            <Textarea
              id="reject-reason"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g., Incomplete documentation, missing certifications…"
              className={cn(NEU_TEXTAREA, error && NEU_TEXTAREA_ERROR)}
              aria-label="Rejection reason"
              aria-invalid={!!error}
              aria-describedby={error ? "reject-error" : undefined}
              maxLength={500}
            />
            {error && (
              <p
                id="reject-error"
                role="alert"
                className="text-xs text-[#FF2157] flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)]"
              >
                <FiAlertCircle
                  className="h-3.5 w-3.5 flex-shrink-0"
                  aria-hidden="true"
                />
                {error}
              </p>
            )}
            <p className={NEU_CHAR_COUNT}>{value.length}/500 characters</p>
          </div>

          <div
            className={cn(NEU_INFO_BOX, "bg-[#FE9900]/10 text-[#1E2938]/70")}
          >
            <strong className="font-[family-name:var(--font-space-mono)] font-bold">
              Note:
            </strong>{" "}
            This message will be sent to the applicant. Please be professional.
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className={NEU_FOOTER}>
          <button
            onClick={handleClose}
            className={NEU_BTN_GHOST}
            aria-label="Cancel rejection"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={NEU_BTN_DANGER}
            aria-label="Submit rejection"
          >
            <FiX className="h-4 w-4" aria-hidden="true" />
            Reject Application
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReviewCommentModal({ open, onClose, onSubmit }: CommentProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) {
      setError("Please enter a comment");
      return;
    }
    onSubmit(value.trim());
    setValue("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setValue("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className={NEU_DIALOG_CONTENT}>
        {/* Header */}
        <DialogHeader className={cn(NEU_DIALOG_HEADER_COMMENT, "space-y-0")}>
          <div className={NEU_ICON_WELL_COMMENT}>
            <FiMessageSquare
              className="h-6 w-6 text-[#006666]"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 pt-0.5">
            <DialogTitle className={NEU_HEADING}>
              Add Review Comment
            </DialogTitle>
            <DialogDescription className={NEU_DESCRIPTION}>
              Document your feedback and observations about this application.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="review-comment" className={NEU_LABEL}>
              Your Comment{" "}
              <span className="text-[#006666]" aria-hidden="true">
                *
              </span>
            </label>
            <Textarea
              id="review-comment"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g., Strong qualifications but needs additional verification…"
              className={cn(NEU_TEXTAREA, error && NEU_TEXTAREA_ERROR)}
              aria-label="Review comment"
              aria-invalid={!!error}
              aria-describedby={error ? "comment-error" : undefined}
              maxLength={500}
            />
            {error && (
              <p
                id="comment-error"
                role="alert"
                className="text-xs text-[#FF2157] flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)]"
              >
                <FiAlertCircle
                  className="h-3.5 w-3.5 flex-shrink-0"
                  aria-hidden="true"
                />
                {error}
              </p>
            )}
            <p className={NEU_CHAR_COUNT}>{value.length}/500 characters</p>
          </div>

          <div
            className={cn(NEU_INFO_BOX, "bg-[#006666]/10 text-[#1E2938]/70")}
          >
            <strong className="font-[family-name:var(--font-space-mono)] font-bold">
              Tip:
            </strong>{" "}
            Internal comments are only visible to reviewers and administrators.
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className={NEU_FOOTER}>
          <button
            onClick={handleClose}
            className={NEU_BTN_GHOST}
            aria-label="Cancel comment"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={NEU_BTN_PRIMARY}
            aria-label="Save comment"
          >
            <FiMessageSquare className="h-4 w-4" aria-hidden="true" />
            Save Comment
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}