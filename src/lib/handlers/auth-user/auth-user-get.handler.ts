// app/api/auth/user/v1/route.ts
import UserModel from "@/models/user.model";
import { IBaseUser } from "@/types/user/current-user.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { USER_ROLE } from "@/constants/user.const";
import { ApiError } from "@/lib/helpers/withErrorHandler";

/**
 * GET /api/auth/user/v1
 * Returns base info for the currently logged-in user
 */
export default async function AuthUserGetHandler() {

    await ConnectDB()
    // Get user ID from session
    const userId = await getUserIdFromSession();

    if (!userId) {
        throw new ApiError("Unauthorized", 401)

    }

    // Find user by ID
    const user = await UserModel.findOne({
        _id: userId,
        role: { $in: [USER_ROLE.ADMIN, USER_ROLE.SUPPORT] },
    })

    if (!user) {
        throw new ApiError("User not found", 404)
    }

    // Map user to IBaseUser
    const baseUser: IBaseUser = {
        _id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        role: user.role as IBaseUser["role"],
        createdAt: user.createdAt!.toISOString(),
        updatedAt: user.updatedAt!.toISOString(),
    };

    return { data: baseUser, status: 200 }
} 