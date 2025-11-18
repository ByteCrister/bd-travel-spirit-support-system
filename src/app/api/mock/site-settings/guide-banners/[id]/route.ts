// app/api/mock/site-settings/guide-banners/[id]/route.ts
import { NextResponse } from "next/server";
import type { GuideBannerPatchOperation } from "@/types/guide-banner-settings.types";
import { deleteBanner, getBanner, patchBanner, replaceBanner } from "@/lib/mocks/guideBannersSettings";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const found = getBanner(id);
  if (!found) return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
  return NextResponse.json({ data: found });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json().catch(() => ({}));
  // Allow partial replace but treat as replace
  const replaced = replaceBanner(id, body);
  if (!replaced) return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
  return NextResponse.json({ data: replaced });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json().catch(() => ({}));
  const ops = Array.isArray(body?.ops) ? (body.ops as GuideBannerPatchOperation[]) : [];
  if (!ops.length) return NextResponse.json({ error: { message: "ops required" } }, { status: 400 });
  const updated = patchBanner(id, ops);
  if (!updated) return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const ok = deleteBanner(id);
  if (!ok) return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
  return NextResponse.json({ data: { id } });
}
