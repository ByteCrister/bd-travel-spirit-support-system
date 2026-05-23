"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_TABLE_HEADER =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] border-b border-white/60";
// ─────────────────────────────────────────────────────────────

const COLUMNS = [
  "Company",
  "Host Email",
  "Employees",
  "Tours",
  "Reviews",
  "Avg Rating",
  "Last Login",
  "Created",
];

export function CompanySkeleton() {
  const rows = Array.from({ length: 8 });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      aria-busy="true"
      aria-live="polite"
    >
      <Table>
        <TableHeader>
          <TableRow className={`${NEU_TABLE_HEADER} hover:bg-transparent`}>
            {COLUMNS.map((col) => (
              <TableHead
                key={col}
                className={`py-4 ${["Employees", "Tours", "Reviews", "Avg Rating"].includes(col) ? "text-right" : ""}`}
              >
                <span className={NEU_LABEL}>{col}</span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((_, i) => (
            <TableRow
              key={i}
              className="border-b border-white/60 last:border-b-0 hover:bg-transparent"
            >
              {/* Company */}
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`${NEU_SKELETON} w-10 h-10 rounded-xl`} />
                  <div className="flex flex-col gap-1.5">
                    <div className={`${NEU_SKELETON} h-3.5 w-32`} />
                    <div className={`${NEU_SKELETON} h-3 w-24`} />
                  </div>
                </div>
              </TableCell>
              {/* Host Email */}
              <TableCell className="py-4">
                <div className={`${NEU_SKELETON} h-3.5 w-44`} />
              </TableCell>
              {/* Employees */}
              <TableCell className="py-4 text-right">
                <div
                  className={`${NEU_SKELETON} ml-auto h-7 w-14 rounded-lg`}
                />
              </TableCell>
              {/* Tours */}
              <TableCell className="py-4 text-right">
                <div
                  className={`${NEU_SKELETON} ml-auto h-7 w-14 rounded-lg`}
                />
              </TableCell>
              {/* Reviews */}
              <TableCell className="py-4 text-right">
                <div
                  className={`${NEU_SKELETON} ml-auto h-7 w-14 rounded-lg`}
                />
              </TableCell>
              {/* Avg Rating */}
              <TableCell className="py-4 text-right">
                <div className={`${NEU_SKELETON} ml-auto h-3.5 w-10`} />
              </TableCell>
              {/* Last Login */}
              <TableCell className="py-4">
                <div className="flex flex-col gap-1.5">
                  <div className={`${NEU_SKELETON} h-3.5 w-28`} />
                  <div className={`${NEU_SKELETON} h-3 w-20`} />
                </div>
              </TableCell>
              {/* Created */}
              <TableCell className="py-4">
                <div className="flex flex-col gap-1.5">
                  <div className={`${NEU_SKELETON} h-3.5 w-28`} />
                  <div className={`${NEU_SKELETON} h-3 w-20`} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
