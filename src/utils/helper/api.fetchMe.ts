// src/lib/api/fetchMe.ts
import { useUserStore } from '@/store/useUserStore';
import { User } from '@/types/user.type';
import axios from 'axios';
import { toast } from 'sonner';

export async function fetchCurrentUser(): Promise<User | null> {
    try {
        // send cookie automatically if withCredentials is true
        const response = await axios.get<User>('/api/me', {
            withCredentials: true,
        });

        // on success, inject into Zustand and return
        const user = response.data;
        useUserStore.getState().setUser(user);
        return user;
    } catch (error: unknown) {
        // extract message from AxiosError or fallback
        let message = 'Unknown error';
        if (axios.isAxiosError(error)) {
            message =
                (error.response?.data as { error?: string })?.error ||
                error.message;
        } else if (error instanceof Error) {
            message = error.message;
        }

        // show toast and return null
        toast.error(message, { duration: 4000 });
        return null;
    }
}
