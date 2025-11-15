// app/api/admin/ads/[id]/restore/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ApiResponse, AdvertisementResponse } from "@/types/advertising.types";
import { getAdById, restoreAd } from "@/lib/mocks/mockAds";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const existing = getAdById(id);
    if (!existing) return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });
    const ad = restoreAd(id);
    const payload: ApiResponse<AdvertisementResponse | null> = { ok: true, data: ad };
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: { message: err?.message ?? "Server error" } }, { status: 500 });
  }
}
