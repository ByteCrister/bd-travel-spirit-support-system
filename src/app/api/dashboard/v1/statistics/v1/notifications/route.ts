// app/api/dashboard/v1/statistics/v1/notifications/route.ts
import { NextRequest } from "next/server";
import { Model } from "mongoose";
import { withErrorHandler, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { NotificationsStats, CategoryCount, TimeSeriesPoint } from "@/types/dashboard/statistics.types";
import ConnectDB from "@/config/db";
import { TravelerNotificationModel } from "@/models/notifications/traveler-notification.model";
import { GuideSystemNotificationModel } from "@/models/notifications/guide-system-notification.model";
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";

type DateRangeFilter = {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
    };
};

function parseDate(value: string | null): Date | undefined {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildDateFilter(from: string | null, to: string | null): DateRangeFilter {
    const fromDate = parseDate(from);
    const toDate = parseDate(to);
    if (!fromDate && !toDate) return {};
    const createdAt: DateRangeFilter["createdAt"] = {};
    if (fromDate) createdAt.$gte = fromDate;
    if (toDate) createdAt.$lte = toDate;
    return { createdAt };
}

async function getNotificationsStats(req: NextRequest): Promise<HandlerResult<NotificationsStats>> {
    await ConnectDB();

    const searchParams = req.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dateFilter = buildDateFilter(from, to);

    // Note: TravelerNotification has 'isRead', while Guide and Support might also have 'isDeleted'
    // But we are focusing on global aggregation based on date filter
    const matchQuery = { ...dateFilter };

    // Common aggregation for metrics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getStatsForModel = async (ModelInstance: Model<any>, systemName: string) => {
        // Timeline
        const timeline = await ModelInstance.aggregate<{ _id: string; count: number }>([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
        ]);

        // Priority breakdown
        const priority = await ModelInstance.aggregate<{ _id: string; count: number }>([
            { $match: matchQuery },
            { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]);

        // Sent vs Read
        const sentVsRead = await ModelInstance.aggregate<{ sent: number; read: number }>([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    sent: { $sum: 1 },
                    read: { $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] } },
                },
            },
        ]);

        return {
            systemName,
            timeline,
            priority,
            sentVsRead: sentVsRead[0] || { sent: 0, read: 0 },
        };
    };

    // Run aggregations across all 3 models in parallel
    const [travelerStats, guideStats, supportStats] = await Promise.all([
        getStatsForModel(TravelerNotificationModel, "Travelers"),
        getStatsForModel(GuideSystemNotificationModel, "Guides"),
        getStatsForModel(SupportSystemNotificationModel, "Support"),
    ]);

    const allStats = [travelerStats, guideStats, supportStats];

    // Combine timeline
    const timelineMap = new Map<string, number>();
    allStats.forEach((stat) => {
        stat.timeline.forEach((item) => {
            timelineMap.set(item._id, (timelineMap.get(item._id) || 0) + item.count);
        });
    });

    const deliveryTimeline: TimeSeriesPoint[] = Array.from(timelineMap.entries())
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Combine priorities
    const priorityMap = new Map<string, number>();
    allStats.forEach((stat) => {
        stat.priority.forEach((item) => {
            const key = item._id ? item._id.toUpperCase() : "NORMAL";
            priorityMap.set(key, (priorityMap.get(key) || 0) + item.count);
        });
    });

    const byPriority: CategoryCount[] = Array.from(priorityMap.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

    // Sent vs Read and By System
    let totalSent = 0;
    let totalRead = 0;
    const bySystem: CategoryCount[] = [];

    allStats.forEach((stat) => {
        totalSent += stat.sentVsRead.sent;
        totalRead += stat.sentVsRead.read;
        bySystem.push({
            label: stat.systemName,
            count: stat.sentVsRead.sent,
        });
    });
    
    // Calculate readRate
    const readRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;

    return {
        data: {
            sentVsRead: {
                sent: totalSent,
                read: totalRead,
                readRate: Math.round(readRate * 10) / 10, // Round to 1 decimal place
            },
            bySystem: bySystem.sort((a, b) => b.count - a.count),
            byPriority,
            deliveryTimeline,
        }
    };
}

export const GET = withErrorHandler(getNotificationsStats);