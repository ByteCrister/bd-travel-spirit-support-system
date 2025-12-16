// app/api/site-settings/v1/enums/[name]/route.ts
import type { NextRequest } from "next/server";
import type {
    UpdateEnumGroupPayload,
    UpsertEnumValuesPayload,
    EnumGroup,
    EnumValue,
} from "@/types/enum-settings.types";
import ConnectDB from "@/config/db";
import SiteSettings from "@/models/site-settings.model";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

/* ---------------------------------------------------
   Strictly typed helper: merge partial EnumValue data
---------------------------------------------------- */
function mergePartialValues(
    existing: EnumValue[] = [],
    partials: Partial<EnumValue>[] = []
): EnumValue[] {
    const map = new Map<string, EnumValue>(
        existing.map((v) => [v.key, { ...v }])
    );

    for (const p of partials) {
        if (!p?.key) continue;

        const previous = map.get(p.key);

        if (previous) {
            // merge into existing
            map.set(p.key, {
                ...previous,
                ...p,
            });
        } else {
            // create new strictly typed EnumValue
            const newValue: EnumValue = {
                key: p.key,
                value: p.value ?? p.key,
                label: p.label ?? `label: ${p.key}`,
                description: p.description ?? null,
                active: p.active ?? true,
            };
            map.set(p.key, newValue);
        }
    }

    return Array.from(map.values());
}

/* ---------------------------------------------------
   Params type for Next.js Route
---------------------------------------------------- */
interface Params {
    params: Promise<{ name: string }>;
}

/* ---------------------------------------------------
   GET — Fetch single enum group
---------------------------------------------------- */
export const GET = withErrorHandler(
    async (_req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { name } = await params;

        if (!name) {
            throw new ApiError("Missing enum group name", 400);
        }
        const doc = await SiteSettings.findOne().lean();

        const raw = doc?.enums?.find((g) => g.name === name) ?? null;

        let group: EnumGroup | null = null;

        if (raw) {
            group = {
                name: raw.name,
                description: raw.description ?? null,
                values: raw.values.map(
                    (v): EnumValue => ({
                        key: v.key,
                        value: v.value ?? v.key,
                        label: v.label ?? `label: ${v.key}`,
                        description: v.description ?? null,
                        active: v.active ?? true,
                    })
                ),
            };
        }

        const data = {
            enumGroup: group,
            fetchedAt: new Date().toISOString(),
        };

        return { data, status: 200 };
    }
);

/* ---------------------------------------------------
   PUT — Partially update enum group metadata + values
---------------------------------------------------- */

function toEnumGroupDTO(group: EnumGroup): EnumGroup {
    return {
        name: group.name,
        description: group.description ?? null,
        values: group.values.map((v) => ({
            key: v.key,
            value: v.value ?? v.key,
            label: v.label ?? `label: ${v.key}`,
            description: v.description ?? null,
            active: v.active ?? true,
        })),
    };
}

export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { name } = await params;

        if (!name) {
            throw new ApiError("Missing enum group name", 400);
        }
        const payload = (await req.json()) as UpdateEnumGroupPayload;

        const settings = await SiteSettings.findOne();
        if (!settings) {
            throw new ApiError("Site settings not found", 404);
        }

        const groupIndex = settings.enums.findIndex((g) => g.name === name);

        if (groupIndex === -1) {
            throw new ApiError(`Enum group '${name}' not found`, 404);
        }

        const existing = settings.enums[groupIndex];

        const mergedRaw = {
            ...existing,
            description: payload.description ?? existing.description ?? null,
            values: Array.isArray(payload.values)
                ? mergePartialValues(existing.values, payload.values)
                : existing.values,
        };

        // Save raw mongoose version
        settings.enums[groupIndex] = mergedRaw;
        await settings.save();

        // Convert to DTO for response
        const mergedGroup: EnumGroup = toEnumGroupDTO(mergedRaw);

        return { data: { enumGroup: mergedGroup }, status: 200 };
    }
);

/* ---------------------------------------------------
   PATCH — Insert/update specific values only
---------------------------------------------------- */
export const PATCH = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { name } = await params;

        if (!name) {
            throw new ApiError("Missing enum group name", 400);
        }
        const payload = (await req.json()) as Partial<UpsertEnumValuesPayload>;
        const incoming = Array.isArray(payload.values) ? payload.values : [];

        const settings = await SiteSettings.findOne();
        if (!settings) {
            throw new ApiError("Site settings not found", 404);
        }

        const groupIndex = settings.enums.findIndex(
            (g: EnumGroup) => g.name === name
        );

        if (groupIndex === -1) {
            throw new ApiError(`Enum group '${name}' not found`, 404);
        }

        const existingValues = settings.enums[groupIndex].values;

        const updatedValues = payload.replace
            ? (incoming as EnumValue[])
            : mergePartialValues(existingValues, incoming);

        settings.enums[groupIndex].values = updatedValues;
        await settings.save();

        return { data: { enumGroup: settings.enums[groupIndex] }, status: 200 };
    }
);

/* ---------------------------------------------------
   DELETE — delete the entire enum group
---------------------------------------------------- */
export const DELETE = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        const { name } = await params;
        if (!name) {
            throw new ApiError("Enum group name is required", 400);
        }
        await ConnectDB();

        // Load the singleton SiteSettings document
        const siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            throw new ApiError("Site settings not found", 404);
        }

        // Check if the enum group exists
        const groupIndex = siteSettings.enums.findIndex((g) => g.name === name);
        if (groupIndex === -1) {
            throw new ApiError(`Enum group '${name}' not found`, 404);
        }

        // Remove the group
        siteSettings.enums.splice(groupIndex, 1);

        // Save changes
        await siteSettings.save();

        return { data: null, status: 200 };
    }
);
