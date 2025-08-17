// src/hooks/useChatManage.tsx
'use client'

import { useEffect, useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useUserStore } from '@/store/useUserStore'
import { deleteDraftFromDB } from '@/utils/user-agent-chat/api.draft'
import { apiHandleLogout } from '@/utils/helper/api.handle-logout'

export const useChatManage = () => {
    const {
        users,
        messages,
        currentChatUserId,
        nextCursor,
        loadingUsers,
        loadingMessages,
        hasMoreUsers,

        setCurrentChatUserId,
        fetchUsers,
        fetchMoreUsers,
        fetchMessages,
        loadMoreMessages,
        markRead,
        send,
        removeMessage,

        setDraft,
        getDraft
    } = useChatStore()

    const { user } = useUserStore()
    const [messageInput, setMessageInput] = useState('')

    // 1) Initial load of chat users
    useEffect(() => {
        fetchUsers(true)
    }, [fetchUsers])

    //1. First Effect: Fetch messages + restore draft
    useEffect(() => {
        if (!currentChatUserId) return;
        fetchMessages(currentChatUserId);
        setMessageInput(getDraft(currentChatUserId));
    }, [currentChatUserId, fetchMessages, getDraft]);

    // 2. Second Effect: When messages update, check if they need to be marked as read
    useEffect(() => {
        const partnerId = currentChatUserId;
        const myId = user?.id;

        if (!partnerId || !myId || messages.length === 0) return;

        const messagesFromPartner = messages.some(
            (m) => m.sender === partnerId && m.receiver === myId && !m.isRead
        );

        if (messagesFromPartner) {
            markRead(partnerId, myId);
        }
    }, [messages, currentChatUserId, markRead, user?.id]);

    // Handlers
    const handleSend = async () => {
        if (!messageInput.trim()) return
        await send(messageInput.trim())
        setMessageInput('')
        if (currentChatUserId) {
            await deleteDraftFromDB(currentChatUserId)
        }
    }

    const handleInputChange = (val: string) => {
        setMessageInput(val)
        if (currentChatUserId) {
            setDraft(currentChatUserId, val)
        }
    }

    const handleLogout = async () => {
        const isSucceed = await apiHandleLogout();
        if (isSucceed) window.location.href = '/';
    }

    return {
        // state
        users,
        messages,
        currentChatUserId,
        currentUser: user,
        nextCursor,
        loadingUsers,
        loadingMessages,
        hasMoreUsers,

        // actions
        setCurrentChatUserId,
        fetchMoreUsers,
        loadMoreMessages,
        removeMessage,

        // message UI
        messageInput,
        setMessageInput,
        handleSend,
        handleInputChange,
        handleLogout
    }
}
