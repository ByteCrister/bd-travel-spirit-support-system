import { NextResponse } from "next/server";
import type { ChatMessageStatsResponse } from "@/types/chatMessage.types";
import { messages } from "../route"; // reuse in-memory messages array from /api/chat/route.ts

/**
 * =========================
 * GET /api/chat/stats
 * =========================
 * Returns aggregate statistics for dashboard widgets.
 */
export async function GET(): Promise<NextResponse<ChatMessageStatsResponse>> {
    const stats = {
        totalMessages: messages.length,
        totalDrafts: messages.filter((m) => m.isDraft).length,
        totalDelivered: messages.filter((m) => m.isDelivered).length,
        totalRead: messages.filter((m) => m.isRead).length,
        totalFlagged: messages.filter((m) => m.moderationStatus === "flagged").length,
        totalRemoved: messages.filter((m) => m.moderationStatus === "removed").length,
        totalClean: messages.filter((m) => m.moderationStatus === "clean").length,
        unreadByUser: messages.reduce<Record<string, number>>((acc, m) => {
            if (!m.isRead && typeof m.receiver === "object") {
                const id = m.receiver._id;
                acc[id] = (acc[id] || 0) + 1;
            }
            return acc;
        }, {}),
    };

    const response: ChatMessageStatsResponse = {
        success: true,
        data: stats,
    };

    return NextResponse.json(response, { status: 200 });
}
