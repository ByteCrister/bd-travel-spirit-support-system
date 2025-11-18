// app/api/mock/site-settings/advertising/config/route.ts
import { getConfig } from "@/lib/mocks/siteSettings.mock";
import { NextResponse } from "next/server";

export async function GET() {
  const cfg = getConfig();
  return NextResponse.json(cfg, { status: 200 });
}

// Provide simple notes update via PUT at /config/notes (route below in same folder path)
// But to keep routes separate, see /config/notes route implementation if desired.
