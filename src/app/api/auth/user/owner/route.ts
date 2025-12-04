// app/api/auth/user/owner/route.ts
import { NextResponse } from "next/server";
import OwnerModel from "@/models/owner.model";
import { IOwnerInfo } from "@/types/current-user.types";
import { getUserIdFromSession } from "@/lib/helpers/get-user";
import { USER_ROLE } from "@/constants/user.const";
import ConnectDB from "@/config/db";

/**
 * GET /api/auth/user/owner
 * Returns extended info for the currently logged-in Owner (platform administrator)
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

        // Find Owner by user ID
        const owner = await OwnerModel.findOne({ user: userId });
        if (!owner) {
            return NextResponse.json(
                { success: false, message: "Owner not found" },
                { status: 404 }
            );
        }

        // Populate user info (already auto-populated by pre-hook)

        // Map to IOwnerInfo
        const ownerInfo: IOwnerInfo = {
            role: USER_ROLE.ADMIN,
            fullName: owner.name,
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
