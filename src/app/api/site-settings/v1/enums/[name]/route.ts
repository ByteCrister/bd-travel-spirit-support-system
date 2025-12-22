// app/api/site-settings/v1/enums/[name]/route.ts
import type { NextRequest } from "next/server";

import type {
    UpdateEnumGroupPayload,
    UpsertEnumValuesPayload,
    EnumGroup,
    EnumValue,
} from "@/types/enum-settings.types";

import ConnectDB from "@/config/db";
import EnumGroupSetting from "@/models/site-settings/enumGroup.model";
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
            map.set(p.key, {
                ...previous,
                ...p,
            });
        } else {
            map.set(p.key, {
                key: p.key,
                value: p.value ?? p.key,
                label: p.label ?? `label: ${p.key}`,
                description: p.description ?? null,
                active: p.active ?? true,
            });
        }
    }

    return Array.from(map.values());
}

/* ---------------------------------------------------
   Params type
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

        const doc = await EnumGroupSetting.findOne({ name }).lean();

        let group: EnumGroup | null = null;

        if (doc) {
            group = {
                name: doc.name,
                description: doc.description ?? null,
                values: doc.values.map(
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

        return {
            data: {
                enumGroup: group,
                fetchedAt: new Date().toISOString(),
            },
            status: 200,
        };
    }
);

/* ---------------------------------------------------
   PUT — Partially update enum group metadata + values
---------------------------------------------------- */
export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { name } = await params;

        if (!name) {
            throw new ApiError("Missing enum group name", 400);
        }

        const payload = (await req.json()) as UpdateEnumGroupPayload;

        const doc = await EnumGroupSetting.findOne({ name });
        if (!doc) {
            throw new ApiError(`Enum group '${name}' not found`, 404);
        }

        if (payload.description !== undefined) {
            doc.description = payload.description ?? null;
        }

        if (Array.isArray(payload.values)) {
            doc.values = mergePartialValues(doc.values, payload.values);
        }

        await doc.save();

        const enumGroup: EnumGroup = {
            name: doc.name,
            description: doc.description ?? null,
            values: doc.values.map((v) => ({
                key: v.key,
                value: v.value ?? v.key,
                label: v.label ?? `label: ${v.key}`,
                description: v.description ?? null,
                active: v.active ?? true,
            })),
        };

        return { data: { enumGroup }, status: 200 };
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

        const doc = await EnumGroupSetting.findOne({ name });
        if (!doc) {
            throw new ApiError(`Enum group '${name}' not found`, 404);
        }

        doc.values = payload.replace
            ? (incoming as EnumValue[])
            : mergePartialValues(doc.values, incoming);

        await doc.save();

        return {
            data: {
                enumGroup: {
                    name: doc.name,
                    description: doc.description ?? null,
                    values: doc.values,
                },
            },
            status: 200,
        };
    }
);

/* ---------------------------------------------------
   DELETE — delete the entire enum group
---------------------------------------------------- */
export const DELETE = withErrorHandler(
    async (_req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { name } = await params;

        if (!name) {
            throw new ApiError("Enum group name is required", 400);
        }

        const deleted = await EnumGroupSetting.findOneAndDelete({ name });

        if (!deleted) {
            throw new ApiError(`Enum group '${name}' not found`, 404);
        }

        return { data: null, status: 200 };
    }
);