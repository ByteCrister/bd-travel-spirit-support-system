"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Neumorphism style tokens ──────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] text-[#1E2938]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// Series color tokens — teal (travelers) & success-green (guides)
const TRAVELERS_COLOR = "#006666";
const GUIDES_COLOR = "#00A63D";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Point {
  date: string;
  count: number;
}

interface UsersAreaChartProps {
  travelers: Point[];
  guides: Point[];
  className?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export function UsersAreaChart({ travelers, guides, className }: UsersAreaChartProps) {
  const series = travelers
    .map((t, i) => ({
      date: t.date,
      travelers: t.count,
      guides: guides[i]?.count ?? 0,
    }))
    .slice(-14);

  const max = Math.max(1, ...series.map((s) => Math.max(s.travelers, s.guides)));
  const yTicks = 4;
  const tickValues = Array.from(
    { length: yTicks + 1 },
    (_, i) => Math.round((max / yTicks) * i)
  );

  const totalTravelers = series.reduce((s, d) => s + d.travelers, 0);
  const totalGuides = series.reduce((s, d) => s + d.guides, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(NEU_CARD, "overflow-hidden", className)}
    >
      {/* ── Header ── */}
      <div className={cn("flex items-start justify-between px-5 sm:px-6 pt-5 pb-4 border-b", NEU_DIVIDER)}>
        <div>
          <h3 className={cn(NEU_HEADING, "text-sm")}>Travelers vs Guides</h3>
          <p className={cn(NEU_MUTED, "text-xs mt-0.5")}>Last 14 days comparison</p>
        </div>
        {/* Two mini totals */}
        <div className="flex items-center gap-2">
          <div className={cn(NEU_BADGE, "flex-col items-center gap-0 px-2.5 py-1")}>
            <span
              className="font-[family-name:var(--font-space-mono)] font-bold text-sm tabular-nums leading-none"
              style={{ color: TRAVELERS_COLOR }}
            >
              {totalTravelers.toLocaleString()}
            </span>
            <span className={cn(NEU_LABEL, "text-[8px] mt-0.5")}>Travelers</span>
          </div>
          <div className={cn(NEU_BADGE, "flex-col items-center gap-0 px-2.5 py-1")}>
            <span
              className="font-[family-name:var(--font-space-mono)] font-bold text-sm tabular-nums leading-none"
              style={{ color: GUIDES_COLOR }}
            >
              {totalGuides.toLocaleString()}
            </span>
            <span className={cn(NEU_LABEL, "text-[8px] mt-0.5")}>Guides</span>
          </div>
        </div>
      </div>

      {/* ── Chart body ── */}
      <div className="px-5 sm:px-6 py-5">
        <div className="flex gap-3">
          {/* Y-axis */}
          <div
            className={cn(
              NEU_LABEL,
              "w-10 flex flex-col justify-between h-48 text-[10px] text-right select-none shrink-0"
            )}
          >
            {tickValues
              .slice()
              .reverse()
              .map((v, i) => (
                <span key={`y-${i}`} className="tabular-nums leading-none">
                  {v}
                </span>
              ))}
          </div>

          {/* Chart area */}
          <div className="relative flex-1 min-w-0">
            {/* Inset bg */}
            <div className={cn(NEU_SURFACE_INSET, "absolute inset-0 rounded-xl")} />

            {/* Grid lines */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {tickValues.slice(1, -1).map((_, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute left-0 right-0 border-t border-[#1E2938]/5"
                  style={{ bottom: `${((i + 1) / yTicks) * 100}%` }}
                />
              ))}
            </div>

            {/* Grouped bars */}
            <div className="relative flex items-end justify-between gap-0.5 h-48 px-2">
              {series.map((s, i) => (
                <div
                  key={`${s.date}-${i}`}
                  className="relative group flex-1 h-full flex items-end gap-px"
                  title={`${formatDate(s.date)} — Travelers: ${s.travelers}, Guides: ${s.guides}`}
                >
                  {/* Travelers bar */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(s.travelers / max) * 100}%`, opacity: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
                    className="flex-1 rounded-t-sm cursor-default"
                    style={{
                      minHeight: s.travelers > 0 ? 3 : 0,
                      background: `linear-gradient(to top, ${TRAVELERS_COLOR}cc, ${TRAVELERS_COLOR}88)`,
                      boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.15)",
                    }}
                  />
                  {/* Guides bar */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(s.guides / max) * 100}%`, opacity: 1 }}
                    transition={{ delay: i * 0.03 + 0.05, duration: 0.4, ease: "easeOut" }}
                    className="flex-1 rounded-t-sm cursor-default"
                    style={{
                      minHeight: s.guides > 0 ? 3 : 0,
                      background: `linear-gradient(to top, ${GUIDES_COLOR}cc, ${GUIDES_COLOR}88)`,
                      boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.15)",
                    }}
                  />

                  {/* Hover tooltip */}
                  <div
                    className={cn(
                      "absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-lg text-[10px] whitespace-nowrap",
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10",
                      "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
                      "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]"
                    )}
                  >
                    <span style={{ color: TRAVELERS_COLOR }} className="font-bold">{s.travelers}</span>
                    <span className="mx-1 opacity-40">/</span>
                    <span style={{ color: GUIDES_COLOR }} className="font-bold">{s.guides}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex gap-0.5 mt-2 ml-[52px]">
          {series.map((s, i) => (
            <div
              key={`x-${i}`}
              className={cn(NEU_LABEL, "flex-1 text-center text-[9px] truncate leading-none")}
            >
              {i % 2 === 0 ? formatDate(s.date) : ""}
            </div>
          ))}
        </div>

        {/* ── Legend ── */}
        <div className={cn("mt-4 pt-3 border-t flex items-center gap-4", NEU_DIVIDER)}>
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-sm shadow-[1px_1px_2px_#c8c6c5,-1px_-1px_2px_#ffffff]"
              style={{ backgroundColor: TRAVELERS_COLOR }}
            />
            <span className={cn(NEU_LABEL, "text-[10px] normal-case tracking-normal")}>Travelers</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-sm shadow-[1px_1px_2px_#c8c6c5,-1px_-1px_2px_#ffffff]"
              style={{ backgroundColor: GUIDES_COLOR }}
            />
            <span className={cn(NEU_LABEL, "text-[10px] normal-case tracking-normal")}>Guides</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}