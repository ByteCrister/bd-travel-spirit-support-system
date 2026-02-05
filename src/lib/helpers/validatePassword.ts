import z from "zod";
import { ApiError } from "./withErrorHandler";


const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");
export function validatePassword(password: unknown) {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
        throw new ApiError(result.error.issues[0].message, 400);
    }
}
