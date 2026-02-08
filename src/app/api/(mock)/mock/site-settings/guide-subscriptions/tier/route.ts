// app/api/mock/site-settings/guide-subscriptions/tier/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import type { SubscriptionTierDTO } from "@/types/site-settings/guide-subscription-settings.types";
import { upsertTier } from "@/lib/mocks/guideSubscriptionsSettings.mock";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) ?? {};
    const tierPayload = body.tier ?? {};
    const editorId = body.editorId;
    const note = body.note;
    const clientVersion = typeof body.version === "number" ? body.version : undefined;

    const result = upsertTier(tierPayload as Partial<SubscriptionTierDTO>, editorId, note, clientVersion);

    if (!result.ok) {
      if (result.status === 400) {
        return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
      }
      if (result.status === 409) {
        return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
      }
      return NextResponse.json({ ok: false, message: result.message ?? "Unknown error" }, { status: 500 });
    }

    return NextResponse.json(
      {
        tier: result?.data?.tier,
        version: result?.data?.version,
        updatedAt: result?.data?.updatedAt,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message ?? "Invalid JSON" }, { status: 400 });
  }
}
