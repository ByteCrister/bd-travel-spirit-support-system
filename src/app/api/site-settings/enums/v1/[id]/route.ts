// app/api/site-settings/v1/enums/[id]/route.ts
import type { NextRequest } from "next/server";

import type {
    UpdateEnumGroupPayload,
    UpsertEnumValuesPayload,
    EnumGroup,
    EnumValue,
} from "@/types/site-settings/enum-settings.types";

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
    const map = new Map<string, EnumValue>(existing.map((v) => [v.key, { ...v }]));

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
   Params type (now using id)
---------------------------------------------------- */
interface Params {
    params: Promise<{ id: string }>;
}

/* ---------------------------------------------------
   GET — Fetch single enum group by id (only non-deleted)
---------------------------------------------------- */
export const GET = withErrorHandler(
    async (_req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { id } = await params;

        if (!id) {
            throw new ApiError("Missing enum group id", 400);
        }

        const doc = await EnumGroupSetting.findOne({ _id: id, deletedAt: null }).lean();

        let group: EnumGroup | null = null;

        if (doc) {
            group = {
                _id: doc._id.toString(),
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
   PUT — Partially update enum group metadata + values by id
---------------------------------------------------- */
export const PUT = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { id } = await params;

        if (!id) {
            throw new ApiError("Missing enum group id", 400);
        }

        const payload = (await req.json()) as UpdateEnumGroupPayload;

        const doc = await EnumGroupSetting.findOne({ _id: id, deletedAt: null });
        if (!doc) {
            throw new ApiError(`Enum group with id '${id}' not found`, 404);
        }

        if (payload.description !== undefined) {
            doc.description = payload.description ?? null;
        }

        if (Array.isArray(payload.values)) {
            doc.values = mergePartialValues(doc.values, payload.values);
        }

        await doc.save();

        const enumGroup: EnumGroup = {
            _id: doc._id.toString(),
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
   PATCH — Insert/update specific values only by id
---------------------------------------------------- */
export const PATCH = withErrorHandler(
    async (req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { id } = await params;

        if (!id) {
            throw new ApiError("Missing enum group id", 400);
        }

        const payload = (await req.json()) as Partial<UpsertEnumValuesPayload>;
        const incoming = Array.isArray(payload.values) ? payload.values : [];

        const doc = await EnumGroupSetting.findOne({ _id: id, deletedAt: null });
        if (!doc) {
            throw new ApiError(`Enum group with id '${id}' not found`, 404);
        }

        doc.values = payload.replace ? (incoming as EnumValue[]) : mergePartialValues(doc.values, incoming);

        await doc.save();

        return {
            data: {
                enumGroup: {
                    _id: doc._id.toString(),
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
   DELETE — soft-delete the entire enum group by id
---------------------------------------------------- */
export const DELETE = withErrorHandler(
    async (_req: NextRequest, { params }: Params) => {
        await ConnectDB();
        const { id } = await params;

        if (!id) {
            throw new ApiError("Enum group id is required", 400);
        }

        // Use the model's soft-delete helper so deletedAt and nested values are handled consistently
        const deleted = await EnumGroupSetting.softDeleteGroupById(id);

        if (!deleted) {
            throw new ApiError(`Enum group with id '${id}' not found`, 404);
        }

        return { data: null, status: 200 };
    }
);