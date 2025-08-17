// app/api/chat/draft/route.ts

import { NextResponse } from 'next/server'
import { getChatMessageModel } from '@/models/ChatMessage'
import { z } from 'zod'
import ConnectUserDB from '@/config/ConnectUserDB'
import { getUserFromToken } from '@/utils/helper/getUserFromToken'



// 1. Zod schema for incoming payload
const DraftSchema = z.object({
    receiverId: z.string().min(1, 'receiverId is required'),
    text: z.string().min(1, 'text cannot be empty'),
})

// 2. Helper to return consistent JSON errors
function errorResponse(message: string, status = 500) {
    return NextResponse.json({ error: message }, { status })
}

// 3. POST handler
export async function POST(req: Request) {
    try {
        // 3.1 Authenticate
        const user = await getUserFromToken().catch(() => null);
        if (!user?.id) {
            return errorResponse('Unauthorized', 401)
        }

        // 3.2 Parse & validate body
        const body = await req.json()
        const parsed = DraftSchema.safeParse(body)
        if (!parsed.success) {
            const msg = parsed.error.issues.map(e => e.message).join('; ')
            return errorResponse(`Invalid data: ${msg}`, 400)
        }
        const { receiverId, text } = parsed.data

        // 3.3 Connect to Mongo
        const db = await ConnectUserDB()
        const ChatMessage = getChatMessageModel(db)

        // 3.4 Upsert draft in one shot
        const draft = await ChatMessage.findOneAndUpdate(
            {
                sender: user.id,
                receiver: receiverId,
                isDraft: true,
            },
            {
                $set: {
                    message: text,
                    isRead: false,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        )

        // 3.5 Return the created/updated draft
        return NextResponse.json({ draft }, { status: 201 })

    } catch (err: unknown) {
        console.error('POST /api/chat/draft error:', err)
        return errorResponse('Internal server error', 500)
    }
}

// Zod schema for incoming payload
const DeleteSchema = z.object({
    receiverId: z.string().min(1, 'receiverId is required'),
})

// DELETE /api/chat/draft
export async function DELETE(req: Request) {
    try {
        const user = await getUserFromToken().catch(() => null);
        if (!user?.id) {
            return errorResponse('Unauthorized', 401)
        }

        const body = await req.json()
        const parsed = DeleteSchema.safeParse(body)
        if (!parsed.success) {
            const msg = parsed.error.issues.map(e => e.message).join('; ')
            return errorResponse(`Invalid data: ${msg}`, 400)
        }
        const { receiverId } = parsed.data

        const db = await ConnectUserDB()
        const ChatMessage = getChatMessageModel(db)

        await ChatMessage.deleteMany({
            sender: user.id,
            receiver: receiverId,
            isDraft: true,
        })

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err: unknown) {
        console.error('DELETE /api/chat/draft error:', err)
        return errorResponse('Internal server error', 500)
    }
}