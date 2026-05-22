"use client";

import { motion } from "framer-motion";
import {
  FiUsers, FiMapPin, FiVolume2, FiBarChart2, FiMessageSquare,
  FiInbox, FiFlag, FiSettings, FiPlus, FiEye,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { USER_ROLE, UserRole } from "@/constants/user.const";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";

// Action button: raised neu look, pressed on active
const NEU_ACTION_BTN =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/60 " +
  "hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] hover:-translate-y-0.5 " +
  "active:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] active:translate-y-0 " +
  "transition-all duration-200 cursor-pointer text-left w-full";

// ── Action definitions ────────────────────────────────────────────────────────
const supportActions = [
  { id: "manage-tickets",  title: "Manage Tickets",  description: "View and respond to support tickets",     icon: FiMessageSquare, accent: "#3B82F6" },
  { id: "support-inbox",   title: "Support Inbox",   description: "Check messages and inquiries",            icon: FiInbox,         accent: "#00A63D" },
  { id: "review-reports",  title: "Review Reports",  description: "Investigate user reports and complaints", icon: FiFlag,          accent: "#FE9900" },
  { id: "user-management", title: "User Management", description: "Manage user accounts and permissions",    icon: FiUsers,         accent: "#8B5CF6" },
];

const adminActions = [
  { id: "manage-users",        title: "Manage Users",        description: "View and manage all user accounts",     icon: FiUsers,       accent: "#3B82F6" },
  { id: "view-tours",          title: "View Tours",          description: "Review and approve tour listings",      icon: FiMapPin,      accent: "#00A63D" },
  { id: "add-announcement",    title: "Add Announcement",    description: "Create new system announcements",       icon: FiVolume2,     accent: "#FE9900" },
  { id: "finance-reports",     title: "Finance Reports",     description: "View revenue and financial analytics",  icon: FiBarChart2,   accent: "#8B5CF6" },
  { id: "system-settings",     title: "System Settings",     description: "Configure system-wide settings",        icon: FiSettings,    accent: "#6366F1" },
  { id: "analytics-dashboard", title: "Analytics Dashboard", description: "View detailed analytics and insights",  icon: FiEye,         accent: "#006666" },
];

interface QuickActionsProps {
  userRole: UserRole;
  onAction?: (action: string) => void;
  className?: string;
}

export function QuickActions({ userRole, onAction, className }: QuickActionsProps) {
  const actions = userRole === USER_ROLE.ADMIN ? adminActions : supportActions;

  return (
    <div className={cn(NEU_CARD, "p-5", className)}>
      {/* Header */}
      <div className={cn("flex items-center gap-2.5 pb-4 mb-4 border-b", NEU_DIVIDER)}>
        <div className="p-2 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
          <FiPlus className="h-4 w-4 text-[#006666]" />
        </div>
        <h3 className={cn(NEU_HEADING, "text-base")}>Quick Actions</h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAction?.(action.id)}
              aria-label={action.title}
              className={cn(NEU_ACTION_BTN, "p-3.5 flex items-center gap-3 min-h-[72px]")}
            >
              {/* Icon badge */}
              <div
                className="flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]"
                style={{ backgroundColor: `${action.accent}18` }}
              >
                <Icon className="h-5 w-5" style={{ color: action.accent }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(NEU_HEADING, "text-sm truncate")}>{action.title}</p>
                <p className={cn(NEU_MUTED, "text-xs mt-0.5 line-clamp-2 leading-relaxed")}>{action.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}