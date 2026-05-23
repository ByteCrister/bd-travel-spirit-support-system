"use client";

// components/travelers/TravelerPagination.tsx

import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_BTN_ICON = [
  "rounded-xl w-8 h-8 flex items-center justify-center",
  "bg-[#E7E5E4] text-[#1E2938]/60",
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40",
].join(" ");

const NEU_PAGE_BTN_INACTIVE = [
  "relative h-8 min-w-[2rem] px-2.5 rounded-xl text-xs",
  "font-[family-name:var(--font-space-mono)] font-bold",
  "bg-[#E7E5E4] text-[#1E2938]/70",
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] hover:text-[#006666]",
  "transition-all duration-200 select-none",
].join(" ");

const NEU_PAGE_BTN_ACTIVE = [
  "relative h-8 min-w-[2rem] px-2.5 rounded-xl text-xs",
  "font-[family-name:var(--font-space-mono)] font-bold",
  "bg-[#006666] text-white",
  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]",
  "select-none cursor-default",
].join(" ");

const NEU_PAGE_INFO = [
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 tabular-nums hidden sm:block",
].join(" ");

const NEU_ELLIPSIS =
  "w-6 text-center text-[#1E2938]/30 text-xs select-none font-[family-name:var(--font-jetbrains-mono)]";

// ── Sub-components ─────────────────────────────────────────────
interface NavButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: React.ElementType;
  label: string;
}

function NavButton({ onClick, disabled, icon: Icon, label }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={NEU_BTN_ICON}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function PageButton({
  page,
  isActive,
  onClick,
}: {
  page: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={isActive ? NEU_PAGE_BTN_ACTIVE : NEU_PAGE_BTN_INACTIVE}
    >
      <span className="relative z-10">{page}</span>
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────
interface TravelerPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TravelerPagination({
  currentPage,
  totalPages,
  onPageChange,
}: TravelerPaginationProps) {
  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 1;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-center justify-between gap-4"
    >
      {/* Page info */}
      <p className={NEU_PAGE_INFO}>
        Page <span className="font-bold text-[#1E2938]">{currentPage}</span> of{" "}
        <span className="font-bold text-[#1E2938]">{totalPages}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
        <NavButton
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          icon={ChevronsLeft}
          label="First page"
        />
        <NavButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          icon={ChevronLeft}
          label="Previous page"
        />

        <div className="flex items-center gap-1 mx-1">
          {showStartEllipsis && (
            <>
              <PageButton
                page={1}
                isActive={false}
                onClick={() => onPageChange(1)}
              />
              <span className={NEU_ELLIPSIS}>···</span>
            </>
          )}

          {visiblePages.map((page) => (
            <PageButton
              key={page}
              page={page}
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            />
          ))}

          {showEndEllipsis && (
            <>
              <span className={NEU_ELLIPSIS}>···</span>
              <PageButton
                page={totalPages}
                isActive={false}
                onClick={() => onPageChange(totalPages)}
              />
            </>
          )}
        </div>

        <NavButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          icon={ChevronRight}
          label="Next page"
        />
        <NavButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          icon={ChevronsRight}
          label="Last page"
        />
      </div>

      <div className="hidden sm:block w-20" />
    </motion.div>
  );
}
