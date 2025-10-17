import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeDetailDTO,
    EmployeePosition,
    PositionCategory,
} from "@/types/employee.types";
import { EMPLOYEE_POSITIONS } from "@/constants/employee.const";
import { ACCOUNT_STATUS } from "@/constants/user.const";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";

function getPositionCategory(position: EmployeePosition): PositionCategory {
    const found = Object.entries(EMPLOYEE_POSITIONS).find(([, list]) =>
        (list as readonly string[]).includes(position)
    );
    return (found?.[0] as PositionCategory) ?? "general";
}

export async function GET(
    _req: NextRequest,
    { params }: { params: { employeeId: string } }
) {
    const { employeeId } = await params;
    const encodedId = decodeId(decodeURIComponent(employeeId));

    const position = faker.helpers.arrayElement(
        Object.values(EMPLOYEE_POSITIONS).flat()
    ) as EmployeePosition;

    const detail: EmployeeDetailDTO = {
        id: encodedId!,
        companyId: faker.database.mongodbObjectId(),

        user: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
            isVerified: faker.datatype.boolean(),
            accountStatus: faker.helpers.arrayElement([
                ACCOUNT_STATUS.PENDING,
                ACCOUNT_STATUS.ACTIVE,
                ACCOUNT_STATUS.SUSPENDED,
                ACCOUNT_STATUS.BANNED,
            ]),
        },
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

        salaryHistory: [
            {
                amount: faker.number.int({ min: 20000, max: 120000 }),
                currency: "USD",
                effectiveFrom: faker.date.past().toISOString(),
                reason: "Initial salary",
            },
        ],
        positionHistory: [
            {
                position: getPositionCategory(position),
                effectiveFrom: faker.date.past().toISOString(),
            },
        ],

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
    };

    return NextResponse.json({
        ok: true,
        data: detail,
        error: null,
    });
}
