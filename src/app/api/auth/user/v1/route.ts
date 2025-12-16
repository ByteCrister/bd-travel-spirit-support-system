// app/api/auth/user/route.ts
import { NextResponse } from "next/server";
import UserModel from "@/models/user.model";
import { IBaseUser } from "@/types/current-user.types";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";

/**
 * GET /api/auth/user
 * Returns base info for the currently logged-in user
 */
export async function GET() {
    try {
        await ConnectDB()
        // Get user ID from session
        const userId = await getUserIdFromSession();

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Find user by ID
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Map user to IBaseUser
        const baseUser: IBaseUser = {
            _id: (user._id as Types.ObjectId).toString(),
            email: user.email,
            role: user.role as IBaseUser["role"],
            createdAt: user.createdAt!.toISOString(),
            updatedAt: user.updatedAt!.toISOString(),
        };

        return NextResponse.json(baseUser);
    } catch (err) {
        console.error("GET /api/auth/user error:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}