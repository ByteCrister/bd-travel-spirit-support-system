// \src\utils\chat\api.draft.ts
import axios from 'axios'
import { toast } from 'react-toastify'

// shape of { error } your API returns on failure
interface ErrorResponse {
    error?: string
}

// shape of a successful save response
interface SaveDraftResponse {
    draft: {
        _id: string
        sender: string
        receiver: string
        message: string
        isRead: boolean
        isDraft: boolean
        createdAt: string
        updatedAt: string
    }
}

/**
 * Saves or updates a draft message in the DB.
 */
export async function saveDraftToDB(
    receiverId: string,
    text: string
): Promise<SaveDraftResponse | null> {
    try {
        const res = await axios.post<SaveDraftResponse>('/api/chat/draft', {
            receiverId,
            text,
        })
        return res.data
    } catch (err: unknown) {
        let message = 'Failed to save draft. Please try again.'

        if (axios.isAxiosError(err)) {
            // err is AxiosError<ErrorResponse>
            const data = err.response?.data as ErrorResponse | undefined
            message = data?.error ?? err.message ?? message
        } else if (err instanceof Error) {
            message = err.message
        }

        toast.error(message)
        console.error('[saveDraftToDB]', err)
        return null
    }
}

/**
 * Deletes all draft(s) for a given receiver in the DB.
 */
export async function deleteDraftFromDB(
    receiverId: string
): Promise<boolean> {
    try {
        await axios.delete<void, void, { receiverId: string }>(
            '/api/chat/draft',
            { data: { receiverId } }
        )
        return true
    } catch (err: unknown) {
        let message = 'Failed to delete draft. Please try again.'

        if (axios.isAxiosError(err)) {
            const data = err.response?.data as ErrorResponse | undefined
            message = data?.error ?? err.message ?? message
        } else if (err instanceof Error) {
            message = err.message
        }

        toast.error(message)
        console.error('[deleteDraftFromDB]', err)
        return false
    }
}
