// app/api/site-settings/v1/enums/route.ts
import { NextResponse, type NextRequest } from "next/server";
import ConnectDB from "@/config/db";
import SiteSettings from "@/models/site-settings.model";
import type {
    EnumGroup,
    EnumValue,
    GetEnumGroupsResponse,
    CreateEnumGroupPayload,
} from "@/types/enum-settings.types";

function error(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
}

/* -----------------------------
   GET: Fetch all enum groups
------------------------------ */
export async function GET() {
    await ConnectDB();

    try {
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

        const res: GetEnumGroupsResponse = {
            enums,
            fetchedAt: new Date().toISOString(),
        };

        return NextResponse.json(res, { status: 200 });
    } catch (err) {
        return error((err as Error).message ?? "Failed to fetch enums", 500);
    }
}

/* -----------------------------
   POST: Create a new enum group
------------------------------ */
export async function POST(req: NextRequest) {
    await ConnectDB();

    try {
        const body = (await req.json()) as CreateEnumGroupPayload;

        if (!body?.name || typeof body.name !== "string") {
            return error("Field 'name' is required and must be a string.", 422);
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
            return error(`Enum group '${body.name}' already exists.`, 409);
        }

        const newGroup: EnumGroup = {
            name: body.name,
            description: body.description ?? null,
            values,
        };

        settings.enums.push(newGroup);
        await settings.save();

        return NextResponse.json(
            {
                message: "Enum group created successfully.",
                enumGroup: newGroup,
            },
            { status: 201 }
        );
    } catch (err) {
        return error((err as Error).message ?? "Failed to create enum group", 500);
    }
}