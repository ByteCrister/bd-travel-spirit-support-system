"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ViewProfile } from "./ViewProfile";
import { Settings } from "./Settings";
import { LogoutConfirmation } from "./LogoutConfirmation";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Optimized mobile detection with debouncing
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024;

    // if switching to desktop, close menu
    if (!mobile) {
      setIsMobileMenuOpen(false);
    }

    setIsMobile(mobile);
  }, []);


  useEffect(() => {
    // Initial check
    checkMobile();
    setIsLoading(false);

    // Debounced resize handler
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

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const openMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  // Logout handlers
  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    // Simulate logout process
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Logging out...");
    setIsLoggingOut(false);
    setShowLogoutConfirm(false);
  }, []);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  // Prevent body scroll when mobile menu is open
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      {isMobile ? (
        <Sidebar
          isMobile
          onClose={closeMobileMenu}
          isOpen={isMobileMenuOpen}
        />
      ) : (
        <Sidebar
          isMobile={false}
          onClose={() => { }}
          isOpen={true} // always open on desktop
        />
      )}

      {/* Topbar */}
      <Topbar
        onMenuClick={openMobileMenu}
        isMobile={isMobile}
        onViewProfile={() => setShowViewProfile(true)}
        onSettings={() => setShowSettings(true)}
        onLogout={handleLogoutClick}
      />

      {/* Main Content Area */}
      <div className={cn(
        "fixed top-16 bottom-0 overflow-y-auto transition-all duration-300 ease-in-out",
        "scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent",
        isMobile ? "left-0 right-0" : "left-0 right-0 lg:left-80"
      )}>
        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="min-h-full p-4 lg:p-6"
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
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

      {/* Modals - Rendered at the top level */}
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
        onConfirm={handleLogoutConfirm}
        isLoggingOut={isLoggingOut}
      />
    </div>
  );
}
