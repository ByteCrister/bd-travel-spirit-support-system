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

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_SCROLLBAR =
  "scrollbar-thin scrollbar-thumb-[#c8c6c5] scrollbar-track-transparent";
// ─────────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); clearTimeout(timeoutId); };
  }, [checkMobile]);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const toggleMenuClick = useCallback(() => setIsMobileMenuOpen((p) => !p), []);
  const handleLogoutClick = useCallback(() => setShowLogoutConfirm(true), []);
  const handleLogoutCancel = useCallback(() => setShowLogoutConfirm(false), []);

  useEffect(() => {
    document.body.style.overflow = isMobile && isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobile, isMobileMenuOpen]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" });
      setTimeout(() => { window.location.href = "/"; }, 300);
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const desktopLeft = isCollapsed ? "lg:left-20" : "lg:left-72";

  return (
    <div className={NEU_PAGE_BG}>
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
          onClose={() => {}}
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

      {/* Main content */}
      <div
        className={cn(
          "fixed top-16 bottom-0 overflow-y-auto transition-all duration-300 ease-in-out",
          NEU_SCROLLBAR,
          isMobile ? "left-0 right-0" : `right-0 ${desktopLeft}`
        )}
      >
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="min-h-full"
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </motion.main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#1E2938]/40 backdrop-blur-sm lg:hidden"
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