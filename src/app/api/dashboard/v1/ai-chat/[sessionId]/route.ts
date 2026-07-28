import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "@/config/db";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { USER_ROLE } from "@/constants/user.const";
import { deleteSession } from "@/lib/ai/chat-session.service";

/**
 * DELETE /api/dashboard/v1/ai-chat/[sessionId]
 *
 * Hard-deletes a chat session and all its messages.
 * Only the session owner (admin / support role) can delete.
 *
 * Responses:
 *   200 { deleted: true }                 – successfully deleted
 *   401 { error: "Unauthorized" }         – not authenticated
 *   403 { error: "Forbidden" }            – wrong role
 *   404 { error: "Session not found" }    – session doesn't exist or is not owned by caller
 *   500 { error: "Internal server error" }
 */
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        await ConnectDB();

        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await VERIFY_USER_ROLE.MULTIPLE(userId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT]);

        const { sessionId } = await params;

        if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const deleted = await deleteSession(sessionId.trim(), userId);

        if (!deleted) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({ deleted: true });
    } catch (error) {
        console.error("AI chat DELETE session error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
