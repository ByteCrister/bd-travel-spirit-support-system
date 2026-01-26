// /app/api/users-management/companies/[companyId]/tours/[tourId]/reports/route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";
import { TourReportListItemDTO } from "@/types/report.tour.response.types";

// enum arrays for faker
const reasons = Object.values(REPORT_REASON);
const statuses = Object.values(REPORT_STATUS);
const priorities = Object.values(REPORT_PRIORITY);

export async function GET(
    req: Request,
    { params }: { params: Promise<{ companyId: string; tourId: string }> }
) {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");

    const { tourId } = await params;

    // total count can be large; simulate with a reasonable upper bound
    const total = faker.number.int({ min: 0, max: 200 });

    // build page of fake items
    const start = (page - 1) * limit;
    const count = Math.max(0, Math.min(limit, total - start));

    const docs: TourReportListItemDTO[] = Array.from({ length: count }, () => {
        const createdAt = faker.date.past();
        const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
        const lastActivityAt = faker.date.between({ from: createdAt, to: new Date() });

        return {
            id: faker.database.mongodbObjectId(),
            reporterId: faker.database.mongodbObjectId(),
            reporterName: faker.person.fullName(),
            tourId: tourId,
            tourTitle: faker.lorem.words({ min: 2, max: 4 }),
            reason: faker.helpers.arrayElement(reasons) as REPORT_REASON,
            messageExcerpt: faker.lorem.sentence({ min: 6, max: 20 }),
            status: faker.helpers.arrayElement(statuses) as REPORT_STATUS,
            priority: faker.helpers.arrayElement(priorities) as REPORT_PRIORITY,
            assignedToId: faker.datatype.boolean() ? faker.database.mongodbObjectId() : null,
            assignedToName: faker.datatype.boolean() ? faker.person.fullName() : null,
            reopenedCount: faker.number.int({ min: 0, max: 5 }),
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            lastActivityAt: lastActivityAt.toISOString(),
            flags: faker.datatype.boolean() ? ["escalated"] : [],
            evidenceCount: faker.number.int({ min: 0, max: 6 }),
        };
    });

    const pages = Math.max(1, Math.ceil(total / limit));

    // response shape expected by your hook: res.data.data.docs
    return NextResponse.json({
        data: {
            docs,
            total,
            page,
            pages,
        },
    });
}
