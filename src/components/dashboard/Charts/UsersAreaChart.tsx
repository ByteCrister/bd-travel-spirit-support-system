"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Point { date: string; count: number }

export function UsersAreaChart({ travelers, guides, className }: { travelers: Point[]; guides: Point[]; className?: string }) {
  const series = travelers.map((t, i) => ({
    date: t.date,
    travelers: t.count,
    guides: guides[i]?.count ?? 0,
  })).slice(-14);
  const max = Math.max(1, ...series.map(s => Math.max(s.travelers, s.guides)));
  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i));

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Travelers vs Guides (14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex">
            {/* Y-axis */}
            <div className="w-12 pr-2 flex flex-col justify-between h-48 text-[10px] text-slate-500 dark:text-slate-400 select-none">
              {tickValues.slice().reverse().map((v, i) => (
                <div key={`y-${i}-${v}`} className="flex items-center gap-1">
                  <span className="tabular-nums">{v}</span>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="relative flex-1">
              <div className="absolute inset-0 border-l border-b border-slate-200 dark:border-slate-800" />
              <div className="grid grid-cols-14 gap-2 items-end h-48 px-1">
                {series.map((s, i) => (
                  <div key={s.date} className="relative h-full flex flex-col justify-end">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${(s.travelers / max) * 100}%`, opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="w-full bg-blue-400/70 rounded-t"
                      title={`${s.date} Travelers: ${s.travelers}`}
                    />
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${(s.guides / max) * 100}%`, opacity: 1 }}
                      transition={{ delay: i * 0.03 + 0.02 }}
                      className="w-full bg-emerald-400/70 rounded-t mt-1"
                      title={`${s.date} Guides: ${s.guides}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* X-axis */}
          <div className="ml-12 mt-2 grid grid-cols-14 gap-2 text-[10px] text-slate-500 dark:text-slate-400 select-none">
            {series.map((s, i) => {
              const label = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const show = i % 2 === 0;
              return <div key={`x-${i}-${s.date}`} className="text-center truncate">{show ? label : ''}</div>;
            })}
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 select-none">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-400" /> Travelers</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Guides</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


