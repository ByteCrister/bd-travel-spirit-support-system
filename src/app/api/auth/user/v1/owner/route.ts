// app/api/auth/user/owner/route.ts
import { NextResponse } from "next/server";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import ConnectDB from "@/config/db";
import UserModel from "@/models/user.model";
import { IOwnerInfo } from "@/types/current-user.types";
import { USER_ROLE } from "@/constants/user.const";

/**
 * GET /api/auth/user/owner
 * Returns extended info for the currently logged-in Owner (platform administrator)
 */
export async function GET() {
    try {
        await ConnectDB();

        // Get user ID from session
        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user directly
        const user = await UserModel.findById(userId).select("name role");
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // Ensure the user is actually an Admin / Owner
        if (user.role !== USER_ROLE.ADMIN) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        // Map to IOwnerInfo
        const ownerInfo: IOwnerInfo = {
            role: user.role as USER_ROLE.ADMIN,
            fullName: user.name ?? "Admin",
        };

        return NextResponse.json({ success: true, data: ownerInfo });
    } catch (err) {
        console.error("GET /api/auth/user/owner error:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}