// app/api/site-settings/v1/enums/route.ts
import { NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import SiteSettings from "@/models/site-settings.model";
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

    const doc = await SiteSettings.findOne().lean();

    const enums: EnumGroup[] = (doc?.enums ?? []).map((g) => ({
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
        }, status: 200
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

    const values: EnumValue[] = Array.isArray(body.values)
        ? body.values.map((v) => ({
            key: v.key,
            label: v.label ?? null,
            value: v.value,
            description: v.description ?? null,
            active: v.active ?? true,
        }))
        : [];

    // Get or create the singleton document
    let settings = await SiteSettings.findOne();
    if (!settings) {
        settings = await SiteSettings.create({ enums: [] });
    }

    // Prevent duplicate enum group names
    if (settings.enums.some((g) => g.name === body.name)) {
        throw new ApiError(`Enum group '${body.name}' already exists.`, 409);
    }

    const newGroup: EnumGroup = {
        name: body.name,
        description: body.description ?? null,
        values,
    };

    settings.enums.push(newGroup);
    await settings.save();

    return { data: { enumGroup: newGroup }, status: 201 };

})