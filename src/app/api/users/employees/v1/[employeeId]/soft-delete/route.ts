
import { NextRequest } from "next/server";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { isValidObjectId } from "mongoose";
import ConnectDB from "@/config/db";
import { withTransaction } from "@/lib/helpers/withTransaction";
import EmployeeModel from "@/models/employees/employees.model";
import { Types } from "mongoose";
import { validateUser } from "@/lib/auth/validateUser";
import { USER_ROLE } from "@/constants/user.const";

interface Params {
    params: Promise<{ employeeId: string }>
}
// SoftDelete employee
export const PATCH = withErrorHandler(async (request: NextRequest, { params }: Params) => {
    // 1. Authorize the request
    const adminId = await getUserIdFromSession();
    if (!adminId) throw new ApiError("Unauthorized", 401);

    // 2. Extract and validate employee ID
    const employeeId = decodeURIComponent((await params).employeeId);
    if (!employeeId || !isValidObjectId(employeeId)) throw new ApiError("Invalid employee ID", 400);

    // 3. Parse request body
    const body = await request.json();
    const { reason } = body as { reason?: string };

    // 4. Connect to DB
    await ConnectDB();

    await validateUser(adminId, USER_ROLE.ADMIN);

    // 5. Run soft delete inside transaction
    const deletedEmployee = await withTransaction(async (session) => {
        const deleted = await EmployeeModel.softDeleteById(
            new Types.ObjectId(employeeId),
            session,
            reason,
            new Types.ObjectId(adminId)
        );

        if (!deleted) {
            throw new ApiError("Employee not found or already deleted", 404);
        }

        return deleted;
    });

    // 6. Return success
    return { data: deletedEmployee, status: 200 };
});