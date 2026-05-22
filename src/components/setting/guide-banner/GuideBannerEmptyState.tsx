"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, ArrowRight, Layers, Sparkles } from "lucide-react";
import GuideBannerForm from "./GuideBannerForm";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_ICON_WELL_PRIMARY = "p-3.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const FEATURES = ["Easy to create", "Fully customizable", "Drag to reorder"] as const;

export default function GuideBannerEmptyState() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={`${NEU_CARD} overflow-hidden`}>
          <div className="relative p-10 md:p-14 flex flex-col items-center text-center gap-8">

            {/* Subtle background texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #1E2938 1px, transparent 0)", backgroundSize: "28px 28px" }}
            />

            {/* Icon cluster */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 }}
            >
              <div className={`${NEU_ICON_WELL_PRIMARY} relative z-10`}>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ImagePlus className="w-12 h-12 text-[#006666]" />
                </motion.div>
              </div>

              {/* Orbiting sparkle */}
              <motion.div
                className="absolute -top-1.5 -right-1.5"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-[#FE9900]" />
              </motion.div>

              {/* Floating layers icon */}
              <motion.div
                className="absolute -bottom-1.5 -left-1.5"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Layers className="w-4 h-4 text-[#006666]/60" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              className="space-y-2 max-w-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className={`text-2xl ${NEU_HEADING}`}>No guide banners yet</h3>
              <p className={NEU_MUTED}>
                Create your first banner to guide users through your application with beautiful, engaging visuals.
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              {FEATURES.map((feature, idx) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.08 }}
                  className={`${NEU_SURFACE_INSET} flex items-center gap-2 px-3.5 py-1.5 rounded-xl`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#006666]" />
                  <span className={NEU_LABEL}>{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <button
                onClick={() => setOpen(true)}
                className={`${NEU_BTN_PRIMARY} inline-flex items-center gap-2.5 px-6 py-3 text-sm`}
              >
                <ImagePlus className="w-4 h-4" />
                Create your first banner
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {open && <GuideBannerForm mode="create" onClose={() => setOpen(false)} />}
    </>
  );
}