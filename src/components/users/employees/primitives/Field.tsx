// components/employees/primitives/Field.tsx
"use client";

import * as React from "react";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_HINT =
    "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40";
const NEU_ERROR =
    "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157] flex items-center gap-1";
// ─────────────────────────────────────────────────────────────

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
            <label htmlFor={htmlFor} className={NEU_LABEL}>
                {label}
            </label>
            {children}
            {hint && <p className={NEU_HINT}>{hint}</p>}
            {error && (
                <p className={NEU_ERROR}>
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}