'use client'

import { useChatManage } from '@/hooks/useChatManage'
import Navbar from '@/components/ui/Navbar'
import ChatSidebar from '@/components/ui-user-agent-chat/ChatSidebar'
import ChatMessages from '@/components/ui-user-agent-chat/ChatMessages'

export default function ChatPage() {
    const {
        users,
        currentChatUserId,
        setCurrentChatUserId,
        fetchMoreUsers,
        hasMoreUsers,
        loadingUsers,

        messages,
        loadingMessages,
        messageInput,
        setMessageInput,
        handleSend,
        removeMessage,
        loadMoreMessages,

        currentUser,
        handleLogout,
    } = useChatManage()

    return (
        <div className="flex flex-col h-screen">
            {/* Top nav */}
            <Navbar currentUser={currentUser} onLogout={handleLogout} />

            {/* Main content */}
            <div className="flex flex-1">
                <ChatSidebar
                    users={users}
                    currentUserId={currentUser?.id ?? null}
                    onSelectUser={setCurrentChatUserId}
                    fetchMoreUsers={fetchMoreUsers}
                    hasMoreUsers={hasMoreUsers}
                    loadingUsers={loadingUsers}
                />
                <ChatMessages
                    messages={messages}
                    currentChatUserId={currentChatUserId ?? null}
                    currentUserId={currentUser?.id ?? null}
                    messageInput={messageInput}
                    onMessageChange={setMessageInput}
                    onSend={handleSend}
                    onDelete={removeMessage}
                    onLoadMore={loadMoreMessages}
                    loading={loadingMessages}
                />
            </div>
        </div>
    )
}
