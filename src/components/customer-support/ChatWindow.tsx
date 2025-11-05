'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSend,
    FiMoreVertical,
    FiCheck,
    FiCheckCircle,
    FiEdit2,
    FiTrash2,
    FiFlag,
    FiShield,
    FiMessageCircle,
    FiChevronDown
} from 'react-icons/fi';
import type { ConversationQuery, ChatMessage } from '@/types/chatMessage.types';
import { Badge } from '@/components/ui/badge';
import { useChatMessageStore } from '@/store/useChatMessageStore';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

type Props = { adminId: string; userId: string | null };

export function ChatWindow({ adminId, userId }: Props) {
    const [page, setPage] = useState(1);
    const limit = 50;

    // Selectors / actions individually to avoid full-store re-renders
    const fetchConversation = useChatMessageStore((s) => s.fetchConversation);
    const getConversation = useChatMessageStore((s) => s.getConversation);
    const getConversationMeta = useChatMessageStore((s) => s.getConversationMeta);
    const sendMessage = useChatMessageStore((s) => s.sendMessage);
    const updateMessage = useChatMessageStore((s) => s.updateMessage);
    const deleteMessage = useChatMessageStore((s) => s.deleteMessage);
    const markRead = useChatMessageStore((s) => s.markRead);
    const markDelivered = useChatMessageStore((s) => s.markDelivered);
    const moderateMessage = useChatMessageStore((s) => s.moderateMessage);

    const [input, setInput] = useState('');
    const listEndRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isAutoScroll, setIsAutoScroll] = useState(true);

    const query: ConversationQuery | null = useMemo(
        () =>
            userId
                ? {
                    sender: adminId,
                    receiver: userId,
                    page,
                    limit,
                    sortBy: 'createdAt',
                    sortOrder: 'asc',
                }
                : null,
        [adminId, userId, page, limit]
    );

    const [messages, setMessages] = useState<ChatMessage[]>(query ? getConversation(query) : []);
    const [meta, setMeta] = useState<{
        total: number; page: number; limit: number; totalPages: number;
    }>(query ? getConversationMeta(query) : { total: 0, page: 1, limit, totalPages: 0 })

    // fetch conversation when user changes or page changes
    useEffect(() => {
        if (!query) return;

        const fetchAndSet = async () => {
            await fetchConversation(query, { force: true });
            setMessages(getConversation(query));
            setMeta(getConversationMeta(query));
        };

        fetchAndSet().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query?.sender, query?.receiver, query?.page, query?.limit, query?.sortBy, query?.sortOrder, fetchConversation]);


    // Auto-scroll when new messages arrive, only if user is near bottom
    useEffect(() => {
        if (!isAutoScroll) return;
        listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, isAutoScroll]);

    // Track whether user is near bottom to decide auto-scroll behavior
    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;
        const onScroll = () => {
            const threshold = 320; // px from bottom to consider "at bottom"
            const pos = node.scrollHeight - node.scrollTop - node.clientHeight;
            setIsAutoScroll(pos < threshold);
        };
        node.addEventListener('scroll', onScroll, { passive: true });
        // initial check
        onScroll();
        return () => node.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            listEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]); // run when a new user is selected

    // send message with optimistic UI handled by store
    const handleSend = useCallback(async () => {
        if (!userId) return;
        const text = input.trim();
        if (!text) return;
        setInput('');
        try {
            await sendMessage({ receiver: userId, message: text });
            // after send, ensure conversation list is kept consistent; store triggers background refetch
        } catch (err) {
            // optionally show toast (not included)
            console.error('sendMessage failed', err);
        }
    }, [input, sendMessage, userId]);

    // Load older messages (pagination)
    const loadOlder = useCallback(() => {
        if (meta.page >= meta.totalPages) return;
        setPage((p) => p + 1);
    }, [meta.page, meta.totalPages]);

    if (!userId) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                        <FiMessageCircle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No conversation selected</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Choose a conversation from the sidebar to start chatting with customers
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-900">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
                                U
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">User Chat</h3>
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white dark:bg-slate-800">
                            {meta.total} messages
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4 max-w-4xl mx-auto">
                        {meta.page < meta.totalPages && (
                            <div className="flex justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadOlder}
                                    className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800"
                                >
                                    <FiChevronDown className="mr-2 w-4 h-4" />
                                    Load older messages
                                </Button>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {messages.map((m) => (
                                <motion.div
                                    key={m._id}
                                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -12, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <MessageItem
                                        adminId={adminId}
                                        message={m}
                                        onEdit={async (text) => {
                                            try {
                                                await updateMessage(m._id, { message: text, isEdited: true });
                                            } catch (e) {
                                                console.error('update failed', e);
                                            }
                                        }}
                                        onDelete={async () => {
                                            if (!confirm('Delete this message?')) return;
                                            try {
                                                await deleteMessage(m._id);
                                            } catch (e) {
                                                console.error('delete failed', e);
                                            }
                                        }}
                                        onMarkRead={async () => {
                                            try {
                                                await markRead(m._id);
                                            } catch (e) {
                                                console.error('markRead failed', e);
                                            }
                                        }}
                                        onMarkDelivered={async () => {
                                            try {
                                                await markDelivered(m._id ?? m._id);
                                            } catch (e) {
                                                console.error('markDelivered failed', e);
                                            }
                                        }}
                                        onModerate={async (status) => {
                                            try {
                                                await moderateMessage(m._id, status);
                                            } catch (e) {
                                                console.error('moderate failed', e);
                                            }
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div ref={listEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 bg-white dark:bg-slate-900">
                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="pr-12 h-11 rounded-xl border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                    <Button
                        disabled={!input.trim()}
                        onClick={handleSend}
                        className="h-11 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSend className="mr-2" /> Send
                    </Button>
                </div>
            </div>
        </div>
    );
}

/* MessageItem component (typed, self-contained) */
function MessageItem({
    adminId,
    message,
    onEdit,
    onDelete,
    onMarkRead,
    onMarkDelivered,
    onModerate,
}: {
    adminId: string;
    message: ChatMessage;
    onEdit: (text: string) => void | Promise<void>;
    onDelete: () => void | Promise<void>;
    onMarkRead: () => void | Promise<void>;
    onMarkDelivered: () => void | Promise<void>;
    onModerate: (status: 'clean' | 'flagged' | 'removed') => void | Promise<void>;
}) {
    const isMine = (() => {
        const s = message.sender;
        const id = typeof s === 'string' ? s : s._id;
        return id === adminId;
    })();

    const content =
        message.moderationStatus === 'removed' ? (
            <span className="italic opacity-70 flex items-center gap-2">
                <FiShield className="w-4 h-4" />
                Message removed by moderation
            </span>
        ) : (
            message.message
        );

    const getModerationColor = () => {
        switch (message.moderationStatus) {
            case 'flagged': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800';
            case 'removed': return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700';
            default: return '';
        }
    };

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
            <div className={`flex flex-col gap-1.5 ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
                {/* Message Bubble */}
                <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${isMine
                        ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white ${message.moderationStatus !== 'clean' ? getModerationColor() : ''} rounded-tr-sm`
                        : `bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 ${message.moderationStatus !== 'clean' ? getModerationColor() : ''} rounded-tl-sm`
                        } ${message.isDraft ? 'opacity-70 italic border-2 border-dashed' : ''} transition-all`}
                >
                    <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                        {content}
                    </div>

                    {/* Message Footer */}
                    <div className={`flex items-center gap-2 mt-2 text-[11px] ${isMine ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                        {message.isEdited && (
                            <span className="opacity-70">(edited)</span>
                        )}

                        {message.moderationStatus !== 'clean' && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-current">
                                {message.moderationStatus}
                            </Badge>
                        )}

                        <div className="ml-auto flex items-center gap-0.5">
                            {message.isDelivered && (
                                <FiCheck className={`w-3.5 h-3.5 ${message.isRead ? 'text-blue-300' : ''}`} aria-label="delivered" />
                            )}
                            {message.isRead && (
                                <FiCheck className="w-3.5 h-3.5 -ml-1.5 text-blue-300" aria-label="read" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Menu */}
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isMine ? 'self-end' : 'self-start'}`}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <FiMoreVertical className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMine ? 'end' : 'start'} className="w-48">
                            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Message Actions
                            </div>

                            <DropdownMenuItem onClick={() => onMarkRead()}>
                                <FiCheckCircle className="mr-2 w-4 h-4" />
                                Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMarkDelivered()}>
                                <FiCheck className="mr-2 w-4 h-4" />
                                Mark as Delivered
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Moderation
                            </div>

                            <DropdownMenuItem onClick={() => onModerate('clean')}>
                                <FiShield className="mr-2 w-4 h-4 text-green-600" />
                                Mark Clean
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onModerate('flagged')}>
                                <FiFlag className="mr-2 w-4 h-4 text-amber-600" />
                                Flag Message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onModerate('removed')}>
                                <FiShield className="mr-2 w-4 h-4 text-red-600" />
                                Remove Message
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => {
                                    const text = prompt('Edit message:', message.message);
                                    if (typeof text === 'string') onEdit(text);
                                }}
                            >
                                <FiEdit2 className="mr-2 w-4 h-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (confirm('Delete this message?')) onDelete();
                                }}
                                className="text-red-600 dark:text-red-400"
                            >
                                <FiTrash2 className="mr-2 w-4 h-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}