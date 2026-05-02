// app/api/dashboard/notifications/v1/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { USER_ROLE } from "@/constants/user.const";
import type {
    SupportSystemNotificationType,
    FetchNotificationsResponseType,
} from "@/types/notification.types";
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";

const DEFAULT_LIMIT = 15;

function serializeNotification(doc: any): SupportSystemNotificationType {
    return {
        _id: doc._id.toString(),
        type: doc.type,
        title: doc.title,
        message: doc.message,
        link: doc.link,
        icon: doc.icon,
        relatedModel: doc.relatedModel,
        relatedId: doc.relatedId?.toString(),
        priority: doc.priority,
        meta: doc.meta,
        expiresAt: doc.expiresAt?.toISOString() ?? undefined,
        isRead: doc.isRead,
        isDeleted: doc.isDeleted,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

export const GET = withErrorHandler(async (req: NextRequest) => {
    // 1. Authenticate
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Authorize (Admin or Support)
    await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT]);

    // 3. Business logic
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor") || null;
    const limit = Math.min(
        parseInt(url.searchParams.get("limit") || String(DEFAULT_LIMIT), 10),
        50
    );

    const activeFilter = {
        isDeleted: false,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } },
        ],
    };

    const queryFilter: any = { ...activeFilter };
    if (cursor) {
        if (!Types.ObjectId.isValid(cursor)) {
            throw new ApiError("Invalid cursor", 400);
        }
        queryFilter._id = { $lt: new Types.ObjectId(cursor) };
    }

    const docs = await SupportSystemNotificationModel.find(queryFilter)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean();

    const hasMore = docs.length > limit;
    const resultDocs = hasMore ? docs.slice(0, limit) : docs;
    const notifications = resultDocs.map(serializeNotification);
    const nextCursor = hasMore ? notifications[notifications.length - 1]._id : null;

    const totalUnread = await SupportSystemNotificationModel.countDocuments({
        ...activeFilter,
        isRead: false,
    });

    const data: FetchNotificationsResponseType = {
        notifications,
        nextCursor,
        hasMore,
        totalUnread,
    };

    return { data, status: 200 };
});