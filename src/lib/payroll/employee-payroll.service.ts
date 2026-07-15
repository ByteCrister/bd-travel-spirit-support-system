import mongoose from "mongoose";
import {
    EMPLOYEE_STATUS,
    PAYROLL_STATUS,
    SALARY_PAYMENT_MODE,
} from "@/constants/employee.const";
import { USER_ROLE } from "@/constants/user.const";
import { CURRENCY } from "@/constants/tour.const";
import {
    convertBdtToUsd,
    usdToStripeCents,
} from "@/lib/exchange-rate/convert-bdt-to-usd";
import { chargeStripePaymentAccount } from "@/lib/payments/stripe-charge.service";
import {
    findAdminTransactionAccount,
    findGuideTransactionAccount,
} from "@/lib/payroll/payroll-account.helper";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import {
    findPayrollRecord,
    getCurrentPayrollCycle,
    isPayrollAlreadyPaid,
} from "@/lib/cron/helpers/payroll-cycle.helper";

/* ── Types ────────────────────────────────────────────────────────────────── */

export type ManualPayrollMarkResult = {
    employeeId: string;
    success: boolean;
    error?: string;
    year?: number;
    month?: number;
};

type EmployeeWithRole = IEmployee & {
    user: { _id: mongoose.Types.ObjectId; role: string };
};

/* ── Eligibility guard ────────────────────────────────────────────────────── */

export function isEmployeeEligibleForManualPay(employee: Pick<
    IEmployee,
    "paymentMode" | "status" | "deletedAt" | "salary" | "payroll" | "dateOfJoining" | "paymentAccount"
>): boolean {
    if (employee.paymentMode !== SALARY_PAYMENT_MODE.MANUAL) return false;
    if (employee.status !== EMPLOYEE_STATUS.ACTIVE || employee.deletedAt) return false;
    if (!employee.paymentAccount) return false;
    if (employee.salary <= 0) return false;

    const cycle = getCurrentPayrollCycle(employee.dateOfJoining);
    if (!cycle.isDue) return false;

    return !isPayrollAlreadyPaid(employee.payroll, cycle.year, cycle.month);
}

/* ── Resolve payer Stripe account ─────────────────────────────────────────── */

async function resolvePayerAccount(employee: EmployeeWithRole): Promise<{
    payerAccountId: mongoose.Types.ObjectId;
    payerLabel: string;
}> {
    const role = employee.user?.role;

    if (role === USER_ROLE.SUPPORT) {
        const { account } = await findAdminTransactionAccount();
        return {
            payerAccountId: account._id as mongoose.Types.ObjectId,
            payerLabel: "admin-transaction-account",
        };
    }

    if (role === USER_ROLE.ASSISTANT && employee.companyId) {
        const { guide, account } = await findGuideTransactionAccount(employee.companyId);
        return {
            payerAccountId: account._id as mongoose.Types.ObjectId,
            payerLabel: `guide-${guide.companyName}`,
        };
    }

    throw new Error(
        `Cannot resolve payer account for employee ${employee._id.toString()} with role "${role}"`
    );
}

/* ── Mark single employee as paid (manual trigger, real Stripe charge) ──────── */

