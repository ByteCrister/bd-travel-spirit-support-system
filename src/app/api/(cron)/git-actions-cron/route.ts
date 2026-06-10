import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import {
    cleanupDeletedAssets,
    processEmployeePayments,
    processTourSettlements,
} from "@/lib/cron";

function verifyCronAuth(req: NextRequest) {
    const token = process.env.CRON_API_TOKEN!;

    if (!token) {
        throw new ApiError("Cron API token is not configured", 500);
    }

    const authorization = req.headers.get("authorization");
    if (authorization !== `Bearer ${token}`) {
        throw new ApiError("Unauthorized", 401);
    }
}

async function runCronJobs() {
    await ConnectDB();

    const assetCleanup = await cleanupDeletedAssets();
    const employeePayments = await processEmployeePayments();
    const tourSettlements = await processTourSettlements();

    return {
        success: true,
        results: {
            assetCleanup,
            employeePayments,
            tourSettlements,
        },
    };
}

export const GET = withErrorHandler(async (req: NextRequest) => {
    verifyCronAuth(req);

    const data = await runCronJobs();

    return { data, status: 200 };
});

export const POST = withErrorHandler(async (req: NextRequest) => {
    verifyCronAuth(req);

    const data = await runCronJobs();

    return { data, status: 200 };
});
