// components/employees/primitives/Badge.tsx
import React from "react";
export function Badge({
    children,
    intent = "default",
}: {
    children: React.ReactNode;
    intent?: "default" | "success" | "warning" | "danger" | "muted";
}) {
    const map: Record<string, string> = {
        default: "bg-muted text-muted-foreground",
        success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
        danger: "bg-red-500/15 text-red-600 dark:text-red-400",
        muted: "bg-muted text-muted-foreground",
    };
    return <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${map[intent]}`}>{children}</span>;
}
