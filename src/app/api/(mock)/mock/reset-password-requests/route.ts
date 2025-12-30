import { NextResponse } from "next/server";
import { applyFilters, compareByField, ensureDataset, matchesSearch, MOCK_DB } from "@/lib/mocks/reset-password-requests.mock";

ensureDataset();

export async function GET(req: Request) {
    // parse query params
    const url = new URL(req.url);
    const qp = Object.fromEntries(url.searchParams.entries());

    // parse expected parameters with defaults
    const search = qp.search ?? undefined;
    const statusParam = qp.status ?? undefined; // could be "pending"|"denied"|"fulfilled"|"all"
    const sortBy = (qp.sortBy as string | undefined) ?? undefined;
    const sortDir = (qp.sortDir as "asc" | "desc" | undefined) ?? "desc";
    const page = Math.max(1, Number(qp.page ?? "1") || 1);
    const limit = Math.min(100, Math.max(1, Number(qp.limit ?? "20") || 20));

    // extract 'filters' - simple approach: any query param not in known set becomes a filter
    const known = new Set(["search", "status", "sortBy", "sortDir", "page", "limit"]);
    const filters: Record<string, string> = {};
    for (const [k, v] of url.searchParams.entries()) {
        if (!known.has(k)) {
            filters[k] = v;
        }
    }

    // Apply filters and search
    let results = MOCK_DB.filter((d) => {
        if (statusParam && statusParam !== "all" && (d.status as string) !== statusParam) return false;
        if (!matchesSearch(d, search)) return false;
        if (!applyFilters(d, filters as Record<string, string | number | boolean | undefined>)) return false;
        return true;
    });

    const total = results.length;

    // Sorting
    if (sortBy) {
        results = results.slice().sort((a, b) => compareByField(a, b, sortBy, sortDir as "asc" | "desc"));
    } else {
        // default ordering: newest requestedAt first
        results = results.slice().sort((a, b) => compareByField(a, b, "requestedAt", "desc"));
    }

    // Pagination
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const pageData = results.slice(start, start + limit);

    // Construct response matching ResetRequestListResponse
    const body = {
        data: pageData,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };

    return NextResponse.json({ data: body });
}
