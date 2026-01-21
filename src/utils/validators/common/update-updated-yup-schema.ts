import { NextResponse } from "next/server";
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
            throw NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: err.inner.reduce((acc, e) => {
                        if (e.path) acc[e.path] = e.message;
                        return acc;
                    }, {} as Record<string, string>),
                },
                { status: 400 }
            );
        }

        // Unexpected error
        throw err;
    }
}