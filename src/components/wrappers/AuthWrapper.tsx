"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUserStore } from "@/store/current-user.store";
import type React from "react";

interface AuthWrapperProps {
    children: React.ReactNode;
}


export function AuthWrapper({ children }: AuthWrapperProps) {
    const { fetchBaseUser } = useCurrentUserStore();

    const {  } = useQuery({
        queryKey: ["baseUser"],
        queryFn: () => fetchBaseUser(),
        staleTime: 5 * 60 * 1000, // cache 5 minutes
        retry: false, // do not retry on error
    });

    return <>{children}</>;
}