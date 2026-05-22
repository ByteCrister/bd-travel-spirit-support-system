"use client";

import React from "react";
import { motion } from "framer-motion";
import { HiExclamationCircle, HiRefresh } from "react-icons/hi";

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
    "font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:bg-[#FF2157]/5 hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/40 " +
    "transition-all duration-200",

  support:
    "mt-6 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/30 text-center",
};

interface Props {
  onRetry: () => void;
}

const ErrorState: React.FC<Props> = ({ onRetry }) => {
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
          <HiExclamationCircle className="h-10 w-10 text-[#FF2157]" />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-[#FF2157]/20"
          />
        </motion.div>

        {/* Text */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={S.heading}
        >
          Failed to load advertising settings
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={S.body}
        >
          We encountered an error while loading your advertising configuration.
          Please check your connection and try again.
        </motion.p>

        {/* Retry */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <button onClick={onRetry} className={S.btn}>
            <HiRefresh className="h-5 w-5" />
            Retry
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={S.support}
        >
          If the problem persists, please contact support
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ErrorState;