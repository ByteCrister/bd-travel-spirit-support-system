// src/api/chat/getMessages.ts
import axios from 'axios'
import { toast } from 'sonner'

interface Message {
    _id: string
    sender: string
    receiver: string
    message: string
    timestamp: string
    isRead: boolean
}

interface GetMessagesResponse {
    messages: Message[]
    nextCursor: string | null
}

/**
 * Fetches a paginated list of chat messages.
 * @param participantId  ID of the other chat participant
 * @param cursor         Optional pagination cursor
 * @returns              Response data or null on failure
 */
export async function getMessages(
    participantId: string,
    cursor?: string
): Promise<GetMessagesResponse | null> {
    try {
        const { data } = await axios.get<GetMessagesResponse>(
            '/api/chat/messages',
            {
                params: { participantId, ...(cursor && { cursor }) },
            }
        )
        return data
    } catch (error: unknown) {
        let errorMsg = 'Failed to load messages'

        if (axios.isAxiosError(error)) {
            // Axios errors (network issues, 4xx/5xx, etc)
            errorMsg = error.response?.data?.error ?? error.message
        } else if (error instanceof Error) {
            // Native JS errors
            errorMsg = error.message
        }

        console.error('getMessages failed:', error)
        toast.error(errorMsg)
        return null
    }
}