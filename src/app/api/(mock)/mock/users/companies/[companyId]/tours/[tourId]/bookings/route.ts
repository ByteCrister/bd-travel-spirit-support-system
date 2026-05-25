// lib/mock/bookings-generator.ts
import { faker } from "@faker-js/faker";
import {
    BookingListItemDTO,
    BookingUserInfo,
    TourBookingsResponseDTO,
} from "@/types/tour/tour-detail-booking.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a single mock booking item.
 */
const generateMockBooking = (): BookingListItemDTO => ({
    _id: faker.string.uuid(),
    user: {
        _id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatarGitHub(), // or faker.image.avatar()
    } satisfies BookingUserInfo,
    bookingTime: faker.date.recent({ days: 30 }).toISOString(),
    totalParticipants: faker.number.int({ min: 1, max: 10 }),
    totalPaid: faker.number.int({ min: 50, max: 2000 }),
});

/**
 * Generate a paginated bookings response.
 */
export function generateMockBookingsResponse(
    page: number,
    limit: number,
    totalCount?: number // optional fixed total
): TourBookingsResponseDTO {
    const total = totalCount ?? faker.number.int({ min: 20, max: 100 });
    const pages = Math.ceil(total / limit);

    const docs: BookingListItemDTO[] = Array.from({ length: limit }, () =>
        generateMockBooking()
    );

    return {
        docs,
        total,
        page,
        pages,
    };
}


// Simple delay to simulate network
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(
    request: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { params }: { params: Promise<{ tourId: string }> }
) {
    // Simulate network latency (300-800ms)
    await delay(faker.number.int({ min: 300, max: 800 }));

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = (searchParams.get("search") ?? "").trim().toLowerCase();

    // Simulate potential server error (5% chance) for testing error handling
    if (Math.random() < 0.05) {
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }

    const poolSize = Math.max(limit * 5, 50);
    const pool = Array.from({ length: poolSize }, () => generateMockBooking());
    const filtered = search
        ? pool.filter(
            (b) =>
                b.user.name.toLowerCase().includes(search) ||
                b.user.email.toLowerCase().includes(search)
        )
        : pool;

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const docs = filtered.slice(start, start + limit);

    const data: TourBookingsResponseDTO = {
        docs,
        total,
        page,
        pages,
    };

    // Wrap in your standard ApiResponse shape
    return NextResponse.json({
        data,
    });
}