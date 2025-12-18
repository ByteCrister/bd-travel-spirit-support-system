// app/api/mock/site-settings/guide-banners/route.ts
import { NextResponse } from "next/server";
import type { GuideBannerCreateDTO } from "@/types/guide-banner-settings.types";
import { createBanner, listBanners, reorderBanners, seedMockBanners } from "@/lib/mocks/guideBannersSettings";

seedMockBanners(); // seed on first import

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined;
  const offset = url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined;
  const sortBy = (url.searchParams.get("sortBy") as any) ?? undefined;
  const sortDir = (url.searchParams.get("sortDir") as any) ?? undefined;
  const active = url.searchParams.has("active") ? url.searchParams.get("active") === "true" : undefined;
  const search = url.searchParams.get("search") ?? undefined;

  const result = listBanners({ limit, offset, sortBy, sortDir, active, search });
  return NextResponse.json({ data: { ...result } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const payload = body as GuideBannerCreateDTO;
  if (!payload || !payload.asset) {
    return NextResponse.json({ error: { message: "asset is required" } }, { status: 400 });
  }
  const created = createBanner(payload);
  return NextResponse.json({ data: { data: created } }, { status: 201 });
}

/** Reorder endpoint */
export async function PUT(req: Request) {
  // some clients may use PUT for reorder with body { orderedIds: string[] }
  const body = await req.json().catch(() => ({}));
  const orderedIds = Array.isArray(body?.orderedIds) ? body.orderedIds : [];
  if (!orderedIds.length) {
    return NextResponse.json({ error: { message: "orderedIds required" } }, { status: 400 });
  }
  const updated = reorderBanners(orderedIds);
  return NextResponse.json({ data: updated });
}

/** Also allow POST /reorder via next route (see separate handler if needed) */
