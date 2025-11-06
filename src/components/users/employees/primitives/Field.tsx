// components/employees/primitives/Field.tsx
import * as React from "react";
import { Label } from "@/components/ui/label";

interface FieldProps {
    label: string;
    children: React.ReactNode;
    hint?: string;
    htmlFor?: string;
    error?: string;
}

export function Field({ label, children, hint, htmlFor, error }: FieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor} className="text-sm">
                {label}
            </Label>
            {children}
            {hint && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}