// lib/mock/siteSettings.mock.ts
import { faker } from "@faker-js/faker";
import { PLACEMENT, PlacementType } from "@/constants/advertising.const";
import type {
    AdvertisingPriceDTO,
    AdvertisingConfigDTO,
    CreateAdvertisingPricePayload,
    UpdateAdvertisingPricePayload,
    BulkUpdateAdvertisingPricesPayload,
    ObjectId,
} from "@/types/advertising-settings.types";

const PLACEMENTS = [
    PLACEMENT.LANDING_BANNER,
    PLACEMENT.POPUP_MODAL,
    PLACEMENT.EMAIL,
    PLACEMENT.SIDEBAR,
    PLACEMENT.SPONSORED_LIST,
];

function nowIso() {
    return new Date().toISOString();
}

function generateId(): string {
    return faker.string.uuid();
}

export const mockState = {
    config: null as AdvertisingConfigDTO | null,
};

function randomAllowedDurations() {
    const pool = [1, 7, 14, 30, 60];
    const count = faker.number.int({ min: 0, max: 3 });
    return faker.helpers.arrayElements(pool, count).sort((a, b) => a - b);
}

export function createAdvertisingPriceDTO(
    partial?: Partial<AdvertisingPriceDTO>
): AdvertisingPriceDTO {
    const id = partial?.id ?? generateId();
    const placement =
        (partial?.placement as PlacementType) ??
        faker.helpers.arrayElement(PLACEMENTS.concat(PLACEMENTS));
    const price =
        partial?.price ??
        Number(
            faker.finance.amount({
                min: 5,
                max: 500,
                dec: 2,
            })
        );
    const currency = partial?.currency ?? faker.helpers.arrayElement(["USD", "EUR", "BDT"]);
    const defaultDurationDays =
        partial?.defaultDurationDays ?? faker.helpers.arrayElement([null, 7, 14, 30]);
    const allowedDurationsDays = partial?.allowedDurationsDays ?? randomAllowedDurations();
    const active = partial?.active ?? faker.datatype.boolean({ probability: 0.85 });

    const createdAt = partial?.createdAt ?? nowIso();
    const updatedAt = partial?.updatedAt ?? nowIso();

    return {
        id,
        placement,
        price,
        currency,
        defaultDurationDays: defaultDurationDays === null ? undefined : (defaultDurationDays as number),
        allowedDurationsDays,
        active,
        createdAt,
        updatedAt,
    };
}

export function ensureConfigSeeded() {
    if (mockState.config) return mockState.config;
    const initialCount = 6;
    const pricing: AdvertisingPriceDTO[] = Array.from({ length: initialCount }).map(() =>
        createAdvertisingPriceDTO()
    );
    mockState.config = {
        pricing,
        notes: "Mock advertising config for local development",
        version: 1,
    };
    return mockState.config;
}

export function getConfig(): AdvertisingConfigDTO {
    return ensureConfigSeeded();
}

export function createPrice(payload: CreateAdvertisingPricePayload): AdvertisingPriceDTO {
    const dto = createAdvertisingPriceDTO({
        id: generateId(),
        placement: payload.placement,
        price: payload.price,
        currency: payload.currency ?? "USD",
        defaultDurationDays: payload.defaultDurationDays,
        allowedDurationsDays: payload.allowedDurationsDays ?? [],
        active: payload.active ?? true,
        createdAt: nowIso(),
        updatedAt: nowIso(),
    });
    ensureConfigSeeded();
    mockState.config!.pricing.unshift(dto);
    mockState.config!.version = (mockState.config!.version ?? 0) + 1;
    return dto;
}

export function updatePrice(payload: UpdateAdvertisingPricePayload): AdvertisingPriceDTO | null {
    ensureConfigSeeded();
    const idx = mockState.config!.pricing.findIndex((p) => p.id === payload.id);
    if (idx === -1) return null;
    const current = mockState.config!.pricing[idx];
    const updated: AdvertisingPriceDTO = {
        ...current,
        placement: payload.placement ?? current.placement,
        price: payload.price ?? current.price,
        currency: payload.currency ?? current.currency,
        defaultDurationDays:
            payload.defaultDurationDays === undefined ? current.defaultDurationDays : payload.defaultDurationDays ?? undefined,
        allowedDurationsDays: payload.allowedDurationsDays ?? current.allowedDurationsDays,
        active: payload.active ?? current.active,
        updatedAt: nowIso(),
    };
    mockState.config!.pricing[idx] = updated;
    mockState.config!.version = (mockState.config!.version ?? 0) + 1;
    return updated;
}

export function deletePrice(id: ObjectId): boolean {
    ensureConfigSeeded();
    const before = mockState.config!.pricing.length;
    mockState.config!.pricing = mockState.config!.pricing.filter((p) => p.id !== id);
    mockState.config!.version = (mockState.config!.version ?? 0) + 1;
    return mockState.config!.pricing.length < before;
}

export function bulkUpdatePrices(payload: BulkUpdateAdvertisingPricesPayload): AdvertisingConfigDTO {
    ensureConfigSeeded();
    if (payload.updates?.length) {
        for (const u of payload.updates) {
            const idx = mockState.config!.pricing.findIndex((p) => p.id === u.id);
            if (idx === -1) continue;
            mockState.config!.pricing[idx] = {
                ...mockState.config!.pricing[idx],
                placement: u.placement ?? mockState.config!.pricing[idx].placement,
                price: u.price ?? mockState.config!.pricing[idx].price,
                currency: u.currency ?? mockState.config!.pricing[idx].currency,
                defaultDurationDays:
                    u.defaultDurationDays === undefined ? mockState.config!.pricing[idx].defaultDurationDays : u.defaultDurationDays ?? undefined,
                allowedDurationsDays: u.allowedDurationsDays ?? mockState.config!.pricing[idx].allowedDurationsDays,
                active: u.active ?? mockState.config!.pricing[idx].active,
                updatedAt: nowIso(),
            };
        }
    }
    if (payload.removeIds?.length) {
        mockState.config!.pricing = mockState.config!.pricing.filter((p) => !payload.removeIds!.includes(p.id));
    }
    mockState.config!.version = (mockState.config!.version ?? 0) + 1;
    return mockState.config!;
}
