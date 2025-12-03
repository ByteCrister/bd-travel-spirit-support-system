"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react'
import { AuthWrapper } from './AuthWrapper';
import { DashboardProvider } from './DashboardProvider';
interface GlobalProviderProps {
    children: React.ReactNode;
}

const queryClient = new QueryClient();

const GlobalProvider = ({ children }: GlobalProviderProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthWrapper>
                <DashboardProvider>{children}</DashboardProvider>
            </AuthWrapper>
        </QueryClientProvider>
    )
}

export default GlobalProvider