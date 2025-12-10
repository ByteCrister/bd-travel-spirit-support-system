// \api\users-management\companies\[companyId]\employees\[employeeId]\route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { EmployeeDetailDTO, PAYROLL_STATUS, PayrollRecordDTO } from "@/types/employee.types";
import {
    EMPLOYEE_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
} from "@/constants/employee.const";

/**
 * Generate N payroll records ending at current month.
 * month is 1..12 in PayrollRecordDTO.
 */
function generatePayrollRecords(count = 6, currency = "USD"): PayrollRecordDTO[] {
    const now = new Date();
    const records: PayrollRecordDTO[] = [];

    for (let i = 0; i < count; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1; // 1..12

        // random amount and status
        const amount = Math.round(2000 + Math.random() * 6000);
        const status = (Math.random() < 0.85) ? PAYROLL_STATUS.PAID : (Math.random() < 0.5 ? PAYROLL_STATUS.PENDING : PAYROLL_STATUS.FAILED);

        const record: PayrollRecordDTO = {
            year,
            month,
            amount,
            currency,
            status,
            attemptedAt: status === PAYROLL_STATUS.PAID ? undefined : new Date(d.getFullYear(), d.getMonth(), 5).toISOString(),
            paidAt: status === PAYROLL_STATUS.PAID ? new Date(d.getFullYear(), d.getMonth(), 10).toISOString() : undefined,
            failureReason: status === PAYROLL_STATUS.FAILED ? "Bank transfer failed" : undefined,
            transactionRef: status === PAYROLL_STATUS.PAID ? `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : undefined,
            paidBy: status === PAYROLL_STATUS.PAID ? faker.database.mongodbObjectId() : undefined,
        };

        records.push(record);
    }

    return records;
}

/**
 * Generate a fake EmployeeDetailDTO (aligned with employee.types.ts)
 */
function generateFakeEmployeeDetail(): EmployeeDetailDTO {
    const gender = faker.helpers.arrayElement<"male" | "female">(["male", "female"]);
    const dateOfJoining = faker.date.past({ years: 5 }).toISOString();
    const dateOfLeaving = faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined;

    // Build a small salary history
    const salaryHistory = [
        {
            amount: faker.number.int({ min: 20000, max: 40000 }),
            currency: "USD",
            effectiveFrom: faker.date.past({ years: 4 }).toISOString(),
            effectiveTo: faker.date.past({ years: 3 }).toISOString(),
            reason: "Initial salary",
        },
        {
            amount: faker.number.int({ min: 40001, max: 80000 }),
            currency: "USD",
            effectiveFrom: faker.date.past({ years: 2 }).toISOString(),
            effectiveTo: undefined,
            reason: "Promotion",
        },
    ];

    // Documents
    const documents = faker.helpers.multiple(
        () => ({
            type: faker.helpers.arrayElement(["passport", "contract", "id_card", "certificate"]),
            url: faker.internet.url(),
            uploadedAt: faker.date.past().toISOString(),
        }),
        { count: 2 }
    );

    // Minimal audit log entries (shape is flexible for fake data)
    const audit = [
        {
            _id: faker.database.mongodbObjectId(),
            targetModel: "Employee",
            target: faker.database.mongodbObjectId(),
            actor: faker.database.mongodbObjectId(),
            actorModel: "User",
            action: "created",
            note: "Created via seed",
            ip: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),
            changes: {},
            createdAt: faker.date.past().toISOString(),
        },
    ];

    return {
        id: faker.database.mongodbObjectId(),
        userId: faker.database.mongodbObjectId(),
        companyId: faker.database.mongodbObjectId(),

        // user summary (UserSummaryDTO)
        user: {
            name: faker.person.fullName({ sex: gender }),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar: faker.image.avatar(),
            isVerified: faker.datatype.boolean(),
            accountStatus: faker.helpers.arrayElement(["pending", "active", "suspended", "banned"]),
        },

        // role / employment
        role: faker.helpers.arrayElement(Object.values(EMPLOYEE_ROLE)),
        employmentType: faker.helpers.arrayElement(Object.values(EMPLOYMENT_TYPE)),
        status: faker.helpers.arrayElement(Object.values(EMPLOYEE_STATUS)),

        // histories and compensation
        salaryHistory,
        salary: faker.number.int({ min: 25000, max: 120000 }),
        currency: "USD",

        // dates
        dateOfJoining,
        dateOfLeaving,

        // contact info
        contactInfo: {
            phone: faker.phone.number(),
            email: faker.internet.email(),
            emergencyContact: {
                name: faker.person.fullName(),
                phone: faker.phone.number(),
                relation: faker.helpers.arrayElement(["Parent", "Spouse", "Sibling", "Friend"]),
            },
            firstName: faker.person.firstName(gender),
            lastName: faker.person.lastName(gender),
        },

        // optional payroll (small sample)
        payroll: generatePayrollRecords(5),

        // shifts
        shifts: [
            {
                startTime: "09:00",
                endTime: "17:00",
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            },
        ],

        // documents
        documents,

        notes: faker.lorem.paragraph(),

        audit,

        lastLogin: faker.date.recent().toISOString(),

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