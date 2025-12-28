import { showToast } from "@/components/global/showToast";
import { extractErrorMessage } from "../axios/extract-error-message";
import api from "../axios";

/**
 * Updates the password for a given employee.
 *
 * @param employeeId - Unique identifier of the employee whose password is being changed.
 *   - Must be a valid string ID (e.g., database ObjectId or UUID).
 *   - Will be URL-encoded before being sent to the API.
 *
 * @param password - The new password to set for the employee.
 *   - Should already meet backend validation rules (length, complexity, etc.).
 *   - Sent in the request body as JSON.
 * @param sendMail - To notify about the new password.
 *   - Should already meet backend validation rules (length, complexity, etc.).
 *   - Sent in the request body as JSON.
 *
 * @returns Promise<boolean> - Resolves to `true` if the password update succeeds.
 *   - On success, a success toast is shown.
 *   - On failure, an error toast is shown and the error is re-thrown.
 *
 * @throws Error - If the API request fails or the server responds with an error.
 */
export async function updateEmployeePassword(employeeId: string, password: string, sendMail: boolean): Promise<boolean> {
    try {
        await api.put(`/users/v1/employees/${encodeURIComponent(employeeId)}/update-password`, {
            password,
            sendMail
        });

        showToast.success("Password updated");
        return true;
    } catch (err: unknown) {
        console.error("changePasswordApi", err);
        showToast.error(String(extractErrorMessage(err) ?? "Failed to update password"));
        throw err;
    }
}
