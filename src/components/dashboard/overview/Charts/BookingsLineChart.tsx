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
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] text-[#1E2938]";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Point {
  date: string;
  count: number;
  revenue?: number;
}

interface BookingsLineChartProps {
  data: Point[];
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
export function BookingsLineChart({ data, className }: BookingsLineChartProps) {
  const last14 = data.slice(-14);
  const max = Math.max(1, ...last14.map((d) => d.count));
  const total = last14.reduce((sum, d) => sum + d.count, 0);
  const yTicks = 4;
  const tickValues = Array.from(
    { length: yTicks + 1 },
    (_, i) => Math.round((max / yTicks) * i)
  );

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
          <h3 className={cn(NEU_HEADING, "text-sm")}>Bookings</h3>
          <p className={cn(NEU_MUTED, "text-xs mt-0.5")}>Last 14 days activity</p>
        </div>
        <div className={cn(NEU_BADGE, "flex-col items-end gap-0 px-3 py-1.5")}>
          <span className="font-[family-name:var(--font-space-mono)] font-bold text-lg tabular-nums text-[#1E2938] leading-none">
            {total.toLocaleString()}
          </span>
          <span className={cn(NEU_LABEL, "text-[9px] mt-0.5")}>Total</span>
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
            {/* Inset background */}
            <div className={cn(NEU_SURFACE_INSET, "absolute inset-0 rounded-xl")} />

            {/* Grid lines */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {tickValues.slice(1, -1).map((_, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute left-0 right-0 border-t border-[#1E2938]/5"
                  style={{
                    bottom: `${((i + 1) / yTicks) * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Bars */}
            <div className="relative flex items-end justify-between gap-1 h-48 px-2 pb-0">
              {last14.map((d, i) => {
                const heightPct = (d.count / max) * 100;
                return (
                  <motion.div
                    key={`${d.date}-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${heightPct}%`, opacity: 1 }}
                    transition={{ delay: i * 0.03, duration: 0.4, ease: "easeOut" }}
                    className="relative group flex-1 rounded-t-md cursor-default"
                    style={{ minHeight: d.count > 0 ? 4 : 0 }}
                    title={`${formatDate(d.date)}: ${d.count} bookings`}
                  >
                    {/* Bar fill with brand primary teal */}
                    <div
                      className="absolute inset-0 rounded-t-md"
                      style={{
                        background:
                          "linear-gradient(to top, #006666cc, #00888880)",
                        boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.15)",
                      }}
                    />
                    {/* Tooltip on hover */}
                    <div
                      className={cn(
                        "absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10",
                        "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
                        "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] font-bold"
                      )}
                    >
                      {d.count}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex gap-1 mt-2 ml-[52px]">
          {last14.map((d, i) => (
            <div
              key={`x-${i}`}
              className={cn(
                NEU_LABEL,
                "flex-1 text-center text-[9px] truncate leading-none"
              )}
            >
              {i % 2 === 0 ? formatDate(d.date) : ""}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}