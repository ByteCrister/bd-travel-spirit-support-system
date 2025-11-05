import { faker } from "@faker-js/faker";
import { NextResponse } from "next/server";
import type { ToursStats } from "@/types/statistics.types";

export async function GET() {
  const data: ToursStats = {
    statusCounts: [
      { label: "Upcoming", count: 20 },
      { label: "Ongoing", count: 10 },
      { label: "Completed", count: 70 },
    ],
    bookingsPerTour: Array.from({ length: 5 }, () => ({
      id: faker.string.uuid(),
      label: faker.location.city(),
      value: faker.number.int({ min: 50, max: 500 }),
      change: faker.number.int({ min: -20, max: 20 }),
    })),
    ratingLeaderboard: Array.from({ length: 5 }, () => ({
      id: faker.string.uuid(),
      label: faker.company.name(),
      value: faker.number.float({ min: 3.5, max: 5, fractionDigits: 2 }),
    })),
    upcomingTours: Array.from({ length: 10 }, () => ({
      date: faker.date.future().toISOString(),
      value: faker.number.int({ min: 10, max: 100 }),
    })),
  };

  return NextResponse.json(data);
}
