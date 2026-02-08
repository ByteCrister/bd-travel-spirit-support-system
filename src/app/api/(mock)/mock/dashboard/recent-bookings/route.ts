import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { Booking } from "@/types/dashboard/dashboard.types";

export async function GET() {
    const statuses = ["confirmed", "pending", "cancelled", "completed"] as const;
    const items: Booking[] = Array.from({ length: 6 }).map(() => ({
        id: faker.string.uuid(),
        user: {
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
        },
        tour: {
            id: faker.string.uuid(),
            title: faker.lorem.words({ min: 2, max: 5 }),
            destination: `${faker.location.city()}, ${faker.location.country()}`,
        },
        bookingDate: faker.date.past({ years: 0.1 }).toISOString(),
        status: faker.helpers.arrayElement(statuses),
        amount: faker.number.int({ min: 50, max: 5000 }),
    }));

    return NextResponse.json({ data: items });
}
