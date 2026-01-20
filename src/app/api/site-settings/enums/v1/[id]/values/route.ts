// app/api/site-settings/v1/enums/[id]/values/route.ts
import { NextRequest } from "next/server";

import ConnectDB from "@/config/db";
import EnumGroupSetting from "@/models/site-settings/enumGroup.model";

import {
    EnumGroup,
    EnumValue,
    UpsertEnumValuesPayload,
} from "@/types/enum-settings.types";

import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/* ---------------------------------------------------
   POST — insert / merge / replace enum values (by group id)
---------------------------------------------------- */
export const POST = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams) => {
        await ConnectDB();

        const { id } = await params;
        if (!id) {
            throw new ApiError("Missing enum group id", 400);
        }

        const body = (await req.json()) as UpsertEnumValuesPayload & {
            replace?: boolean;
        };

        const incoming: EnumValue[] = Array.isArray(body.values)
            ? body.values.map((v) => ({
                key: v.key,
                label: v.label ?? `label: ${v.key}`,
                value: v.value,
                active: v.active ?? true,
                description: v.description ?? null,
            }))
            : [];

        /**
         * Find existing enum group (must be non-deleted)
         */
        const group = await EnumGroupSetting.findOne({ _id: id, deletedAt: null });
        if (!group) {
            throw new ApiError(`Enum group with id '${id}' not found`, 404);
        }

        /**
         * Update existing group
         *
         * - If replace: replace values array entirely (ensure deletedAt cleared)
         * - If merge: merge incoming values into existing values. If an incoming key
         *   matches a soft-deleted value, restore it (clear deletedAt and set active).
         */
        if (body.replace) {
            // Ensure incoming values are not soft-deleted
            group.values = incoming.map((v) => ({ ...v, deletedAt: null }));
        } else {
            const map = new Map<string, EnumValue>(
                group.values.map((v) => [v.key, { ...v }])
            );

            for (const v of incoming) {
                const existing = map.get(v.key);
                if (existing) {
                    // Merge fields from incoming
                    existing.label = v.label ?? existing.label;
                    existing.value = v.value ?? existing.value;
                    existing.description = v.description ?? existing.description;
                    existing.active = v.active ?? existing.active;
                    map.set(v.key, existing);
                } else {
                    // New value: ensure deletedAt is null
                    map.set(v.key, v);
                }
            }

            group.values = Array.from(map.values());
        }

        await group.save();

        const enumGroup: EnumGroup = {
            _id: group._id.toString(),
            name: group.name,
            description: group.description ?? null,
            values: group.values,
        };

        return { data: { enumGroup }, status: 200 };
    }
);