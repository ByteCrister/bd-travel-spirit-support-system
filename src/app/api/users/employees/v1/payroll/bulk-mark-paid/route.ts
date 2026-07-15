import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { AUDIT_ACTION, logAuditBestEffort } from "@/lib/audit/audit-logger";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { bulkMarkManualPayrollPaid } from "@/lib/payroll/employee-payroll.service";
import { BulkMarkManualPayrollPayload } from "@/types/employee/employee.types";

export const POST = withErrorHandler(async (req: NextRequest) => {
    const body: BulkMarkManualPayrollPayload = await req.json();

    if (!Array.isArray(body.employeeIds) || body.employeeIds.length === 0) {
        throw new ApiError("employeeIds must be a non-empty array", 400);
    }

    const invalidIds = body.employeeIds.filter((id) => !Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
        throw new ApiError("One or more employeeIds are invalid", 400);
    }

    const actorId = await getUserIdFromSession();
    if (!actorId) throw new ApiError("Unauthorized", 401);
    await VERIFY_USER_ROLE.ADMIN(actorId);

    await ConnectDB();

    const objectIds = body.employeeIds.map((id) => new Types.ObjectId(id));
    const results = await bulkMarkManualPayrollPaid(
        objectIds,
        new Types.ObjectId(actorId),
        body.manualReference
    );

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    void logAuditBestEffort({
        action: AUDIT_ACTION.UPDATE,
        targetModel: "Employee",
        target: actorId,
        actor: actorId,
        actorModel: "User",
        note: `Bulk manual payroll: ${succeeded} succeeded, ${failed} failed`,
        after: {
            employeeIds: body.employeeIds,
            manualReference: body.manualReference,
            results,
        },
    });

    return {
        data: {
            succeeded,
            failed,
            total: results.length,
            results,
        },
        status: 200,
    };
});
