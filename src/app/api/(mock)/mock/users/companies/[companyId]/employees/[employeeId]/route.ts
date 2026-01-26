// \api\users-management\companies\[companyId]\employees\[employeeId]\route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { EmployeeDetailDTO, PayrollRecordDTO, CurrentMonthPaymentStatusDTO } from "@/types/employee.types";
import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    PAYROLL_STATUS,
    SALARY_PAYMENT_MODE,
} from "@/constants/employee.const";
import { CURRENCY } from "@/constants/tour.const";
import { AUDIT_ACTION } from "@/constants/audit-action.const";

/**
 * Generate N payroll records ending at current month.
 * month is 1..12 in PayrollRecordDTO.
 */
function generatePayrollRecords(count = 6, currency = CURRENCY.BDT): PayrollRecordDTO[] {
    const now = new Date();
    const records: PayrollRecordDTO[] = [];

    for (let i = 1; i <= count; i++) { // Start from 1 to exclude current month
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
 * Generate current month payment status
 */
function generateCurrentMonthPayment(): CurrentMonthPaymentStatusDTO {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1..12
    const lastDayOfMonth = new Date(year, month, 0);

    const amount = Math.round(2000 + Math.random() * 6000);
    const status = (Math.random() < 0.7) ? PAYROLL_STATUS.PAID :
        (Math.random() < 0.5 ? PAYROLL_STATUS.PENDING : PAYROLL_STATUS.FAILED);

    return {
        status,
        amount,
        currency: "USD",
        dueDate: lastDayOfMonth.toISOString(),
        attemptedAt: status === PAYROLL_STATUS.PAID ? undefined : new Date(year, month - 1, 5).toISOString(),
        paidAt: status === PAYROLL_STATUS.PAID ? new Date(year, month - 1, 10).toISOString() : undefined,
        transactionRef: status === PAYROLL_STATUS.PAID ? `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}` : undefined,
        failureReason: status === PAYROLL_STATUS.FAILED ? "Bank transfer failed" : undefined,
    };
}

/**
 * Generate a fake EmployeeDetailDTO (aligned with employee.types.ts)
 */
function generateFakeEmployeeDetail(): EmployeeDetailDTO {
    const gender = faker.helpers.arrayElement<"male" | "female">(["male", "female"]);
    const dateOfJoining = faker.date.past({ years: 5 }).toISOString();
    const dateOfLeaving = faker.datatype.boolean() ? faker.date.recent().toISOString() : undefined;
    const avatar = faker.image.avatar();


    // Build a small salary history
    const salaryHistory = [
        {
            amount: faker.number.int({ min: 20000, max: 40000 }),
            currency: CURRENCY.BDT,
            effectiveFrom: faker.date.past({ years: 4 }).toISOString(),
            effectiveTo: faker.date.past({ years: 3 }).toISOString(),
            reason: "Initial salary",
        },
        {
            amount: faker.number.int({ min: 40001, max: 80000 }),
            currency: CURRENCY.BDT,
            effectiveFrom: faker.date.past({ years: 2 }).toISOString(),
            effectiveTo: undefined,
            reason: "Promotion",
        },
    ];

    // Documents
    const documents = faker.helpers.multiple(
        () => ({
            type: faker.helpers.arrayElement(["passport", "contract", "id_card", "certificate"]),
            url: faker.database.mongodbObjectId(), // ObjectIdString for cloudinary URL
            uploadedAt: faker.date.past().toISOString(),
        }),
        { count: 2 }
    );

    // Minimal audit log entries
    const audit = [
        {
            _id: faker.database.mongodbObjectId(),
            targetModel: "Employee",
            target: faker.database.mongodbObjectId(),
            actor: faker.database.mongodbObjectId(),
            actorModel: "User",
            action: faker.helpers.enumValue(AUDIT_ACTION),
            note: "Created via seed",
            ip: faker.internet.ip(),
            userAgent: faker.internet.userAgent(),
            changes: {},
            createdAt: faker.date.past().toISOString(),
        },
    ];

    // Generate payroll records (past months only, not current month)
    const payroll = generatePayrollRecords(4);

    // Generate current month payment
    const currentMonthPayment = generateCurrentMonthPayment();

    // Generate payment mode
    const paymentMode = faker.helpers.arrayElement(Object.values(SALARY_PAYMENT_MODE));

    return {
        id: faker.database.mongodbObjectId(),
        userId: faker.database.mongodbObjectId(),
        companyId: faker.database.mongodbObjectId(),

        // user summary (UserSummaryDTO)
        user: {
            name: faker.person.fullName({ sex: gender }),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            avatar,
        },

        // avatar at root level
        avatar,

        // Employment details
        status: faker.helpers.arrayElement(Object.values(EMPLOYEE_STATUS)),
        employmentType: faker.helpers.arrayElement(Object.values(EMPLOYMENT_TYPE)),

        // Compensation
        salaryHistory,
        salary: faker.number.int({ min: 25000, max: 120000 }),
        currency: CURRENCY.BDT,
        paymentMode,
        currentMonthPayment,

        // dates
        dateOfJoining,
        dateOfLeaving,

        // contact info (without firstName/lastName - they're not in ContactInfoDTO)
        contactInfo: {
            phone: faker.phone.number(),
            email: faker.internet.email(),
            emergencyContact: {
                name: faker.person.fullName(),
                phone: faker.phone.number(),
                relation: faker.helpers.arrayElement(["Parent", "Spouse", "Sibling", "Friend"]),
            },
        },

        // optional payroll (past months only)
        payroll,

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

export async function GET() {
    const employee: EmployeeDetailDTO = generateFakeEmployeeDetail();
    return NextResponse.json({ data: employee });
}