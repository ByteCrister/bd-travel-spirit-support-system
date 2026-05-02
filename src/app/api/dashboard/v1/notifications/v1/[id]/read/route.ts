// app/api/dashboard/notifications/v1/[id]/read/route.ts
import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { withErrorHandler, ApiError } from "@/lib/helpers/withErrorHandler";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { USER_ROLE } from "@/constants/user.const";
import { SupportSystemNotificationModel } from "@/models/notifications/support-system-notification.model";

export const PATCH = withErrorHandler(async (
    _req: NextRequest,
    { params }: { params: { id: string } }
) => {
    // 1. Authenticate
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Authorize
    await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT]);

    // 3. Business logic
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError("Invalid notification ID", 400);
    }

    const notification = await SupportSystemNotificationModel.findById(id);

    if (!notification) {
        throw new ApiError("Notification not found", 404);
    }

    if (notification.isDeleted) {
        throw new ApiError("Notification already deleted", 410);
    }

    if (notification.isRead) {
        return { data: { message: "Already read" }, status: 200 };
    }

    notification.isRead = true;
    await notification.save();

    return { data: { message: "Marked as read" }, status: 200 };
});