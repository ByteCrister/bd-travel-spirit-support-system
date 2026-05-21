"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiSettings, FiLogOut, FiChevronDown } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUserStore } from "@/store/current-user.store";
import { USER_ROLE } from "@/constants/user.const";
import { cn } from "@/lib/utils";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_BTN =
  "flex items-center gap-2 rounded-xl p-1.5 bg-[#E7E5E4] " +
  "shadow-[3px_3px_7px_#c8c6c5,-3px_-3px_7px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_PANEL =
  "absolute right-0 top-12 z-50 w-64 rounded-2xl overflow-hidden " +
  "bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/60";
const NEU_MENU_ITEM =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70 " +
  "transition-all duration-200 " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_MENU_ITEM_DANGER =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]/70 " +
  "transition-all duration-200 " +
  "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/30";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
const NEU_AVATAR_WELL =
  "rounded-2xl bg-[#006666] shadow-[3px_3px_7px_#004d4d,-2px_-2px_5px_#008080]";
// ─────────────────────────────────────────────────────────────

interface ProfilePopoverProps {
  onViewProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function ProfilePopover({
  onViewProfile,
  onSettings,
  onLogout,
}: ProfilePopoverProps) {
  const { baseUser, fullUser, fetchFullUser, fetchBaseUser } =
    useCurrentUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const base = await fetchBaseUser();
        if (base?.role) await fetchFullUser(base.role);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setInitialLoadComplete(true);
      }
    };
    if (!initialLoadComplete || !baseUser) loadUserData();
  }, [fetchBaseUser, fetchFullUser, initialLoadComplete, baseUser]);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleLogoutClick = () => { onLogout?.(); setIsOpen(false); };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={NEU_BTN}
        whileTap={{ scale: 0.97 }}
        aria-label={`Profile menu for ${fullUser?.fullName}`}
        aria-expanded={isOpen}
      >
        <Avatar className="h-8 w-8 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
          {fullUser?.role === USER_ROLE.SUPPORT && (
            <AvatarImage src={fullUser?.avatar} alt={fullUser.fullName} />
          )}
          <AvatarFallback className="text-[10px] bg-[#006666] text-white font-bold font-[family-name:var(--font-space-mono)]">
            {getInitials(fullUser?.fullName ?? "-")}
          </AvatarFallback>
        </Avatar>

        <div className="hidden md:block text-left">
          <p className={cn(NEU_HEADING, "text-xs truncate max-w-24")}>
            {fullUser?.fullName}
          </p>
          <p className={cn(NEU_MUTED, "truncate max-w-24")}>{fullUser?.role}</p>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden md:block"
        >
          <FiChevronDown className="h-3.5 w-3.5 text-[#1E2938]/50" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={NEU_PANEL}
              role="dialog"
              aria-label="Profile menu"
            >
              {/* Profile header */}
              <div className="flex items-center gap-3 px-4 py-4">
                <div className={cn(NEU_AVATAR_WELL, "flex-shrink-0")}>
                  <Avatar className="h-11 w-11">
                    {fullUser?.role === USER_ROLE.SUPPORT && (
                      <AvatarImage src={fullUser.avatar} alt={fullUser.fullName} />
                    )}
                    <AvatarFallback className="text-sm bg-transparent text-white font-bold font-[family-name:var(--font-space-mono)]">
                      {getInitials(fullUser?.fullName ?? "-")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(NEU_HEADING, "text-sm truncate")}>
                    {fullUser?.fullName}
                  </p>
                  <p className={cn(NEU_MUTED, "truncate")}>{fullUser?.email}</p>
                  <span
                    className={cn(
                      "inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest",
                      "bg-[#006666]/10 text-[#006666]",
                      "font-[family-name:var(--font-space-mono)] font-bold",
                      "shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]"
                    )}
                  >
                    {fullUser?.role}
                  </span>
                </div>
              </div>

              <div className={cn("border-t mx-3 mb-2", NEU_DIVIDER)} />

              {/* Menu items */}
              <div className="px-2 pb-2 space-y-0.5">
                <motion.button
                  className={NEU_MENU_ITEM}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onViewProfile?.(); setIsOpen(false); }}
                >
                  <FiUser className="h-4 w-4" />
                  View Profile
                </motion.button>

                <motion.button
                  className={NEU_MENU_ITEM}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onSettings?.(); setIsOpen(false); }}
                >
                  <FiSettings className="h-4 w-4" />
                  Settings
                </motion.button>
              </div>

              <div className={cn("border-t mx-3", NEU_DIVIDER)} />

              <div className="px-2 py-2">
                <motion.button
                  className={NEU_MENU_ITEM_DANGER}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogoutClick}
                >
                  <FiLogOut className="h-4 w-4" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}