// app/users-management/employees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeListItemDTO,
    EmployeesListResponse,
    EmployeeRole,
    EmployeeSubRole,
    EmployeeStatus,
    EmploymentType,
    EmployeePosition,
    PositionCategory,
} from "@/types/employee.types";
import { EMPLOYEE_POSITIONS } from "@/constants/employee.const";

/**
 * Derive positionCategory by scanning EMPLOYEE_POSITIONS
 */
function getPositionCategory(position: EmployeePosition): PositionCategory {
    const found = Object.entries(EMPLOYEE_POSITIONS).find(([, list]) =>
        (list as readonly string[]).includes(position)
    );
    return (found?.[0] as PositionCategory) ?? "general";
}

/**
 * Generate a single fake employee list item
 */
function generateEmployee(id: string): EmployeeListItemDTO {
    const position = faker.helpers.arrayElement(
        Object.values(EMPLOYEE_POSITIONS).flat()
    ) as EmployeePosition;

    return {
        id,
        userId: faker.database.mongodbObjectId(),
        user: {
            id: faker.database.mongodbObjectId(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
        },

        role: faker.helpers.arrayElement(["assistant", "support"]) as EmployeeRole,
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
        positionCategory: getPositionCategory(position),

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

        department: faker.commerce.department(),
        salary: faker.number.int({ min: 20000, max: 120000 }),
        salaryCurrency: "USD",

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

    // Return wrapped ApiResult
    return NextResponse.json({
        ok: true,
        data: response,
    });
}
