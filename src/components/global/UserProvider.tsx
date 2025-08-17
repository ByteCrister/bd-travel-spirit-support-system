// src/components/UserProvider.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { fetchCurrentUser } from '@/utils/helper/api.fetchMe';

interface Props {
    children: React.ReactNode;
}

export function UserProvider({ children }: Props) {
    const { setUser, user } = useUserStore((s) => s);
    const router = useRouter();

    useEffect(() => {
        async function init() {
            if (user) {
                setUser(user);
            } else {
                const user = await fetchCurrentUser();
                if (!user) {
                    // redirect to login when unauthenticated
                    // router.push('/');
                }
            }
        }
        init();
    }, [setUser, router, user]);

    return <>{children}</>;
}
