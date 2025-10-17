// /api/users-management/companies/[companyId]/tours/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    SortableTourKeys,
    TourListItemDTO,
} from "@/types/tour.types";
import {
    TOUR_STATUS,
    TRAVEL_TYPE,
    AUDIENCE_TYPE,
    CONTENT_CATEGORY,
} from "@/constants/tour.const";

// --- Helper: pick random enum value ---
function randomEnum<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// --- Helper: pick random subset ---
function randomSubset<T>(arr: T[], count: number): T[] {
    return faker.helpers.shuffle(arr).slice(0, count);
}

// --- Generate one fake tour aligned with new fields ---
function generateFakeTour(): TourListItemDTO {
    const startDate = faker.date.future();
    const endDate = faker.date.soon({
        days: faker.number.int({ min: 3, max: 14 }),
        refDate: startDate,
    });

    const minAmount = faker.number.int({ min: 100, max: 500 });
    const maxAmount = faker.number.int({ min: minAmount + 100, max: 1000 });
    const bookingCount = faker.number.int({ min: 0, max: 50 });
    const maxGroupSize = faker.number.int({ min: 20, max: 60 });

    return {
        id: faker.database.mongodbObjectId(),
        title: faker.lorem.words(3),
        slug: faker.lorem.slug(),
        status: randomEnum(Object.values(TOUR_STATUS)),

        // Schedule
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ),

        // Ratings & bookings
        averageRating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
        reviewCount: faker.number.int({ min: 0, max: 300 }),
        reportCount: faker.number.int({ min: 0, max: 20 }),
        faqCount: faker.number.int({ min: 0, max: 20 }),
        bookingCount,
        maxGroupSize,
        isFull: bookingCount >= maxGroupSize,

        // Categorization
        tags: [faker.word.noun(), faker.word.noun()],
        travelTypes: randomSubset(Object.values(TRAVEL_TYPE), 2),
        category: faker.helpers.arrayElement(["Adventure", "Cultural", "Leisure"]),
        subCategory: faker.helpers.arrayElement(["Hiking", "City Tour", "Safari"]),
        categories: randomSubset(Object.values(CONTENT_CATEGORY), 2),
        audience: randomSubset(Object.values(AUDIENCE_TYPE), 2),

        // Pricing
        priceSummary: { minAmount, maxAmount, currency: "USD" },
        activeDiscountPercentage: faker.datatype.boolean()
            ? faker.number.int({ min: 5, max: 30 })
            : undefined,

        // Media
        heroImageId: faker.database.mongodbObjectId(),
        isFeatured: faker.datatype.boolean(),

        // Engagement & metrics
        wishlistCount: faker.number.int({ min: 0, max: 1000 }),
        popularityScore: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
        featured: faker.datatype.boolean(),
        trendingUntil: faker.date.future().toISOString(),
        viewCount: faker.number.int({ min: 100, max: 10000 }),
        likeCount: faker.number.int({ min: 10, max: 5000 }),
        shareCount: faker.number.int({ min: 5, max: 2000 }),

        // Operational metadata
        visibility: randomEnum(["public", "private", "archived"]),
        lastBookingDate: faker.date.soon({ days: 7 }).toISOString(),
        bookingTrend: randomEnum(["increasing", "stable", "decreasing"]),
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
    };
}

// --- Handler ---
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const sortParam = (searchParams.get("sort") || "createdAt") as SortableTourKeys;
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";
    const search = searchParams.get("search")?.toLowerCase() || "";

    // Generate mock tours
    let tours = Array.from({ length: 200 }, generateFakeTour);

    // Filter by search
    if (search) {
        tours = tours.filter((t) => t.title.toLowerCase().includes(search));
    }

    // Sort
    tours.sort((a, b) => {
        const aVal = a[sortParam];
        const bVal = b[sortParam];

        if (typeof aVal === "string" && typeof bVal === "string") {
            return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
            return order === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    // Paginate
    const total = tours.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const pagedTours = tours.slice(start, start + limit);

    // Response
    return NextResponse.json({
        companyId: (await params).companyId,
        data: {
            docs: pagedTours,
            total,
            page,
            pages,
        },
    });
}
