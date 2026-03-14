import { NextRequest, NextResponse } from 'next/server';
// import ConnectDB from '@/config/db';
// import { AdminNotificationModel } from '@/models/admin/admin-notification.model';
import { ApiResponse } from '@/types/common/api.types';
import { AdminNotification } from '@/types/dashboard/dashboard.types';

export async function GET(request: NextRequest) {
    try {
        // await ConnectDB();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        // const skip = (page - 1) * limit;

        /**
         * TODO: Enable this query once AdminNotificationModel is implemented
         */

        /*
        const query = AdminNotificationModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const [notifications, total] = await Promise.all([
            query.exec(),
            AdminNotificationModel.countDocuments(),
        ]);

        const transformed: AdminNotification[] = notifications.map((n) => ({
            id: n._id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            severity: n.severity,
            createdAt: n.createdAt.toISOString(),
            isRead: n.isRead,
            actionRequired: n.actionRequired,
            meta: n.meta,
        }));
        */

        // Temporary empty response
        const transformed: AdminNotification[] = [];

        return NextResponse.json({
            data: transformed,
            pagination: {
                page,
                limit,
                total: 0,
                pages: 0,
            },
        } as ApiResponse<AdminNotification[]>);

    } catch (error) {
        console.error('Failed to fetch admin notifications:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}