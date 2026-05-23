"use client";

import { Clock, Calendar, Plus, Trash2 } from "lucide-react";
import { DayOfWeek, ShiftDTO } from "@/types/employee/employee.types";
import FormRow from "./FormRow";
import { Input } from "@/components/ui/input";

// ── Neumorphism tokens ──────────────────────────────────────────
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#006666] text-white text-sm " +
  "font-[family-name:var(--font-space-mono)] font-bold px-4 py-2 " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_DANGER =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#E7E5E4] text-[#FF2157] text-sm " +
  "font-[family-name:var(--font-space-mono)] p-2 " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#FF2157]/10 hover:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "transition-all duration-200";

const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// ───────────────────────────────────────────────────────────────

export default function ShiftEditor({
  shifts,
  onChange,
}: {
  shifts: ShiftDTO[];
  onChange: (next: ShiftDTO[] | undefined) => void;
}) {
  const add = () =>
    onChange([
      ...shifts,
      {
        startTime: "09:00",
        endTime: "17:00",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      },
    ]);

  const update = (idx: number, patch: Partial<ShiftDTO>) =>
    onChange(shifts.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const remove = (idx: number) => onChange(shifts.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className={NEU_MUTED}>Configure employee work schedules</p>
        <button type="button" onClick={add} className={NEU_BTN_PRIMARY}>
          <Plus className="h-4 w-4" />
          Add Shift
        </button>
      </div>

      {/* Empty state */}
      {shifts.length === 0 ? (
        <div
          className={`${NEU_SURFACE_INSET_SM} flex flex-col items-center justify-center gap-3 rounded-2xl py-14 text-center`}
        >
          <Clock className="h-10 w-10 text-[#1E2938]/20" />
          <p className={NEU_MUTED}>No shifts assigned yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shifts.map((s, idx) => (
            <div key={idx} className={`${NEU_CARD_SM} p-5 space-y-4`}>
              {/* Shift header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#006666]/10 
                    font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#006666]
                    shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]"
                  >
                    {idx + 1}
                  </span>
                  <span className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]">
                    Shift {idx + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className={NEU_BTN_DANGER}
                  aria-label={`Remove shift ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Time + days grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormRow label="Start Time" icon={Clock}>
                  <Input
                    type="time"
                    value={s.startTime}
                    onChange={(e) => update(idx, { startTime: e.target.value })}
                    className={`${NEU_INPUT} font-mono`}
                  />
                </FormRow>

                <FormRow label="End Time" icon={Clock}>
                  <Input
                    type="time"
                    value={s.endTime}
                    onChange={(e) => update(idx, { endTime: e.target.value })}
                    className={`${NEU_INPUT} font-mono`}
                  />
                </FormRow>

                <div className="col-span-1 md:col-span-2">
                  <FormRow label="Working Days" icon={Calendar}>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day) => {
                        const active = s.days.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              const days = active
                                ? s.days.filter((d) => d !== day)
                                : [...s.days, day];
                              update(idx, { days });
                            }}
                            className={
                              active
                                ? "px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
                                  "bg-[#006666] text-white " +
                                  "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] " +
                                  "transition-all duration-200"
                                : "px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
                                  "bg-[#E7E5E4] text-[#1E2938]/60 " +
                                  "shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] " +
                                  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
                                  "transition-all duration-200"
                            }
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </FormRow>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
