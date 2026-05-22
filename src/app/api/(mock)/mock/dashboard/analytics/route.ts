import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { AnalyticsData } from "@/types/dashboard/dashboard.types";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // Extract filter parameters
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const start = searchParams.get("start") || faker.date.recent({ days: 30 }).toISOString().split("T")[0];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const end = searchParams.get("end") || new Date().toISOString().split("T")[0];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const page = parseInt(searchParams.get("page") || "1");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const limit = parseInt(searchParams.get("limit") || "10");

    // (Optional) use filters to modify data generation, e.g., date range
    // For simplicity, we generate fresh data each time, but you could adjust based on start/end

    const days = 30; // you could compute days from start/end
    const bookingsOverTime = Array.from({ length: days }).map((_, i) => ({
        date: faker.date
            .soon({ days: days - i })
            .toISOString()
            .split("T")[0],
        count: faker.number.int({ min: 0, max: 200 }),
        revenue: faker.number.int({ min: 0, max: 50_000 }),
    }));
    const travelersOverTime = Array.from({ length: days }).map(() => ({
        date: faker.date.recent({ days }).toISOString().split("T")[0],
        count: faker.number.int({ min: 0, max: 200 }),
    }));
    const guidesOverTime = Array.from({ length: days }).map(() => ({
        date: faker.date.recent({ days }).toISOString().split("T")[0],
        count: faker.number.int({ min: 0, max: 50 }),
    }));
    const revenueOverTime = Array.from({ length: days }).map(() => ({
        date: faker.date.recent({ days }).toISOString().split("T")[0],
        amount: faker.number.int({ min: 0, max: 100_000 }),
    }));
    const reportsOverTime = Array.from({ length: days }).map(() => ({
        date: faker.date.recent({ days }).toISOString().split("T")[0],
        count: faker.number.int({ min: 0, max: 20 }),
    }));

    const payload: AnalyticsData = {
        bookingsOverTime,
        travelersOverTime,
        guidesOverTime,
        revenueOverTime,
        reportsOverTime,
    };

    return NextResponse.json({ data: payload });
}