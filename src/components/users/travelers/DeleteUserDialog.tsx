// components/users/DeleteUserDialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserTableRow } from "@/types/user.table.types";

interface DeleteUserDialogProps {
    user: UserTableRow | null;
    open: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    confirming?: boolean;
}

export function DeleteUserDialog({ user, open, onConfirm, onOpenChange, confirming }: DeleteUserDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Delete user</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                        This action cannot be undone. This will permanently delete:
                    </p>
                    <div className="p-3 rounded-md bg-muted">
                        <div className="font-medium">{user?.name ?? "—"}</div>
                        <div className="text-sm text-muted-foreground">{user?.email ?? ""}</div>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={confirming}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm} disabled={confirming}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
