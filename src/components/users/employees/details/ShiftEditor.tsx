"use client";

import { Button } from "@/components/ui/button";
import { DayOfWeek, ShiftDTO } from "@/types/employee/employee.types";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import FormRow from "./FormRow";
import { Input } from "@/components/ui/input";

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
            { startTime: "09:00", endTime: "17:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
        ]);

    const update = (idx: number, patch: Partial<ShiftDTO>) =>
        onChange(shifts.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

    const remove = (idx: number) => onChange(shifts.filter((_, i) => i !== idx));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Configure employee work schedules</p>
                <Button variant="secondary" onClick={add} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Shift
                </Button>
            </div>

            {shifts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No shifts assigned yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {shifts.map((s, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-sm">
                                        {idx + 1}
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">Shift {idx + 1}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(idx)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormRow label="Start Time" icon={Clock}>
                                    <Input
                                        type="time"
                                        value={s.startTime}
                                        onChange={(e) => update(idx, { startTime: e.target.value })}
                                        className="font-mono"
                                    />
                                </FormRow>

                                <FormRow label="End Time" icon={Clock}>
                                    <Input
                                        type="time"
                                        value={s.endTime}
                                        onChange={(e) => update(idx, { endTime: e.target.value })}
                                        className="font-mono"
                                    />
                                </FormRow>

                                <div className="col-span-1 md:col-span-2">
                                    <FormRow label="Working Days" icon={Calendar}>
                                        <div className="flex flex-wrap gap-2">
                                            {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as DayOfWeek[]).map((day) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        const days = s.days.includes(day)
                                                            ? s.days.filter((d) => d !== day)
                                                            : [...s.days, day];
                                                        update(idx, { days });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                        s.days.includes(day)
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
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