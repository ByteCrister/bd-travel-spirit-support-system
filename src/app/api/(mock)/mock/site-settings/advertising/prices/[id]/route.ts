// app/api/mock/site-settings/advertising/prices/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UpdateAdvertisingPricePayload } from "@/types/advertising-settings.types";
import { deletePrice, updatePrice } from "@/lib/mocks/siteSettings.mock";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const body = await req.json();
    const payload: UpdateAdvertisingPricePayload = { id, ...(body ?? {}) };
    const updated = updatePrice(payload);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id;
    const ok = deletePrice(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(null, { status: 204 });
}
