// app/users-management/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeListItemDTO,
    EmployeesListResponse,
    EmployeeSubRole,
    EmployeeStatus,
    EmploymentType,
    EmployeePosition,
} from "@/types/employee.types";
import { EMPLOYEE_POSITIONS } from "@/constants/employee.const";

/**
 * Generate a single fake employee list item
 */
function generateEmployee(id: string): EmployeeListItemDTO {
    const position = faker.helpers.arrayElement(
        Object.values(EMPLOYEE_POSITIONS).flat()
    ) as EmployeePosition;

    // Salary & position summaries
    const salary = faker.number.int({ min: 20000, max: 120000 });
    const salaryCurrency = "USD";

    return {
        id,
        user: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
        },
        subRole: faker.helpers.arrayElement([
            "product",
            "order",
            "support",
            "marketing",
            "finance",
            "analytics",
            "hr",
        ]) as EmployeeSubRole,
        position,
        status: faker.helpers.arrayElement([
            "active",
            "onLeave",
            "suspended",
            "terminated",
        ]) as EmployeeStatus,
        employmentType: faker.helpers.arrayElement([
            "full_time",
            "part_time",
            "contract",
            "intern",
        ]) as EmploymentType,

        salary,
        salaryCurrency,

        dateOfJoining: faker.date.past().toISOString(),
        dateOfLeaving: faker.datatype.boolean()
            ? faker.date.future().toISOString()
            : undefined,

        contactPhone: faker.phone.number(),
        contactEmail: faker.internet.email(),

        rating: faker.number.int({ min: 1, max: 5 }),
        lastReview: faker.date.past().toISOString(),

        shiftSummary: "09:00–17:00, Mon–Fri",

        isDeleted: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
    };
}

/**
 * GET /users-management/employees
 * Returns a paginated mock list of employees
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);

    const docs: EmployeeListItemDTO[] = Array.from({ length: limit }, () =>
        generateEmployee(faker.database.mongodbObjectId())
    );

    const response: EmployeesListResponse = {
        docs,
        total: 200,
        page,
        pages: Math.ceil(200 / limit),
    };

    return NextResponse.json({
        ok: true,
        data: response,
    });
}
