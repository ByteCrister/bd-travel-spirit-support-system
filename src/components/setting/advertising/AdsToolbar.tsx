"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiPlus, HiPencil, HiTrash, HiRefresh } from "react-icons/hi";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  wrap: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
  leftGroup: "flex items-center gap-2 flex-wrap",
  rightGroup: "flex items-center gap-2",

  btnPrimary:
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold " +
    "font-[family-name:var(--font-space-mono)] tracking-wide text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "transition-all duration-200",

  btnGhost:
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] text-[#1E2938] bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "transition-all duration-200",

  btnDanger:
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] text-[#FF2157] bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
    "transition-all duration-200",

  btnIcon:
    "w-9 h-9 flex items-center justify-center rounded-xl bg-[#E7E5E4] text-[#006666] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
    "transition-all duration-200",

  badge:
    "inline-flex items-center justify-center h-5 min-w-[1.25rem] px-1.5 rounded-md " +
    "text-xs font-bold font-[family-name:var(--font-space-mono)]",
};

interface Props {
  selectedCount: number;
  onNew: () => void;
  onBulkEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const AdsToolbar: React.FC<Props> = ({
  selectedCount,
  onNew,
  onBulkEdit,
  onDelete,
  onRefresh,
}) => {
  return (
    <div className={S.wrap}>
      {/* Left — Primary actions */}
      <div className={S.leftGroup}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNew}
          className={S.btnPrimary}
          aria-label="Create new price"
        >
          <HiPlus className="h-4 w-4" />
          New Price
        </motion.button>

        <motion.button
          whileHover={{ scale: selectedCount > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedCount > 0 ? 0.97 : 1 }}
          onClick={onBulkEdit}
          disabled={selectedCount === 0}
          className={S.btnGhost}
          aria-disabled={selectedCount === 0}
          aria-label="Bulk edit selected"
        >
          <HiPencil className="h-4 w-4" />
          Bulk Edit
          {selectedCount > 0 && (
            <span className={`${S.badge} bg-[#006666]/10 text-[#006666]`}>
              {selectedCount}
            </span>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: selectedCount > 0 ? 1.02 : 1 }}
          whileTap={{ scale: selectedCount > 0 ? 0.97 : 1 }}
          onClick={onDelete}
          disabled={selectedCount === 0}
          className={S.btnDanger}
          aria-disabled={selectedCount === 0}
          aria-label="Delete selected"
        >
          <HiTrash className="h-4 w-4" />
          Delete
          {selectedCount > 0 && (
            <span className={`${S.badge} bg-[#FF2157]/10 text-[#FF2157]`}>
              {selectedCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Right — Secondary actions */}
      <div className={S.rightGroup}>
        <motion.button
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
          onClick={onRefresh}
          className={S.btnIcon}
          aria-label="Refresh"
        >
          <HiRefresh className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default AdsToolbar;