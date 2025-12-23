// app/api/site-settings/v1/enums/route.ts
import { NextRequest } from "next/server";

import ConnectDB from "@/config/db";
import EnumGroupSetting from "@/models/site-settings/enumGroup.model";

import type {
    EnumGroup,
    EnumValue,
    CreateEnumGroupPayload,
} from "@/types/enum-settings.types";

import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";

/* -----------------------------
   GET: Fetch all enum groups
------------------------------ */
export const GET = withErrorHandler(async () => {

    await ConnectDB();

    let query = EnumGroupSetting.find();
    query = query.where({ deletedAt: null })
    const docs = await query.lean();

    const enums: EnumGroup[] = docs.map((g) => ({
        _id: g._id.toString(),
        name: g.name,
        description: g.description ?? null,
        values: (Array.isArray(g.values) ? g.values : []).map((v) => ({
            key: v.key,
            label: v.label ?? `label: ${v.key}`,
            value: v.value,
            active: v.active ?? true,
            description: v.description ?? null,
        })),
    }));

    return {
        data: {
            enums,
            fetchedAt: new Date().toISOString(),
        },
        status: 200,
    };
});

/* -----------------------------
   POST: Create a new enum group
------------------------------ */
export const POST = withErrorHandler(async (req: NextRequest) => {
    await ConnectDB();

    const body = (await req.json()) as CreateEnumGroupPayload;

    if (!body?.name || typeof body.name !== "string") {
        throw new ApiError("Field 'name' is required and must be a string.", 422);
    }

    // Check if a non-deleted group already exists with this name
    const existingActiveGroup = await EnumGroupSetting.findOne({
        name: body.name,
        deletedAt: null
    }).lean();

    if (existingActiveGroup) {
        throw new ApiError(`Enum group '${body.name}' already exists.`, 409);
    }

    const values: EnumValue[] = Array.isArray(body.values)
        ? body.values.map((v) => ({
            key: v.key,
            label: v.label ?? v.key,
            value: v.value,
            description: v.description ?? null,
            active: v.active ?? true,
        }))
        : [];

    const created = await EnumGroupSetting.create({
        name: body.name,
        description: body.description ?? null,
        values,
        deletedAt: null,
    });

    const enumGroup: EnumGroup = {
        _id: created._id.toString(),
        name: created.name,
        description: created.description ?? null,
        values: created.values.map((v) => ({
            key: v.key,
            label: v.label,
            value: v.value,
            active: v.active,
            description: v.description ?? null,
        })),
    };

    return {
        data: { enumGroup },
        status: 201,
    };
});