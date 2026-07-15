import { NextRequest } from "next/server";
import { Types } from "mongoose";
import ConnectDB from "@/config/db";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import { AUDIT_ACTION, logAuditBestEffort } from "@/lib/audit/audit-logger";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { retryEmployeeSalaryPayment } from "@/lib/cron/employee-payment.cron";

interface Params {
    params: Promise<{ employeeId: string }>;
}

export const POST = withErrorHandler(async (req: NextRequest, { params }: Params) => {
    const employeeId = resolveMongoId((await params).employeeId);
    if (!Types.ObjectId.isValid(employeeId)) {
        throw new ApiError("Invalid employeeId", 400);
    }

    const actorId = await getUserIdFromSession();
    if (!actorId) throw new ApiError("Unauthorized", 401);
    await VERIFY_USER_ROLE.ADMIN(actorId);

    await ConnectDB();

    const status = await retryEmployeeSalaryPayment(new Types.ObjectId(employeeId));

    if (status === "failed") {
        throw new ApiError("Salary payment retry failed", 502);
    }

    if (status === "skipped") {
        throw new ApiError("Salary payment retry was skipped — not due or already paid", 409);
    }

    const employeeDto = await buildEmployeeDTO(new Types.ObjectId(employeeId));

    void logAuditBestEffort({
        action: AUDIT_ACTION.UPDATE,
        targetModel: "Employee",
        target: employeeId,
        actor: actorId,
        actorModel: "User",
        note: "Retried automatic salary payment",
    });

    return { data: employeeDto, status: 200 };
});
