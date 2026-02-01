// app/api/auth/user/owner/route.ts
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { IOwnerInfo } from "@/types/current-user.types";
import { USER_ROLE } from "@/constants/user.const";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

/**
 * GET /api/auth/user/v1/owner
 * Returns extended info for the currently logged-in Owner (platform administrator)
 */
export const GET = withErrorHandler(async () => {

    await ConnectDB();

    // Get user ID from session
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401)
    }

    await VERIFY_USER_ROLE.ADMIN(userId)

    // Fetch user directly
    const user = await UserModel.findOne({
        _id: userId,
        role: { $in: [USER_ROLE.ADMIN] },
    }).select("name role email");

    // Ensure the user is actually an Admin / Owner
    if (!user) {
        throw new ApiError("User not found", 404)
    }

    // Map to IOwnerInfo
    const ownerInfo: IOwnerInfo = {
        role: user.role as USER_ROLE.ADMIN,
        fullName: user.name ?? "Admin",
        email: user.email
    };

    return {
        data: ownerInfo,
        status: 200,
    }

})