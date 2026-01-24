// lib/helpers/slugify.ts

/**
 * Create a URL-friendly slug from a title.
 *
 * @param title - The input string to convert into a slug. Can contain Unicode, punctuation, and whitespace.
 * @param options - Optional configuration object.
 *   @param options.maxLength - Maximum length of the returned slug. The function will try not to cut a word in half;
 *                             if a word boundary cannot be found before maxLength it will truncate at maxLength.
 *                             Default: 50.
 *   @param options.locale - Locale used for case conversion (passed to toLocaleLowerCase). Default: 'en'.
 *   @param options.fallback - Value to return when the slug would be empty after normalization (e.g., title was only punctuation).
 *                            Default: 'n-a'.
 *
 * @returns A lowercased, ASCII-safe slug with no leading/trailing dashes and no repeated dashes.
 */
export function slugify(
  title: string,
  options?: { maxLength?: number; locale?: string; fallback?: string }
): string {
  const { maxLength = 50, locale = 'en', fallback = 'n-a' } = options ?? {};

  if (typeof title !== 'string') {
    throw new TypeError('slugify: title must be a string');
  }

  // 1) Normalize Unicode to decompose combined characters (NFKD)
  // 2) Remove combining diacritical marks (accents)
  // 3) Replace any remaining non-alphanumeric characters with a dash
  // 4) Collapse multiple dashes into one, trim leading/trailing dashes
  let slug = title
    .normalize('NFKD') // decompose accents so we can strip them
    .replace(/[\u0300-\u036f]/g, '') // remove combining diacritical marks
    // Replace any character that is not a letter or number with a dash.
    // \p{L} and \p{N} are Unicode properties (letters and numbers). The 'u' flag enables Unicode mode.
    .replace(/[^\p{L}\p{N}]+/gu, '-') // group separators and punctuation into dashes
    .replace(/-+/g, '-') // collapse repeated dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes

  // Lowercase using locale (safer for languages with special casing rules)
  slug = slug.toLocaleLowerCase(locale);

  // If slug is empty after normalization, return fallback
  if (!slug) return fallback;

  // Truncate to maxLength without cutting mid-word when possible
  if (slug.length > maxLength) {
    // If there's a dash before maxLength, cut at the last dash within the limit
    const cutIndex = slug.lastIndexOf('-', maxLength);
    if (cutIndex > 0) {
      slug = slug.slice(0, cutIndex);
    } else {
      // No dash found within limit, hard truncate
      slug = slug.slice(0, maxLength);
    }

    // Remove any trailing dash(s) after truncation
    slug = slug.replace(/-+$/g, '');
  }

  // Final safety: if truncation removed everything, return fallback
  if (!slug) return fallback;

  return slug;
}


export function generateSlug(title: string, existingSlugs: string[] = []): string {
  const slugOptions = {
    maxLength: 60,
    locale: 'en',
    fallback: 'article'
  };

  const baseSlug = slugify(title, slugOptions);
  let finalSlug = baseSlug;
  let counter = 1;

  // Check against existing slugs
  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;

    if (counter > 100) {
      finalSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return finalSlug;
}
