import { faker } from "@faker-js/faker";
import type {
    EnumGroup,
    EnumValue,
    CreateEnumGroupPayload,
    UpdateEnumGroupPayload,
    UpsertEnumValuesPayload,
    GetEnumGroupsResponse,
    GetEnumGroupResponse,
    EnumKey,
} from "@/types/enum-settings.types";

const nowIso = () => new Date().toISOString();

function makeValue(overrides?: Partial<EnumValue>): EnumValue {
    const key = overrides?.key ?? faker.helpers.slugify(faker.word.words(2)).toLowerCase();
    return {
        key,
        value: overrides?.value ?? key,
        label: overrides?.label ?? faker.word.words(2),
        description: overrides?.description ?? faker.lorem.sentence(),
        order: overrides?.order ?? Math.floor(Math.random() * 100),
        active: overrides?.active ?? faker.datatype.boolean(),
    };
}

export function generateEnumGroup(name?: EnumKey, count = 4): EnumGroup {
    const groupName = name ?? faker.helpers.slugify(faker.word.words(2)).toLowerCase();
    const values: EnumValue[] = Array.from({ length: count }).map(() => makeValue());
    return {
        name: groupName,
        description: faker.lorem.sentence(),
        values: values.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        version: 1,
    };
}

export function generateEnumGroups(count = 3, valuesPerGroup = 4): EnumGroup[] {
    return Array.from({ length: count }).map((_, i) => generateEnumGroup(`mock_group_${i + 1}`, valuesPerGroup));
}

/* In-memory storage used by mock routes (keeps state while dev server running) */
export const inMemoryStore: Record<EnumKey, EnumGroup> = {};
export function seedStore(groups: EnumGroup[]) {
    for (const g of groups) inMemoryStore[g.name] = g;
}

/* Helpers to apply create/update/upsert/remove */
export function createGroupFromPayload(payload: CreateEnumGroupPayload): EnumGroup {
    const group: EnumGroup = {
        name: payload.name,
        description: payload.description ?? null,
        values: (payload.values ?? []).map((v, i) => ({
            key: v.key,
            value: (v as Partial<EnumValue>).value ?? v.key,
            label: (v as Partial<EnumValue>).label ?? null,
            description: (v as Partial<EnumValue>).description ?? null,
            order: (v as Partial<EnumValue>).order ?? i,
            active: (v as Partial<EnumValue>).active ?? true,
        })),
        version: 1,
    };
    inMemoryStore[group.name] = group;
    return group;
}

export function updateGroupWithPayload(name: EnumKey, payload: UpdateEnumGroupPayload): EnumGroup | null {
    const existing = inMemoryStore[name];
    if (!existing) return null;
    const merged: EnumGroup = {
        ...existing,
        description: payload.description ?? existing.description,
        // merge partials for values by key
        values: mergePartialValues(existing.values ?? [], payload.values ?? []),
        version: (existing.version ?? 1) + 1,
    };
    inMemoryStore[name] = merged;
    return merged;
}

export function upsertValuesToGroup(payload: UpsertEnumValuesPayload): EnumGroup {
    const { groupName, values, replace } = payload;
    const existing = inMemoryStore[groupName];
    if (!existing) {
        const created: EnumGroup = {
            name: groupName,
            description: null,
            values: values.map((v, i) => ({ ...v, order: v.order ?? i })),
            version: 1,
        };
        inMemoryStore[groupName] = created;
        return created;
    }
    if (replace) {
        existing.values = values.map((v, i) => ({ ...v, order: v.order ?? i }));
    } else {
        const map = new Map<string, EnumValue>((existing.values ?? []).map((v) => [v.key, { ...v }]));
        for (const v of values) {
            map.set(v.key, { ...v, order: v.order ?? map.get(v.key)?.order ?? 0 });
        }
        existing.values = Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    existing.version = (existing.version ?? 1) + 1;
    return existing;
}

export function removeValueFromGroup(groupName: EnumKey, valueKey: string): EnumGroup | null {
    const existing = inMemoryStore[groupName];
    if (!existing) return null;
    existing.values = (existing.values ?? []).filter((v) => v.key !== valueKey);
    existing.version = (existing.version ?? 1) + 1;
    return existing;
}

/* Utility: merge partial EnumValue[] into a full EnumValue[] */
export function mergePartialValues(existing: EnumValue[] = [], partials: Partial<EnumValue>[] = []): EnumValue[] {
    const map = new Map<string, EnumValue>(existing.map((v) => [v.key, { ...v }]));
    for (const p of partials) {
        if (!p?.key) continue;
        const key = p.key;
        const prev = map.get(key);
        if (prev) {
            map.set(key, { ...prev, ...p } as EnumValue);
        } else {
            const created: EnumValue = {
                key,
                value: p.value ?? key,
                label: p.label ?? null,
                description: p.description ?? null,
                order: p.order ?? 0,
                active: p.active ?? true,
            };
            map.set(key, created);
        }
    }
    return Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/* Example response builders using nowIso */
export function allEnumsResponse(): GetEnumGroupsResponse {
    return {
        enums: Object.values(inMemoryStore),
        fetchedAt: nowIso(),
    };
}

export function singleEnumResponse(name: EnumKey): GetEnumGroupResponse {
    return {
        enumGroup: inMemoryStore[name] ?? null,
        fetchedAt: nowIso(),
    };
}

/* Seed default data on module load */
seedStore(generateEnumGroups(3, 5));
