/**
 * Generates a compact UTC timestamp suffix for use in keys, titles, or identifiers.
 *
 * Format: `-restored-YYYYMMDDTHHMMSSZ`
 * - Uses UTC time to ensure consistency across environments.
 * - Safe for filenames, cache keys, and other contexts requiring predictable, locale-independent strings.
 *
 * @returns {string} A string containing the suffix with a UTC timestamp in ISO-like compact format.
 */
export default function restoredSuffix(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `-restored-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
        d.getUTCHours()
    )}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}