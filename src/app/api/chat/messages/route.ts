// app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChatMessageModel, IChatMessage } from '@/models/ChatMessage';
import { getUserFromToken } from '@/utils/helper/getUserFromToken';
import ConnectUserDB from '@/config/ConnectUserDB';
import { FilterQuery, Types } from 'mongoose';
import { z, ZodError } from 'zod'

export async function GET(req: Request) {
    try {
        const user = await getUserFromToken().catch(() => null);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbConn = await ConnectUserDB();
        const ChatMessage = getChatMessageModel(dbConn);

        const currentUserId = user.id;
        const { searchParams } = new URL(req.url ?? '', 'http://localhost');
        const participantId = searchParams.get('participantId');
        const cursor = searchParams.get('cursor');
        const pageSize = 20;

        if (!participantId) {
            return NextResponse.json({ error: 'Missing participantId' }, { status: 400 });
        }

        const query: FilterQuery<IChatMessage> = {
            $or: [
                { sender: currentUserId, receiver: participantId },
                { sender: participantId, receiver: currentUserId }
            ],
            isDraft: false
        };

        if (cursor) {
            query['_id'] = { $lt: cursor };
        }

        const messages = await ChatMessage.find(query)
            .sort({ _id: -1 })
            .limit(pageSize)
            .lean();

        const hasNext = messages.length === pageSize;
        const nextCursor = hasNext ? messages[messages.length - 1]._id : null;

        return NextResponse.json({
            messages: messages.reverse(),
            nextCursor
        });
    } catch (error) {
        console.error('❌ Error in GET /api/chat/messages:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}

const messageSchema = z.object({
    receiverId: z.string().refine(Types.ObjectId.isValid, {
        message: 'Invalid receiverId',
    }),
    message: z.string().min(1, 'Message cannot be empty'),
});

export async function POST(req: NextRequest) {
    try {
        // Authenticate user
        const user = await getUserFromToken().catch(() => null);
        // const user = { id: '688271f5239afc1287f50611' }
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate request body
        const body = await req.json();
        const parsed = messageSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.format() },
                { status: 400 }
            );
        }

        const { receiverId, message } = parsed.data;

        // Connect to DB and send message
        const dbConn = await ConnectUserDB();
        const ChatMessage = getChatMessageModel(dbConn);

        const saved = await ChatMessage.create({
            sender: user.id,
            receiver: receiverId,
            message,
            isRead: false,
            timestamp: new Date(),
        });

        return NextResponse.json({ success: true, message: saved }, { status: 201 });
    } catch (error) {
        console.error('❌ Error in POST /api/chat/send:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}

// 1. Define and compile request schema
const bodySchema = z.object({
    userId: z.string().min(1),
    viewerId: z.string().min(1),
})

export async function PUT(req: NextRequest) {
    try {
        // 2. Parse + validate request body
        const json = await req.json()
        const { userId, viewerId } = bodySchema.parse(json)

        // 3. Connect to DB and update documents
        const db = await ConnectUserDB()
        const ChatMessage = getChatMessageModel(db)
        const result = await ChatMessage.updateMany(
            { sender: userId, receiver: viewerId, isRead: false },
            { $set: { isRead: true } }
        )

        // 4. Return success with metadata
        return NextResponse.json(
            { success: true, modifiedCount: result.modifiedCount },
            { status: 200 }
        )
    } catch (err: unknown) {
        console.error('markAsRead error:', err)

        //  Handle Zod validation errors
        if (err instanceof ZodError) {
            // send back the array of validation issues
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid payload',
                    details: err.issues,
                },
                { status: 422 }
            )
        }
        // Fallback: internal error
        return NextResponse.json(
            { success: false, error: 'Unable to mark messages as read' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await getUserFromToken().catch(() => null);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id || !Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid or missing message ID' }, { status: 400 });
        }

        const dbConn = await ConnectUserDB();
        const ChatMessage = getChatMessageModel(dbConn);

        const result = await ChatMessage.deleteOne({
            _id: id,
            sender: user.id,
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Message not found or not authorized' }, { status: 404 });
        }

        return NextResponse.json({ deletedId: id });
    } catch (error) {
        console.error('❌ Error in DELETE /api/chat/deleteMessage:', error);
        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}