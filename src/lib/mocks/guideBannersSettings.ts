// lib/mock/guide-banners.ts
import { GuideBannerCreateDTO, GuideBannerEntity, GuideBannerPatchOperation } from "@/types/guide-banner-settings.types";
import { faker } from "@faker-js/faker";

const DEFAULT_COUNT = 8;

/**
 * In-memory store for mock guide banners.
 * Keyed by id (string). For app-router mock usage only.
 */
const store: Record<string, GuideBannerEntity> = {};
let version = 1;

function nowISO() {
    return new Date().toISOString();
}

function makeId() {
    // use faker uuid for stable unique ids
    return faker.string.uuid();
}

function mockAssetId() {
  return `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/1600/600`;
}

/** Create a single mocked GuideBannerEntity */
export function createMockBanner(overrides?: Partial<GuideBannerEntity>): GuideBannerEntity {
    const id = overrides?._id ?? makeId();
    const createdAt = overrides?.createdAt ?? nowISO();
    const updatedAt = overrides?.updatedAt ?? createdAt;
    const entity: GuideBannerEntity = {
        _id: id,
        asset: overrides?.asset ?? mockAssetId(),
        alt: overrides?.alt ?? faker.lorem.words(3),
        caption: overrides?.caption ?? faker.lorem.sentence(6),
        order: typeof overrides?.order === "number" ? overrides!.order : Number(faker.number.int({ min: 0, max: 999 })),
        active: typeof overrides?.active === "boolean" ? overrides!.active : faker.datatype.boolean(),
        createdAt,
        updatedAt,
    };
    return entity;
}

/** Seed store with N items if empty */
export function seedMockBanners(count = DEFAULT_COUNT) {
    if (Object.keys(store).length > 0) return;
    const items: GuideBannerEntity[] = [];

    for (let i = 0; i < count; i++) {
        const item = createMockBanner({
            order: i,
            active: i % 2 === 0,
            caption: faker.company.catchPhrase(),
            alt: `Banner ${i + 1}`,
            asset: mockAssetId(),   // <-- Real image URL
        });

        store[item._id] = item;
        items.push(item);
    }

    version += 1;
    return items;
}

/** List banners with optional query params: limit, offset, sortBy, sortDir, active, search */
export function listBanners(params?: {
    limit?: number;
    offset?: number;
    sortBy?: "order" | "createdAt" | "active";
    sortDir?: "asc" | "desc";
    active?: boolean;
    search?: string;
}) {
    const all = Object.values(store);
    let items = [...all];

    if (typeof params?.active === "boolean") {
        items = items.filter((i) => i.active === params.active);
    }

    if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter((i) => (i.caption || "").toLowerCase().includes(q) || (i.alt || "").toLowerCase().includes(q));
    }

    if (params?.sortBy) {
        const dir = params.sortDir === "desc" ? -1 : 1;
        items.sort((a, b) => {
            const key = params.sortBy!;
            const av = (a as any)[key];
            const bv = (b as any)[key];
            if (av == null && bv == null) return 0;
            if (av == null) return 1;
            if (bv == null) return -1;
            if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
            if (typeof av === "boolean" && typeof bv === "boolean") return (Number(av) - Number(bv)) * dir;
            return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
        });
    } else {
        // default sort by order asc
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    const total = items.length;
    const limit = typeof params?.limit === "number" ? params.limit : 25;
    const offset = typeof params?.offset === "number" ? params.offset : 0;
    items = items.slice(offset, offset + limit);

    return {
        data: items,
        meta: { total, limit, offset, version },
    };
}

/** Get single banner */
export function getBanner(id: string) {
    return store[id] ?? null;
}

/** Create new banner */
export function createBanner(payload: GuideBannerCreateDTO) {
    const id = makeId();
    const now = nowISO();
    const entity: GuideBannerEntity = {
        _id: id,
        asset: payload.asset,
        alt: payload.alt ?? null,
        caption: payload.caption ?? null,
        order: typeof payload.order === "number" ? payload.order : Math.max(...Object.values(store).map((s) => s.order ?? 0), 0) + 1,
        active: typeof payload.active === "boolean" ? payload.active : true,
        createdAt: now,
        updatedAt: now,
    };
    store[id] = entity;
    version += 1;
    return entity;
}

/** Replace banner */
export function replaceBanner(id: string, payload: Partial<GuideBannerEntity>) {
    const existing = store[id];
    if (!existing) return null;
    const now = nowISO();
    const replaced: GuideBannerEntity = {
        _id: id,
        asset: payload.asset ?? existing.asset,
        alt: payload.alt ?? existing.alt,
        caption: payload.caption ?? existing.caption,
        order: typeof payload.order === "number" ? payload.order : existing.order ?? 0,
        active: typeof payload.active === "boolean" ? payload.active : existing.active,
        createdAt: existing.createdAt ?? now,
        updatedAt: now,
    };
    store[id] = replaced;
    version += 1;
    return replaced;
}

/** Patch with operations */
export function patchBanner(id: string, ops: GuideBannerPatchOperation[]) {
    const existing = store[id];
    if (!existing) return null;
    const copy: any = { ...existing };
    for (const op of ops) {
        if (op.op === "set" && op.path === "/active") copy.active = Boolean(op.value);
        if (op.op === "set" && op.path === "/order") copy.order = Number(op.value);
        if (op.op === "replace" && (op.path === "/caption" || op.path === "/alt")) {
            const key = op.path.slice(1);
            copy[key] = op.value;
        }
        if (op.op === "replace" && op.path === "/asset") copy.asset = op.value;
    }
    copy.updatedAt = nowISO();
    store[id] = copy as GuideBannerEntity;
    version += 1;
    return store[id];
}

/** Delete banner */
export function deleteBanner(id: string) {
    const exists = !!store[id];
    if (!exists) return false;
    delete store[id];
    version += 1;
    return true;
}

/** Reorder: accept orderedIds and persist order values to match index */
export function reorderBanners(orderedIds: string[]) {
    const list: GuideBannerEntity[] = [];
    for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        const e = store[id];
        if (e) {
            e.order = i;
            e.updatedAt = nowISO();
            store[id] = e;
            list.push(e);
        }
    }
    version += 1;
    return list;
}

/** Reset helper (for tests/dev) */
export function resetMockStore() {
    for (const k of Object.keys(store)) delete store[k];
    version = 1;
}
