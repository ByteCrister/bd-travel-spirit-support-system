"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiHeadphones,
  FiFileText,
  FiShare2,
  FiImage,
  FiGift,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronRight,
  FiCreditCard,
  FiTag,
  FiGlobe,
} from "react-icons/fi";
import { FaComments, FaUsers } from "react-icons/fa";
import { HiOutlineChartSquareBar, HiOutlineUser } from "react-icons/hi";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { Compass, KeyRound, ShieldCheck, Sparkles, Globe } from "lucide-react";
import { MdBusiness, MdTravelExplore } from "react-icons/md";
import { usePathname } from "next/navigation";
import { TbPasswordFingerprint, TbReceipt } from "react-icons/tb";
import { useCurrentUserStore } from "@/store/current-user.store";
import { USER_ROLE } from "@/constants/user.const";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SIDEBAR =
  "bg-[#E7E5E4] shadow-[4px_0_24px_#c8c6c5,-2px_0_8px_#ffffff]";
const NEU_BTN_ICON =
  "rounded-xl flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_GROUP_BTN =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-[#1E2938]/60 " +
  "transition-all duration-200 " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666]";
const NEU_GROUP_BTN_ACTIVE =
  "bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] text-[#006666]";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_LOGO_WELL =
  "flex items-center justify-center rounded-2xl bg-[#006666] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";
