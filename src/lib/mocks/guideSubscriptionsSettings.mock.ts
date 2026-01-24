// lib/mock/guideSubscriptions.ts
import { faker } from "@faker-js/faker";
import type {
    SubscriptionTierDTO,
    ValidationError,
} from "@/types/guide-subscription-settings.types";

type SiteSettingsSingleton = {
    guideSubscriptions: SubscriptionTierDTO[];
    version: number;
    updatedAt: string;
};

const nowIso = () => new Date().toISOString();

function samplePerks(n = 2) {
    return Array.from({ length: n }).map(() =>
        faker.helpers.arrayElement([
            "Priority support",
            "Early access to new content",
            "Downloadable guide PDFs",
            "Offline maps",
            "Ad-free experience",
            "Exclusive discounts",
        ])
    );
}

function makeTier(overrides: Partial<SubscriptionTierDTO> = {}): SubscriptionTierDTO {
    const key =
        overrides.key ??
        faker.helpers
            .slugify(`${faker.company.name()}-${faker.internet.password({ length: 4 })}`)
            .toLowerCase();
    const createdAt = overrides.createdAt ?? nowIso();
    const updatedAt = overrides.updatedAt ?? nowIso();
    return {
        key: String(key),
        title: overrides.title ?? `${faker.commerce.productAdjective()} Plan`,
        price: typeof overrides.price === "number" ? overrides.price : Number(faker.commerce.price({ min: 0, max: 199, dec: 2 })),
        currency: overrides.currency ?? "USD",
        billingCycleDays: overrides.billingCycleDays ?? [30],
        perks: overrides.perks ?? samplePerks(2),
        active: typeof overrides.active === "boolean" ? overrides.active : true,
        _id: overrides._id ?? faker.database.mongodbObjectId(),
        createdAt,
        updatedAt,
    };
}

const singleton: SiteSettingsSingleton = {
    guideSubscriptions: [
        makeTier({ key: "basic_monthly", title: "Basic — Monthly", price: 4.99, billingCycleDays: [30] }),
        makeTier({ key: "pro_monthly", title: "Pro — Monthly", price: 14.99, billingCycleDays: [30] }),
        makeTier({ key: "enterprise_yearly", title: "Enterprise — Yearly", price: 199.0, billingCycleDays: [365], active: false }),
    ],
    version: 1,
    updatedAt: nowIso(),
};

function bumpVersion() {
    singleton.version += 1;
    singleton.updatedAt = nowIso();
}

/**
 * Return a deep-ish copy for safety
 */
export function getSiteSettings() {
    return {
        guideSubscriptions: singleton.guideSubscriptions.map((t) => ({ ...t })),
        version: singleton.version,
        updatedAt: singleton.updatedAt,
    };
}

export function findTierByKeyOrId(idOrKey: string) {
    return singleton.guideSubscriptions.find((t) => t._id === idOrKey || t.key === idOrKey) ?? null;
}

export function validateTierInput(input: Partial<SubscriptionTierDTO>): ValidationError[] {
    const errs: ValidationError[] = [];

    const key = String(input.key ?? "").trim();
    if (!key) errs.push({ field: "key", message: "Key is required" });
    else if (!/^[a-z0-9-_]+$/i.test(key)) errs.push({ field: "key", message: "Key must be alphanumeric, dash or underscore" });

    const title = String(input.title ?? "").trim();
    if (!title) errs.push({ field: "title", message: "Title is required" });

    const price = input.price;
    const priceNum = Number(price);
    if (price === undefined || price === null || Number.isNaN(priceNum)) errs.push({ field: "price", message: "Price is required and must be a number" });
    else if (!isFinite(priceNum) || priceNum < 0) errs.push({ field: "price", message: "Price must be a finite number >= 0" });

    const billing = input.billingCycleDays;
    if (!Array.isArray(billing) || billing.length === 0) errs.push({ field: "billingCycleDays", message: "At least one billing cycle is required" });
    else if (billing.some((v) => !Number.isInteger(Number(v)) || Number(v) <= 0)) errs.push({ field: "billingCycleDays", message: "Billing cycles must be positive integers (days)" });

    return errs;
}

/**
 * Upsert a single tier. Returns:
 *  - { ok: true, data: { tier, version, updatedAt } }
 *  - { ok: false, status: 400, errors }  // validation
 *  - { ok: false, status: 409, message }  // version conflict
 */
export function upsertTier(
    input: Partial<SubscriptionTierDTO>,
    editorId?: string,
    note?: string,
    clientVersion?: number
) {
    const errors = validateTierInput(input);
    if (errors.length > 0) {
        return { ok: false, status: 400, errors };
    }

    if (typeof clientVersion === "number" && clientVersion !== singleton.version) {
        return { ok: false, status: 409, message: "Version conflict" };
    }

    const key = String(input.key).trim();
    const existingIdx = singleton.guideSubscriptions.findIndex((t) => t.key === key || t._id === input._id);

    const now = nowIso();
    const toSave: SubscriptionTierDTO = {
        key,
        title: String(input.title).trim(),
        price: Number(input.price),
        currency: input.currency ?? "USD",
        billingCycleDays: (input.billingCycleDays ?? []).map(Number),
        perks: input.perks ?? [],
        active: typeof input.active === "boolean" ? input.active : true,
        _id: input._id ?? faker.database.mongodbObjectId(),
        createdAt: existingIdx >= 0 ? singleton.guideSubscriptions[existingIdx].createdAt : now,
        updatedAt: now,
    };

    if (existingIdx >= 0) {
        singleton.guideSubscriptions[existingIdx] = toSave;
    } else {
        singleton.guideSubscriptions.push(toSave);
    }

    bumpVersion();

    return { ok: true, data: { tier: { ...toSave }, version: singleton.version, updatedAt: singleton.updatedAt } };
}

export function deleteTierById(id: string, clientVersion?: number) {
    if (typeof clientVersion === "number" && clientVersion !== singleton.version) {
        return { ok: false, status: 409, message: "Version conflict" };
    }
    const idx = singleton.guideSubscriptions.findIndex((t) => t._id === id || t.key === id);
    if (idx === -1) {
        return { ok: false, status: 404, message: "Not found" };
    }
    singleton.guideSubscriptions.splice(idx, 1);
    bumpVersion();
    return { ok: true, data: { version: singleton.version, updatedAt: singleton.updatedAt } };
}

export function reorder(orderedIds: string[], clientVersion?: number) {
    if (typeof clientVersion === "number" && clientVersion !== singleton.version) {
        return { ok: false, status: 409, message: "Version conflict" };
    }

    const idToTier = new Map<string, SubscriptionTierDTO>();
    for (const t of singleton.guideSubscriptions) {
        idToTier.set(t.key, t);
        if (t._id) idToTier.set(t._id, t);
    }

    const newList: SubscriptionTierDTO[] = [];
    for (const id of orderedIds) {
        const t = idToTier.get(id);
        if (t) newList.push(t);
    }
    for (const t of singleton.guideSubscriptions) {
        if (!newList.includes(t)) newList.push(t);
    }

    singleton.guideSubscriptions = newList;
    bumpVersion();
    return { ok: true, data: { version: singleton.version, updatedAt: singleton.updatedAt } };
}