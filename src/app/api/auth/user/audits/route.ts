// app/api/auth/user/audits/route.ts
import { NextRequest, NextResponse } from "next/server";
import AuditModel, { IAuditDoc } from "@/models/audit.model";
import { AuditListApiResponse, AuditLog } from "@/types/current-user.types";
import { Types } from "mongoose";
import { getUserIdFromSession } from "@/lib/auth/user-id.session.auth";
import ConnectDB from "@/config/db";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
    try {
        await ConnectDB()

        const url = new URL(req.url);
        let page = Number.parseInt(url.searchParams.get("page") ?? `${DEFAULT_PAGE}`, 10);
        let pageSize = Number.parseInt(url.searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`, 10);

        if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
        if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
        pageSize = Math.min(pageSize, MAX_PAGE_SIZE);

        const userId = await getUserIdFromSession();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        if (!Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 });
        }

        const filter = { actor: new Types.ObjectId(userId) };
        const skip = (page - 1) * pageSize;

        // Use .select with array to safely project fields
        const [total, rawAudits] = await Promise.all([
            AuditModel.countDocuments(filter),
            AuditModel.find(filter)
                .select([
                    "_id",
                    "targetModel",
                    "target",
                    "actor",
                    "actorModel",
                    "action",
                    "note",
                    "ip",
                    "userAgent",
                    "changes",
                    "createdAt",
                ])
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean<IAuditDoc[]>(),
        ]);

        // Map Mongoose docs to AuditLog
        const audits: AuditLog[] = rawAudits.map(a => ({
            _id: (a._id as Types.ObjectId).toString(),
            targetModel: a.targetModel,
            target: a.target.toString(),
            actor: a.actor?.toString(),
            actorModel: a.actorModel,
            action: a.action,
            note: a.note,
            ip: a.ip,
            userAgent: a.userAgent,
            changes: a.changes,
            createdAt: a.createdAt.toISOString(),
        }));

        const response: AuditListApiResponse = {
            success: true,
            audits,
            total,
            page,
            pageSize,
        };

        return NextResponse.json(response);
    } catch (err) {
        console.error("Error fetching audits:", err);
        return NextResponse.json(
            { success: false, audits: [], total: 0, page: 1, pageSize: DEFAULT_PAGE_SIZE },
            { status: 500 }
        );
    }
}