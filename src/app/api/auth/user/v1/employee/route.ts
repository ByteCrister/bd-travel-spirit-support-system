// app/api/auth/user/v1/employee/route.ts
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import ConnectDB from "@/config/db";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import { Types } from "mongoose";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { IEmployeeInfo } from "@/types/current-user.types";
import mappedEmployeeUser from "@/lib/build-responses/build-mappedEmployeeUser";
import EmployeeModel from "@/models/employees/employees.model"; // Add this import
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";

// Create the actual handler function that will be wrapped
async function handler(): Promise<{ data: IEmployeeInfo }> {
    await ConnectDB();

    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    await VERIFY_USER_ROLE.SUPPORT(userId);


    // Use withTransaction to wrap the employee DTO building
    const mappedDto = await withTransaction(async (session) => {
        // First, find the employee by userId
        const employee = await EmployeeModel.findOne({ 
            user: new Types.ObjectId(userId) 
        }).session(session).exec();
        
        if (!employee) {
            throw new ApiError("Employee not found.", 404);
        }

        // Now use the employee's ID (not the user's ID)
        const dto = await buildEmployeeDTO(employee._id as Types.ObjectId, session);
        if (!dto) {
            throw new ApiError("Employee not found.", 404);
        }

        return mappedEmployeeUser(dto);
    });

    return { data: mappedDto };
}

// Export the wrapped handler using withErrorHandler
export const GET = withErrorHandler(handler);