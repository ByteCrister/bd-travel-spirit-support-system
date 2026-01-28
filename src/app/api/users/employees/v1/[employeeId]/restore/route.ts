import { NextRequest } from "next/server";
import { Types } from "mongoose";
import { withErrorHandler, ApiError, HandlerResult } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { EmployeeDetailDTO } from "@/types/employee.types";
import EmployeeModel from "@/models/employees/employees.model";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import ConnectDB from "@/config/db";
import { validateUser } from "@/lib/auth/validateUser";
import { USER_ROLE } from "@/constants/user.const";

/**
 * PATCH /users/v1/employees/[id]/restore
 * Restores a soft-deleted employee
 */
export const PATCH = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ employeeId: string }> }
): Promise<HandlerResult<EmployeeDetailDTO>> => {

    const adminId = await getUserIdFromSession();

    if (!adminId || !Types.ObjectId.isValid(adminId)) {
        throw new ApiError("Unauthorized", 401);
    }

    const employeeId = decodeURIComponent((await params).employeeId);

    if (!employeeId || !Types.ObjectId.isValid(employeeId)) {
        throw new ApiError("Invalid employee ID", 400);
    }

    const objectId = new Types.ObjectId(employeeId);

    await ConnectDB();

    await validateUser(adminId, USER_ROLE.ADMIN);

    const restoredEmployee = await withTransaction(async (session) => {
        const employee = await EmployeeModel.restoreById(objectId, session);

        if (!employee) {
            throw new ApiError("Employee not found or already active", 404);
        }

        const employeeDTO = await buildEmployeeDTO(objectId, false, session);

        if (!employeeDTO) {
            throw new ApiError("Failed to build employee DTO", 500);
        }

        return employeeDTO;
    });

    return {
        data: restoredEmployee,
        status: 200,
    };
});