// ─────────────────────────────────────────────────────────────

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
  isOpen?: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    icon: FiHome,
    items: [
      { href: "/dashboard/overview", label: "Dashboard", icon: FiHome },
      {
        href: "/dashboard/statistics",
        label: "Statistics",
        icon: HiOutlineChartSquareBar,
        adminOnly: true,
      },
      { href: "/dashboard/profile", label: "Profile", icon: HiOutlineUser },
      { href: "/dashboard/ai-chat", label: "AI Assistant", icon: Sparkles },
    ],
  },
  {
    title: "Users",
    icon: FiUsers,
    items: [
      { href: "/users/travelers", label: "Travelers", icon: ShieldCheck },
      { href: "/users/guides", label: "Guides", icon: MdTravelExplore },
      { href: "/users/companies", label: "Companies", icon: MdBusiness },
      {
        href: "/users/employees",
        label: "Employees",
        icon: FaUsers,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Support",
    icon: FiFileText,
    items: [
      { href: "/support/users", label: "Users", icon: FiHeadphones },
      { href: "/support/tours", label: "Tour Approval", icon: Compass },
      { href: "/support/articles", label: "Articles", icon: FiFileText },
      {
        href: "/support/article-comments",
        label: "Article Comments",
        icon: FaComments,
      },
      {
        href: "/support/guide-password-requests",
        label: "Guide Password Requests",
        icon: KeyRound,
      },
      {
        href: "/support/reset-password-requests",
        label: "Employees Password Requests",
        icon: TbPasswordFingerprint,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Social",
    icon: FiShare2,
    items: [
      { href: "/social/ads", label: "Ads", icon: FiImage, adminOnly: true },
      {
        href: "/social/promotions",
        label: "Promotions",
        icon: FiGift,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Settings",
    icon: FiSettings,
    items: [
      {
        href: "/setting/advertising",
        label: "Advertising",
        icon: FiImage,
        adminOnly: true,
      },
      {
        href: "/setting/guide-subscriptions",
        label: "Guide Subscriptions",
        icon: FiCreditCard,
        adminOnly: true,
      },
      {
        href: "/setting/guide-banners",
        label: "Guide Banners",
        icon: FiFileText,
        adminOnly: true,
      },
      {
        href: "/setting/enums",
        label: "Enums",
        icon: FiTag,
        adminOnly: true,
      },
      {
        href: "/setting/payment-accounts",
        label: "Payment Accounts",
        icon: TbReceipt,
        adminOnly: true,
      },
      {
        href: "/setting/footer",
        label: "Footer",
        icon: FiGlobe,
        adminOnly: true,
      },
    ],
  },
];

export function Sidebar({
  isMobile = false,
  onClose,
  isOpen = false,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    navigationGroups.map((group) => group.title),
  );
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  const { baseUser } = useCurrentUserStore();
  const isAdmin = baseUser?.role === USER_ROLE.ADMIN;

  useEffect(() => {
    if (pathname.startsWith("/customer-support") && !hasAutoCollapsed) {
      if (isMobile && isOpen && onClose) {
        onClose();
      } else if (!isMobile && !isCollapsed) {
        setIsCollapsed(true);
      }
      setHasAutoCollapsed(true);
    } else if (!pathname.startsWith("/customer-support")) {
      setHasAutoCollapsed(false);
    }
  }, [
    hasAutoCollapsed,
    isCollapsed,
    isMobile,
    isOpen,
    onClose,
    pathname,
    setIsCollapsed,
  ]);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupTitle)
        ? prev.filter((t) => t !== groupTitle)
        : [...prev, groupTitle],
    );
  };

  const sidebarVariants = {
    expanded: { width: 288 },
    collapsed: { width: 80 },
  };
  const mobileVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };

  return (
    <motion.aside
      initial={false}
      animate={
        isMobile
          ? isOpen
            ? "open"
            : "closed"
          : isCollapsed
            ? "collapsed"
            : "expanded"
      }
      variants={isMobile ? mobileVariants : sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col",
        NEU_SURFACE,
        NEU_SIDEBAR,
        "border-r",
        NEU_DIVIDER,
        isMobile ? "w-80" : "w-80 lg:relative lg:z-auto",
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className={cn(
          "border-b p-4",
          NEU_DIVIDER,
          isCollapsed
            ? "flex flex-col items-center gap-3"
            : "flex items-center justify-between",
        )}
      >
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              {/* Brand icon — BD text in teal neumorphic well */}
              <div className={cn(NEU_LOGO_WELL, "h-10 w-10")}>
                <span className="text-white font-bold text-lg tracking-tight font-[family-name:var(--font-space-mono)]">
                  BD
                </span>
              </div>

              <div>
                <h1 className={cn(NEU_HEADING, "text-base leading-tight")}>
                  BD Travel Spirit
                </h1>
                <p className={NEU_MUTED}>Admin Dashboard</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className={cn(NEU_LOGO_WELL, "h-11 w-11")}
            >
              <Globe className="h-5 w-5 text-white" strokeWidth={2} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop collapse toggle */}
        {!isMobile && (
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(NEU_BTN_ICON, "h-8 w-8", isCollapsed && "mt-2")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FiMenu className="h-4 w-4" />
            ) : (
              <FiX className="h-4 w-4" />
            )}
          </motion.button>
        )}

        {/* Mobile close */}
        {isMobile && (
          <motion.button
            onClick={onClose}
            className={cn(NEU_BTN_ICON, "h-8 w-8")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Close sidebar"
          >
            <FiX className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.adminOnly) return isAdmin;
            return true;
          });
          if (visibleItems.length === 0) return null;

          const isGroupActive = expandedGroups.includes(group.title);

          return (
            <div key={group.title}>
              {/* Group header button */}
              <motion.button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  NEU_GROUP_BTN,
                  isGroupActive && NEU_GROUP_BTN_ACTIVE,
                  isCollapsed && "justify-center px-2 py-3",
                )}
                whileTap={{ scale: 0.98 }}
                aria-expanded={isGroupActive}
                aria-controls={`nav-group-${group.title.toLowerCase()}`}
              >
                <group.icon
                  className={cn(
                    "flex-shrink-0 transition-colors duration-200",
                    isCollapsed ? "h-6 w-6" : "h-5 w-5",
                    isGroupActive ? "text-[#006666]" : "text-[#1E2938]/50",
                  )}
                />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-1 items-center justify-between"
                    >
                      <span className="text-sm">{group.title}</span>
                      <motion.div
                        animate={{ rotate: isGroupActive ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FiChevronRight className="h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Group items */}
              <AnimatePresence>
                {!isCollapsed && isGroupActive && (
                  <motion.div
                    id={`nav-group-${group.title.toLowerCase()}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    className="ml-5 mt-1 space-y-0.5 overflow-hidden border-l-2 border-[#006666]/20 pl-3"
                    role="group"
                    aria-label={`${group.title} navigation items`}
                  >
                    {visibleItems.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        onClick={isMobile ? onClose : undefined}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className={cn("border-t p-4", NEU_DIVIDER)}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded-footer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-lg bg-[#006666]/10",
                  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
                )}
              >
                <Globe className="h-3 w-3 text-[#006666]" />
              </div>
              <p
                className={cn(
                  NEU_MUTED,
                  "font-[family-name:var(--font-space-mono)] text-[10px] uppercase tracking-widest",
                )}
              >
                Travel Spirit v1.0
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-footer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl",
                  "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
                )}
              >
                <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#006666]">
                  TS
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
