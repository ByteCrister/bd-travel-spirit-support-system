// components/providers/SocketProvider.tsx
"use client";

import { useEffect } from "react";
import { useCurrentUserStore } from "@/store/current-user.store";
import { EMIT_SOCKET, SOCKET_NAMESPACES } from "@/constants/socket.const";
import { disconnectSocket, getSocket } from "@/socket/initiateSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { baseUser } = useCurrentUserStore();

    useEffect(() => {
        if (!baseUser?._id) return; // wait for user

        const socket = getSocket(SOCKET_NAMESPACES.USER_CHAT);
        socket.connect();

        // Register the user once connected
        const onConnect = () => {
            console.log("Socket connected, registering user", baseUser._id);
            socket.emit(EMIT_SOCKET.REGISTER_USER, { userId: baseUser._id });
        };

        socket.on("connect", onConnect);

        // If already connected, register immediately
        if (socket.connected) {
            onConnect();
        }

        // Cleanup on user change or unmount
        return () => {
            socket.off("connect", onConnect);
            disconnectSocket(SOCKET_NAMESPACES.USER_CHAT);
        };
    }, [baseUser?._id]); // re-run only when user ID changes

    return <>{children}</>;
}