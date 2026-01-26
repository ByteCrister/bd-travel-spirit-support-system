"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Point { date: string; amount: number }

export function RevenueMiniChart({ data, className }: { data: Point[]; className?: string }) {
  const last14 = data.slice(-14);
  const max = Math.max(1, ...last14.map(d => d.amount));
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Revenue (14 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="flex">
            {/* Y-axis */}
            <div className="w-12 pr-2 flex flex-col justify-between h-36 text-[10px] text-slate-500 dark:text-slate-400 select-none">
              {Array.from({ length: 5 }, (_, i) => Math.round((max / 4) * (4 - i))).map((v, i) => (
                <div key={`y-${i}-${v}`} className="flex items-center gap-1">
                  <span className="tabular-nums">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)}</span>
                </div>
              ))}
            </div>
            {/* Chart */}
            <div className="relative flex-1">
              <div className="absolute inset-0 border-l border-b border-slate-200 dark:border-slate-800" />
              <div className="flex items-end gap-1 h-36 px-1">
                {last14.map((d, i) => (
                  <motion.div key={`${d.date}-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(d.amount / max) * 100}%`, opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="w-3 bg-gradient-to-t from-emerald-500/70 to-emerald-400/90 rounded"
                    title={`${d.date}: $${d.amount.toLocaleString()}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* X-axis */}
          <div className="ml-12 mt-2 grid grid-cols-14 gap-1 text-[10px] text-slate-500 dark:text-slate-400 select-none">
            {last14.map((d, i) => {
              const label = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const show = i % 3 === 0;
              return <div key={`x-${i}-${d.date}`} className="text-center truncate">{show ? label : ''}</div>;
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


