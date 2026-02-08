// app/users-management/employees/[employeeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import {
    EmployeeDetailDTO,
    PayrollRecordDTO,
} from "@/types/employee/employee.types";
import { AuditLog } from "@/types/current-user.types";
import {
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    SALARY_PAYMENT_MODE,
    SalaryPaymentMode,
    PAYROLL_STATUS,
} from "@/constants/employee.const";
import { decodeId } from "@/utils/helpers/mongodb-id-conversions";
import { calculateCurrentMonthPayment, getActualPaymentStatus } from "@/lib/helpers/payment-calculator";
import { AUDIT_ACTION } from "@/constants/audit-action.const";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ employeeId: string }> }
) {
    const { employeeId } = await params;
    const encodedId = decodeId(decodeURIComponent(employeeId));

    // Generate between 1 and 10 audit entries
    const auditCount = faker.number.int({ min: 1, max: 10 });
    const audits: AuditLog[] = Array.from({ length: auditCount }).map(() => ({
        _id: faker.database.mongodbObjectId(),
        targetModel: "Employee",
        target: encodedId!,
        actor: faker.database.mongodbObjectId(),
        actorModel: "User",
        action: faker.helpers.arrayElement(Object.values(AUDIT_ACTION)),
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

    // Generate mock payroll records for the last 6 months
    const payroll: PayrollRecordDTO[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Generate payroll records for previous months
    for (let i = 0; i < 6; i++) {
        const month = currentMonth - i;
        const year = currentYear;
        const adjustedMonth = month <= 0 ? month + 12 : month;
        const adjustedYear = month <= 0 ? year - 1 : year;

        const status = faker.helpers.arrayElement(Object.values(PAYROLL_STATUS));

        payroll.push({
            year: adjustedYear,
            month: adjustedMonth,
            amount: faker.number.int({ min: 20000, max: 120000 }),
            currency: "USD",
            status,
            attemptedAt: status !== "pending" ? faker.date.past().toISOString() : undefined,
            paidAt: status === "paid" ? faker.date.past().toISOString() : undefined,
            failureReason: status === "failed" ? faker.helpers.arrayElement([
                "Insufficient funds",
                "Bank account closed",
                "Network error",
                "Invalid account details",
            ]) : undefined,
            transactionRef: status === "paid" ? `txn_${faker.string.alphanumeric(12)}` : undefined,
            paidBy: status === "paid" ? faker.database.mongodbObjectId() : undefined,
        });
    }

    // Generate salary history
    const salaryHistory = [
        {
            amount: faker.number.int({ min: 20000, max: 80000 }),
            currency: "USD",
            effectiveFrom: faker.date.past({ years: 2 }).toISOString(),
            effectiveTo: faker.date.past({ years: 1 }).toISOString(),
            reason: "Initial salary",
        },
        {
            amount: faker.number.int({ min: 80000, max: 120000 }),
            currency: "USD",
            effectiveFrom: faker.date.past({ years: 1 }).toISOString(),
            reason: "Promotion",
        },
    ];

    const salary = salaryHistory[1].amount;
    const dateOfJoining = faker.date.past({ years: 2 });
    const paymentMode = faker.helpers.arrayElement(
        Object.values(SALARY_PAYMENT_MODE)
    ) as SalaryPaymentMode;

    // Calculate current month payment status
    const baseCurrentMonthPayment = calculateCurrentMonthPayment(
        dateOfJoining.toISOString(),
        salary,
        "USD",
        paymentMode
    );

    // Get actual payment status with payroll records
    const currentMonthPayment = getActualPaymentStatus(
        baseCurrentMonthPayment,
        payroll,
        currentYear,
        currentMonth
    );

    const detail: EmployeeDetailDTO = {
        id: encodedId!,
        userId: faker.database.mongodbObjectId(),
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

        salaryHistory: salaryHistory,

        salary: salary,
        currency: "USD",
        paymentMode: paymentMode,

        // Add current month payment status
        currentMonthPayment: currentMonthPayment,

        dateOfJoining: dateOfJoining.toISOString(),
        dateOfLeaving: faker.datatype.boolean(0.2)
            ? faker.date.future().toISOString()
            : undefined,
        lastLogin: faker.datatype.boolean(0.7)
            ? faker.date.recent().toISOString()
            : undefined,

        contactInfo: {
            phone: faker.phone.number(),
            email: faker.internet.email(),
            emergencyContact: {
                name: faker.person.fullName(),
                phone: faker.phone.number(),
                relation: faker.helpers.arrayElement(["Spouse", "Parent", "Sibling", "Friend"]),
            },
        },

        // Add payroll records
        payroll: payroll,

        shifts: [
            {
                startTime: "09:00",
                endTime: "17:00",
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            },
            {
                startTime: "10:00",
                endTime: "18:00",
                days: ["Sat"],
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
            {
                type: "certificate",
                url: faker.database.mongodbObjectId(),
                uploadedAt: faker.date.past().toISOString(),
            },
        ],

        // Add avatar as ObjectIdString
        avatar: faker.datatype.boolean(0.6)
            ? faker.database.mongodbObjectId()
            : undefined,

        notes: faker.lorem.paragraph(),

        // Limited to at most 10 audits
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