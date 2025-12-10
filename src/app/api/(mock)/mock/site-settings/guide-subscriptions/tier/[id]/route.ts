// app/api/mock/site-settings/guide-subscriptions/tier/[id]/route.ts
import { deleteTierById } from "@/lib/mocks/guideSubscriptionsSettings.mock";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const versionParam = url.searchParams.get("version");
  const clientVersion = versionParam ? Number(versionParam) : undefined;

  // extract id segment from pathname; this route is mounted at /.../tier/[id]/route.ts
  const pathname = req.nextUrl.pathname;
  const parts = pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];

  if (!id) {
    return NextResponse.json({ ok: false, message: "Missing id in route" }, { status: 400 });
  }

  const result = deleteTierById(id, clientVersion);

  if (!result.ok) {
    if (result.status === 409) return NextResponse.json({ ok: false, message: result.message }, { status: 409 });
    if (result.status === 404) return NextResponse.json({ ok: false, message: result.message }, { status: 404 });
    return NextResponse.json({ ok: false, message: result.message ?? "Unknown error" }, { status: 500 });
  }

  return NextResponse.json({ version: result.data.version, updatedAt: result.data.updatedAt }, { status: 200 });
}
