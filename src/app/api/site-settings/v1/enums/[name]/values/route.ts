// /api/site-settings/v1/enums/[name]/values
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import SiteSettings from "@/models/site-settings.model";
import { EnumGroup, EnumValue, UpsertEnumValuesPayload } from "@/types/enum-settings.types";
import { NextRequest } from "next/server";

interface RouteParams {
    params: Promise<{ name: string }>;
}

export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {

    await ConnectDB();

    const { name } = await params;
    if (!name) {
        throw new ApiError("Missing enum group name", 400);
    }
    const body = (await req.json()) as UpsertEnumValuesPayload & { replace?: boolean };
    const incoming: EnumValue[] = Array.isArray(body.values)
        ? body.values.map(v => ({
            key: v.key,
            label: v.label ?? `label: ${v.key}`,
            value: v.value,
            active: v.active ?? true,
            description: v.description ?? null,
        }))
        : [];

    let settings = await SiteSettings.findOne();
    if (!settings) {
        // Create singleton document with this enum group
        const newGroup: EnumGroup = { name, description: null, values: incoming };
        settings = await SiteSettings.create({ enums: [newGroup] });
        return { data: { enumGroup: newGroup }, status: 201 };
    }

    // Find existing group
    const idx = (settings.enums ?? []).findIndex(g => g.name === name);
    if (idx === -1) {
        // Group doesn't exist, create new
        const newGroup: EnumGroup = { name, description: null, values: incoming };
        settings.enums = [...(settings.enums ?? []), newGroup];
        await settings.save();
        return { data: { enumGroup: newGroup }, status: 201 };
    }

    // Update existing group
    const existingGroup = settings.enums[idx];
    if (body.replace) {
        existingGroup.values = incoming;
    } else {
        // Merge values by key
        const map = new Map<string, EnumValue>(existingGroup.values.map(v => [v.key, v]));
        incoming.forEach(v => map.set(v.key, v));
        existingGroup.values = Array.from(map.values());
    }

    await settings.save();

    return { data: { enumGroup: existingGroup }, status: 200 };
})