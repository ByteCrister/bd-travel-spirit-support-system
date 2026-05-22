"use client";

import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs, BreadcrumbItem as Crumb } from "@/hooks/useBreadcrumbs";
import clsx from "clsx";
import React from "react";

// ── Style tokens (neu design system) ──────────────────────────
const STYLES = {
    list: "flex flex-wrap items-center gap-0.5 min-w-0",
    linkBase: "transition-colors duration-150 text-sm leading-none",
    linkActive:
        "font-[family-name:var(--font-space-mono)] font-semibold text-[#1E2938]/50 cursor-default pointer-events-none",
    linkInactive:
        "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] " +
        "hover:text-[#006666] hover:underline underline-offset-4",
    separator: "text-[#1E2938]/30 select-none mx-0.5",
} as const;

type BreadcrumbsProps = {
    items: Crumb[];
    className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    const breadcrumbs = useBreadcrumbs(items);

    return (
        <Breadcrumb>
            <BreadcrumbList className={clsx(STYLES.list, className)}>
                {breadcrumbs.map(({ href, label }, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <React.Fragment key={href}>
                            {index > 0 && (
                                <BreadcrumbSeparator className={STYLES.separator} />
                            )}
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={href}
                                        aria-current={isLast ? "page" : undefined}
                                        className={clsx(
                                            STYLES.linkBase,
                                            isLast ? STYLES.linkActive : STYLES.linkInactive
                                        )}
                                    >
                                        {label}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}