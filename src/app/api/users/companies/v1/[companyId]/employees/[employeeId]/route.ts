// api/users/companies/v1/[companyId]/employees/[employeeId]
import { NextRequest } from "next/server";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { IEmployee } from "@/models/employees/employees.model";
import { Types } from "mongoose";
import { UserRole } from "@/constants/user.const";
import ConnectDB from "@/config/db";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import { PopulatedAssetLean } from "@/types/populated-asset.types";

interface Params {
    params: Promise<{ employeeId: string }>
}

export type EmployeeLeanPopulated =
    Omit<IEmployee,
        | "user"
    > & {
        _id: Types.ObjectId;
        user: {
            _id: Types.ObjectId;
            name: string;
            avatar?: PopulatedAssetLean
            role: UserRole
        };
    };

// Get full employee details
export const GET = withErrorHandler(async (req: NextRequest, { params }: Params) => {

    const decodedId = resolveMongoId((await params).employeeId);

    if (!decodedId || !Types.ObjectId.isValid(decodedId)) {
        throw new ApiError("Invalid employeeId", 400);
    }

    await ConnectDB()

    const employeeDto = await buildEmployeeDTO(new Types.ObjectId(decodedId));

    if (!employeeDto) {
        throw new ApiError("Employee not found", 404);
    }

    return {
        data: employeeDto,
        status: 200
    }

})