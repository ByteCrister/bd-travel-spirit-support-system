// type/api.types.ts

/**
 * Generic API response wrapper.
 *
 * This type standardizes the structure of responses returned from API calls.
 * It ensures consistency across success and error states while allowing
 * flexible typing for the `data` payload.
 *
 * @template T - The type of the data payload returned on success.
 */
export type ApiResponse<T> = {

    /** The data returned from the API (present only if `success` is true) */
    data?: T;

    /** Error message describing why the API call failed (present only if `success` is false) */
    error?: string;
};
