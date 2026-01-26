// app/api/mock/ads/[id]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ApiResponse, AdvertisementResponse } from "@/types/advertising.types";
import { getAdById, softDeleteAd } from "@/lib/mocks/mockAds";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const ad = getAdById(id);
        if (!ad) return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
        const payload: ApiResponse<AdvertisementResponse> = { ok: true, data: ad };
        return NextResponse.json(payload);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: { message: err?.message ?? "Server error" } }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = (await params).id;
        const ad = softDeleteAd(id);
        if (!ad) return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
        const payload: ApiResponse<AdvertisementResponse | null> = { ok: true, data: ad };
        return NextResponse.json(payload);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: { message: err?.message ?? "Server error" } }, { status: 500 });
    }
}
