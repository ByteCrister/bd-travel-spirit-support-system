"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUserStore } from "@/store/current-user.store";

interface AuthWrapperProps {
    children: ReactNode;
}

const PUBLIC_ONLY_ROUTES = ["/", "/register-as-guide"]; // skip fetch

export function AuthWrapper({ children }: AuthWrapperProps) {
    const pathname = usePathname();
    const skipFetch = PUBLIC_ONLY_ROUTES.includes(pathname);

    const { fetchBaseUser } = useCurrentUserStore();

    const {  } = useQuery({
        queryKey: ["baseUser"],
        queryFn: () => fetchBaseUser(),
        enabled: !skipFetch, // skip fetch for public-only routes
        staleTime: 5 * 60 * 1000, // cache 5 minutes
        retry: false, // do not retry on error
    });

    return <>{children}</>;
}