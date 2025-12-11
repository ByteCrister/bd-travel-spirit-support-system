// /api/site-settings/enums/[name]/values/[valueKey]
import ConnectDB from "@/config/db";
import SiteSettings from "@/models/site-settings.model";
import { EnumGroup } from "@/types/enum-settings.types";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{ name: string; valueKey: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    await ConnectDB();

    const { name, valueKey } = await params;

    if (!name) {
        return NextResponse.json({ error: "Missing enum group name" }, { status: 400 });
    }

    if (!valueKey) {
        return NextResponse.json({ error: "Missing value key to delete" }, { status: 400 });
    }

    try {
        const settings = await SiteSettings.findOne();
        if (!settings) {
            return NextResponse.json({ error: "Site settings not found" }, { status: 404 });
        }

        const group = settings.enums?.find(g => g.name === name);
        if (!group) {
            return NextResponse.json({ error: `Enum group '${name}' not found` }, { status: 404 });
        }

        const originalLength = group.values.length;
        group.values = group.values.filter(v => v.key !== valueKey);

        if (group.values.length === originalLength) {
            // valueKey not found
            return NextResponse.json({ error: `Value key '${valueKey}' not found in group '${name}'` }, { status: 404 });
        }

        await settings.save();

        return NextResponse.json({ enumGroup: group as EnumGroup }, { status: 200 });
    } catch (err) {
        const message = (err as Error).message ?? "Failed to remove enum value";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}