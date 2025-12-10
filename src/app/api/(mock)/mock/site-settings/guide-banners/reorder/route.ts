// app/api/mock/site-settings/guide-banners/reorder/route.ts
import { reorderBanners } from "@/lib/mocks/guideBannersSettings";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds : [];
  if (!orderedIds.length) {
    return NextResponse.json({ error: { message: "orderedIds required" } }, { status: 400 });
  }
  const updated = reorderBanners(orderedIds);
  return NextResponse.json({ data: updated });
}
