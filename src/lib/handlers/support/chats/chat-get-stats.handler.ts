// lib/handlers/support/chats/chat-get-stats.handler.ts
import ConnectDB from "@/config/db";
import { ChatMessageModel } from "@/models/chat-message.model";
import { ApiError } from "@/lib/helpers/withErrorHandler";
import { auth } from "@/lib/auth/options.auth";

/**
 * GET /api/support/users/v1/chats/stats
 *
 * Returns dashboard-level statistics about chat messages.
 */
export default async function ChatGetStatsHandler() {
    const session = await auth();
    if (!session?.user?.id) throw new ApiError("Unauthorized", 401);

    await ConnectDB();

    const [stats] = await ChatMessageModel.aggregate([
        {
            $facet: {
                totalMessages: [{ $count: "count" }],
                totalDrafts: [{ $match: { isDraft: true } }, { $count: "count" }],
                totalDelivered: [{ $match: { isDelivered: true } }, { $count: "count" }],
                totalRead: [{ $match: { isRead: true } }, { $count: "count" }],
                totalFlagged: [{ $match: { moderationStatus: "flagged" } }, { $count: "count" }],
                totalRemoved: [{ $match: { moderationStatus: "removed" } }, { $count: "count" }],
                totalClean: [{ $match: { moderationStatus: "clean" } }, { $count: "count" }],
            },
        },
    ]);

    const extract = (arr: { count: number }[]) => arr[0]?.count ?? 0;

    return {
        data: {
            data: {
                totalMessages: extract(stats.totalMessages),
                totalDrafts: extract(stats.totalDrafts),
                totalDelivered: extract(stats.totalDelivered),
                totalRead: extract(stats.totalRead),
                totalFlagged: extract(stats.totalFlagged),
                totalRemoved: extract(stats.totalRemoved),
                totalClean: extract(stats.totalClean),
            },
        },
        status: 200,
    };
}
