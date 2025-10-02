import { AxiosError } from "axios";

/**
 * Safely extracts a human‑readable error message from any thrown value.
 *
 * This helper normalizes different error shapes into a single `string`:
 * - If the error is an AxiosError, it prefers the server's response message
 *   (`response.data.error`) when available, otherwise falls back to Axios' own message.
 * - If it's a standard JavaScript `Error`, it returns the `.message` property.
 * - If it's something unexpected (string, number, object, etc.), it returns a generic
 *   `"Unknown error"` string to avoid leaking raw values.
 *
 * Usage:
 * ```ts
 * try {
 *   await apiCall();
 * } catch (err) {
 *   const message = extractErrorMessage(err);
 *   toast.error(message);
 * }
 * ```
 */
export function extractErrorMessage(err: unknown): string {
    if (err instanceof AxiosError) {
        return err.response?.data?.error || err.message;
    }
    if (err instanceof Error) {
        return err.message;
    }
    return "Unknown error";
}
