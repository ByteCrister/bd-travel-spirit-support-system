// /api/site-settings/v1/enums/[name]/values
import ConnectDB from "@/config/db";
import SiteSettings from "@/models/site-settings.model";
import { EnumGroup, EnumValue, UpsertEnumValuesPayload } from "@/types/enum-settings.types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ name: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
    await ConnectDB();

    const { name } = await params;
    if (!name) {
        return NextResponse.json({ error: "Missing enum group name" }, { status: 400 });
    }

    try {
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
            return NextResponse.json({ enumGroup: newGroup }, { status: 201 });
        }

        // Find existing group
        const idx = (settings.enums ?? []).findIndex(g => g.name === name);
        if (idx === -1) {
            // Group doesn't exist, create new
            const newGroup: EnumGroup = { name, description: null, values: incoming };
            settings.enums = [...(settings.enums ?? []), newGroup];
            await settings.save();
            return NextResponse.json({ enumGroup: newGroup }, { status: 201 });
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

        return NextResponse.json({ enumGroup: existingGroup }, { status: 200 });
    } catch (err) {
        const message = (err as Error).message ?? "Failed to upsert enum values";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}