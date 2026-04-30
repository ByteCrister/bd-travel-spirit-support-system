// components/providers/SocketProvider.tsx
"use client";

import { useEffect } from "react";
import { useCurrentUserStore } from "@/store/current-user.store";
import {
    EMIT_SOCKET,
    LISTEN_SOCKET_AGET_EVENT,
    LISTEN_SOCKET_CHAT_EVENT,
    SOCKET_NAMESPACES,
} from "@/constants/socket.const";
import { disconnectSocket, getSocket } from "@/socket/initiateSocket";
import { useChatMessageStore } from "@/store/chat-message.store";
import type { ChatMessage } from "@/types/chatMessage.types";
import { useOnlineAgentsStore } from "@/store/online-agents.store";
import { Agent } from "@/types/user/agent";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { baseUser } = useCurrentUserStore();
    const { handleEvent } = useChatMessageStore();
    const { fetchOnlineAgents, registerAgent, removeAgent } = useOnlineAgentsStore();

    useEffect(() => {
        // 🔓 Only require a logged‑in user – normal users have no owner_id
        if (!baseUser?._id) return;

        const socket = getSocket(SOCKET_NAMESPACES.USER_ONLINE);
        socket.connect();

        // ── Register on connect ────────────────────────────────
        const onConnect = () => {
            console.log("Socket connected, registering user", baseUser._id);
            socket.emit(EMIT_SOCKET.REGISTER_USER, {
                userId: baseUser._id,
                owner_id: baseUser.owner_id, // undefined for normal users → fine
            });
        };

        socket.on("connect", onConnect);

        if (socket.connected) {
            onConnect();
            // Company users fetch initial agent list
            if (baseUser.owner_id) {
                fetchOnlineAgents();
            }
        }

        // ── Chat listeners (work for EVERYONE) ─────────────────
        const onNewMessage = (payload: { userId: string; data: ChatMessage }) => {
            console.log("[Socket] New chat message received:", payload);
            handleEvent({ type: "created", payload: payload.data });
        };

        const onDeleteMessage = (payload: { userId: string; data: { _id: string } }) => {
            console.log("[Socket] Chat message deleted:", payload);
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
        };

        socket.on(LISTEN_SOCKET_CHAT_EVENT.SEND_NEW_CHAT_MESSAGE, onNewMessage);
        socket.on(LISTEN_SOCKET_CHAT_EVENT.DELETE_CHAT_MESSAGE, onDeleteMessage);
        socket.on(LISTEN_SOCKET_CHAT_EVENT.MARK_AS_SEEN, onMarkSeen);
        socket.on(LISTEN_SOCKET_CHAT_EVENT.INCREASE_UNSEEN_MESSAGE_COUNT, onUnseenCount);

        // ── Agent listeners (only for company users) ────────────
        let cleanupAgentListeners = () => { };

        if (baseUser.owner_id) {
            const onUserConnected = (payload: { data: Agent }) => {
                registerAgent(payload.data);
            };

            const onUserDisconnected = (payload: { userId: string }) => {
                removeAgent(payload.userId);
            };

            socket.on(LISTEN_SOCKET_AGET_EVENT.USER_CONNECTED, onUserConnected);
            socket.on(LISTEN_SOCKET_AGET_EVENT.USER_DISCONNECTED, onUserDisconnected);

            cleanupAgentListeners = () => {
                socket.off(LISTEN_SOCKET_AGET_EVENT.USER_CONNECTED, onUserConnected);
                socket.off(LISTEN_SOCKET_AGET_EVENT.USER_DISCONNECTED, onUserDisconnected);
            };
        }

        // ── Cleanup on user change or unmount ───────────────────
        return () => {
            socket.off("connect", onConnect);
            socket.off(LISTEN_SOCKET_CHAT_EVENT.SEND_NEW_CHAT_MESSAGE, onNewMessage);
            socket.off(LISTEN_SOCKET_CHAT_EVENT.DELETE_CHAT_MESSAGE, onDeleteMessage);
            socket.off(LISTEN_SOCKET_CHAT_EVENT.MARK_AS_SEEN, onMarkSeen);
            socket.off(LISTEN_SOCKET_CHAT_EVENT.INCREASE_UNSEEN_MESSAGE_COUNT, onUnseenCount);
            cleanupAgentListeners();
            disconnectSocket(SOCKET_NAMESPACES.USER_ONLINE);
        };
    }, [baseUser?._id, baseUser?.owner_id, handleEvent, fetchOnlineAgents, registerAgent, removeAgent]);

    return <>{children}</>;
}