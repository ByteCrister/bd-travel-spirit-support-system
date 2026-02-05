export function sanitizeSearch(
  value?: string | null,
) {
  if (!value) return undefined;

  // Step 1 — normalize user input
  const cleaned = value
    .trim()
    .replace(/\+/g, " ")      // convert URL "+" to spaces
    .replace(/\s+/g, " ")     // collapse multiple spaces
    .normalize("NFKC");       // fix weird unicode characters

  if (!cleaned) return undefined;

  // Step 2 — escape regex special characters (CRITICAL for Mongo safety)
  const escaped = cleaned.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Step 3 — return Mongo-ready regex object
  return escaped;
}