/* -----------------------------
   Formatting helpers
------------------------------ */

import { SalaryHistoryDTO } from "@/types/employee/employee.types";

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

export function toLocalInput(iso: string) {
  // Convert ISO to "YYYY-MM-DDTHH:mm" for datetime-local
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function fromLocalInput(local: string) {
  // Treat local datetime as local time and convert to ISO
  const d = new Date(local);
  return d.toISOString();
}

export function latestEffectiveFrom(history?: SalaryHistoryDTO[]) {
  if (!history || history.length === 0) return null;
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
  );
  return formatDate(sorted[0].effectiveFrom);
}

export function clamp(min: number, max: number, v: number) {
  if (Number.isNaN(v)) return undefined;
  return Math.max(min, Math.min(max, v));
}
