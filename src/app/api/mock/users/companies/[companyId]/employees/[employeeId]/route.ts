// \api\users-management\companies\[companyId]\employees\[employeeId]\route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { EmployeeDetailDTO } from "@/types/employee.types";
import {
    EMPLOYEE_ROLE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EMPLOYEE_POSITIONS,
} from "@/constants/employee.const";

/**
 * Generate a fake EmployeeDetailDTO (aligned with employee.types.ts)
 */
function generateFakeEmployeeDetail(): EmployeeDetailDTO {
    const gender = faker.helpers.arrayElement<"male" | "female">(["male", "female"]);
    const dateOfJoining = faker.date.past({ years: 5 }).toISOString();
    const dateOfLeaving = faker.datatype.boolean()
        ? faker.date.recent().toISOString()
        : undefined;

    const positionCategory = faker.helpers.arrayElement(
        Object.keys(EMPLOYEE_POSITIONS)
    ) as keyof typeof EMPLOYEE_POSITIONS;
    const position = faker.helpers.arrayElement(EMPLOYEE_POSITIONS[positionCategory]);

    return {
        id: faker.database.mongodbObjectId(),
        userId: faker.database.mongodbObjectId(),
        hostId: faker.database.mongodbObjectId(),

        user: {
            id: faker.database.mongodbObjectId(),
            name: faker.person.fullName({ sex: gender }),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
            role: faker.helpers.arrayElement(["traveler", "guide", "assistant", "support", "admin"]),
            isVerified: faker.datatype.boolean(),
            accountStatus: faker.helpers.arrayElement([
                "pending",
                "active",
                "suspended",
                "banned",
            ]),
        },

        role: faker.helpers.arrayElement(Object.values(EMPLOYEE_ROLE)),
        subRole: faker.helpers.arrayElement(Object.values(EMPLOYEE_SUB_ROLE)),
        position,
        positionCategory,

        status: faker.helpers.arrayElement(Object.values(EMPLOYEE_STATUS)),
        employmentType: faker.helpers.arrayElement(Object.values(EMPLOYMENT_TYPE)),

        department: faker.commerce.department(),
        salary: faker.number.int({ min: 25000, max: 120000 }),
        salaryCurrency: "USD",

        dateOfJoining,
        dateOfLeaving,

        contactInfo: {
            phone: faker.phone.number(),
            email: faker.internet.email(),
            emergencyContact: {
                name: faker.person.fullName(),
                phone: faker.phone.number(),
                relation: faker.helpers.arrayElement(["Parent", "Spouse", "Sibling", "Friend"]),
            },
        },

        permissions: faker.helpers.multiple(() => faker.word.noun(), { count: 3 }),
        shifts: [
            {
                startTime: "09:00",
                endTime: "17:00",
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            },
        ],

        performance: {
            rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
            lastReview: faker.date.recent().toISOString(),
            feedback: faker.lorem.sentences(),
        },

        documents: faker.helpers.multiple(
            () => ({
                type: faker.helpers.arrayElement(["passport", "contract", "id_card"]),
                url: faker.internet.url(),
                uploadedAt: faker.date.past().toISOString(),
            }),
            { count: 2 }
        ),

        notes: faker.lorem.paragraph(),

        audit: {
            createdBy: faker.database.mongodbObjectId(),
            updatedBy: faker.database.mongodbObjectId(),
        },

        isDeleted: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),

        // Optional UI labels (can be computed server-side or client-side)
        roleLabel: undefined,
        subRoleLabel: undefined,
        positionLabel: position,
    };
}


export async function GET(
    req: Request,
    { params }: { params: { companyId: string; employeeId: string } }
) {
    const employee: EmployeeDetailDTO = generateFakeEmployeeDetail();

    return NextResponse.json({ data: employee });
}
