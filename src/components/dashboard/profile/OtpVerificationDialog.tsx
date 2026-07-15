"use client";

import { useRef, useState, useEffect, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmailVerificationService } from "@/utils/api/email-verification.api";
import { EMAIL_VERIFICATION_PURPOSE } from "@/constants/email-verification-purpose.const";

// ── Neumorphism tokens (mirror PasswordUpdateForm) ────────────────────────────
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

interface OtpVerificationDialogProps {
  open: boolean;
  email: string;
  /** Called when OTP is verified successfully — caller should then do the actual password update */
  onVerified: () => void;
  onClose: () => void;
}

type DialogPhase = "sending" | "input" | "verifying" | "verified" | "error";

export default function OtpVerificationDialog({
  open,
  email,
  onVerified,
  onClose,
}: OtpVerificationDialogProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [phase, setPhase] = useState<DialogPhase>("sending");
  const [statusMessage, setStatusMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Send OTP ──────────────────────────────────────────────────────────────
  const sendOtp = useCallback(async () => {
    if (!email) return;
    const service = new EmailVerificationService(email);
    setPhase("sending");
    setStatusMessage("");
    const result = await service.sendVerificationEmail(
      EMAIL_VERIFICATION_PURPOSE.PASSWORD_RESET
    );
    if (result.success) {
      setPhase("input");
      setOtp(Array(OTP_LENGTH).fill(""));
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      // Start countdown
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      cooldownTimer.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimer.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      setPhase("error");
      setStatusMessage(result.message);
    }
  }, [email]);

  // ── Trigger send when dialog opens ───────────────────────────────────────
  useEffect(() => {
    if (open) {
      setOtp(Array(OTP_LENGTH).fill(""));
      setStatusMessage("");
      setPhase("sending");
      sendOtp();
    }
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, [open, sendOtp]);

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const verifyOtp = useCallback(async () => {
    if (!email) return;
    const token = otp.join("");
    if (token.length < OTP_LENGTH) return;
    const service = new EmailVerificationService(email);
    setPhase("verifying");
    setStatusMessage("");

    const result = await service.verifyToken(
      token,
      EMAIL_VERIFICATION_PURPOSE.PASSWORD_RESET
    );

    if (result.success) {
      setPhase("verified");
      setStatusMessage(result.message);
      // Brief success flash, then hand off
      setTimeout(() => {
        onVerified();
      }, 800);
    } else {
      setPhase("error");
      setStatusMessage(result.message);
      // Clear + reset after shake
      setTimeout(() => {
        setOtp(Array(OTP_LENGTH).fill(""));
        setPhase("input");
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }, 1800);
    }
  }, [otp, email, onVerified]);

  // ── Auto-verify when all digits filled ───────────────────────────────────
  useEffect(() => {
    if (otp.every((d) => d !== "") && phase === "input") {
      verifyOtp();
    }
  // verifyOtp is stable per otp change, safe to include
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, phase]);

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((ch, i) => {
      if (i < OTP_LENGTH) next[i] = ch;
    });
    setOtp(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const maskedEmail = email
    ? email.replace(/(.{2}).*(@.*)/, "$1****$2")
    : "your email";

  const isBusy = phase === "sending" || phase === "verifying";
  const isVerified = phase === "verified";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden border-0 shadow-none bg-transparent max-w-md w-full"
      >
        {/* Neumorphic card wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isBusy}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-xl
              bg-[#E7E5E4] text-[#1E2938]/40
              shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]
              hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]
              transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Close OTP dialog"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                <AnimatePresence mode="wait">
                  {isVerified ? (
                    <motion.span
                      key="ok-icon"
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-[#00A63D]" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="shield-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <ShieldCheck className="h-5 w-5 text-[#006666]" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <DialogTitle className={`text-lg ${NEU_HEADING}`}>
                  Verify Your Identity
                </DialogTitle>
                <DialogDescription className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-0.5">
                  Password change requires email verification
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          <div className="px-6 pt-5 pb-6 space-y-5">

            {/* Email banner */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${NEU_SURFACE_INSET}`}>
              <Mail className="h-4 w-4 text-[#006666] shrink-0" />
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70 leading-relaxed">
                A 6-digit code was sent to{" "}
                <span className="font-bold text-[#1E2938]">{maskedEmail}</span>
              </p>
            </div>

            {/* OTP digit inputs */}
            <div className="space-y-2">
              <label className={NEU_LABEL}>Enter verification code</label>
              <div className="flex items-center gap-2 justify-center pt-1">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={
                      phase === "error"
                        ? { x: [0, -7, 7, -5, 5, -3, 3, 0] }
                        : isVerified
                        ? { scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={
                      phase === "error"
                        ? { duration: 0.4, delay: i * 0.03 }
                        : isVerified
                        ? { duration: 0.35, delay: i * 0.07 }
                        : {}
                    }
                  >
                    <input
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      disabled={isBusy || isVerified}
                      aria-label={`Verification code digit ${i + 1}`}
                      className={[
                        "w-11 h-14 text-center text-xl font-bold rounded-xl select-none",
                        "font-[family-name:var(--font-space-mono)]",
                        "transition-all duration-200 focus:outline-none",
                        "disabled:cursor-not-allowed",
                        isVerified
                          ? "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] text-[#00A63D] bg-[#E7E5E4]"
                          : phase === "error"
                          ? "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] text-[#FF2157] bg-[#E7E5E4]"
                          : otp[i]
                          ? "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] text-[#006666] bg-[#E7E5E4] ring-2 ring-[#006666]/30"
                          : "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] text-[#1E2938] bg-[#E7E5E4] focus:shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] focus:ring-2 focus:ring-[#006666]/30",
                      ].join(" ")}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Separator dots */}
            <div className="flex justify-center gap-1">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1 rounded-full"
                  animate={{
                    width: otp[i] ? "1.5rem" : "0.4rem",
                    backgroundColor: isVerified
                      ? "#00A63D"
                      : phase === "error"
                      ? "#FF2157"
                      : otp[i]
                      ? "#006666"
                      : "#1E293820",
                  }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>

            {/* Status messages */}
            <AnimatePresence mode="wait">
              {phase === "sending" && (
                <motion.div
                  key="sending-msg"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl ${NEU_SURFACE_INSET}`}
                >
                  <Loader2 className="h-4 w-4 text-[#006666] animate-spin shrink-0" />
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70">
                    Sending verification code…
                  </p>
                </motion.div>
              )}

              {phase === "verifying" && (
                <motion.div
                  key="verifying-msg"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl ${NEU_SURFACE_INSET}`}
                >
                  <Loader2 className="h-4 w-4 text-[#006666] animate-spin shrink-0" />
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/70">
                    Verifying code…
                  </p>
                </motion.div>
              )}

              {isVerified && (
                <motion.div
                  key="verified-msg"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl ${NEU_SURFACE_INSET}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-[#00A63D] shrink-0" />
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#00A63D]">
                    {statusMessage || "Verified! Applying password update…"}
                  </p>
                </motion.div>
              )}

              {phase === "error" && (
                <motion.div
                  key="error-msg"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl ${NEU_SURFACE_INSET}`}
                >
                  <AlertTriangle className="h-4 w-4 text-[#FF2157] shrink-0" />
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]">
                    {statusMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer: Resend + Verify button */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={sendOtp}
                disabled={resendCooldown > 0 || isBusy || isVerified}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs ${NEU_BTN_GHOST} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <RefreshCw className="h-3 w-3" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
              </button>

              <button
                type="button"
                onClick={verifyOtp}
                disabled={otp.some((d) => !d) || isBusy || isVerified}
                className={`h-10 px-5 text-sm flex items-center gap-2 ${NEU_BTN_PRIMARY}`}
              >
                {phase === "verifying" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
