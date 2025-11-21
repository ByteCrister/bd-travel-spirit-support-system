"use client";

import React from "react";
import { IconType } from "react-icons";

// Map prefixes → react-icons library paths
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

type Props = {
    name: string; // e.g. "FiFacebook"
    size?: number;
    color?: string;
    className?: string;
} & React.SVGProps<SVGSVGElement>;

const IconFromName = ({
    name,
    size = 20,
    color,
    className,
    ...rest
}: Props) => {
    const [Icon, setIcon] = React.useState<IconType | null>(null);

    React.useEffect(() => {
        if (!name) return;

        const libraryKey = Object.keys(iconLibraries).find(prefix =>
            name.startsWith(prefix)
        );

        if (!libraryKey) {
            console.warn("Unknown icon prefix:", name);
            return;
        }

        iconLibraries[libraryKey]().then(module => {
            // module[name] is guaranteed to be an IconType
            const Comp = module[name] as IconType | undefined;
            if (Comp) setIcon(() => Comp);
            else console.warn(`Icon "${name}" not found in ${libraryKey}`);
        });
    }, [name]);

    if (!Icon) return <span className={className} />;

    return <Icon size={size} color={color} className={className} {...rest} />;
}

export default React.memo(IconFromName);