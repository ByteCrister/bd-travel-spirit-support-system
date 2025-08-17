// src/api/chat/messages.ts
import axios from 'axios'
import { toast } from 'sonner'

export interface MarkAsReadResponse {
    success: boolean
    modifiedCount?: number
    error?: string
}

/**
 * Marks all unread messages between userId → viewerId as read.
 * Displays toasts and returns the API result.
 */
export async function markMessagesAsRead(
    userId: string,
    viewerId: string
): Promise<MarkAsReadResponse> {
    try {
        const { data } = await axios.put<MarkAsReadResponse>(
            '/api/chat/messages',
            { userId, viewerId }
        )
        if (!data.success) {
            // Backend returned an error payload
            const msg = data.error ?? 'Could not mark messages read'
            toast.error(msg)
            return data
        }

        // toast.success(
        //     `${data.modifiedCount ?? 0} message${data.modifiedCount === 1 ? '' : 's'
        //     } marked as read`
        // )
        return data
    } catch (error: unknown) {
        // Network or Axios-specific errors
        let errorMsg = 'Failed to update read status'
        if (axios.isAxiosError(error)) {
            errorMsg = error.response?.data?.error ?? error.message
        } else if (error instanceof Error) {
            errorMsg = error.message
        }
        console.error('markMessagesAsRead failed:', error)
        toast.error(errorMsg)
        return { success: false, error: errorMsg }
    }
}
