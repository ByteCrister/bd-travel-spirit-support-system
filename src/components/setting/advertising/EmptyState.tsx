"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiPlus } from "react-icons/hi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

// ── Neumorphism style constants ───────────────────────────────
const S = {
  wrap:
    "rounded-2xl bg-[#E7E5E4] " +
    "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60",
  inner: "flex flex-col items-center justify-center py-16 px-6",

  iconRing:
    "relative mb-6 h-24 w-24 rounded-full flex items-center justify-center " +
    "bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]",

  heading:
    "text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] mb-2",
  body:
    "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 " +
    "text-center max-w-md mb-8 leading-relaxed",

  btn:
    "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 " +
    "transition-all duration-200",

  dotRow: "mt-8 flex items-center gap-6",
  dotItem:
    "flex items-center gap-2 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40",
  dot: "h-2 w-2 rounded-full",
};

const FEATURE_DOTS = [
  { color: "bg-[#006666]", label: "Landing banners" },
  { color: "bg-[#00A63D]", label: "Popup modals" },
  { color: "bg-[#FE9900]", label: "Email campaigns" },
];

interface Props {
  onCreate: () => void;
}

const EmptyState: React.FC<Props> = ({ onCreate }) => {
  return (
    <div className={S.wrap}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={S.inner}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={S.iconRing}
        >
          <FaBangladeshiTakaSign className="h-10 w-10 text-[#006666]" />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-[#006666]/20"
          />
        </motion.div>

        {/* Text */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={S.heading}
        >
          No advertising prices yet
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={S.body}
        >
          Get started by creating your first advertising price entry. Define placements,
          pricing, and duration options for your platform.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <button onClick={onCreate} className={S.btn}>
            <HiPlus className="h-5 w-5" />
            Create First Price
          </button>
        </motion.div>

        {/* Feature dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={S.dotRow}
        >
          {FEATURE_DOTS.map(({ color, label }) => (
            <div key={label} className={S.dotItem}>
              <div className={`${S.dot} ${color}`} />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EmptyState;