// app/api/auth/user/v1/route.ts
import UserModel from "@/models/user.model";
import { IBaseUser } from "@/types/user/current-user.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { USER_ROLE } from "@/constants/user.const";
import { ApiError } from "@/lib/helpers/withErrorHandler";

export default async function AuthUserGetHandler() {
    await ConnectDB();

    // 1. Get current user ID from session
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Find the logged-in user (must be admin or support)
    const user = await UserModel.findOne({
        _id: userId,
        role: { $in: [USER_ROLE.ADMIN, USER_ROLE.SUPPORT] },
    });
    if (!user) {
        throw new ApiError("User not found", 404);
    }

    // 3. Retrieve the owner_id → first user with role "admin"
    const firstAdmin = await UserModel.findOne({ role: USER_ROLE.ADMIN })
        .sort({ createdAt: 1 })   // oldest admin = owner
        .select('_id')
        .lean();

    if (!firstAdmin) {
        throw new ApiError("Owner (admin) not found in system", 500);
    }

    // 4. Build the response
    const baseUser: IBaseUser = {
        _id: (user._id as Types.ObjectId).toString(),
        owner_id: (firstAdmin._id as Types.ObjectId).toString(),
        email: user.email,
        role: user.role as IBaseUser["role"],
        createdAt: user.createdAt!.toISOString(),
        updatedAt: user.updatedAt!.toISOString(),
    };

    return { data: baseUser, status: 200 };
}