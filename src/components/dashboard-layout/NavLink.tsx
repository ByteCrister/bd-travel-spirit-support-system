"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

// ─── Neumorphism style tokens ────────────────────────────────
const NEU_NAV_ITEM =
  "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] font-medium " +
  "text-[#1E2938]/60 transition-all duration-200 cursor-pointer " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_NAV_ITEM_ACTIVE =
  "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm " +
  "font-[family-name:var(--font-jetbrains-mono)] font-semibold " +
  "text-[#006666] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
// ─────────────────────────────────────────────────────────────

interface NavLinkProps {
  href: string;
  icon: IconType | React.ComponentType<{ className?: string }>;
  label: string;
  isCollapsed?: boolean;
  onClick?: () => void;
}

function useIsActive(href: string, pathname: string | null | undefined) {
  if (!pathname) return false;
  const normalizedHref =
    href.endsWith("/") && href !== "/" ? href.replace(/\/+$/, "") : href;
  const normalizedPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.replace(/\/+$/, "")
      : pathname;
  if (normalizedPath === normalizedHref) return true;
  if (normalizedHref === "/") return false;
  const segmentCount = normalizedHref.split("/").filter(Boolean).length;
  if (segmentCount >= 2 && normalizedPath.startsWith(normalizedHref + "/")) {
    return true;
  }
  return false;
}

export function NavLink({
  href,
  icon: Icon,
  label,
  isCollapsed = false,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = useIsActive(href, pathname);

  return (
    <Link
      href={href}
      onClick={onClick}
      className="block"
      aria-current={isActive ? "page" : undefined}
    >
      <motion.div
        className={isActive ? NEU_NAV_ITEM_ACTIVE : NEU_NAV_ITEM}
        whileTap={{ scale: 0.97 }}
        role="menuitem"
        tabIndex={0}
      >
        {/* Active accent bar */}
        {isActive && (
          <motion.span
            layoutId="neu-active-bar"
            className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[#006666]"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        )}

        <Icon
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-colors duration-200",
            isActive ? "text-[#006666]" : "text-[#1E2938]/50",
          )}
        />

        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="truncate text-xs"
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
}
