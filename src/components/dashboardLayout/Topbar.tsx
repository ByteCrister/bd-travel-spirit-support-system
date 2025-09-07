"use client";

import { motion } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import { SearchBar } from "./SearchBar";
import { NotificationMenu } from "./NotificationMenu";
import { AdminAvatars } from "./AdminAvatars";
import { ProfilePopover } from "./ProfilePopover";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onViewProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function Topbar({ onMenuClick, isMobile = false, isCollapsed = false, onViewProfile, onSettings, onLogout }: TopbarProps) {
  const desktopLeft = isCollapsed ? "lg:left-20" : "lg:left-72"; // 80px vs 288px
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "fixed top-0 right-0 z-50 flex h-16 items-center justify-between",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60",
        "shadow-lg shadow-slate-200/10 dark:shadow-slate-900/10",
        "supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-slate-900/80",
        isMobile ? "px-4 left-0" : `px-6 ${desktopLeft}`
      )}
      role="banner"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {isMobile && (
          <motion.button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <FiMenu className="h-5 w-5" />
          </motion.button>
        )}

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden md:block"
        >
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-display">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Welcome back, Admin</p>
        </motion.div>
      </div>

      {/* Center Section - Search */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 max-w-md mx-4"
      >
        <SearchBar
          isMobile={isMobile}
        />
      </motion.div>

      {/* Right Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        {/* Notifications */}
        <NotificationMenu />

        {/* Admin Avatars */}
        <div className="hidden lg:block">
          <AdminAvatars />
        </div>

        {/* Profile Popover */}
        <ProfilePopover
          onViewProfile={onViewProfile}
          onSettings={onSettings}
          onLogout={onLogout}
        />
      </motion.div>
    </motion.header>
  );
}
