// components/AuthWrapper.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUserStore } from "@/store/current-user.store";
import type React from "react";
import { SocketProvider } from "./SocketProvider";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { fetchBaseUser } = useCurrentUserStore();

    const { } = useQuery({
        queryKey: ["baseUser"],
        queryFn: () => fetchBaseUser(),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    return (
        <SocketProvider>
            {children}
        </SocketProvider>
    );
}