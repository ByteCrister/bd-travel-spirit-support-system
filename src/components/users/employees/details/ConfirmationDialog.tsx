"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, RotateCcw, AlertTriangle, CheckCircle2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl border-none";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm sm:w-auto " +
  "font-[family-name:var(--font-space-mono)] px-4 py-2 " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
// ───────────────────────────────────────────────────────────────

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (s: boolean) => void;
  onConfirm: (reason: string) => void | Promise<void>;
  mode: "delete" | "restore";
  employeeName: string;
}

const DIALOG_CONFIG = {
  delete: {
    Icon: AlertTriangle,
    iconBg: "bg-[#FF2157]/10",
    iconColor: "text-[#FF2157]",
    infoBg: "bg-[#FE9900]/5 border border-[#FE9900]/20",
    infoText: "text-[#1E2938]",
    title: "Delete Employee Record?",
    description:
      "This will soft delete the employee record. The record can be restored later if needed.",
    ButtonIcon: Flame,
    buttonClass:
      "inline-flex items-center gap-1.5 rounded-xl bg-[#FF2157] text-white text-sm sm:w-auto " +
      "font-[family-name:var(--font-space-mono)] font-bold px-4 py-2 " +
      "shadow-[4px_4px_8px_#cc0040,-2px_-2px_6px_#ff4d7a] " +
      "hover:bg-[#e61f50] hover:shadow-[6px_6px_12px_#cc0040,-3px_-3px_8px_#ff4d7a] " +
      "active:shadow-[inset_3px_3px_6px_#cc0040,inset_-2px_-2px_4px_#ff4d7a] " +
      "disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200",
    buttonText: "Delete Record",
    loadingText: "Deleting…",
    placeholder: "Enter reason for deletion (minimum 10 characters)…",
  },
  restore: {
    Icon: CheckCircle2,
    iconBg: "bg-[#00A63D]/10",
    iconColor: "text-[#00A63D]",
    infoBg: "bg-[#00A63D]/5 border border-[#00A63D]/20",
    infoText: "text-[#1E2938]",
    title: "Restore Employee Record?",
    description:
      "This will restore the employee record and make it active again in the system.",
    ButtonIcon: RotateCcw,
    buttonClass:
      "inline-flex items-center gap-1.5 rounded-xl bg-[#00A63D] text-white text-sm sm:w-auto " +
      "font-[family-name:var(--font-space-mono)] font-bold px-4 py-2 " +
      "shadow-[4px_4px_8px_#007a2d,-2px_-2px_6px_#00cc4a] " +
      "hover:bg-[#009935] hover:shadow-[6px_6px_12px_#007a2d,-3px_-3px_8px_#00cc4a] " +
      "active:shadow-[inset_3px_3px_6px_#007a2d,inset_-2px_-2px_4px_#00cc4a] " +
      "disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200",
    buttonText: "Restore Record",
    loadingText: "Restoring…",
    placeholder: "Enter reason for restoration (minimum 10 characters)…",
  },
} as const;

function validateReason(value: string): string {
  if (!value.trim()) return "Reason is required";
  if (value.trim().length < 10) return "Reason must be at least 10 characters";
  if (value.trim().length > 500)
    return "Reason must be less than 500 characters";
  return "";
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  employeeName,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const cfg = DIALOG_CONFIG[mode];
  const { Icon, ButtonIcon } = cfg;

  const resetForm = () => {
    setReason("");
    setError("");
    setTouched(false);
    setIsLoading(false);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setReason(v);
    if (touched) setError(validateReason(v));
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateReason(reason));
  };

  const handleConfirm = async () => {
    setTouched(true);
    const ve = validateReason(reason);
    if (mode === "delete" && ve) {
      setError(ve);
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(reason.trim());
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error(`${mode} failed:`, err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}
    >
      <AlertDialogContent className="sm:max-w-md rounded-2xl bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-white/60 p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              <div className="p-6 space-y-5">
                <AlertDialogHeader>
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className={`mx-auto mb-2 w-14 h-14 rounded-2xl ${cfg.iconBg} flex items-center justify-center shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]`}
                  >
                    <Icon className={`h-7 w-7 ${cfg.iconColor}`} />
                  </motion.div>

                  <AlertDialogTitle
                    className={`text-center text-lg ${NEU_HEADING}`}
                  >
                    {cfg.title}
                  </AlertDialogTitle>

                  <AlertDialogDescription asChild>
                    <div className="space-y-3 text-center">
                      <span className={NEU_MUTED}>{cfg.description}</span>
                      {employeeName && (
                        <div className={`mt-2 p-3 rounded-xl ${cfg.infoBg}`}>
                          <p
                            className={`text-sm font-[family-name:var(--font-space-mono)] font-bold ${cfg.infoText}`}
                          >
                            Employee: {employeeName}
                          </p>
                        </div>
                      )}
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Reason textarea — delete only */}
                {mode === "delete" && (
                  <div className="space-y-2">
                    <label htmlFor="reason" className={NEU_LABEL}>
                      Reason *
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={handleReasonChange}
                      onBlur={handleBlur}
                      placeholder={cfg.placeholder}
                      rows={4}
                      disabled={isLoading}
                      className={`w-full p-3 resize-none ${NEU_SURFACE_INSET} text-[#1E2938] font-[family-name:var(--font-jetbrains-mono)] text-sm placeholder:text-[#1E2938]/40 focus:outline-none focus:ring-2 focus:ring-[#006666]/50 disabled:opacity-50 ${
                        error && touched ? "ring-2 ring-[#FF2157]/50" : ""
                      }`}
                    />
                    <div className="flex justify-between items-center">
                      {error && touched && (
                        <p className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">
                          {error}
                        </p>
                      )}
                      <p
                        className={`text-xs ml-auto font-[family-name:var(--font-jetbrains-mono)] ${
                          reason.length > 500
                            ? "text-[#FF2157]"
                            : "text-[#1E2938]/40"
                        }`}
                      >
                        {reason.length}/500
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <AlertDialogFooter className="px-6 pb-6 sm:flex-row sm:justify-center gap-2">
                <AlertDialogCancel
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={NEU_BTN_GHOST}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </AlertDialogCancel>

                <button
                  type="submit"
                  disabled={isLoading || (touched && !!error)}
                  className={cfg.buttonClass}
                >
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                      />
                      {cfg.loadingText}
                    </>
                  ) : (
                    <>
                      <ButtonIcon className="h-4 w-4" />
                      {cfg.buttonText}
                    </>
                  )}
                </button>
              </AlertDialogFooter>
            </form>
          </motion.div>
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  );
}
