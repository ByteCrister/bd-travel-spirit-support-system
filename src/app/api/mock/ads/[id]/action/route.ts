// app/api/mock/ads/[id]/action/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { performAdminAction, getAdById } from "@/lib/mocks/mockAds";
import type { ApiResponse, AdvertisementResponse, AdvertisementAdminActionDTO } from "@/types/advertising.types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json().catch(() => ({}));
    const dto: AdvertisementAdminActionDTO = { ...(body || {}), id };

    const existing = getAdById(id);
    if (!existing) return NextResponse.json({ ok: false, error: { message: "Not found" } }, { status: 404 });

    const updated = performAdminAction(dto);
    if (!updated) return NextResponse.json({ ok: false, error: { message: "Action failed" } }, { status: 400 });

    const payload: ApiResponse<AdvertisementResponse> = { ok: true, data: updated };
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: { message: err?.message ?? "Server error" } }, { status: 500 });
  }
}
