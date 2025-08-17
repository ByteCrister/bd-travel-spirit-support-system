// components/chat/ChatSidebar.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChatUser } from '@/store/chatStore'
import { format, isToday } from 'date-fns'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { getInitials } from '@/utils/helper/getInitials'

interface Props {
    users: ChatUser[]
    currentUserId: string | null
    onSelectUser: (id: string) => void
    fetchMoreUsers: () => void
    hasMoreUsers: boolean
    loadingUsers: boolean
}

export default function ChatSidebar({
    users,
    currentUserId,
    onSelectUser,
    fetchMoreUsers,
    hasMoreUsers,
    loadingUsers,
}: Props) {
    const [searchTerm, setSearchTerm] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const fmtTime = useCallback((iso: string) => {
        const d = new Date(iso)
        return isToday(d) ? format(d, 'hh:mm a') : format(d, 'MM/dd/yyyy')
    }, [])

    useEffect(() => {
        const sent = sentinelRef.current
        if (!sent || !hasMoreUsers) return

        const obs = new IntersectionObserver(
            ([e]) => e.isIntersecting && fetchMoreUsers(),
            { root: containerRef.current, threshold: 0.5 }
        )
        obs.observe(sent)
        return () => obs.disconnect()
    }, [fetchMoreUsers, hasMoreUsers])

    const filteredUsers = users.filter(({ user }) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div
            ref={containerRef}
            className="w-1/3 flex flex-col h-full bg-white border-r border-gray-200"
        >
            {/* Search Input */}
            <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200">
                <input
                    type="text"
                    value={searchTerm}
                    placeholder="Search users..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers.map(
                    ({ user, lastMessage, unreadCount, draftMessage }) => (
                        <div
                            key={user._id}
                            onClick={() => onSelectUser(user._id)}
                            className={`flex items-center gap-3 p-3 mx-2 my-1 rounded-lg cursor-pointer transition
                ${currentUserId === user._id
                                    ? 'bg-blue-50'
                                    : 'hover:bg-gray-50'
                                }`}
                        >
                            {/* Avatar + Status */}
                            <div className="relative flex-shrink-0">
                                <Avatar className="w-10 h-10">
                                    {user.avatar ? (
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                    ) : (
                                        <AvatarFallback>
                                            <Badge
                                                variant="outline"
                                                className="px-2 py-1 bg-gray-100 text-gray-600"
                                            >
                                                {getInitials(user.name)}
                                            </Badge>
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            
                            </div>

                            {/* Name & Last Message */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {user.name}
                                    </h4>
                                    <span className="ml-2 text-xs text-gray-400">
                                        {fmtTime(lastMessage.timestamp)}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-gray-500 truncate">
                                    {draftMessage ? (
                                        <span className="text-orange-500">
                                            Draft: {draftMessage}
                                        </span>
                                    ) : (
                                        lastMessage.message
                                    )}
                                </p>
                            </div>

                            {/* Unread Badge */}
                            {unreadCount > 0 && (
                                <span className="flex-shrink-0 ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    )
                )}

                {/* No Results Handler */}
                {!loadingUsers && filteredUsers.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No users found.
                    </div>
                )}

                {/* Loading Sentinel */}
                <div ref={sentinelRef} className="flex justify-center py-2">
                    {loadingUsers && (
                        <p className="text-sm text-gray-500 animate-pulse">
                            Loading more…
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}