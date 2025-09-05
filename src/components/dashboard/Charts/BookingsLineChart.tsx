"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Point { date: string; count: number; revenue?: number }

export function BookingsLineChart({ data, className }: { data: Point[]; className?: string }) {
  // Placeholder chart: simple bars using divs to avoid extra deps
  const max = Math.max(1, ...data.map(d => d.count));
  const last14 = data.slice(-14);
  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i));

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Bookings (Last 14 Days)</CardTitle>
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
            {/* Chart area */}
            <div className="relative flex-1">
              <div className="absolute inset-0 border-l border-b border-slate-200 dark:border-slate-800" />
              <div className="grid grid-cols-14 gap-2 items-end h-48 px-1">
                {last14.map((d, i) => (
                  <motion.div key={d.date}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${(d.count / max) * 100}%`, opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-gradient-to-t from-blue-500/70 to-blue-400/90 rounded"
                    title={`${d.date}: ${d.count}`}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* X-axis labels */}
          <div className="ml-12 mt-2 grid grid-cols-14 gap-2 text-[10px] text-slate-500 dark:text-slate-400 select-none">
            {last14.map((d, i) => {
              const label = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const show = i % 2 === 0; // show every 2nd label for readability
              return (
                <div key={`x-${i}-${d.date}`} className="text-center truncate">
                  {show ? label : ''}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


