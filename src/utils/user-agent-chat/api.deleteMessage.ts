// src/api/chat/messages/route.ts
import axios from 'axios'
import { toast } from 'sonner'

/**
 * Shape of your delete‐message API response.
 * Adjust the fields to match what your backend actually returns.
 */
interface DeleteMessageResponse {
    deletedId: string
    message?: string
}

export async function deleteMessage(
    id: string
): Promise<DeleteMessageResponse | null> {
    try {
        // Tell Axios what shape to expect back
        const { data } = await axios.delete<DeleteMessageResponse>(
            `/api/chat/messages?id=${id}`
        )

        // toast.success('Message deleted')
        return data
    } catch (error: unknown) {
        // Default fallback
        let errorMsg = 'Failed to delete message'

        if (axios.isAxiosError(error)) {
            // Axios‐specific error (network, 4xx/5xx, etc)
            errorMsg = error.response?.data?.error ?? error.message
        } else if (error instanceof Error) {
            // Generic JS error
            errorMsg = error.message
        }

        console.error('deleteMessage failed:', error)
        toast.error(errorMsg)
        return null
    }
}
