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

    // 2. Single aggregation: fetch the current user AND the oldest admin atomically.
    //    $lookup with a pipeline lets us sort + limit inside the join, so we get
    //    exactly one document back (the canonical owner) without a second round-trip.
    const [result] = await UserModel.aggregate([
        // Match the currently logged-in user
        {
            $match: {
                _id: new Types.ObjectId(userId),
                role: { $in: [USER_ROLE.ADMIN, USER_ROLE.SUPPORT] },
            },
        },
        // Co-fetch the oldest admin from the same collection
        {
            $lookup: {
                from: UserModel.collection.name,   // "users"
                pipeline: [
                    { $match: { role: USER_ROLE.ADMIN } },
                    { $sort: { createdAt: 1 } },   // oldest first
                    { $limit: 1 },
                    { $project: { _id: 1 } },
                ],
                as: "ownerAdmin",
            },
        },
        // Flatten the single-element array into a plain object
        {
            $unwind: {
                path: "$ownerAdmin",
                preserveNullAndEmptyArrays: false, // 500 if no admin exists
            },
        },
        // Project only the fields we need
        {
            $project: {
                _id: 1,
                email: 1,
                role: 1,
                createdAt: 1,
                updatedAt: 1,
                owner_id: "$ownerAdmin._id",
            },
        },
    ]);

    if (!result) {
        throw new ApiError("User not found or no admin exists in system", 404);
    }

    // 3. Build the response
    const baseUser: IBaseUser = {
        _id: result._id.toString(),
        owner_id: result.owner_id.toString(),
        email: result.email,
        role: result.role as IBaseUser["role"],
        createdAt: result.createdAt?.toISOString(),
        updatedAt: result.updatedAt?.toISOString(),
    };

    return { data: baseUser, status: 200 };
}