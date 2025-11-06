import { Button } from "@/components/ui/button";
import { DayOfWeek, ShiftDTO } from "@/types/employee.types";
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                                <FormRow label="Working Days" icon={Calendar}>
                                    <Input
                                        value={s.days.join(", ")}
                                        onChange={(e) =>
                                            update(idx, {
                                                days: e.target.value.split(",").map((d) => d.trim() as DayOfWeek),
                                            })
                                        }
                                        placeholder="Mon, Tue, Wed..."
                                    />
                                </FormRow>

                                <div className="flex items-end">
                                    <Button
                                        variant="destructive"
                                        onClick={() => remove(idx)}
                                        className="w-full text-white hover:text-white"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}