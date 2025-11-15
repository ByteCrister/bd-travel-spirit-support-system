// lib/mockAds.ts
import { faker } from "@faker-js/faker";
import type {
    AdvertisementResponse,
    AdListQuery,
    PaginatedResponse,
    AdvertisementOverview,
    AdvertisementAdminActionDTO,
} from "@/types/advertising.types";
import { AdStatusType, PlacementType } from "@/constants/advertising.const";

const AD_STATUSES: AdStatusType[] = ["draft", "pending", "active", "paused", "expired", "cancelled", "rejected"];
const PLACEMENTS: PlacementType[] = ["landing_banner", "popup_modal", "email", "sidebar", "sponsored_list"];

function randomFrom<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function nowIso() {
    return new Date().toISOString();
}

function computeCtr(impressions: number, clicks: number) {
    if (!impressions) return null;
    return Math.round((clicks / impressions) * 10000) / 10000; // 4-digit precision
}

function makeSnapshot() {
    const placements = faker.helpers.arrayElements(PLACEMENTS, faker.number.int({ min: 1, max: 2 }));
    const price = faker.number.int({ min: 10, max: 5000 });
    return {
        name: faker.commerce.productName(),
        placements,
        price,
        currency: "USD",
        durationDays: faker.number.int({ min: 7, max: 90 }),
        description: faker.lorem.sentence(),
    };
}

function makeAd(overrides?: Partial<AdvertisementResponse>): AdvertisementResponse {
    const impressions = faker.number.int({ min: 0, max: 20000 });
    const clicks = faker.number.int({ min: 0, max: impressions });
    const createdAt = faker.date.recent({ days: 90 }).toISOString();
    const updatedAt = faker.date.between({
        from: new Date(createdAt),
        to: new Date(),
    }).toISOString();
    const status = overrides?.status ?? randomFrom(AD_STATUSES);
    const isDeleted = overrides?.isDeleted ?? false;
    const deletedAt = isDeleted ? faker.date.recent({ days: 10 }).toISOString() : null;
    const expiryDate = faker.date.soon({ days: 120 }).toISOString();
    const id = overrides?.id ?? faker.string.uuid();

    const ad: AdvertisementResponse = {
        id,
        guideId: faker.string.uuid(),
        guideName: faker.person.fullName(),
        tourId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
        tourTitle: faker.datatype.boolean() ? faker.lorem.words(3) : undefined,
        title: faker.lorem.sentence(5),
        snapshot: makeSnapshot(),
        placements: faker.helpers.arrayElements(PLACEMENTS, faker.number.int({ min: 1, max: 2 })),
        status: status as AdStatusType,
        reason: status === "rejected" ? faker.lorem.sentence() : undefined,
        startAt: faker.date.recent({ days: 30 }).toISOString(),
        endAt: faker.date.soon({ days: 90 }).toISOString(),
        autoRenew: faker.datatype.boolean(),
        renewCount: faker.number.int({ min: 0, max: 5 }),
        impressions,
        clicks,
        paymentRef: faker.datatype.boolean() ? faker.string.uuid() : null,
        note: faker.datatype.boolean() ? faker.lorem.sentences(1) : null,
        createdBy: faker.person.fullName(),
        createdAt,
        updatedAt,
        isDeleted,
        deletedAt,
        deletedBy: isDeleted ? faker.person.fullName() : null,
        expiryDate,
        ctr: computeCtr(impressions, clicks),
    };

    return { ...ad, ...overrides };
}

// In-memory DB
const DB: Record<string, AdvertisementResponse> = {};
const seeded = { value: false };

export function seedMockAds(count = 120) {
    if (seeded.value) return;
    for (let i = 0; i < count; i++) {
        const ad = makeAd();
        DB[ad.id] = ad;
    }
    seeded.value = true;
}

