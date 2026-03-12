// app/api/dashboard/v1/statistics/v1/notifications/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        data: {
            sentVsRead: { sent: 0, read: 0, readRate: 0 },
            byType: [],
            byPriority: [],
            deliveryTimeline: [],
        }
    });
}