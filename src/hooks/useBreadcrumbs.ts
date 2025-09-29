"use client";

import { useMemo } from "react";

export type BreadcrumbItem = {
    label: string;
    href: string;
};

export function useBreadcrumbs(items: BreadcrumbItem[]) {
    // In case you want to add memoization or transformations later
    return useMemo(() => items, [items]);
}
