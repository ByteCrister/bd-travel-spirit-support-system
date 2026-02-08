// components/users/EditUserModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { User } from "@/types/user/user.types";

interface EditUserModalProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (patch: Partial<User>) => Promise<void> | void;
    saving?: boolean;
}

export function EditUserModal({ user, open, onOpenChange, onSubmit, saving }: EditUserModalProps) {
    const [form, setForm] = useState<Partial<User>>({
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        dateOfBirth: user?.dateOfBirth,
        address: user?.address,
    });

    // Sync when user changes
    useState(() => setForm({
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        dateOfBirth: user?.dateOfBirth,
        address: user?.address,
    }));

    // Strongly typed update function
    const update = <K extends keyof User>(key: K, value: User[K]) =>
        setForm((p) => ({ ...p, [key]: value }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Edit user information</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} disabled={saving} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value)} disabled={saving} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={form.phone ?? ""} onChange={(e) => update("phone", e.target.value)} disabled={saving} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dob">Date of birth</Label>
                        <Input id="dob" type="date" value={form.dateOfBirth ? form.dateOfBirth.slice(0, 10) : ""} onChange={(e) => update("dateOfBirth", e.target.value)} disabled={saving} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-2">
                            <Label htmlFor="street">Street</Label>
                            <Input id="street" value={form.address?.street ?? ""} onChange={(e) => update("address", { ...form.address, street: e.target.value })} disabled={saving} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={form.address?.city ?? ""} onChange={(e) => update("address", { ...form.address, city: e.target.value })} disabled={saving} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" value={form.address?.state ?? ""} onChange={(e) => update("address", { ...form.address, state: e.target.value })} disabled={saving} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="zip">Postal code</Label>
                            <Input id="zip" value={form.address?.zip ?? ""} onChange={(e) => update("address", { ...form.address, zip: e.target.value })} disabled={saving} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
                    <Button
                        onClick={async () => {
                            await onSubmit(form);
                            onOpenChange(false);
                        }}
                        disabled={saving}
                    >
                        Save changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
