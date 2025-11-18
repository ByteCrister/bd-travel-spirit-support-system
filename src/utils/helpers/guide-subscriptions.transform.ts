// lib/guide-subscriptions/transform.ts
import {
    SubscriptionTierDTO,
    SubscriptionTierFormValues,
    ValidationError,
} from "@/types/guide-subscription-settings.types";

export function normalizePrice(input: string | number): number {
    const raw = typeof input === "string" ? input.trim() : input;
    const n = Number(raw);
    if (Number.isNaN(n) || !isFinite(n)) {
        throw new Error("Invalid price: must be a finite number");
    }
    return n;
}

export function normalizeBillingCycles(
    input: Array<string | number>
): number[] {
    if (!Array.isArray(input) || input.length === 0) {
        throw new Error(
            "billingCycleDays required: provide an array of positive integers (days)"
        );
    }
    const out = input.map((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
            throw new Error(
                "Invalid billingCycleDays: each entry must be a positive integer (days)"
            );
        }
        return Math.floor(n);
    });
    return out;
}

export function toSubscriptionTierDTO(
    values: SubscriptionTierFormValues,
    existing?: Partial<SubscriptionTierDTO>
): SubscriptionTierDTO {
    const price = normalizePrice(values.price);
    const billing = normalizeBillingCycles(values.billingCycleDays);
    return {
        key: String(values.key ?? existing?.key ?? "").trim(),
        title: String(values.title ?? existing?.title ?? "").trim(),
        price,
        currency: values.currency ?? existing?.currency ?? "USD",
        billingCycleDays: billing,
        perks: values.perks ?? existing?.perks ?? [],
        active: values.active ?? existing?.active ?? true,
        metadata: values.metadata ?? existing?.metadata ?? {},
        _id: existing?._id,
        createdAt: existing?.createdAt,
        updatedAt: existing?.updatedAt,
    };
}

/**
 * Suggest duplicate key: append -copy, -copy-2, ...
 */
export function suggestDuplicateKey(existingKey: string, allKeys: string[]) {
    const base = `${existingKey}-copy`;
    if (!allKeys.includes(base)) return base;
    for (let i = 2; i < 1000; i++) {
        const cand = `${existingKey}-copy-${i}`;
        if (!allKeys.includes(cand)) return cand;
    }
    return `${existingKey}-copy-${Date.now()}`;
}

/**
 * Map server ValidationError[] into a record for quick lookup
 */
export function mapValidationErrors(
    errors: ValidationError[] | undefined
): Record<string, string> {
    const out: Record<string, string> = {};
    if (!errors) return out;
    for (const e of errors) {
        if (e.field) out[e.field] = e.message;
    }
    return out;
}
