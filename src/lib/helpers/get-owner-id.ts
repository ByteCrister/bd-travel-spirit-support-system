import { USER_ROLE } from "@/constants/user.const";
import { UserModel } from "@/models/user.model";
import { Types } from "mongoose";

/**
 * Returns the ObjectId of the first admin user (by creation order).
 * Returns null if no admin exists.
 */
export async function getOwnerId(): Promise<Types.ObjectId | null> {
    const owner = await UserModel.findOne({ role: USER_ROLE.ADMIN })
        .sort({ createdAt: 1 })
        .select("_id")
        .lean();

    return (owner?._id as Types.ObjectId) ?? null;
}