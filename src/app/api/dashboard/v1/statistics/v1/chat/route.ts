// app/api/dashboard/v1/statistics/v1/chat/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        data: {
            messagesOverTime: [],
            readVsUnread: { read: 0, unread: 0, readRate: 0 },
            topConversations: [],
            avgResponseTime: 0,
        }
    });
}