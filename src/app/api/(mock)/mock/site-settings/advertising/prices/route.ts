// app/api/mock/site-settings/advertising/prices/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { CreateAdvertisingPricePayload } from "@/types/advertising-settings.types";
import { createPrice, getConfig } from "@/lib/mocks/siteSettings.mock";

export async function GET() {
  const cfg = getConfig();
  return NextResponse.json(cfg.pricing, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const payload = body as CreateAdvertisingPricePayload;
  // minimal validation
  if (!payload || !payload.placement || typeof payload.price !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const dto = createPrice(payload);
  return NextResponse.json({ data: dto }, { status: 201 });
}
