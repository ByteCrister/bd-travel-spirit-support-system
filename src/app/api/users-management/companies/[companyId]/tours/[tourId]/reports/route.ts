// /api/users-management/companies/[companyId]/tours/[tourId]/reports/route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { ReportsPageDTO, ReportListItemDTO } from "@/types/reports.types";

// Match enums exactly to DTOs
const reasons: ReportListItemDTO["reason"][] = [
    "false_description",
    "late_pickup",
    "safety_issue",
    "unprofessional_guide",
    "billing_problem",
    "other",
];

const statuses: ReportListItemDTO["status"][] = [
    "open",
    "in_review",
    "resolved",
    "rejected",
];

const priorities: ReportListItemDTO["priority"][] = [
    "low",
    "normal",
    "high",
    "urgent",
];

export async function GET(
    req: Request,
    { params }: { params: { companyId: string; tourId: string } }
) {
    // Generate 5–10 fake reports with variations
    const reports: ReportListItemDTO[] = Array.from(
        { length: faker.number.int({ min: 0, max: 200 }) },
        () => {
            const createdAt = faker.date.past();
            return {
                id: faker.database.mongodbObjectId(),
                reporterId: faker.database.mongodbObjectId(),
                tourId: params.tourId,
                reason: faker.helpers.arrayElement(reasons),
                messageExcerpt: faker.lorem.sentence({ min: 5, max: 15 }),
                status: faker.helpers.arrayElement(statuses),
                priority: faker.helpers.arrayElement(priorities),
                reopenedCount: faker.number.int({ min: 0, max: 3 }),
                createdAt: createdAt.toISOString(),
                updatedAt: faker.date.between({
                    from: createdAt,
                    to: new Date(),
                }).toISOString(),
            };
        }
    );

    const dto: ReportsPageDTO = {
        companyId: params.companyId,
        tourId: params.tourId,
        table: {
            docs: reports,
            total: reports.length,
            page: 1,
            pages: 1,
        },
    };

    return NextResponse.json({ data: dto });
}
