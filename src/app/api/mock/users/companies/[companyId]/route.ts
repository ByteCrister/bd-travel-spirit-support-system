// \api\users-management\companies\[companyId]\route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    CompanyOverviewDTO,
} from "@/types/company.overview.types";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";

export async function GET(
    req: Request,
    { params }: { params: { companyId: string } }
) {
    const { companyId } = await params;
    const decodeCompanyId = decodeId(decodeURIComponent(companyId));

    // Generate collections
    const tours = 200;

    const employees = 200;

    const overview: CompanyOverviewDTO = {
        companyId,
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
