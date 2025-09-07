"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon: IconType | React.ComponentType<{ className?: string }>;
  label: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export function NavLink({ href, icon: Icon, label, isCollapsed = false, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className="block"
      aria-current={isActive ? "page" : undefined}
    >
      <motion.div
        className={cn(
          "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-sans font-medium transition-all duration-200",
          "group cursor-pointer",
          isActive
            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-sm border border-blue-200/50 dark:border-blue-800/50"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        role="menuitem"
        tabIndex={0}
      >
        {/* Icon */}
        <motion.div
          className="relative flex items-center justify-center"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Icon
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-colors duration-200",
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            )}
          />

          {/* Icon glow effect */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-500/15 blur-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>

        {/* Label with smooth text color animation */}
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: 1,
              x: 0,
              color: isActive
                ? "rgb(37, 99, 235)" // blue-600
                : "rgb(100, 116, 139)", // slate-500
            }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="truncate"
            whileHover={{
              color: isActive
                ? "rgb(37, 99, 235)" // stay blue if active
                : "rgb(37, 99, 235)", // transition to blue on hover
            }}
          >
            {label}
          </motion.span>
        )}

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-600 shadow-sm"
            layoutId="activeIndicator"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}

        {/* Hover indicator */}
        {!isActive && (
          <motion.div
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-slate-400/40"
            initial={{ scaleY: 0, opacity: 0 }}
            whileHover={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    </Link>
  );
}
