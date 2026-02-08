'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfToday, endOfDay, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { UserTableRow } from "@/types/user/user.table.types";
import { Suspension } from "@/types/user/user.types";
import { useState } from "react";

interface SuspendUserDialogProps {
    user: UserTableRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suspending: boolean;
    onConfirm: (suspensionData: Omit<Suspension, "suspendedBy" | "createdAt">) => void;
}

export function SuspendUserDialog({
    user,
    open,
    onOpenChange,
    suspending,
    onConfirm,
}: SuspendUserDialogProps) {
    const [reason, setReason] = useState("");
    // store date as ISO-like yyyy-MM-dd string from the native date input
    const [until, setUntil] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = reason.trim();
        if (!trimmed || !until) return;

        // Convert "yyyy-MM-dd" to a Date safely and normalize to end-of-day
        // parseISO expects "yyyy-MM-dd" and creates a Date in local time.
        const picked = parseISO(until); // local date at 00:00
        if (!isValid(picked)) return;

        onConfirm({
            reason: trimmed,
            until: endOfDay(picked).toISOString(),
        });

        // Clear and close dialog after submit
        setReason("");
        setUntil("");
        onOpenChange(false);
    };

    const handleCancel = () => {
        setReason("");
        setUntil("");
        onOpenChange(false);
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-xl border border-border/50 shadow-lg">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-lg font-semibold text-destructive tracking-tight">
                        Suspend User
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        You are about to suspend{" "}
                        <span className="font-medium text-foreground">{user.name}</span>’s account.
                        They will lose access until the specified date.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium">
                            Reason <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Provide a clear reason for suspension..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            required
                            className="resize-none rounded-md border-muted bg-muted/30 focus-visible:ring-2 focus-visible:ring-destructive/40"
                        />
                    </div>

                    {/* Until (native date picker) */}
                    <div className="space-y-2">
                        <Label htmlFor="until" className="text-sm font-medium">
                            Suspend Until <span className="text-destructive">*</span>
                        </Label>
                        <input
                            id="until"
                            type="date"
                            value={until}
                            onChange={(e) => setUntil(e.target.value)}
                            min={format(startOfToday(), "yyyy-MM-dd")} // prevent past dates
                            required
                            className={cn(
                                "w-full rounded-md border border-muted bg-muted/30 px-3 py-2 text-sm outline-none",
                                "focus-visible:ring-2 focus-visible:ring-destructive/40"
                            )}
                        />
                        <p className="text-xs text-muted-foreground">
                            The account will automatically reactivate on this date.
                        </p>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={suspending}
                            className="rounded-md text-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={suspending || !reason.trim() || !until}
                            className="rounded-md text-white hover:text-white"
                        >
                            {suspending ? "Suspending..." : "Suspend"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
