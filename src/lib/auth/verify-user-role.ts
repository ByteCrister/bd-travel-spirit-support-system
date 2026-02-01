import { Types } from "mongoose";
import httpStatus from "http-status";
import UserModel, { IUser, IUserDoc } from "@/models/user.model";
import { USER_ROLE, UserRole } from "@/constants/user.const"
import { ApiError } from "../helpers/withErrorHandler";

/**
 * Options for user validation
 */
export interface ValidateUserOptions {
    /** If true, returns the full user document (excluding password by default) */
    returnUser?: boolean;
    /** If true, includes password in the returned user (only when returnUser is true) */
    includePassword?: boolean;
    /** Custom error messages */
    errorMessages?: {
        notFound?: string;
        invalidRole?: string;
    };
}

export type PublicUser = Omit<IUser, "password">;

/**
 * Validates a user by ID and role
 * @param userId - User ID to validate
 * @param role - Required role or array of roles
 * @param options - Validation options
 * @returns Object with validation result and optionally the user document
 * @throws Error if validation fails (for use in API handlers)
 */
export async function validateUser(
    userId: string | Types.ObjectId,
    role: UserRole | UserRole[],
    options: ValidateUserOptions = {}
): Promise<true | Omit<IUserDoc, "password"> | IUserDoc | PublicUser> {
    const {
        returnUser = false,
        includePassword = false,
        errorMessages = {},
    } = options;

    const {
        notFound = "User not found",
        invalidRole = "Insufficient permissions",
    } = errorMessages;

    // Build query
    const query = UserModel.findById(userId);

    if (returnUser && includePassword) {
        query.select("+password");
    }

    const user = await query.exec();

    if (!user) {
        throw new ApiError(notFound, httpStatus.NOT_FOUND);
    }

    const allowedRoles = Array.isArray(role) ? role : [role];

    if (!allowedRoles.includes(user.role)) {
        throw new ApiError(invalidRole, httpStatus.FORBIDDEN);
    }

    // Success
    if (!returnUser) {
        return true;
    }

    if (includePassword) {
        return user;
    }

    return user.safeToJSON();;
}

const VERIFY_USER_ROLE = {
    ADMIN: async (id: string) => {
        return await validateUser(id, USER_ROLE.ADMIN);
    },
    ASSISTANT: async (id: string) => {
        return await validateUser(id, USER_ROLE.ASSISTANT);
    },
    GUIDE: async (id: string) => {
        return await validateUser(id, USER_ROLE.GUIDE);
    },
    SUPPORT: async (id: string) => {
        return await validateUser(id, USER_ROLE.SUPPORT);
    },
    TRAVELER: async (id: string) => {
        return await validateUser(id, USER_ROLE.TRAVELER);
    },
    MULTIPLE: async (id: string, roles: UserRole[]) => {
        return await validateUser(id, roles);
    },
}

export default VERIFY_USER_ROLE;