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

type BreadcrumbsProps = {
    items: Crumb[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    const breadcrumbs = useBreadcrumbs(items);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map(({ href, label }, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <React.Fragment key={href}>
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={href}
                                        aria-current={isLast ? "page" : undefined}
                                        className={clsx(
                                            // Fonts: Inter for normal crumbs, Poppins for the active one
                                            isLast
                                                ? "font-display text-muted-foreground cursor-default font-semibold"
                                                : "font-sans hover:underline text-foreground",
                                            "transition-colors"
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
