// app/api/dashboard/notifications/v1/read-all/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { USER_ROLE } from "@/constants/user.const";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";

export const PATCH = withErrorHandler(async (_req: NextRequest) => {
    // 1. Authenticate
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Authorize
    await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT]);

    // 3. Business logic
    const result = await withTransaction(async (session) => {
        const activeFilter = {
            isDeleted: false,
            isRead: false,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } },
            ],
        };

        const updateResult = await SupportSystemNotificationModel.updateMany(
            activeFilter,
            { $set: { isRead: true } },
            { session }
        );

        return updateResult.modifiedCount;
    });

    return {
        data: {
            message: "All active notifications marked as read",
            modifiedCount: result,
        },
        status: 200,
    };
});