// app/api/mock/site-settings/enums/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { GetEnumGroupsResponse, CreateEnumGroupPayload } from "@/types/enum-settings.types";
import { createGroupFromPayload, inMemoryStore } from "@/lib/mocks/enumsSettings.mock";

export async function GET() {
  const enums = Object.values(inMemoryStore);
  const payload: GetEnumGroupsResponse = { enums, fetchedAt: new Date().toISOString() };
  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateEnumGroupPayload;
    const created = createGroupFromPayload(body);
    return NextResponse.json({ enumGroup: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json("Invalid payload", { status: 400 });
  }
}
