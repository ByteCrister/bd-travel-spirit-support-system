// app/api/mock/site-settings/enums/[name]/values/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UpsertEnumValuesPayload } from "@/types/enum-settings.types";
import { upsertValuesToGroup } from "@/lib/mocks/enumsSettings.mock";

export async function POST(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    const groupName = decodeURIComponent(params.name);
    const body = (await req.json()) as UpsertEnumValuesPayload;
    body.groupName = groupName;
    const updated = upsertValuesToGroup(body);
    return NextResponse.json({ enumGroup: updated });
  } catch (err) {
    return NextResponse.json("Invalid payload", { status: 400 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { name: string } }) {
  // For PATCH we treat similarly: upsert/merge values
  try {
    const groupName = decodeURIComponent(params.name);
    const body = (await req.json()) as Partial<UpsertEnumValuesPayload>;
    const payload: UpsertEnumValuesPayload = {
      groupName,
      values: body.values ?? [],
      replace: body.replace ?? false,
    };
    const updated = upsertValuesToGroup(payload);
    return NextResponse.json({ enumGroup: updated });
  } catch (err) {
    return NextResponse.json("Invalid payload", { status: 400 });
  }
}
