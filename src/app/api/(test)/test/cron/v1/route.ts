// app/api/test/cron/v1/route.ts

import { NextRequest } from "next/server";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

function verifyCronAuth(req: NextRequest) {
    const token = process.env.CRON_API_TOKEN;

    if (!token) {
        throw new ApiError("Cron API token is not configured", 500);
    }

    const authorization = req.headers.get("authorization");

    if (authorization !== `Bearer ${token}`) {
        throw new ApiError("Unauthorized", 401);
    }
}

export const GET = withErrorHandler(async (req: NextRequest) => {
    verifyCronAuth(req);

    return {
        status: 200,
        data: {
            success: true,
            message: "Cron authentication successful.",
            timestamp: new Date().toISOString(),
            userAgent: req.headers.get("user-agent"),
            ip:
                req.headers.get("x-forwarded-for") ??
                req.headers.get("x-real-ip") ??
                "Unknown",
        },
    };
});