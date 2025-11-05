import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { AnalyticsData } from "@/types/dashboard.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(req: NextRequest) {
    // You can inspect filters: const body = await req.json();
    const days = 30;
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
