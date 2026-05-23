"use client";

import { motion } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import { SearchBar } from "./SearchBar";
import { NotificationMenu } from "./NotificationMenu";
import { AdminAvatars } from "./AdminAvatars";
import { ProfilePopover } from "./ProfilePopover";
import { cn } from "@/lib/utils";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_TOPBAR =
  "bg-[#E7E5E4] shadow-[0_4px_16px_#c8c6c5,0_-2px_8px_#ffffff] border-b border-white/60";

const NEU_BTN_PRIMARY_ICON =
  "rounded-xl flex items-center justify-center bg-[#006666] text-white " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
  "transition-all duration-200";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
// ─────────────────────────────────────────────────────────────

interface TopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onViewProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function Topbar({
  onMenuClick,
  isMobile = false,
  isCollapsed = false,
  onViewProfile,
  onSettings,
  onLogout,
}: TopbarProps) {
  const desktopLeft = isCollapsed ? "lg:left-20" : "lg:left-72";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed top-0 right-0 z-50 flex h-16 items-center justify-between",
        NEU_TOPBAR,
        isMobile ? "px-4 left-0" : `px-6 ${desktopLeft}`
      )}
      role="banner"
    >
      {/* ── Left ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <motion.button
            onClick={onMenuClick}
            className={cn(NEU_BTN_PRIMARY_ICON, "h-10 w-10")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open navigation menu"
          >
            <FiMenu className="h-5 w-5" />
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:block"
        >
          <h1 className={cn(NEU_HEADING, "text-lg")}>Dashboard</h1>
          <p className={NEU_MUTED}>Welcome back, Admin</p>
        </motion.div>
      </div>

      {/* ── Center – Search ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 max-w-md mx-4"
      >
        <SearchBar isMobile={isMobile} />
      </motion.div>

      {/* ── Right ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <NotificationMenu />

        <div className="hidden lg:block">
          <AdminAvatars />
        </div>

        <ProfilePopover
          onViewProfile={onViewProfile}
          onSettings={onSettings}
          onLogout={onLogout}
        />
      </motion.div>
    </motion.header>
  );
}