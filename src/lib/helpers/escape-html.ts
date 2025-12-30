/**
 * Escape HTML special characters in a string.
 *
 * Replaces characters that have special meaning in HTML with their
 * corresponding HTML entities to prevent injection when inserting
 * untrusted text into HTML content.
 *
 * This function converts:
 * - `&` to `&amp;`
 * - `<` to `&lt;`
 * - `>` to `&gt;`
 * - `"` to `&quot;`
 * - `'` to `&#039;`
 *
 * @param {string} str - Input string that may contain characters needing HTML escaping.
 * @returns {string} The escaped string safe for insertion into HTML text nodes or attribute values.
 *
 * Security notes:
 * - This is a simple, fast escaping utility suitable for most UI text contexts.
 * - It does not perform HTML sanitization (removing tags or attributes). For user-supplied HTML or rich content,
 *   use a dedicated sanitizer library (e.g., DOMPurify) or server-side sanitization.
 * - If you need cryptographically secure handling or to avoid double-escaping existing entities,
 *   consider using DOM APIs (e.g., `textContent` on a temporary element) or a well-tested library.
 */
export function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}