export async function markManualPayrollPaid(
    employeeId: mongoose.Types.ObjectId,
    paidBy: mongoose.Types.ObjectId,
    options?: {
        year?: number;
        month?: number;
        manualReference?: string;    // optional admin note — not the payment proof
    }
): Promise<{ year: number; month: number; transactionRef: string }> {

    /* 1. Fetch employee with user role (needed to pick payer) */
    const employee = (await EmployeeModel.findById(employeeId)
        .select("paymentMode status deletedAt salary currency payroll dateOfJoining paymentAccount companyId user")
        .populate("user", "role")
        .lean()) as unknown as EmployeeWithRole | null;

    if (!employee) {
        throw new Error("Employee not found");
    }

    if (!isEmployeeEligibleForManualPay(employee)) {
        throw new Error("Employee is not eligible for manual payroll payment");
    }

    /* 2. Resolve payroll cycle */
    const cycle = getCurrentPayrollCycle(employee.dateOfJoining);
    const year = options?.year ?? cycle.year;
    const month = options?.month ?? cycle.month;

    if (isPayrollAlreadyPaid(employee.payroll, year, month)) {
        throw new Error("Payroll for this cycle is already paid");
    }

    /* 3. Resolve payer's Stripe account */
    const { payerAccountId, payerLabel } = await resolvePayerAccount(employee);

    /* 4. Convert currency to USD cents */
    const currency = CURRENCY.USD;
    let amountCents: number;

    if (employee.currency.toUpperCase() === CURRENCY.BDT) {
        const usdAmount = await convertBdtToUsd(employee.salary);
        amountCents = usdToStripeCents(usdAmount);
    } else if (employee.currency.toUpperCase() === CURRENCY.USD) {
        amountCents = usdToStripeCents(employee.salary);
    } else {
        throw new Error(`Unsupported salary currency: ${employee.currency}`);
    }

    /* 5. Charge Stripe — also creates a TransactionModel record */
    const idempotencyKey = `manual-salary-${employeeId.toString()}-${year}-${month}`;

    const charge = await chargeStripePaymentAccount({
        paymentAccountId: payerAccountId,
        amountCents,
        currency,
        description: `Manual salary payment for employee ${employeeId.toString()} (${payerLabel})`,
        idempotencyKey,
        metadata: {
            employeeId: employeeId.toString(),
            payrollYear: String(year),
            payrollMonth: String(month),
            triggeredBy: paidBy.toString(),
        },
    });

    /* 6. Write payroll record */
    const existing = findPayrollRecord(employee.payroll, year, month);

    if (existing) {
        await EmployeeModel.updateOne(
            {
                _id: employeeId,
                "payroll.year": year,
                "payroll.month": month,
            },
            {
                $set: {
                    "payroll.$.status": PAYROLL_STATUS.PAID,
                    "payroll.$.paidAt": new Date(),
                    "payroll.$.amount": employee.salary,
                    "payroll.$.currency": employee.currency,
                    "payroll.$.paymentMode": SALARY_PAYMENT_MODE.MANUAL,
                    "payroll.$.transactionRef": charge.paymentIntentId,
                    "payroll.$.paidBy": paidBy,
                    "payroll.$.manualReference": options?.manualReference,
                    "payroll.$.failureReason": undefined,
                },
            }
        ).exec();
    } else {
        await EmployeeModel.updateOne(
            { _id: employeeId },
            {
                $push: {
                    payroll: {
                        year,
                        month,
                        amount: employee.salary,
                        currency: employee.currency,
                        status: PAYROLL_STATUS.PAID,
                        attemptedAt: new Date(),
                        paidAt: new Date(),
                        paymentMode: SALARY_PAYMENT_MODE.MANUAL,
                        transactionRef: charge.paymentIntentId,
                        paidBy,
                        manualReference: options?.manualReference,
                    },
                },
            }
        ).exec();
    }

    return { year, month, transactionRef: charge.paymentIntentId };
}

/* ── Bulk variant — each employee is independent; errors are isolated ─────── */

export async function bulkMarkManualPayrollPaid(
    employeeIds: mongoose.Types.ObjectId[],
    paidBy: mongoose.Types.ObjectId,
    manualReference?: string
): Promise<ManualPayrollMarkResult[]> {
    const results: ManualPayrollMarkResult[] = [];

    for (const employeeId of employeeIds) {
        try {
            const { year, month } = await markManualPayrollPaid(employeeId, paidBy, {
                manualReference,
            });
            results.push({
                employeeId: employeeId.toString(),
                success: true,
                year,
                month,
            });
        } catch (error) {
            results.push({
                employeeId: employeeId.toString(),
                success: false,
                error: error instanceof Error ? error.message : "Payment failed",
            });
        }
    }

    return results;
}