// Basic query: supports page, limit, q (search in title/guideName), status(s), placements, withDeleted, sortBy, sortDir, guideId, tourId
export function queryAds(q?: AdListQuery): PaginatedResponse<AdvertisementResponse> {
    seedMockAds();

    let items = Object.values(DB);

    // filters
    if (q?.withDeleted !== true) {
        items = items.filter((a) => !a.isDeleted);
    }
    if (q?.q) {
        const term = q.q.toLowerCase();
        items = items.filter((a) => (a.title ?? "").toLowerCase().includes(term) || (a.guideName ?? "").toLowerCase().includes(term));
    }
    if (q?.guideId) items = items.filter((a) => a.guideId === q.guideId);
    if (q?.tourId) items = items.filter((a) => a.tourId === q.tourId);
    if (q?.status) {
        const statuses = Array.isArray(q.status) ? q.status : [q.status];
        items = items.filter((a) => statuses.includes(a.status));
    }
    if (q?.placements) {
        const placements = Array.isArray(q.placements) ? q.placements : [q.placements];
        items = items.filter((a) => placements.some((p) => a.placements.includes(p)));
    }
    // date range filters (start/end)
    if (q?.startDateFrom) items = items.filter((a) => a.startAt && new Date(a.startAt) >= new Date(q.startDateFrom!));
    if (q?.startDateTo) items = items.filter((a) => a.startAt && new Date(a.startAt) <= new Date(q.startDateTo!));
    if (q?.endDateFrom) items = items.filter((a) => a.endAt && new Date(a.endAt) >= new Date(q.endDateFrom!));
    if (q?.endDateTo) items = items.filter((a) => a.endAt && new Date(a.endAt) <= new Date(q.endDateTo!));

    // sort
    const sortBy = q?.sortBy ?? "createdAt";
    const sortDir = q?.sortDir ?? "desc";
    items.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const A = (a as any)[sortBy];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const B = (b as any)[sortBy];
        if (A === B) return 0;
        if (sortDir === "asc") return A > B ? 1 : -1;
        return A < B ? 1 : -1;
    });

    const page = q?.page && q.page > 0 ? q.page : 1;
    const limit = q?.limit && q.limit > 0 ? q.limit : 20;
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return {
        items: paged,
        total,
        page,
        limit,
        pages,
    };
}

export function getAdById(id: string): AdvertisementResponse | undefined {
    seedMockAds();
    return DB[id];
}

export function softDeleteAd(id: string): AdvertisementResponse | null {
    const ad = DB[id];
    if (!ad) return null;
    ad.isDeleted = true;
    ad.deletedAt = nowIso();
    ad.deletedBy = "admin:system";
    ad.updatedAt = nowIso();
    return ad;
}

export function restoreAd(id: string): AdvertisementResponse | null {
    const ad = DB[id];
    if (!ad) return null;
    ad.isDeleted = false;
    ad.deletedAt = null;
    ad.deletedBy = null;
    ad.updatedAt = nowIso();
    return ad;
}

export function performAdminAction(dto: AdvertisementAdminActionDTO): AdvertisementResponse | null {
    const ad = DB[dto.id];
    if (!ad) return null;
    const now = nowIso();
    switch (dto.action) {
        case "approve":
            ad.status = "active";
            ad.reason = undefined;
            if (dto.endAt !== undefined) ad.endAt = dto.endAt ?? undefined;
            break;
        case "reject":
            ad.status = "rejected";
            ad.reason = dto.reason ?? "rejected by admin";
            break;
        case "pause":
            ad.status = "paused";
            break;
        case "resume":
            ad.status = "active";
            break;
        case "expire":
            ad.status = "expired";
            ad.expiryDate = dto.endAt ?? now;
            break;
        case "cancel":
            ad.status = "cancelled";
            break;
    }
    ad.updatedAt = now;
    return ad;
}

export function getOverview(): AdvertisementOverview {
    seedMockAds();
    const all = Object.values(DB);
    const totalAds = all.length;
    const activeAds = all.filter((a) => a.status === "active" && !a.isDeleted).length;
    const pendingAds = all.filter((a) => a.status === "pending" && !a.isDeleted).length;
    const draftAds = all.filter((a) => a.status === "draft" && !a.isDeleted).length;
    const pausedAds = all.filter((a) => a.status === "paused" && !a.isDeleted).length;
    const cancelledAds = all.filter((a) => a.status === "cancelled" && !a.isDeleted).length;
    const expiredAds = all.filter((a) => a.status === "expired" && !a.isDeleted).length;
    const rejectedAds = all.filter((a) => a.status === "rejected" && !a.isDeleted).length;

    const statusStats = (["active", "pending", "draft", "paused", "cancelled", "expired", "rejected"] as AdStatusType[]).map((s) => ({
        status: s,
        count: all.filter((a) => a.status === s && !a.isDeleted).length,
    }));

    const placementsMap = new Map<string, number>();
    let impressionsTotal = 0;
    let clicksTotal = 0;
    for (const a of all) {
        if (a.isDeleted) continue;
        impressionsTotal += a.impressions;
        clicksTotal += a.clicks;
        for (const p of a.placements) {
            placementsMap.set(p, (placementsMap.get(p) ?? 0) + 1);
        }
    }
    const topPlacements = Array.from(placementsMap.entries())
        .map(([placement, count]) => ({ placement: placement as PlacementType, count }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 5);
    const averageCTR = impressionsTotal ? Math.round((clicksTotal / impressionsTotal) * 10000) / 10000 : null;

    return {
        totalAds,
        activeAds,
        pendingAds,
        draftAds,
        pausedAds,
        cancelledAds,
        expiredAds,
        rejectedAds,
        statusStats,
        topPlacements,
        impressionsTotal,
        clicksTotal,
        averageCTR,
    };
}
