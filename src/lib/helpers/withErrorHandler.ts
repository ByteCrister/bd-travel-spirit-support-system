// lib/helpers/withErrorHandler.ts

import { NextResponse } from "next/server";

/**
 * Custom error class for API handlers.
 *
 * Extends the native `Error` object with an HTTP status code,
 * allowing you to throw typed errors that can be caught and
 * translated into standardized API responses.
 */
export class ApiError extends Error {
    /** HTTP status code associated with the error */
    status: number;

    /**
     * @param message - Human-readable error message
     * @param status - HTTP status code (defaults to 500)
     */
    constructor(message: string, status = 500) {
        super(message);
        this.status = status;
    }
}

/**
 * Standardized result type returned by handler functions.
 *
 * @template T - The type of the data payload returned on success.
 */
export type HandlerResult<T> = {
    /** The data payload returned from the handler */
    data: T;

    /** Optional HTTP status code (defaults to 200 if not provided) */
    status?: number;
};

/**
 * Higher-order function that wraps an async API handler with
 * consistent error handling and response formatting.
 *
 * - On success: returns `{ success: true, data }` with the given status.
 * - On failure: catches errors, logs them, and returns
 *   `{ success: false, error }` with the appropriate status.
 *
 * @template T - The type of the data payload returned on success.
 * @template Args - The argument types accepted by the handler function.
 *
 * @param fn - Async handler function that returns a `HandlerResult<T>`.
 * @returns A wrapped handler that produces a `NextResponse<ApiResponse<T>>`.
 */
export function withErrorHandler<T, Args extends unknown[]>(
    fn: (...args: Args) => Promise<HandlerResult<T>>
): (...args: Args) => Promise<NextResponse<{ data: T } | { error: string }>> {
    return async (...args: Args) => {
        try {
            const { data, status = 200 } = await fn(...args);

            return NextResponse.json({ data }, { status });
        } catch (err: unknown) {
            let message = "Internal Server Error";
            let status = 500;

            if (err instanceof ApiError) {
                message = err.message;
                status = err.status;
            } else if (err instanceof Error) {
                message = err.message;
            }

            console.log("API Error:", err);

            return NextResponse.json({ error: message }, { status });
        }
    };
}