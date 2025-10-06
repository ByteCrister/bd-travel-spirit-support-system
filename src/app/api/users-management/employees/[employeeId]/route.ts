// app/users-management/employees/[employeeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeDetailDTO,
    EmployeePosition,
    PositionCategory,
} from "@/types/employee.types";
import { EMPLOYEE_POSITIONS } from "@/constants/employee.const";

/**
 * Utility: Derive positionCategory by scanning EMPLOYEE_POSITIONS keys
 */
function getPositionCategory(position: EmployeePosition): PositionCategory {
    const found = Object.entries(EMPLOYEE_POSITIONS).find(([, list]) =>
        (list as readonly string[]).includes(position)
    );
    return (found?.[0] as PositionCategory) ?? "general";
}

/**
 * GET /users-management/employees/:employeeId
 * Returns a fully typed mock employee detail
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: { employeeId: string } }
) {
    const { employeeId } = await params;

    const position = faker.helpers.arrayElement(
        Object.values(EMPLOYEE_POSITIONS).flat()
    ) as EmployeePosition;

    const detail: EmployeeDetailDTO = {
        id: employeeId,
        userId: faker.database.mongodbObjectId(),
        hostId: faker.database.mongodbObjectId(),

        user: {
            id: faker.database.mongodbObjectId(),
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
            role: faker.helpers.arrayElement([
                "traveler",
                "guide",
                "assistant",
                "support",
                "admin",
            ]),
            isVerified: faker.datatype.boolean(),
            accountStatus: faker.helpers.arrayElement([
                "pending",
                "active",
                "suspended",
                "banned",
            ]),
        },

        role: faker.helpers.arrayElement(["assistant", "support"]),
        subRole: faker.helpers.arrayElement([
            "product",
            "order",
            "support",
            "marketing",
            "finance",
            "analytics",
            "hr",
        ]),
        position,
        positionCategory: getPositionCategory(position),

        status: faker.helpers.arrayElement([
            "active",
            "onLeave",
            "suspended",
            "terminated",
        ]),
        employmentType: faker.helpers.arrayElement([
            "full_time",
            "part_time",
            "contract",
            "intern",
        ]),
        department: faker.commerce.department(),
        salary: faker.number.int({ min: 20000, max: 120000 }),
        salaryCurrency: "USD",

        dateOfJoining: faker.date.past().toISOString(),
        dateOfLeaving: faker.datatype.boolean()
            ? faker.date.future().toISOString()
            : undefined,

        contactInfo: {
            phone: faker.phone.number(),
            email: faker.internet.email(),
            emergencyContact: {
                name: faker.person.fullName(),
                phone: faker.phone.number(),
                relation: "Spouse",
            },
        },

        permissions: ["read", "write", "delete"],
        shifts: [
            {
                startTime: "09:00",
                endTime: "17:00",
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            },
        ],

        performance: {
            rating: faker.number.int({ min: 1, max: 5 }),
            lastReview: faker.date.past().toISOString(),
            feedback: faker.lorem.sentence(),
        },

        documents: [
            {
                type: "contract",
                url: faker.internet.url(),
                uploadedAt: faker.date.past().toISOString(),
            },
            {
                type: "id-proof",
                url: faker.internet.url(),
                uploadedAt: faker.date.past().toISOString(),
            },
        ],

        notes: faker.lorem.paragraph(),
        audit: {
            createdBy: faker.database.mongodbObjectId(),
            updatedBy: faker.database.mongodbObjectId(),
        },
        isDeleted: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),

        // UI convenience fields
        roleLabel: "Assistant",
        subRoleLabel: "Support",
        positionLabel: position,
    };

    return NextResponse.json({
        ok: true,
        data: detail,
        error: null,
    });
}
