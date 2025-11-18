// app/api/mock/site-settings/enums/[name]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { GetEnumGroupResponse, UpdateEnumGroupPayload } from "@/types/enum-settings.types";
import { inMemoryStore, updateGroupWithPayload } from "@/lib/mocks/enumsSettings.mock";

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const nm = decodeURIComponent(params.name);
  const group = inMemoryStore[nm] ?? null;
  const payload: GetEnumGroupResponse = { enumGroup: group, fetchedAt: new Date().toISOString() };
  return NextResponse.json(payload);
}

export async function PUT(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const name = decodeURIComponent(params.name);
    const body = (await req.json()) as UpdateEnumGroupPayload;
    if (body.name !== name) {
      // allow the body to include name but prefer route param; normalize
      body.name = name;
    }
    const updated = updateGroupWithPayload(name, body);
    if (!updated) return NextResponse.json("Group not found", { status: 404 });
    return NextResponse.json({ enumGroup: updated });
  } catch (err) {
    return NextResponse.json("Invalid payload", { status: 400 });
  }
}
