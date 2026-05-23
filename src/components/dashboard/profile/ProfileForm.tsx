// Professional Profile Form Component
import { useState } from "react";
import { CurrentUser, RequestMeta } from "@/types/user/current-user.types";
import { Loader2, Save, User, Mail, CheckCircle2, XCircle, AlertCircle, Info, BarChart3, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

interface ProfileFormProps {
  fullUser: CurrentUser | null;
  isLoading: boolean;
  updateUserName: (data: { name: string }) => Promise<CurrentUser | null>;
  updateNameMeta?: RequestMeta;
}

export default function ProfileForm({
  fullUser,
  isLoading,
  updateUserName,
  updateNameMeta,
}: ProfileFormProps) {
  const [name, setName] = useState(() => {
    if (fullUser && "fullName" in fullUser && fullUser.fullName) return fullUser.fullName;
    if (fullUser && "user" in fullUser && fullUser.fullName) return fullUser.fullName;
    return "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    setShowSuccess(false);
    try {
      const result = await updateUserName({ name: name.trim() });
      if (result) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges =
    fullUser && "fullName" in fullUser
      ? name.trim() !== fullUser.fullName
      : name.trim() !== "";

  const completionPercentage = Math.min((name.trim().length / 30) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={NEU_CARD}>
        {/* Header */}
        <div className={`p-6 border-b ${NEU_DIVIDER}`}>
          <div className="flex items-start gap-4">
            <div className={NEU_ICON_WELL}>
              <User className="h-5 w-5 text-[#006666]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className={`text-xl ${NEU_HEADING}`}>Profile Information</h2>
                <AnimatePresence>
                  {hasChanges && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="h-2 w-2 rounded-full bg-[#FE9900] animate-pulse"
                    />
                  )}
                </AnimatePresence>
              </div>
              <p className={`mt-1 ${NEU_MUTED}`}>
                Manage your account details and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Full Name Field */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className={`flex items-center gap-2 ${NEU_LABEL}`}>
                <User className="h-3.5 w-3.5" />
                Full Name
              </label>
              {name.trim().length >= 2 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#00A63D]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Valid
                </motion.span>
              )}
            </div>

            <div className="relative">
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={isLoading || isSubmitting}
                className={`${NEU_INPUT} h-12 pl-11 pr-10`}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
              <AnimatePresence>
                {hasChanges && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#FE9900]"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Character progress */}
            <AnimatePresence>
              {name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`${NEU_LABEL} flex items-center gap-1.5`}>
                      <BarChart3 className="h-3 w-3" />
                      Profile completion
                    </span>
                    <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] font-semibold text-[#1E2938]">
                      {name.trim().length} / 30
                    </span>
                  </div>
                  <div className={`relative h-2 rounded-full overflow-hidden ${NEU_SURFACE_INSET_SM}`}>
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-[#006666] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Validation hint */}
            <AnimatePresence>
              {name.trim() && name.trim().length < 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`flex items-start gap-2 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                >
                  <AlertCircle className="h-4 w-4 text-[#FE9900] mt-0.5 shrink-0" />
                  <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70">
                    Name should be at least 2 characters
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Email Field (Read Only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <label className={`flex items-center gap-2 ${NEU_LABEL}`}>
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </label>
              <span className={`text-xs px-2 py-0.5 rounded-lg ${NEU_SURFACE_INSET_SM} font-[family-name:var(--font-space-mono)] text-[#1E2938]/50`}>
                Read Only
              </span>
            </div>

            <div className="relative">
              <input
                value={fullUser && "user" in fullUser ? fullUser.email : fullUser?.email || ""}
                disabled
                className={`${NEU_INPUT} h-12 pl-11 pr-12 opacity-60 cursor-not-allowed`}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className={`p-1.5 rounded-lg ${NEU_SURFACE_INSET_SM}`}>
                  <Lock className="h-3.5 w-3.5 text-[#1E2938]/40" />
                </div>
              </div>
            </div>

            <div className={`flex items-start gap-2 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
              <Info className="h-4 w-4 text-[#006666] mt-0.5 shrink-0" />
              <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60">
                Your email address is protected and cannot be changed. Contact support for assistance.
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t ${NEU_DIVIDER}`}
          >
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isLoading ||
                isSubmitting ||
                !name.trim() ||
                !hasChanges ||
                name.trim().length < 2
              }
              className={`h-11 px-6 text-sm ${NEU_BTN_PRIMARY}`}
            >
              <AnimatePresence mode="wait">
                {isSubmitting || updateNameMeta?.loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {hasChanges && !isSubmitting && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                >
                  <span className="h-2 w-2 rounded-full bg-[#FE9900] animate-pulse" />
                  <p className="text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60 uppercase tracking-widest">
                    Unsaved changes
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Success / Error */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${NEU_SURFACE_INSET_SM}`}
              >
                <CheckCircle2 className="h-4 w-4 text-[#00A63D] shrink-0" />
                <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]">
                  Your profile has been updated successfully.
                </p>
              </motion.div>
            )}

            {updateNameMeta?.error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`flex items-center gap-3 p-4 rounded-xl ${NEU_SURFACE_INSET_SM}`}
              >
                <XCircle className="h-4 w-4 text-[#FF2157] shrink-0" />
                <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]">
                  {updateNameMeta.error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}