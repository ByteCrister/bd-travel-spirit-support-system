import { NextRequest, NextResponse } from 'next/server';
import ConnectDB from '@/config/db';
import { SupportSystemNotificationModel } from '@/models/notifications/support-system-notification.model';
import { AdminNotification } from '@/types/dashboard/dashboard.types';
import { ADMIN_NOTIFICATION_TYPE } from '@/constants/support-system-notification.const';

function mapNotificationType(rawType: string): AdminNotification['type'] {
    switch (rawType) {
        case ADMIN_NOTIFICATION_TYPE.CONTENT_FLAGGED:
            return 'report';
        case ADMIN_NOTIFICATION_TYPE.FAILED_PAYMENT:
        case ADMIN_NOTIFICATION_TYPE.REFUND_REQUESTED:
            return 'revenue_issue';
        case ADMIN_NOTIFICATION_TYPE.NEW_TOUR_REQUESTED:
        case ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION:
        case ADMIN_NOTIFICATION_TYPE.GUIDE_VERIFIED:
            return 'approval_pending';
        case ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR:
        case ADMIN_NOTIFICATION_TYPE.HIGH_TRAFFIC_ALERT:
        case ADMIN_NOTIFICATION_TYPE.LOW_INVENTORY:
            return 'system_alert';
        case ADMIN_NOTIFICATION_TYPE.GUIDE_FORGOT_PASSWORD:
        case ADMIN_NOTIFICATION_TYPE.SUPPORT_EMP_FORGOT_PASSWORD:
        case ADMIN_NOTIFICATION_TYPE.GUIDE_EMP_FORGOT_PASSWORD:
            return 'ticket';
        default:
            return 'system_alert';
    }
}

export async function GET(request: NextRequest) {
    try {
        await ConnectDB();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        const skip = (page - 1) * limit;

        const query = SupportSystemNotificationModel.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const [notifications, total] = await Promise.all([
            query.exec(),
            SupportSystemNotificationModel.countDocuments({ isDeleted: false }),
        ]);

        const transformed: AdminNotification[] = notifications.map((n: any) => ({
            id: n._id.toString(),
            type: mapNotificationType(n.type),
            title: n.title,
            message: n.message,
            severity: (n.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
            createdAt: n.createdAt.toISOString(),
            isRead: n.isRead,
            actionRequired: n.priority === 'high' || n.priority === 'critical',
            meta: n.meta,
        }));

        return NextResponse.json({
            data: {
                items: transformed,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            }
        });

    } catch (error) {
        console.error('Failed to fetch admin notifications:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}