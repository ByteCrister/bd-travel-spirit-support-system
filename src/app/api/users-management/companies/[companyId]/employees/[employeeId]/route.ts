// \api\users-management\companies\[companyId]\employees\[employeeId]\route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { EmployeeDetailDTO } from "@/types/employee.types";
import {
    EmployeeRole,
    EmployeeStatus,
    EmployeeSubRole,
    EmploymentType,
} from "@/constants/employee.const";

/**
 * Generate a fake EmployeeDetailDTO
 */
function generateFakeEmployeeDetail(): EmployeeDetailDTO {
    const gender = faker.helpers.arrayElement<"male" | "female" | undefined>([
        "male",
        "female",
        undefined,
    ]);

    const dob = faker.date.birthdate({ min: 22, max: 60, mode: "age" }).toISOString();
    const dateOfJoining = faker.date.past({ years: 5 }).toISOString();
    const dateOfLeaving = faker.datatype.boolean()
        ? faker.date.recent().toISOString()
        : undefined;

    return {
        id: faker.database.mongodbObjectId(),
        userId: faker.database.mongodbObjectId(),
        hostId: faker.database.mongodbObjectId(),

        fullName: faker.person.fullName({ sex: gender }),
        profileImage: faker.image.avatar(),
        dob,
        gender,

        role: faker.helpers.arrayElement<EmployeeRole>(["assistant", "support"]),
        subRole: faker.helpers.arrayElement<EmployeeSubRole>([
            "product",
            "order",
            "support",
            "marketing",
            "finance",
            "analytics",
            "hr",
        ]),
        position: faker.person.jobTitle(),
        status: faker.helpers.arrayElement<EmployeeStatus>([
            "active",
            "onLeave",
            "suspended",
            "terminated",
        ]),
        employmentType: faker.helpers.arrayElement<EmploymentType>([
            "full_time",
            "part_time",
            "contract",
            "intern",
        ]),
        department: faker.commerce.department(),
        team: faker.commerce.department(),
        managerId: faker.database.mongodbObjectId(),
        employeeCode: faker.string.alphanumeric({ length: 6 }).toUpperCase(),
        workLocation: faker.helpers.arrayElement(["onsite", "remote", "branch"]),

        salary: {
            amount: faker.number.int({ min: 25000, max: 120000 }),
            currency: "USD",
        },
        payroll: {
            baseSalary: faker.number.int({ min: 25000, max: 120000 }),
            currency: "USD",
            bonuses: faker.number.int({ min: 0, max: 10000 }),
            deductions: faker.number.int({ min: 0, max: 5000 }),
            lastPaidAt: faker.date.recent().toISOString(),
        },

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

        permissions: Array.from({ length: 3 }, () => ({
            code: faker.helpers.slugify(faker.lorem.words(2)),
            scope: faker.helpers.arrayElement(["finance", "orders", "hr", "marketing"]),
            grantedBy: faker.database.mongodbObjectId(),
            grantedAt: faker.date.past().toISOString(),
        })),

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

        documents: Array.from({ length: 2 }, () => ({
            type: faker.helpers.arrayElement(["passport", "contract", "id_card"]),
            url: faker.internet.url(),
            uploadedAt: faker.date.past().toISOString(),
        })),

        notes: faker.lorem.paragraph(),
        audit: {
            createdBy: faker.database.mongodbObjectId(),
            updatedBy: faker.database.mongodbObjectId(),
        },
        isDeleted: false,
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
    };
}

export async function GET(
    req: Request,
    { params }: { params: { companyId: string; employeeId: string } }
) {
    const employee: EmployeeDetailDTO = generateFakeEmployeeDetail();

    return NextResponse.json({ data: employee });
}
