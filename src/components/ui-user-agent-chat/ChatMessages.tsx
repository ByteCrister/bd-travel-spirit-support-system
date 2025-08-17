'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import dayjs from 'dayjs';
import ContextMenuPopover from './ContextMenuPopover';

interface Message {
    _id: string;
    sender: string;
    receiver: string;
    message: string;
    timestamp: string;
    isRead: boolean;
}

interface Props {
    messages: Message[];
    messageInput: string;
    currentUserId: string | null;
    currentChatUserId: string | null;
    onMessageChange: (val: string) => void;
    onSend: () => void;
    onDelete: (id: string) => void;
    onLoadMore: () => void;
    loading: boolean;
}

export default function ChatMessages({
    messages,
    messageInput,
    currentUserId,
    currentChatUserId,
    onMessageChange,
    onSend,
    onDelete,
    onLoadMore,
    loading,
}: Props) {
    const topRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const observer = useRef<IntersectionObserver | null>(null);

    const [contextMenuMsgId, setContextMenuMsgId] = useState<string | null>(null);
    const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

    const firstMessageId = messages[0]?._id;

    const observeTop = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, onLoadMore]
    );

    useEffect(() => {
        if (topRef.current) {
            observeTop(topRef.current);
        }
    }, [observeTop, firstMessageId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setContextMenuMsgId(id);
        setContextMenuPos({ x: e.clientX, y: e.clientY });
    };

    const closeContextMenu = () => {
        setContextMenuMsgId(null);
        setContextMenuPos(null);
    };

    const handleReply = () => {
        // Add your reply logic here or leave empty if not implemented
    };

    const handleCopy = () => {
        if (contextMenuMsgId) {
            const msg = messages.find((m) => m._id === contextMenuMsgId);
            if (msg) navigator.clipboard.writeText(msg.message);
        }
    };

    const groupMessagesByDate = (msgs: Message[]) => {
        const grouped: { [date: string]: Message[] } = {};
        msgs.forEach((msg) => {
            const date = dayjs(msg.timestamp).format('YYYY-MM-DD');
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(msg);
        });
        return grouped;
    };

    const selectedMessage = messages.find(m => m._id === contextMenuMsgId);
    const canDelete = selectedMessage?.sender === currentUserId;

    if (!currentChatUserId) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full text-gray-500 text-lg font-medium">
                No participant selected
            </div>
        );
    }

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="w-2/3 p-4 flex flex-col relative">
            {/* Message List */}
            <div className="flex-1 overflow-y-auto space-y-4 border p-2 rounded-md mb-4 bg-gray-50 relative">
                {loading && <p className="text-sm text-gray-400">Loading...</p>}
                {messages.length === 0 && !loading && <p className="text-gray-400">No messages yet.</p>}
                <div ref={topRef} />
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                        <div className="text-center text-xs text-gray-400 mb-2">
                            {dayjs(date).isSame(dayjs(), 'day') ? 'Today' : dayjs(date).format('MMM DD, YYYY')}
                        </div>
                        {msgs.map((msg) => {
                            const isSender = msg.sender === currentUserId;
                            return (
                                <div
                                    key={msg._id}
                                    className={`max-w-[70%] p-2 rounded-lg relative text-sm ${isSender ? 'ml-auto bg-green-100 text-right' : 'mr-auto bg-white'
                                        } shadow-md`}
                                    onContextMenu={(e) => handleContextMenu(e, msg._id)}
                                >
                                    <p className="break-words">{msg.message}</p>
                                    <div className="flex justify-end items-center gap-1 mt-1 text-gray-400 text-xs">
                                        <span>{dayjs(msg.timestamp).format('hh:mm A')}</span>
                                        {isSender && (
                                            <span className={`${msg.isRead ? 'text-blue-500' : 'text-gray-400'}`}>
                                                {msg.isRead ? '✓✓' : '✓'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Context Menu Popover */}
            <ContextMenuPopover
                isOpen={!!contextMenuMsgId}
                anchorPosition={contextMenuPos}
                onClose={closeContextMenu}
                canDelete={canDelete}
                onDelete={() => contextMenuMsgId && onDelete(contextMenuMsgId)}
                onReply={handleReply}
                onCopy={handleCopy}
            />

            {/* Message Input */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSend();
                }}
                className="flex gap-2"
            >
                <input
                    value={messageInput}
                    onChange={(e) => onMessageChange(e.target.value)}
                    className="flex-1 border border-gray-300 p-2 rounded-md"
                    placeholder="Type a message..."
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
