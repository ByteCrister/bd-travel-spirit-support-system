// app/api/mock/site-settings/enums/[name]/values/[valueKey]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { removeValueFromGroup, inMemoryStore } from "@/lib/mocks/enumsSettings.mock";

export async function DELETE(_req: NextRequest, { params }: { params: { name: string; valueKey: string } }) {
  const name = decodeURIComponent(params.name);
  const valueKey = decodeURIComponent(params.valueKey);
  const existing = inMemoryStore[name];
  if (!existing) return NextResponse.json("Group not found", { status: 404 });
  const updated = removeValueFromGroup(name, valueKey);
  if (!updated) return NextResponse.json("Value not found or already removed", { status: 404 });
  return NextResponse.json({ enumGroup: updated });
}
