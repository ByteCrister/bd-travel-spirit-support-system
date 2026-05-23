"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiX, FiAlertTriangle } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "../ui/spinner";
import { useCurrentUserStore } from "@/store/current-user.store";
import { USER_ROLE } from "@/constants/user.const";
import { cn } from "@/lib/utils";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-white/60";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] font-[family-name:var(--font-space-mono)] text-[#1E2938]/70 font-bold " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2938]/20 disabled:opacity-40";
const NEU_BTN_DANGER =
  "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[4px_4px_8px_rgba(255,33,87,0.35),-2px_-2px_6px_rgba(255,100,130,0.4)] " +
  "hover:bg-[#e01a4a] hover:shadow-[6px_6px_12px_rgba(255,33,87,0.4),-3px_-3px_8px_rgba(255,100,130,0.4)] " +
  "active:shadow-[inset_3px_3px_6px_rgba(180,0,40,0.4),inset_-2px_-2px_4px_rgba(255,100,130,0.3)] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/40 disabled:opacity-50";
const NEU_BTN_ICON_CLOSE =
  "rounded-lg flex items-center justify-center bg-white/20 text-white " +
  "hover:bg-white/30 transition-all duration-200 disabled:opacity-50";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_AVATAR_RING =
  "shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff]";
// ─────────────────────────────────────────────────────────────

interface LogoutConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export function LogoutConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmationProps) {
  const { fullUser } = useCurrentUserStore();

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#1E2938]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={cn(NEU_CARD, "relative w-full max-w-sm overflow-hidden")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header band */}
            <div className="relative bg-[#FF2157] px-6 py-5">
              <button
                onClick={onClose}
                className={cn(NEU_BTN_ICON_CLOSE, "absolute top-4 right-4 h-7 w-7")}
                disabled={isLoggingOut}
                aria-label="Close"
              >
                <FiX className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                  <FiAlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-space-mono)] text-base font-bold text-white leading-tight">
                    Confirm Logout
                  </h3>
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-white/70 mt-0.5">
                    Are you sure you want to sign out?
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* User card */}
              <div
                className={cn(
                  "flex items-center gap-3 mb-5 p-3 rounded-xl",
                  "shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]"
                )}
              >
                <Avatar className={cn("h-11 w-11 flex-shrink-0", NEU_AVATAR_RING)}>
                  {fullUser?.role === USER_ROLE.SUPPORT && (
                    <AvatarImage src={fullUser.avatar} alt={fullUser?.fullName} />
                  )}
                  <AvatarFallback className="bg-[#006666] text-white text-xs font-bold font-[family-name:var(--font-space-mono)]">
                    {getInitials(fullUser?.fullName ?? "-")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className={cn(NEU_HEADING, "text-sm truncate")}>
                    {fullUser?.fullName}
                  </p>
                  <p className={cn(NEU_MUTED, "truncate text-xs")}>
                    {fullUser?.email}
                  </p>
                </div>
              </div>

              <p className={cn(NEU_MUTED, "mb-6 leading-relaxed")}>
                You will be signed out and redirected to the login page. Any unsaved changes will be lost.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoggingOut}
                  className={cn(NEU_BTN_GHOST, "flex-1 py-2.5 text-sm")}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoggingOut}
                  className={cn(NEU_BTN_DANGER, "flex-1 py-2.5 text-sm flex items-center justify-center gap-2")}
                >
                  {isLoggingOut ? (
                    <>
                      <Spinner />
                      <span>Signing Out…</span>
                    </>
                  ) : (
                    <>
                      <FiLogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}