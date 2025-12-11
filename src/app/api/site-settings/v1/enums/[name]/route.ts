// app/api/site-settings/v1/enums/[name]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type {
    GetEnumGroupResponse,
    UpdateEnumGroupPayload,
    UpsertEnumValuesPayload,
    EnumGroup,
    EnumValue,
} from "@/types/enum-settings.types";
import ConnectDB from "@/config/db";
import SiteSettings from "@/models/site-settings.model";

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
            // merge into existing
            map.set(p.key, {
                ...previous,
                ...p,
            });
        } else {
            // create new strictly typed EnumValue
            const newValue: EnumValue = {
                key: p.key,
                value: p.value ?? p.key,
                label: p.label ?? `label: ${p.key}`,
                description: p.description ?? null,
                active: p.active ?? true,
            };
            map.set(p.key, newValue);
        }
    }

    return Array.from(map.values());
}

/* ---------------------------------------------------
   Params type for Next.js Route
---------------------------------------------------- */
interface Params {
    params: Promise<{ name: string }>;
}

/* ---------------------------------------------------
   GET — Fetch single enum group
---------------------------------------------------- */
export async function GET(
    _req: NextRequest,
    { params }: Params
) {
    await ConnectDB();
    const { name } = await params;

    if (!name) {
        return NextResponse.json(
            { error: "Missing enum group name" },
            { status: 400 }
        );
    }

    try {
        const doc = await SiteSettings.findOne().lean();

        const raw = doc?.enums?.find((g) => g.name === name) ?? null;

        let group: EnumGroup | null = null;

        if (raw) {
            group = {
                name: raw.name,
                description: raw.description ?? null,
                values: raw.values.map((v): EnumValue => ({
                    key: v.key,
                    value: v.value ?? v.key,
                    label: v.label ?? `label: ${v.key}`,
                    description: v.description ?? null,
                    active: v.active ?? true,
                })),
            };
        }

        const res: GetEnumGroupResponse = {
            enumGroup: group,
            fetchedAt: new Date().toISOString(),
        };

        return NextResponse.json(res, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { error: (err as Error).message ?? "Failed to fetch enum group" },
            { status: 500 }
        );
    }
}

/* ---------------------------------------------------
   PUT — Partially update enum group metadata + values
---------------------------------------------------- */

function toEnumGroupDTO(group: EnumGroup): EnumGroup {
    return {
        name: group.name,
        description: group.description ?? null,
        values: group.values.map((v) => ({
            key: v.key,
            value: v.value ?? v.key,
            label: v.label ?? `label: ${v.key}`,
            description: v.description ?? null,
            active: v.active ?? true,
        }))
    };
}

export async function PUT(
    req: NextRequest,
    { params }: Params
) {
    await ConnectDB();
    const { name } = await params;

    if (!name) {
        return NextResponse.json(
            { error: "Missing enum group name" },
            { status: 400 }
        );
    }

    try {
        const payload = (await req.json()) as UpdateEnumGroupPayload;

        const settings = await SiteSettings.findOne();
        if (!settings) {
            return NextResponse.json(
                { error: "Site settings not found" },
                { status: 404 }
            );
        }

        const groupIndex = settings.enums.findIndex((g) => g.name === name);

        if (groupIndex === -1) {
            return NextResponse.json(
                { error: `Enum group '${name}' not found` },
                { status: 404 }
            );
        }

        const existing = settings.enums[groupIndex];

        const mergedRaw = {
            ...existing,
            description: payload.description ?? existing.description ?? null,
            values: Array.isArray(payload.values)
                ? mergePartialValues(existing.values, payload.values)
                : existing.values,
        };

        // Save raw mongoose version
        settings.enums[groupIndex] = mergedRaw;
        await settings.save();

        // Convert to DTO for response
        const mergedGroup: EnumGroup = toEnumGroupDTO(mergedRaw);

        return NextResponse.json({ enumGroup: mergedGroup }, { status: 200 });

    } catch (err) {
        const message = (err as Error).message ?? "Failed to update enum group";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/* ---------------------------------------------------
   PATCH — Insert/update specific values only
---------------------------------------------------- */
export async function PATCH(
    req: NextRequest,
    { params }: Params
) {
    await ConnectDB();
    const { name } = await params;

    if (!name) {
        return NextResponse.json(
            { message: "Missing enum group name" },
            { status: 400 }
        );
    }

    try {
        const payload = (await req.json()) as Partial<UpsertEnumValuesPayload>;
        const incoming = Array.isArray(payload.values)
            ? payload.values
            : [];

        const settings = await SiteSettings.findOne();
        if (!settings) {
            return NextResponse.json(
                { message: "Site settings not found" },
                { status: 404 }
            );
        }

        const groupIndex = settings.enums.findIndex(
            (g: EnumGroup) => g.name === name
        );

        if (groupIndex === -1) {
            return NextResponse.json(
                { message: `Enum group '${name}' not found` },
                { status: 404 }
            );
        }

        const existingValues = settings.enums[groupIndex].values;

        const updatedValues = payload.replace
            ? incoming as EnumValue[]
            : mergePartialValues(existingValues, incoming);

        settings.enums[groupIndex].values = updatedValues;
        await settings.save();

        return NextResponse.json(
            { enumGroup: settings.enums[groupIndex] },
            { status: 200 }
        );
    } catch (err) {
        const message = (err as Error).message ?? "Failed to patch enum group";
        return NextResponse.json({ message: message }, { status: 500 });
    }
}

/* ---------------------------------------------------
   DELETE — delete the entire enum group
---------------------------------------------------- */
export async function DELETE(req: NextRequest, { params }: Params) {
    const { name } = await params;
    if (!name) {
        return NextResponse.json({ message: "Enum group name is required" }, { status: 400 });
    }

    try {
        await ConnectDB();

        // Load the singleton SiteSettings document
        const siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            return NextResponse.json({ message: "SiteSettings not found" }, { status: 404 });
        }

        // Check if the enum group exists
        const groupIndex = siteSettings.enums.findIndex((g) => g.name === name);
        if (groupIndex === -1) {
            return NextResponse.json({ message: `Enum group "${name}" not found` }, { status: 404 });
        }

        // Remove the group
        siteSettings.enums.splice(groupIndex, 1);

        // Save changes
        await siteSettings.save();

        return NextResponse.json({ message: `Enum group "${name}" deleted successfully` }, { status: 200 });
    } catch (err) {
        console.log("Failed to delete enum group:", err);
        const message = (err as Error).message ?? "Failed to delete enum group";
        return NextResponse.json({ message: message }, { status: 500 });
    }
}