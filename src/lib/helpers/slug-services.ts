// lib/services/slug.service.ts
import crypto from 'crypto';
import { TravelArticleModel } from '@/models/articles/travel-article.model';

interface GenerateSlugOptions {
    /** Maximum attempts for random-suffix generation (after incremental tries). Default: 10 */
    maxAttempts?: number;
    /** Maximum total slug length including suffix. Default: 60 */
    maxLength?: number;
    /** Separator between base slug and suffix. Default: '-' */
    separator?: string;
    /** Number of short incremental suffixes to try first (1..n). Default: 5 */
    incrementalTries?: number;
    /** Maximum length reserved for generated suffix (used to truncate base). Default: 30 */
    maxSuffixLength?: number;
}

/**
 * Production-ready slug service
 *
 * Improvements over the original:
 * - Batch-check candidate slugs to minimize DB round-trips
 * - Use crypto for stronger randomness
 * - Unicode-normalized slugify (removes diacritics)
 * - Configurable options with sensible defaults
 * - Clear JSDoc and inline comments for maintainability
 */
export class SlugService {
    private static readonly MAX_ATTEMPTS = 10;
    private static readonly MAX_LENGTH = 60;
    private static readonly SEPARATOR = '-';
    private static readonly INCREMENTAL_TRIES = 5;
    private static readonly MAX_SUFFIX_LENGTH = 30;

    /**
     * Generate a unique slug for a title.
     *
     * @param title - Source title to slugify
     * @param existingSlug - If provided (e.g., on update), returned as-is (no DB checks)
     * @param options - Optional overrides:
     *   - maxAttempts: number of random attempts after incremental tries
     *   - maxLength: maximum total slug length (including suffix)
     *   - separator: string used between base and suffix
     *   - incrementalTries: how many numeric suffixes to try first (1..n)
     *   - maxSuffixLength: maximum length reserved for generated suffix
     */
    static async generateUniqueSlug(
        title: string,
        existingSlug?: string,
        options?: GenerateSlugOptions
    ): Promise<string> {
        const maxAttempts = options?.maxAttempts ?? this.MAX_ATTEMPTS;
        const maxLength = options?.maxLength ?? this.MAX_LENGTH;
        const separator = options?.separator ?? this.SEPARATOR;
        const incrementalTries = options?.incrementalTries ?? this.INCREMENTAL_TRIES;
        const maxSuffixLength = options?.maxSuffixLength ?? this.MAX_SUFFIX_LENGTH;

        // If updating and slug explicitly provided, trust it (caller responsibility).
        if (existingSlug) return existingSlug;

        // Create normalized base slug and clamp to maxLength initially.
        const rawBase = this.slugify(title);
        const baseSlug = rawBase.slice(0, maxLength);

        // Fast path: try base slug alone
        if (await this.checkSlugAvailability(baseSlug)) {
            return baseSlug;
        }

        // Build candidate list in batches to reduce DB calls:
        // 1) short incremental numeric suffixes (more readable)
        // 2) timestamp + random suffix variants (strong uniqueness)
        // We'll check candidates in groups and return the first available one.
        const candidates: string[] = [];

        // 1) incremental numeric suffixes
        for (let i = 1; i <= incrementalTries; i++) {
            candidates.push(`${baseSlug}${separator}${i}`);
        }

        // Batch-check incremental candidates
        const taken = await this.batchCheckSlugs(candidates);
        for (const c of candidates) {
            if (!taken.has(c)) return c;
        }

        // 2) Prepare random/timestamp suffix candidates.
        // Precompute a timestamp and a random base to keep suffixes short and predictable length.
        const timestamp = Date.now().toString(36);
        const randomBase = parseInt(
            crypto.randomBytes(3).toString('hex'),
            16
        ).toString(36).slice(0, 4);

        // Generate up to maxAttempts candidates, but create them in batches (e.g., 10 per batch)
        const batchSize = Math.min(10, Math.max(1, Math.ceil(maxAttempts / 2)));
        let attempt = 0;

        while (attempt < maxAttempts) {
            const batch: string[] = [];
            for (let b = 0; b < batchSize && attempt < maxAttempts; b++, attempt++) {
                // Suffix pattern: timestamp + randomBase + attempt (only if attempt > 0)
                const suffixCore = attempt === 0 ? `${timestamp}${randomBase}` : `${timestamp}${randomBase}${attempt}`;
                // Ensure suffix length doesn't exceed maxSuffixLength
                const suffix = suffixCore.slice(0, maxSuffixLength);
                // Truncate base to fit within maxLength when combined with separator + suffix
                const allowedBaseLen = Math.max(1, maxLength - (separator.length + suffix.length));
                const truncatedBase = baseSlug.slice(0, allowedBaseLen);
                batch.push(`${truncatedBase}${separator}${suffix}`);
            }

            // Batch-check this set of candidates
            const takenInBatch = await this.batchCheckSlugs(batch);
            for (const c of batch) {
                if (!takenInBatch.has(c)) return c;
            }
            // If none available, loop to generate next batch
        }

        throw new Error('Unable to generate unique slug after maximum attempts');
    }

    /**
     * Check if a single slug is available.
     * Uses a lean findOne projection to minimize data transfer.
     *
     * @param slug - slug to check
     * @returns true if slug is NOT present in DB (available)
     */
    private static async checkSlugAvailability(slug: string): Promise<boolean> {
        const existing = await TravelArticleModel.findOneWithDeleted({ slug }).select('_id').lean();
        return !existing;
    }

    /**
     * Batch-check multiple slugs and return a Set of existing slugs.
     * This reduces many single queries into one DB call.
     *
     * @param slugs - array of candidate slugs to check
     * @returns Set of slugs that already exist in DB
     */
    static async batchCheckSlugs(slugs: string[]): Promise<Set<string>> {
        if (!slugs || slugs.length === 0) return new Set<string>();

        // Use a simple find with projection instead of aggregation for clarity and performance.
        // Ensure we only request the slug field and use lean() to avoid hydration overhead.
        const docs = await TravelArticleModel.find({ slug: { $in: slugs } })
            .select('slug -_id')
            .lean();

        const existing = new Set<string>();
        for (const d of docs as Array<{ slug: string }>) {
            if (d.slug) existing.add(d.slug);
        }
        return existing;
    }

    /**
     * Robust slugify:
     * - Normalizes unicode (NFKD) and strips diacritics
     * - Converts to lower-case
     * - Replaces non-word characters with separator
     * - Collapses multiple separators
     *
     * @param text - input string to convert to slug
     */
    private static slugify(text: string): string {
        if (!text) return '';

        // Normalize and remove diacritics (e.g., "é" -> "e")
        const normalized = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

        // Replace non-alphanumeric characters with hyphen, keep ascii letters/numbers
        return normalized
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // replace groups of non-alphanum with separator
            .replace(/^-+/, '') // trim leading separators
            .replace(/-+$/, ''); // trim trailing separators
    }
}