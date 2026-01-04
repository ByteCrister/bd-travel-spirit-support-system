/* eslint-disable @typescript-eslint/no-unused-vars */
import { GuideBanner } from "@/models/site-settings.model";

/**
 * Resolves banner order safely.
 *
 * Guarantees:
 * - Orders are always 0..n-1
 * - Invalid / sparse / duplicate input orders are ignored
 * - Insertion index is clamped
 * - Stable relative ordering is preserved
 */
export function resolveGuideBannersOrder(
    banners: GuideBanner[],
    requestedOrder: number
): GuideBanner[] {
    /* ---------------------------------
       1️⃣ Normalize & stable-sort
       --------------------------------- */
    const normalized = banners.map((b, index) => ({
        ...b,
        // treat invalid / undefined orders as +∞ so they go last
        _safeOrder:
            typeof b.order === "number" && b.order >= 0
                ? b.order
                : Number.MAX_SAFE_INTEGER,
        _index: index, // stability key
    }));

    normalized.sort((a, b) => {
        if (a._safeOrder !== b._safeOrder) {
            return a._safeOrder - b._safeOrder;
        }
        return a._index - b._index; // stable
    });

    /* ---------------------------------
       2️⃣ Compact orders → 0..n-1
       --------------------------------- */
    const compacted = normalized.map((b, i) => ({
        ...b,
        order: i,
    }));

    /* ---------------------------------
       3️⃣ Clamp requested order
       --------------------------------- */
    const insertAt =
        typeof requestedOrder === "number" && requestedOrder >= 0
            ? Math.min(requestedOrder, compacted.length - 1)
            : compacted.length - 1;

    /* ---------------------------------
       4️⃣ Rebuild list with insertion
       --------------------------------- */
    const reordered = [...compacted].sort((a, b) => a.order! - b.order!);

    reordered.forEach((b) => {
        if (!b._id) {
            b.order = insertAt;
        } else if (b.order! >= insertAt) {
            b.order! += 1;
        }
    });

    /* ---------------------------------
       5️⃣ Final normalize (absolute safety)
       --------------------------------- */
    return reordered
        .sort((a, b) => a.order! - b.order!)
        .map((b, i) => {
            const { _safeOrder, _index, ...clean } = b;
            return { ...clean, order: i };
        });
}