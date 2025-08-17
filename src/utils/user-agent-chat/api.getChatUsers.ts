// src/api/chat/getChatUsers.ts
import axios from 'axios'
import { toast } from 'sonner'

interface User {
    _id: string
    name: string
    avatar: string
}

interface ChatUser {
    user: User
    lastMessage: {
        message: string
        timestamp: string
    }
    unreadCount: number
}

interface Pagination {
    page: number
    limit: number
    hasMore: boolean
}

export interface GetChatUsersResponse {
    users: ChatUser[]
    pagination: Pagination
}

/**
 * Fetches a paginated list of chat users along with their last message and unread count.
 * @param page  The page number to fetch (default: 1)
 * @param limit Number of items per page (default: 10)
 * @returns     Response data or null on failure
 */
/**
 * Fetch a page of chat partners + last message + unread counts.
 */
export async function getChatUsers(
    page: number = 1,
    limit: number = 10
): Promise<GetChatUsersResponse | null> {
    try {
        const { data } = await axios.get<GetChatUsersResponse>(
            '/api/chat/users',
            { params: { page, limit } }
        )
        return data
    } catch (error: unknown) {
        let msg = 'Failed to load chat users'
        if (axios.isAxiosError(error)) {
            msg = error.response?.data?.error ?? error.message
        } else if (error instanceof Error) {
            msg = error.message
        }
        console.error('[getChatUsers]', error)
        toast.error(msg)
        return null
    }
}