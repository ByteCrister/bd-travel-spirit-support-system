// app/api/mock/site-settings/advertising/prices/bulk/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { BulkUpdateAdvertisingPricesPayload } from "@/types/advertising-settings.types";
import { bulkUpdatePrices } from "@/lib/mocks/siteSettings.mock";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const payload = body as BulkUpdateAdvertisingPricesPayload;
  if (!payload) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const config = bulkUpdatePrices(payload);
  return NextResponse.json(config, { status: 200 });
}
