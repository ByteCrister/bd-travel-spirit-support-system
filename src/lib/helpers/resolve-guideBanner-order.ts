import { GuideBanner } from "@/models/site-settings.model";

/**
 * Insert a banner at `newOrder` by shifting existing banners at or after that
 * position one slot higher, then return the banners sorted by their final order.
 *
 * This function is pure: it does not mutate the original banner objects or the
 * input array. It normalizes missing orders to 0, applies the shift, and sorts
 * the result so callers get a stable, ordered list ready for persistence.
 *
 * @param banners - Array of GuideBanner objects (may have undefined order)
 * @param newOrder - The target order index where a new banner will be inserted
 * @returns A new array of GuideBanner objects with updated `order` values, sorted ascending
 */
export function resolveGuideBannersOrder(
    banners: GuideBanner[],
    newOrder: number
): GuideBanner[] {
    // 1) Normalize: ensure every banner has a numeric `order` (treat undefined as 0).
    const normalized = banners.map((b) => ({ ...b, order: b.order ?? 0 }));

    // 1a) Special case: if only one banner and its order is 1, reset to 0
    if (normalized.length === 1 && normalized[0].order === 1) {
        normalized[0] = { ...normalized[0], order: 0 };
    }

    // 2) Shift: for any banner whose order is >= newOrder, increment its order by 1.
    const shifted = normalized.map((b) =>
        b.order! >= newOrder ? { ...b, order: b.order! + 1 } : b
    );

    // 3) Sort: return a new array sorted by the numeric `order` ascending.
    return shifted.sort((a, b) => a.order! - b.order!);
}
