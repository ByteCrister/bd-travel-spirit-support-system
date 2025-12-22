// app/api/site-settings/v1/enums/[name]/values/route.ts
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
    params: Promise<{ name: string }>;
}

/* ---------------------------------------------------
   POST — insert / merge / replace enum values
---------------------------------------------------- */
export const POST = withErrorHandler(
    async (req: NextRequest, { params }: RouteParams) => {
        await ConnectDB();

        const { name } = await params;
        if (!name) {
            throw new ApiError("Missing enum group name", 400);
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
         * Find existing enum group
         */
        const group = await EnumGroupSetting.findOne({ name });

        /**
         * Create group if missing
         */
        if (!group) {
            const created = await EnumGroupSetting.create({
                name,
                description: null,
                values: incoming,
            });

            const enumGroup: EnumGroup = {
                name: created.name,
                description: created.description ?? null,
                values: created.values,
            };

            return { data: { enumGroup }, status: 201 };
        }

        /**
         * Update existing group
         */
        if (body.replace) {
            group.values = incoming;
        } else {
            const map = new Map<string, EnumValue>(
                group.values.map((v) => [v.key, v])
            );

            for (const v of incoming) {
                map.set(v.key, v);
            }

            group.values = Array.from(map.values());
        }

        await group.save();

        const enumGroup: EnumGroup = {
            name: group.name,
            description: group.description ?? null,
            values: group.values,
        };

        return { data: { enumGroup }, status: 200 };
    }
);