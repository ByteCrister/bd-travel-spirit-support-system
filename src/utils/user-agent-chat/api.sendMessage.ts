// src/api/chat/sendMessage.ts
import axios from 'axios'
import { toast } from 'sonner'

/**
 * Shape of your successful API response
 */
interface SendMessageResponse {
    message: string
}

/**
 * Sends a chat message and toasts on success or failure.
 * @returns the newly created message or null on error
 */
export async function sendMessage(
    receiverId: string,
    message: string
): Promise<string | null> {
    try {
        // Tell Axios what shape to expect back
        const { data } = await axios.post<SendMessageResponse>(
            '/api/chat/messages',
            { receiverId, message }
        )

        // toast.success('Message sent')
        return data.message
    } catch (error: unknown) {
        // Default fallback
        let errorMsg = 'Failed to send message'

        if (axios.isAxiosError(error)) {
            // Axios‐specific error (network, 4xx/5xx, etc)
            errorMsg = error.response?.data?.error ?? error.message
        } else if (error instanceof Error) {
            // Generic JS error (shouldn’t happen here, but just in case)
            errorMsg = error.message
        }

        console.error('sendMessage failed:', error)
        toast.error(errorMsg)
        return null
    }
}
