// app/api/auth/user/v1/name/route.ts
import { NextRequest } from "next/server";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import { withTransaction } from "@/lib/helpers/withTransaction";
import { Types } from "mongoose";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { USER_ROLE } from "@/constants/user.const";
import UserModel, { IUserDoc } from "@/models/user.model";
import { buildEmployeeDTO } from "@/lib/build-responses/build-employee-dt";
import mappedEmployeeUser from "@/lib/build-responses/build-mappedEmployeeUser";
import VERIFY_USER_ROLE from "@/lib/auth/verify-user-role";
import { IEmployeeInfo, IOwnerInfo } from "@/types/user/current-user.types";

// Request body type for name update
interface UpdateNameRequest {
    name: string;
}

// Response type for name update
type UpdateNameResponse = IOwnerInfo | IEmployeeInfo;

// Helper function to validate name
function validateName(name: string): string {
    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new ApiError("Name is required", 400);
    }

    if (trimmedName.length < 2) {
        throw new ApiError("Name must be at least 2 characters", 400);
    }

    if (trimmedName.length > 100) {
        throw new ApiError("Name must not exceed 100 characters", 400);
    }

    return trimmedName;
}

// Main handler function
async function handler(request: NextRequest): Promise<HandlerResult<UpdateNameResponse>> {
    // 1. Get current user ID
    const currentUserId = await getUserIdFromSession();

    if (!currentUserId) {
        throw new ApiError("Unauthorized", 401);
    }

    // 2. Validate user has required role (admin or support)
    await VERIFY_USER_ROLE.MULTIPLE(currentUserId, [USER_ROLE.ADMIN, USER_ROLE.SUPPORT])


    // 3. Parse and validate request body
    let body: UpdateNameRequest;
    try {
        body = await request.json();
    } catch {
        throw new ApiError("Invalid request body", 400);
    }

    const { name } = body;

    if (!name || typeof name !== "string") {
        throw new ApiError("Name is required and must be a string", 400);
    }

    const validatedName = validateName(name);

    // 4. Use transaction for atomic update
    const updatedUser = await withTransaction(async (session) => {
        // Find and update user
        const user = await UserModel.findByIdAndUpdate(
            new Types.ObjectId(currentUserId),
            { name: validatedName },
            {
                new: true,
                session,
                runValidators: true
            }
        ).select("-password").lean<IUserDoc>();

        if (!user) {
            throw new ApiError("User not found", 404);
        }

        // Return appropriate response based on role
        if (user.role === USER_ROLE.ADMIN) {
            const response: IOwnerInfo = {
                email: user.email,
                fullName: user.name,
                role: USER_ROLE.ADMIN,
            };
            return response;
        } else if (user.role === USER_ROLE.SUPPORT) {
            // For support users, we need to fetch employee details
            // You'll need to import and use EmployeeModel here
            // This is a placeholder - adjust based on your actual Employee model
            const dto = await buildEmployeeDTO(new Types.ObjectId(currentUserId), session)
            if (!dto) {
                throw new ApiError("Employee not found.", 404);
            }

            return mappedEmployeeUser(dto);
        } else {
            throw new ApiError("Invalid user role", 400);
        }
    });

    return {
        data: updatedUser,
        status: 200,
    };
}

// Export the wrapped handler
export const PATCH = withErrorHandler(handler);