// components/providers/SocketProvider.tsx
"use client";

import { useEffect } from "react";
import { useCurrentUserStore } from "@/store/current-user.store";
import { EMIT_SOCKET, LISTEN_SOCKET, SOCKET_NAMESPACES } from "@/constants/socket.const";
import { disconnectSocket, getSocket } from "@/socket/initiateSocket";
import { useChatMessageStore } from "@/store/chat-message.store";
import type { ChatMessage } from "@/types/chatMessage.types";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { baseUser } = useCurrentUserStore();
    const { handleEvent } = useChatMessageStore();

    useEffect(() => {
        if (!baseUser?._id) return; // wait for user

        const socket = getSocket(SOCKET_NAMESPACES.USER_ONLINE);
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

        // ─── Chat event listeners ───────────────────────────────
        const onNewMessage = (payload: { userId: string; data: ChatMessage }) => {
            console.log("[Socket] New chat message received:", payload);
            handleEvent({ type: "created", payload: payload.data });
        };

        const onDeleteMessage = (payload: { userId: string; data: { _id: string } }) => {
            console.log("[Socket] Chat message deleted:", payload);
            // Build a minimal ChatMessage to satisfy the event type
            handleEvent({
                type: "deleted",
                payload: { _id: payload.data._id } as ChatMessage,
            });
        };

        const onMarkSeen = (payload: { userId: string; data: { _id: string; isRead: boolean } }) => {
            console.log("[Socket] Message marked as seen:", payload);
            handleEvent({
                type: "read",
                payload: { _id: payload.data._id, isRead: true } as ChatMessage,
            });
        };

        const onUnseenCount = (payload: { userId: string; data: unknown }) => {
            console.log("[Socket] Unseen message count updated:", payload);
            // This can trigger a sidebar refresh or badge update
            // For now, the user-list refetch on openConversation handles this
        };

        socket.on(LISTEN_SOCKET.SEND_NEW_CHAT_MESSAGE, onNewMessage);
        socket.on(LISTEN_SOCKET.DELETE_CHAT_MESSAGE, onDeleteMessage);
        socket.on(LISTEN_SOCKET.MARK_AS_SEEN, onMarkSeen);
        socket.on(LISTEN_SOCKET.INCREASE_UNSEEN_MESSAGE_COUNT, onUnseenCount);

        // Cleanup on user change or unmount
        return () => {
            socket.off("connect", onConnect);
            socket.off(LISTEN_SOCKET.SEND_NEW_CHAT_MESSAGE, onNewMessage);
            socket.off(LISTEN_SOCKET.DELETE_CHAT_MESSAGE, onDeleteMessage);
            socket.off(LISTEN_SOCKET.MARK_AS_SEEN, onMarkSeen);
            socket.off(LISTEN_SOCKET.INCREASE_UNSEEN_MESSAGE_COUNT, onUnseenCount);
            disconnectSocket(SOCKET_NAMESPACES.USER_ONLINE);
        };
    }, [baseUser?._id, handleEvent]); // re-run only when user ID changes

    return <>{children}</>;
}