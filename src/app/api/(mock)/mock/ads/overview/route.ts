// app/api/mock/ads/overview/route.ts
import { NextResponse } from "next/server";
import type { ApiResponse, AdvertisementOverview } from "@/types/advertising/advertising.types";
import { getOverview } from "@/lib/mocks/mockAds";

export async function GET() {
  try {
    const data = getOverview();
    const payload: ApiResponse<AdvertisementOverview> = { ok: true, data };
    return NextResponse.json(payload);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: { message: err?.message ?? "Server error" } }, { status: 500 });
  }
}
