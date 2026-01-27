// \api\users-management\companies\[companyId]\route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    CompanyOverviewDTO,
} from "@/types/company.overview.types";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ companyId: string }> }
) {
    const decodeCompanyId = (await params).companyId;

    // Generate collections
    const tours = 200;

    const employees = 200;

    const overview: CompanyOverviewDTO = {
        companyId: decodeCompanyId.toString(),
        companyName: faker.company.name(),
        kpis: {
            totalTours: tours,
            totalEmployees: employees,
            openReports: faker.number.int({ min: 0, max: 200 }),
            publishedTours: 80,
            totalBookings: 5000,
            avgTourRating: 4.5,
        },
        serverNow: new Date().toISOString(),
    };

    return NextResponse.json({ data: overview });
}
