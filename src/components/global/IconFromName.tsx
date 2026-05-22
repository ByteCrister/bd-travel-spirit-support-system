"use client";

import React from "react";
import { IconType } from "react-icons";

// ── Icon library map ───────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconLibraries: Record<string, () => Promise<any>> = {
    Fa: () => import("react-icons/fa"),
    Fi: () => import("react-icons/fi"),
    Md: () => import("react-icons/md"),
    Io: () => import("react-icons/io"),
    Io5: () => import("react-icons/io5"),
    Ri: () => import("react-icons/ri"),
    Bi: () => import("react-icons/bi"),
    Bs: () => import("react-icons/bs"),
    Hi: () => import("react-icons/hi"),
    Hi2: () => import("react-icons/hi2"),
    Tb: () => import("react-icons/tb"),
    Gi: () => import("react-icons/gi"),
    Pi: () => import("react-icons/pi"),
    Lu: () => import("react-icons/lu"),
};

// ── Style tokens (neu design system) ──────────────────────────
const STYLES = {
    placeholder: "inline-block align-middle",
} as const;

type Props = {
    name: string; // e.g. "FiFacebook"
    size?: number;
    color?: string;
    className?: string;
} & React.SVGProps<SVGSVGElement>;

const IconFromName = ({ name, size = 20, color, className, ...rest }: Props) => {
    const [Icon, setIcon] = React.useState<IconType | null>(null);

    React.useEffect(() => {
        if (!name) return;

        // Prefer longer prefix keys first (e.g. "Io5" before "Io")
        const libraryKey = Object.keys(iconLibraries)
            .sort((a, b) => b.length - a.length)
            .find((prefix) => name.startsWith(prefix));

        if (!libraryKey) {
            console.warn(`[IconFromName] Unknown icon prefix for: "${name}"`);
            return;
        }

        iconLibraries[libraryKey]().then((module) => {
            const Comp = module[name] as IconType | undefined;
            if (Comp) {
                setIcon(() => Comp);
            } else {
                console.warn(`[IconFromName] Icon "${name}" not found in "${libraryKey}"`);
            }
        });
    }, [name]);

    if (!Icon) {
        return (
            <span
                className={`${STYLES.placeholder} ${className ?? ""}`.trim()}
                style={{ width: size, height: size }}
                aria-hidden="true"
            />
        );
    }

    return <Icon size={size} color={color} className={className} {...rest} />;
};

export default React.memo(IconFromName);