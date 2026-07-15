import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import { AUDIT_ACTION, logAuditBestEffort } from "@/lib/audit/audit-logger";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import {
    bulkMarkManualPayrollPaid,
    markManualPayrollPaid,
} from "@/lib/payroll/employee-payroll.service";
import { MarkManualPayrollPayload } from "@/types/employee/employee.types";

interface Params {
    params: Promise<{ employeeId: string }>;
}

export const POST = withErrorHandler(async (req: NextRequest, { params }: Params) => {
    const employeeId = resolveMongoId((await params).employeeId);
    if (!Types.ObjectId.isValid(employeeId)) {
        throw new ApiError("Invalid employeeId", 400);
    }

    const body: MarkManualPayrollPayload = await req.json().catch(() => ({}));

    const actorId = await getUserIdFromSession();
    if (!actorId) throw new ApiError("Unauthorized", 401);
    await VERIFY_USER_ROLE.ADMIN(actorId);

    await ConnectDB();

    await markManualPayrollPaid(
        new Types.ObjectId(employeeId),
        new Types.ObjectId(actorId),
        {
            year: body.year,
            month: body.month,
            manualReference: body.manualReference,
        }
    );

    const employeeDto = await buildEmployeeDTO(new Types.ObjectId(employeeId));

    void logAuditBestEffort({
        action: AUDIT_ACTION.UPDATE,
        targetModel: "Employee",
        target: employeeId,
        actor: actorId,
        actorModel: "User",
        note: "Marked manual payroll as paid",
        after: {
            manualReference: body.manualReference,
            year: body.year,
            month: body.month,
        },
    });

    return { data: employeeDto, status: 200 };
});
