// app/api/mock/ads/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type {
  ApiResponse,
  PaginatedResponse,
  AdvertisementResponse,
  AdListQuery,
} from "@/types/advertising.types";
import { queryAds } from "@/lib/mocks/mockAds";
import { AD_STATUS, PLACEMENT } from "@/constants/advertising.const";

const VALID_STATUSES = new Set(Object.values(AD_STATUS));
const VALID_PLACEMENTS = new Set(Object.values(PLACEMENT));

function normalizeSingleOrArray(
  value: string | string[] | null | undefined
): string[] | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.map((v) => v.trim()).filter(Boolean);
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return undefined;
    if (raw.includes(",")) return raw.split(",").map((s) => s.trim()).filter(Boolean);
    return [raw];
  }
  return undefined;
}

/**
 * Parse query params into AdListQuery (safe conversions + validation)
 */
export function parseAdListQuery(params: URLSearchParams): AdListQuery {
  const pageRaw = params.get("page");
  const limitRaw = params.get("limit");

  const page = pageRaw ? Number(pageRaw) : undefined;
  const limit = limitRaw ? Number(limitRaw) : undefined;

  const q = params.get("q") ?? undefined;
  const guideId = params.get("guideId") ?? undefined;
  const tourId = params.get("tourId") ?? undefined;

  // Status parsing: accept repeated params or comma-separated
  const rawStatuses = normalizeSingleOrArray(
    params.getAll("status").length ? params.getAll("status") : params.get("status")
  );
  let status: AdListQuery["status"];
  if (rawStatuses && rawStatuses.length) {
    const filtered = rawStatuses.filter((s) => VALID_STATUSES.has(s as any));
    if (filtered.length === 1) status = filtered[0] as any;
    else if (filtered.length > 1) status = filtered as any;
  }

  // Placements parsing
  const rawPlacements = normalizeSingleOrArray(
    params.getAll("placements").length ? params.getAll("placements") : params.get("placements")
  );
  let placements: AdListQuery["placements"];
  if (rawPlacements && rawPlacements.length) {
    const filtered = rawPlacements.filter((p) => VALID_PLACEMENTS.has(p as any));
    if (filtered.length === 1) placements = filtered[0] as any;
    else if (filtered.length > 1) placements = filtered as any;
  }

  const startDateFrom = params.get("startDateFrom") ?? undefined;
  const startDateTo = params.get("startDateTo") ?? undefined;
  const endDateFrom = params.get("endDateFrom") ?? undefined;
  const endDateTo = params.get("endDateTo") ?? undefined;

  const sortBy = (params.get("sortBy") as AdListQuery["sortBy"]) ?? undefined;
  const sortDirRaw = params.get("sortDir") ?? undefined;
  const sortDir =
    sortDirRaw && (sortDirRaw === "asc" || sortDirRaw === "desc") ? (sortDirRaw as any) : undefined;

  const withDeleted = params.get("withDeleted") === "true" || params.get("withDeleted") === "1";

  return {
    page,
    limit,
    q,
    guideId,
    tourId,
    status,
    placements,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    sortBy,
    sortDir,
    withDeleted,
  };
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const query = parseAdListQuery(url.searchParams);

    // Provide default pagination if not set and clamp values
    const safeQuery: AdListQuery = {
      ...query,
      page: query.page && Number.isFinite(query.page) && query.page > 0 ? Math.floor(query.page) : 1,
      limit:
        query.limit && Number.isFinite(query.limit) && query.limit > 0
          ? Math.min(100, Math.max(1, Math.floor(query.limit)))
          : 20,
    };

    const data: PaginatedResponse<AdvertisementResponse> = queryAds(safeQuery);

    const payload: ApiResponse<PaginatedResponse<AdvertisementResponse>> = {
      ok: true,
      data,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0", // mock data shouldn't be aggressively cached
        "Content-Type": "application/json",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    const payload: ApiResponse<never> = {
      ok: false,
      error: { message },
    };
    return NextResponse.json(payload, { status: 500 });
  }
}
