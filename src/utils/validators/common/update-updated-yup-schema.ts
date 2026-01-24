import { ApiError } from "@/lib/helpers/withErrorHandler";
import { ValidationError, AnyObjectSchema } from "yup";

/**
 * Validates payload against a Yup schema
 * - Strips unknown fields
 * - Collects all errors
 * - Returns typed data or throws NextResponse
 */
export function validateUpdatedYupSchema<T>(
    schema: AnyObjectSchema,
    payload: unknown
): T {
    try {
        return schema.noUnknown(true).validateSync(payload, {
            abortEarly: false,
            stripUnknown: true,
        }) as T;
    } catch (err) {
        if (err instanceof ValidationError) {
            const firstError = err.inner[0] ?? err;

            throw new ApiError(firstError.message, 400);
        }

        throw err;
    }

}