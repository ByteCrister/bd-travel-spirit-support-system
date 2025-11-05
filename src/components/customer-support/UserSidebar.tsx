'use client';

import { useEffect, useMemo, useRef, useState, useCallback, useTransition } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronDown, FiClock, FiMessageCircle, FiUser } from 'react-icons/fi';
import type { UserListQuery, UserConversationSummary } from '@/types/chatMessage.types';
import { buildUserListKey, useChatMessageStore } from '@/store/useChatMessageStore';

type Props = {
    adminId: string;
    selectedUserId: string | null;
    onSelectUser: (id: string) => void;
};

type LocalFilters = {
    isRead?: boolean;
    isDelivered?: boolean;
    moderationStatus?: 'clean' | 'flagged' | 'removed';
};

export function UserSidebar({ adminId, selectedUserId, onSelectUser }: Props) {
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<UserListQuery['sortBy']>('lastMessageAt');
    const [sortOrder, setSortOrder] = useState<UserListQuery['sortOrder']>('desc');
    const [page, setPage] = useState(1);
    const limit = 20;
    const [filters, setFilters] = useState<LocalFilters>({});
    const [, startTransition] = useTransition();

    // stable key (no page/limit)
    const key = useMemo(
        () => buildUserListKey({ adminId, search, sortBy, sortOrder }),
        [adminId, search, sortBy, sortOrder]
    );
    // full query for fetching
    const query: UserListQuery = useMemo(
        () => ({
            adminId,
            search: search || undefined,
            page,
            limit,
            sortBy,
            sortOrder,
        }),
        [adminId, search, page, limit, sortBy, sortOrder]
    );
    // ---- IMPORTANT: select whole maps from the store, not keyed entries ----
    const fetchUserList = useChatMessageStore((s) => s.fetchUserList);
    const userListLoadingByKeyMap = useChatMessageStore((s) => s.userListLoadingByKey);
    const userListErrorByKeyMap = useChatMessageStore((s) => s.userListErrorByKey);
    const userListsByKeyMap = useChatMessageStore((s) => s.userListsByKey);

    // derive keyed values locally (stable)
    const loading = userListLoadingByKeyMap[key] ?? false;
    const error = userListErrorByKeyMap[key];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const rawUsers = userListsByKeyMap[key]?.users ?? [];
    const meta = {
        page: userListsByKeyMap[key]?.page ?? 1,
        totalPages: userListsByKeyMap[key]?.totalPages ?? 1,
        total: userListsByKeyMap[key]?.total ?? 0,
        limit: userListsByKeyMap[key]?.limit ?? limit,
    };

    // client-side refine for filters until backend supports them
    const users = useMemo<UserConversationSummary[]>(() => {
        let list = rawUsers;
        if (filters.moderationStatus) {
            list = list.filter((row) => row.lastMessage?.moderationStatus === filters.moderationStatus);
        }
        if (typeof filters.isRead === 'boolean') {
            list = list.filter((row) => {
                const m = row.lastMessage;
                return m ? m.isRead === filters.isRead : filters.isRead === false;
            });
        }
        if (typeof filters.isDelivered === 'boolean') {
            list = list.filter((row) => {
                const m = row.lastMessage;
                return m ? m.isDelivered === filters.isDelivered : filters.isDelivered === false;
            });
        }
        return list;
    }, [rawUsers, filters]);

    // Debounced fetch (use primitive deps)
    useEffect(() => {
        let mounted = true;
        const t = setTimeout(() => {
            if (!mounted) return;
            fetchUserList(query, { force: true }).catch(() => { });
        }, 250);
        return () => {
            mounted = false;
            clearTimeout(t);
        };
    }, [fetchUserList, query.adminId, query.search, query.page, query.limit, query.sortBy, query.sortOrder, query]);

    // Local scroll container ref to use as the IntersectionObserver root
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    // Infinite scroll
    const loadMore = useCallback(() => {
        if (loading) return;
        if (meta.page >= meta.totalPages) return;
        startTransition(() => setPage((p) => p + 1));
    }, [loading, meta.page, meta.totalPages, startTransition]);

    useEffect(() => {
        const node = sentinelRef.current;
        const root = scrollRef.current;
        if (!node || !root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const e = entries[0];
                if (e.isIntersecting) loadMore();
            },
            {
                root,
                rootMargin: '120px 0px',
                threshold: 0.1,
            }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [loadMore]);

    const formatter = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            }),
        []
    );

    const activeFiltersCount = Object.values(filters).filter(v => v !== undefined).length;

    return (
        <div className="flex flex-col h-full min-h-0 bg-white dark:bg-slate-900">
            {/* Header - More Compact */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                        <FiMessageCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">Conversations</h2>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {meta.total > 0 ? `${meta.total} users` : 'No users'}
                        </p>
                    </div>
                </div>

                {/* Search Bar - Compact */}
                <div className="relative mb-2">
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-3.5 h-3.5" aria-hidden />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => {
                            const v = e.target.value;
                            startTransition(() => {
                                setPage(1);
                                setSearch(v);
                            });
                        }}
                        className="pl-8 pr-3 h-8 text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        aria-label="Search users"
                    />
                </div>

                {/* Filters & Sort - Compact */}
                <div className="flex items-center gap-1.5">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative px-2"
                                aria-label="Filters"
                            >
                                <FiFilter className="mr-1.5 w-3 h-3" />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <Badge className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center bg-blue-500 text-white text-[10px]">
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Moderation
                            </div>
                            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, moderationStatus: 'flagged' }))} className="text-xs">
                                🚩 Flagged
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, moderationStatus: 'removed' }))} className="text-xs">
                                🗑️ Removed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, moderationStatus: 'clean' }))} className="text-xs">
                                ✅ Clean
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Status
                            </div>
                            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, isRead: true }))} className="text-xs">
                                👁️ Read
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, isRead: false }))} className="text-xs">
                                ⭕ Unread
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, isDelivered: true }))} className="text-xs">
                                ✓ Delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilters((f) => ({ ...f, isDelivered: false }))} className="text-xs">
                                ⏳ Not delivered
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilters({})} className="text-xs text-red-600 dark:text-red-400">
                                Clear all filters
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs rounded-md border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-2"
                                aria-label="Sort"
                            >
                                Sort <FiChevronDown className="ml-1.5 w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Sort by
                            </div>
                            <DropdownMenuItem
                                onClick={() => {
                                    setPage(1);
                                    setSortBy('lastMessageAt');
                                }}
                                className="text-xs"
                            >
                                <FiClock className="mr-1.5 w-3 h-3" /> Last message
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setPage(1);
                                    setSortBy('unreadCount');
                                }}
                                className="text-xs"
                            >
                                <FiMessageCircle className="mr-1.5 w-3 h-3" /> Unread count
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setPage(1);
                                    setSortBy('name');
                                }}
                                className="text-xs"
                            >
                                <FiUser className="mr-1.5 w-3 h-3" /> Name
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))} className="text-xs">
                                {sortOrder === 'asc' ? '↑' : '↓'} Order: {sortOrder === 'asc' ? 'Asc' : 'Desc'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* User List - Compact Cards */}
            <ScrollArea ref={scrollRef} className="flex-1 min-h-0 h-full bg-slate-50 dark:bg-slate-900">
                <div className="p-2">
                    {error && (
                        <div className="p-3 mb-2 text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400 font-medium mb-2">Failed to load users</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchUserList(query, { force: true })}
                                className="h-7 text-xs border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {!error && loading && rawUsers.length === 0 && (
                        <div className="space-y-2">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3 w-2/3" />
                                        <Skeleton className="h-2.5 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {users.map((row) => {
                            const id = row.user._id;
                            const avatar = row.user.avatar ?? '/placeholder-avatar.png';
                            const preview = row.lastMessage ? row.lastMessage.message : 'No messages yet';
                            const time = row.lastMessageAt ? formatter.format(new Date(row.lastMessageAt)) : '';
                            const isSelected = selectedUserId === id;
                            const moderationStatus = row.lastMessage?.moderationStatus;
                            const isUnread = row.unreadCount > 0;

                            return (
                                <motion.button
                                    key={id}
                                    onClick={() => onSelectUser(id)}
                                    className={`w-full text-left p-2 rounded-lg mb-1.5 flex items-center gap-2 transition-all duration-200 border
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800 shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                                        }`}
                                    layout
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                    aria-current={isSelected ? 'true' : undefined}
                                >
                                    {/* Avatar */}
                                    <div className="h-9 w-9 relative flex-shrink-0">
                                        <Image
                                            src={avatar}
                                            alt={`${row.user.name} avatar`}
                                            fill
                                            sizes="36px"
                                            className="rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                                        />
                                        {isUnread && (
                                            <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[10px] flex items-center justify-center font-bold shadow-md">
                                                {row.unreadCount > 99 ? '99+' : row.unreadCount}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {/* Name and Time Row */}
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                <span className={`text-xs font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {row.user.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[9px] px-1 py-0 h-3.5 capitalize bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 flex-shrink-0"
                                                >
                                                    {row.user.role}
                                                </Badge>
                                            </div>
                                            {time && (
                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                                                    {time}
                                                </span>
                                            )}
                                        </div>

                                        {/* Message Preview and Status */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className={`text-xs truncate flex-1 ${isSelected ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {preview}
                                            </div>
                                            
                                            {/* Status Indicators */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {moderationStatus === 'flagged' && (
                                                    <span className="text-xs" title="Flagged">🚩</span>
                                                )}
                                                {moderationStatus === 'removed' && (
                                                    <span className="text-xs" title="Removed">🗑️</span>
                                                )}
                                                {row.lastMessage?.isRead && (
                                                    <span className="text-xs text-blue-500" title="Read">✓✓</span>
                                                )}
                                                {row.lastMessage?.isDelivered && !row.lastMessage?.isRead && (
                                                    <span className="text-xs text-slate-400" title="Delivered">✓</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>

                    <div ref={sentinelRef} className="h-8 flex items-center justify-center">
                        {loading && rawUsers.length > 0 && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-700" />
                            </div>
                        )}
                    </div>

                    {!loading && users.length === 0 && !error && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 mb-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                                <FiUser className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">No users found</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {search ? 'Try adjusting your search' : 'No conversations yet'}
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}