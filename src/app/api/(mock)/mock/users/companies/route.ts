// app/api/users-management/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type {
    CompanyQueryParams,
    CompanyRowDTO,
    CompanyListResponseDTO,
    CompanyDashboardStatsDTO,
} from "@/types/company.types";

// -------------------------------
// Deterministic fake generator
// -------------------------------
function seedCompanies(count: number): CompanyRowDTO[] {
    faker.seed(42); // deterministic seed

    const rows: CompanyRowDTO[] = [];
    for (let i = 0; i < count; i++) {
        const id = faker.string.uuid();
        const companyName = `${faker.company.name()} ${faker.helpers.arrayElement([
            "Ltd",
            "Inc",
            "LLC",
            "Co.",
        ])}`;
        const createdAt = faker.date.past().toISOString();
        const updatedAt = faker.date.recent().toISOString();
        const lastLogin = faker.datatype.boolean() ? faker.date.recent().toISOString() : null;

        const employeesCount = faker.number.int({ min: 0, max: 120 });
        const toursCount = faker.number.int({ min: 0, max: 200 });
        const reviewsCount = faker.number.int({ min: toursCount, max: toursCount * 5 });
        const averageRating =
            toursCount === 0 ? 0 : Number(faker.number.float({ min: 3, max: 4.9 }).toFixed(2));

        const email = faker.internet.email({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            provider: "example.com",
        });

        const host = {
            id,
            name: faker.person.fullName(),
            email,
            avatar: faker.image.avatar(),
            companyName,
            createdAt,
        } as CompanyRowDTO["host"];

        rows.push({
            id,
            name: companyName,
            host,
            metrics: {
                employeesCount,
                toursCount,
                reviewsCount,
                averageRating,
            },
            timestamps: {
                lastLogin,
                createdAt,
                updatedAt,
            },
            tags: faker.helpers.arrayElements(
                ["priority", "featured", "new", "enterprise", "growth"],
                faker.number.int({ min: 0, max: 3 })
            ),
        });
    }
    return rows;
}

// Keep a module-level cache (simulating DB) for consistent pagination/sorting.
const DATASET = seedCompanies(250);

// -------------------------------
// Helpers: parsing, filtering, sorting, pagination
// -------------------------------
function parseQuery(req: NextRequest): Required<CompanyQueryParams> {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";
    const sortBy = (url.searchParams.get("sortBy") as CompanyQueryParams["sortBy"]) ?? "createdAt";
    const sortDir = (url.searchParams.get("sortDir") as CompanyQueryParams["sortDir"]) ?? "desc";
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 20);

    return {
        search,
        sortBy,
        sortDir,
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
    };
}

function applySearch(rows: CompanyRowDTO[], search: string): CompanyRowDTO[] {
    if (!search?.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => {
        const fields = [
            r.name,
            r.host.companyName,
            r.host.name,
            r.host.email,
            ...(r.tags ?? []),
        ]
            .filter(Boolean)
            .map((x) => String(x).toLowerCase());
        return fields.some((f) => f.includes(q));
    });
}

function compare(a: CompanyRowDTO, b: CompanyRowDTO, sortBy: string): number {
    switch (sortBy) {
        case "name":
            return a.name.localeCompare(b.name);
        case "averageRating":
            return a.metrics.averageRating - b.metrics.averageRating;
        case "reviewsCount":
            return a.metrics.reviewsCount - b.metrics.reviewsCount;
        case "employeesCount":
            return a.metrics.employeesCount - b.metrics.employeesCount;
        case "toursCount":
            return a.metrics.toursCount - b.metrics.toursCount;
        case "createdAt":
        default:
            return new Date(a.timestamps.createdAt).getTime() - new Date(b.timestamps.createdAt).getTime();
    }
}

function applySort(rows: CompanyRowDTO[], sortBy: string, sortDir: "asc" | "desc"): CompanyRowDTO[] {
    const cloned = [...rows];
    cloned.sort((a, b) => compare(a, b, sortBy));
    return sortDir === "desc" ? cloned.reverse() : cloned;
}

function applyPagination(rows: CompanyRowDTO[], page: number, limit: number) {
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const end = start + limit;
    const slice = rows.slice(start, end);
    return { rows: slice, total, page, pages };
}

// -------------------------------
// GET handler
// -------------------------------
export async function GET(req: NextRequest) {
    const { search, sortBy, sortDir, page, limit } = parseQuery(req);

    const filtered = applySearch(DATASET, search);
    const sorted = applySort(filtered, sortBy!, sortDir!);
    const paged = applyPagination(sorted, page!, limit!);

    const stats: CompanyDashboardStatsDTO = {
        totalCompanies: DATASET.length,
        totalEmployees: DATASET.reduce((acc, r) => acc + r.metrics.employeesCount, 0),
        totalTours: DATASET.reduce((acc, r) => acc + r.metrics.toursCount, 0),
    };

    const payload: CompanyListResponseDTO & { stats: CompanyDashboardStatsDTO } = {
        ...paged,
        stats,
    };

    return NextResponse.json(payload, { status: 200 });
}
