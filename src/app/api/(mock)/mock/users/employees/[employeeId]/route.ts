import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeDetailDTO,
} from "@/types/employee.types";
import { AuditLog } from "@/types/current-user.types";
import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
} from "@/constants/employee.const";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";


export async function GET(
    _req: NextRequest,
    { params }: { params: { employeeId: string } }
) {
    const { employeeId } = await params;
    const encodedId = decodeId(decodeURIComponent(employeeId));

    // generate between 1 and 10 audit entries
    const auditCount = faker.number.int({ min: 1, max: 10 });
    const audits: AuditLog[] = Array.from({ length: auditCount }).map(() => ({
        _id: faker.database.mongodbObjectId(),
        targetModel: "Employee",
        target: encodedId!,
        actor: faker.database.mongodbObjectId(),
        actorModel: "User",
        action: faker.helpers.arrayElement(["created", "updated", "deleted", "restored"]),
        note: faker.lorem.sentence(),
        ip: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        changes: {
            before: undefined,
            after: {
                sampleField: faker.lorem.word(),
            },
        },
        createdAt: faker.date.past().toISOString(),
    }));

    const detail: EmployeeDetailDTO = {
        id: encodedId!,
        companyId: faker.database.mongodbObjectId(),

        user: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
        },

        status: faker.helpers.arrayElement(
            Object.values(EMPLOYEE_STATUS)
        ) as EmployeeDetailDTO["status"],

        employmentType: faker.helpers.arrayElement(
            Object.values(EMPLOYMENT_TYPE)
        ) as EmployeeDetailDTO["employmentType"],

        salaryHistory: [
            {
                amount: faker.number.int({ min: 20000, max: 120000 }),
                currency: "USD",
                effectiveFrom: faker.date.past().toISOString(),
                reason: "Initial salary",
            },
        ],

        salary: faker.number.int({ min: 20000, max: 120000 }),
        currency: "USD",

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

        shifts: [
            {
                startTime: "09:00",
                endTime: "17:00",
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            },
        ],

        documents: [
            {
                type: "contract",
                url: faker.database.mongodbObjectId(),
                uploadedAt: faker.date.past().toISOString(),
            },
            {
                type: "id-proof",
                url: faker.database.mongodbObjectId(),
                uploadedAt: faker.date.past().toISOString(),
            },
        ],

        notes: faker.lorem.paragraph(),

        // limited to at most 10 audits
        audit: audits,

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