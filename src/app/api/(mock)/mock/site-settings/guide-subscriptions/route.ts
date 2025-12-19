import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { SubscriptionTierDTO } from "@/types/guide-subscription-settings.types";
import { getSiteSettings, upsertTier } from "@/lib/mocks/guideSubscriptionsSettings.mock";

/**
 * GET — return the singleton site settings guideSubscriptions slice
 * Response: { guideSubscriptions, version, updatedAt }
 */
export async function GET(_req: NextRequest) {
  const settings = getSiteSettings();
  return NextResponse.json(
    {
      data: {
        guideSubscriptions: settings.guideSubscriptions,
        version: settings.version,
        updatedAt: settings.updatedAt,
      }
    },
    { status: 200 }
  );
}

/**
 * PUT — upsert a single tier (create or update)
 * Expected JSON body: { tier: Partial<SubscriptionTierDTO>, editorId?, note?, version? }
 * Responses:
 *  - 200: { tier, version, updatedAt }
 *  - 400: { ok: false, errors: ValidationError[] }
 *  - 409: { ok: false, message: "Version conflict" }
 */
export async function PUT(req: NextRequest) {
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
        tier: result.data.tier,
        version: result.data.version,
        updatedAt: result.data.updatedAt,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message ?? "Invalid JSON" }, { status: 400 });
  }
}
