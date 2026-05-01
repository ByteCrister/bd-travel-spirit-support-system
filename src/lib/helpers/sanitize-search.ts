/**
 * Sanitizes a user-provided search string for safe usage in MongoDB queries.
 *
 * Goals:
 * - Normalize inconsistent user input (spaces, encoding, unicode)
 * - Prevent malformed or unintended regex patterns
 * - Avoid regex injection and improve query reliability
 *
 * @param value Raw search input (possibly undefined/null from request)
 * @returns Escaped string safe for building a MongoDB regex, or undefined if empty
 */
export function sanitizeSearch(
  value?: string | null,
) {
  // Guard clause — ignore empty, null, or undefined inputs early
  if (!value) return undefined;

  /**
   * Step 1: Normalize user input
   * - trim(): removes leading/trailing whitespace
   * - replace(/\+/g, " "): converts "+" (common in URL queries) to spaces
   * - replace(/\s+/g, " "): collapses multiple spaces into one
   * - normalize("NFKC"): standardizes unicode (e.g., full-width → normal chars)
   *
   * Why:
   * Ensures consistent and predictable input before processing or querying.
   */
  const cleaned = value
    .trim()
    .replace(/\+/g, " ")
    .replace(/\s+/g, " ")
    .normalize("NFKC");

  // If normalization results in an empty string, skip further processing
  if (!cleaned) return undefined;

  /**
   * Step 2: Escape regex special characters
   * - Escapes characters like ., *, +, ?, ^, $, { }, (, ), |, [, ], \
   *
   * Why:
   * Prevents regex injection and unintended pattern behavior
   * when used in MongoDB $regex queries.
   */
  const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  /**
   * Step 3: Return sanitized string
   *
   * Note:
   * This is NOT a RegExp yet — it’s a safe string that can be used like:
   *   { $regex: escaped, $options: "i" }
   */
  return escaped;
}