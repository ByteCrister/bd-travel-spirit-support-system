"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ViewProfile } from "./ViewProfile";
import { Settings } from "./Settings";
import { LogoutConfirmation } from "./LogoutConfirmation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sidebar collapse state (shared)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Modal states
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    if (!mobile) setIsMobileMenuOpen(false);
    setIsMobile(mobile);
  }, []);

  useEffect(() => {
    checkMobile();
    setIsLoading(false);

    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [checkMobile]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMenuClick = useCallback(() => setIsMobileMenuOpen((prev) => !prev), []);

  const handleLogoutClick = useCallback(() => setShowLogoutConfirm(true), []);

  const handleLogoutCancel = useCallback(() => setShowLogoutConfirm(false), []);

  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isMobileMenuOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      // NextAuth sign out
      await signOut({ callbackUrl: "/signin" });
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };
  // Dynamic left offset for desktop
  const desktopLeft = isCollapsed ? "lg:left-20" : "lg:left-72"; // 80px vs 288px

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      {isMobile ? (
        <Sidebar
          isMobile
          onClose={closeMobileMenu}
          isOpen={isMobileMenuOpen}
          isCollapsed={false}
          setIsCollapsed={setIsCollapsed}
        />
      ) : (
        <Sidebar
          isMobile={false}
          onClose={() => { }}
          isOpen={true}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* Topbar */}
      <Topbar
        onMenuClick={toggleMenuClick}
        isMobile={isMobile}
        isCollapsed={isCollapsed}
        onViewProfile={() => setShowViewProfile(true)}
        onSettings={() => setShowSettings(true)}
        onLogout={handleLogoutClick}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "fixed top-16 bottom-0 overflow-y-auto transition-all duration-300 ease-in-out",
          "scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent",
          isMobile ? "left-0 right-0" : `right-0 ${desktopLeft}`
        )}
      >
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-full p-4 lg:p-6"
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </motion.main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <ViewProfile
        isOpen={showViewProfile}
        onClose={() => setShowViewProfile(false)}
        onEditProfile={() => setShowSettings(true)}
      />
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
