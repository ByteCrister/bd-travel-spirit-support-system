// app/api/mock/site-settings/guide-subscriptions/reorder/route.ts
import { reorder } from "@/lib/mocks/guideSubscriptionsSettings.mock";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) ?? {};
    const { orderedIds, version } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ ok: false, message: "orderedIds required" }, { status: 400 });
    }

    const clientVersion = typeof version === "number" ? version : undefined;
    const result = reorder(orderedIds, clientVersion);

    if (!result.ok) {
      if (result.status === 409) return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
      return NextResponse.json({ ok: false, message: result.message ?? "Unknown error" }, { status: 500 });
    }

    return NextResponse.json({ version: result?.data?.version, updatedAt: result?.data?.updatedAt }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message ?? "Invalid JSON" }, { status: 400 });
  }
}
