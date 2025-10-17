// /src/utils/helpers/companies.company-table.ts

/**
 * Format a numeric rating into a string with one decimal place.
 * - Ensures the rating is always clamped between 0 and 5.
 * - Useful for displaying user or company ratings consistently.
 *
 * @param n - The raw rating value (can be any number).
 * @returns A string representation of the rating (e.g., "4.3").
 */
export function formatRating(n: number): string {
    // Clamp the value between 0 and 5 to avoid invalid ratings
    const v = Math.min(5, Math.max(0, n));
    // Always return with one decimal place for consistency
    return v.toFixed(1);
}

/**
 * Format an ISO date string into a human-readable date.
 * - Uses the browser's locale for formatting.
 * - Returns "—" if the input is null, undefined, or invalid.
 *
 * Example: "2023-10-15T00:00:00Z" → "Oct 15, 2023"
 *
 * @param iso - An ISO date string (e.g., "2023-10-15T00:00:00Z").
 * @returns A formatted date string or "—" if invalid.
 */
export function formatDate(iso?: string | null): string {
    if (!iso) return "—";
    try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat(undefined, {
            month: "short", // Abbreviated month (e.g., "Oct")
            day: "2-digit", // Always two-digit day (e.g., "05")
            year: "numeric", // Full year (e.g., "2023")
        }).format(d);
    } catch {
        // Fallback for invalid date parsing
        return "—";
    }
}

/**
 * Format an ISO date string into a relative time description.
 * - Returns values like "Today", "Yesterday", "3 days ago", "2 weeks ago".
 * - Falls back to an empty string if the input is invalid.
 *
 * Example: If today is Oct 17, 2025:
 *   "2025-10-17T08:00:00Z" → "Today"
 *   "2025-10-16T08:00:00Z" → "Yesterday"
 *   "2025-10-10T08:00:00Z" → "1 week ago"
 *
 * @param iso - An ISO date string.
 * @returns A human-readable relative time string.
 */
export function formatRelativeTime(iso?: string | null): string {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        const now = new Date();

        // Difference in milliseconds between now and the given date
        const diffMs = now.getTime() - d.getTime();
        // Convert milliseconds to whole days
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Map the difference in days to a human-readable label
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
        // Fallback for invalid date parsing
        return "";
    }
}
