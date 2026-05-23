"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, RefreshCw, Shield, CheckCircle2, XCircle, AlertTriangle, Lock } from "lucide-react";
import generateStrongPassword from "@/utils/helpers/generate-strong-password";
import { useCurrentUserStore } from "@/store/current-user.store";

// ── Neumorphism tokens ────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

const STRENGTH_CONFIG = {
  weak: { label: "Weak", color: "bg-[#FF2157]", pct: 33 },
  medium: { label: "Fair", color: "bg-[#FE9900]", pct: 66 },
  strong: { label: "Strong", color: "bg-[#00A63D]", pct: 100 },
};

export default function PasswordUpdateForm() {
  const { updateUserPassword, updatePasswordMeta } = useCurrentUserStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGeneratePassword = () => {
    const strong = generateStrongPassword();
    setFormData((p) => ({ ...p, newPassword: strong, confirmPassword: strong }));
    setShowNewPassword(true);
    setShowConfirmPassword(true);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    if (score <= 2) return "weak";
    if (score <= 3) return "medium";
    return "strong";
  };

  const strengthKey = getPasswordStrength(formData.newPassword);
  const strengthCfg = strengthKey ? STRENGTH_CONFIG[strengthKey] : null;

  const validateForm = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setShowSuccess(false);
    if (!validateForm()) return;
    await updateUserPassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
    if (!updatePasswordMeta?.error) {
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  };

  const requirements = [
    { met: formData.newPassword.length >= 8, label: "8+ characters" },
    { met: /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword), label: "Upper & lowercase" },
    { met: /\d/.test(formData.newPassword), label: "Number" },
    { met: /[^a-zA-Z0-9]/.test(formData.newPassword), label: "Special character" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className={NEU_CARD}>
        {/* Header */}
        <div className={`p-6 border-b ${NEU_DIVIDER}`}>
          <div className="flex items-start gap-4">
            <div className={NEU_ICON_WELL}>
              <Shield className="h-5 w-5 text-[#006666]" />
            </div>
            <div>
              <h2 className={`text-xl ${NEU_HEADING}`}>Change Password</h2>
              <p className={`mt-1 ${NEU_MUTED}`}>Update your password to keep your account secure</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Password */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-3">
            <label htmlFor="currentPassword" className={`flex items-center gap-2 ${NEU_LABEL}`}>
              <Lock className="h-3.5 w-3.5" /> Current Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter your current password"
                disabled={updatePasswordMeta?.loading}
                className={`${NEU_INPUT} h-12 pl-11 pr-12`}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${NEU_BTN_ICON}`}
                aria-label="Toggle current password visibility"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>

          {/* Divider */}
          <div className={`border-t ${NEU_DIVIDER}`} />

          {/* New Password + Generate */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="newPassword" className={`flex items-center gap-2 ${NEU_LABEL}`}>
                <Shield className="h-3.5 w-3.5" /> New Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs ${NEU_BTN_GHOST}`}
              >
                <RefreshCw className="h-3 w-3" /> Generate
              </button>
            </div>

            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Enter new password"
                disabled={updatePasswordMeta?.loading}
                className={`${NEU_INPUT} h-12 pl-11 pr-12`}
              />
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${NEU_BTN_ICON}`}
                aria-label="Toggle new password visibility"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength bar */}
            <AnimatePresence>
              {strengthCfg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={NEU_LABEL}>Strength</span>
                    <span className={`text-xs font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[#1E2938]`}>
                      {strengthCfg.label}
                    </span>
                  </div>
                  <div className={`relative h-2 rounded-full overflow-hidden ${NEU_SURFACE_INSET_SM}`}>
                    <motion.div
                      className={`absolute inset-y-0 left-0 rounded-full ${strengthCfg.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${strengthCfg.pct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Requirements checklist */}
            <AnimatePresence>
              {formData.newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl ${NEU_SURFACE_INSET_SM} grid grid-cols-2 gap-2`}
                >
                  {requirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2">
                      {req.met
                        ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00A63D] shrink-0" />
                        : <div className="h-3.5 w-3.5 rounded-full border border-[#1E2938]/30 shrink-0" />
                      }
                      <span className={`text-xs font-[family-name:var(--font-jetbrains-mono)] ${req.met ? "text-[#1E2938]" : "text-[#1E2938]/50"}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Confirm Password */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
            <label htmlFor="confirmPassword" className={`flex items-center gap-2 ${NEU_LABEL}`}>
              <Lock className="h-3.5 w-3.5" /> Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                disabled={updatePasswordMeta?.loading}
                className={`${NEU_INPUT} h-12 pl-11 pr-12`}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${NEU_BTN_ICON}`}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <AnimatePresence>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className={`flex items-center gap-2 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                >
                  <XCircle className="h-4 w-4 text-[#FF2157] shrink-0" />
                  <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]">Passwords do not match</p>
                </motion.div>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <motion.div initial={{ opacity: 0, y: -4, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                >
                  <CheckCircle2 className="h-4 w-4 text-[#00A63D] shrink-0" />
                  <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#00A63D]">Passwords match</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Status messages */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${NEU_SURFACE_INSET_SM}`}
              >
                <CheckCircle2 className="h-4 w-4 text-[#00A63D] shrink-0" />
                <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]">
                  Your password has been updated successfully!
                </p>
              </motion.div>
            )}
            {(error || updatePasswordMeta?.error) && (
              <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${NEU_SURFACE_INSET_SM}`}
              >
                <AlertTriangle className="h-4 w-4 text-[#FF2157] shrink-0" />
                <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]">
                  {error || updatePasswordMeta?.error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t ${NEU_DIVIDER}`}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                updatePasswordMeta?.loading ||
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword ||
                formData.newPassword !== formData.confirmPassword
              }
              className={`h-11 px-6 text-sm flex-1 sm:flex-none ${NEU_BTN_PRIMARY}`}
            >
              <AnimatePresence mode="wait">
                {updatePasswordMeta?.loading ? (
                  <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </motion.span>
                ) : (
                  <motion.span key="update" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Update Password
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {(error || updatePasswordMeta?.error) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                type="button"
                onClick={() => setError("")}
                className={`h-11 px-4 ${NEU_BTN_GHOST}`}
              >
                Clear Error
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}