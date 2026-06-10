import mongoose from "mongoose";
import {
    EMPLOYEE_STATUS,
    PAYROLL_STATUS,
    SALARY_PAYMENT_MODE,
} from "@/constants/employee.const";
import {
    PAYMENT_OWNER_TYPE,
    PAYMENT_PURPOSE,
} from "@/constants/payment.const";
import { USER_ROLE } from "@/constants/user.const";
import { CURRENCY } from "@/constants/tour.const";
import {
    convertBdtToUsd,
    usdToStripeCents,
} from "@/lib/exchange-rate/convert-bdt-to-usd";
import { chargeStripePaymentAccount } from "@/lib/payments/stripe-charge.service";
import EmployeeModel, { IEmployee } from "@/models/employees/employees.model";
import GuideModel from "@/models/guide/guide.model";
import StripePaymentAccountModel from "@/models/payments/payment-account.model";
import UserModel from "@/models/user.model";
import {
    findPayrollRecord,
    getCurrentPayrollCycle,
    isPayrollAlreadyPaid,
} from "./helpers/payroll-cycle.helper";

export type EmployeePaymentResult = {
    processed: number;
    succeeded: number;
    failed: number;
    skipped: number;
    errors: string[];
};

type EmployeeWithUser = IEmployee & {
    user: { _id: mongoose.Types.ObjectId; role: string; name?: string };
};

async function findAdminTransactionAccount() {
    const adminUser = await UserModel.findOne({ role: USER_ROLE.ADMIN })
        .select("_id")
        .lean();

    if (!adminUser?._id) {
        throw new Error("Admin user not found");
    }

    const account = await StripePaymentAccountModel.findOne({
        ownerType: PAYMENT_OWNER_TYPE.ADMIN,
        ownerId: adminUser._id,
        purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
        isActive: true,
        isDeleted: { $ne: true },
    })
        .sort({ isBackup: 1, createdAt: -1 })
        .lean();

    if (!account) {
        throw new Error("Admin Stripe transaction account not found");
    }

    return { adminUser, account };
}

async function findGuideTransactionAccount(guideId: mongoose.Types.ObjectId) {
    const guide = await GuideModel.findById(guideId).select("owner.user companyName").lean();

    if (!guide?.owner?.user) {
        throw new Error(`Guide not found for companyId ${guideId.toString()}`);
    }

    const account = await StripePaymentAccountModel.findOne({
        ownerType: PAYMENT_OWNER_TYPE.GUIDE,
        ownerId: guide.owner.user,
        purpose: PAYMENT_PURPOSE.TRANSACTION_ACCOUNT,
        isActive: true,
        isDeleted: { $ne: true },
    })
        .sort({ isBackup: 1, createdAt: -1 })
        .lean();

    if (!account) {
        throw new Error(
            `Guide Stripe transaction account not found for guide ${guideId.toString()}`
        );
    }

    return { guide, account };
}

async function upsertPayrollAttempt(
    employeeId: mongoose.Types.ObjectId,
    payrollEntry: {
        year: number;
        month: number;
        amount: number;
        currency: string;
    }
): Promise<boolean> {
    const employee = await EmployeeModel.findById(employeeId).select("payroll").lean();
    const existing = findPayrollRecord(employee?.payroll, payrollEntry.year, payrollEntry.month);

    if (existing?.status === PAYROLL_STATUS.PAID) {
        return false;
    }

    if (existing) {
        await EmployeeModel.updateOne(
            {
                _id: employeeId,
                payroll: {
                    $elemMatch: {
                        year: payrollEntry.year,
                        month: payrollEntry.month,
                        status: { $ne: PAYROLL_STATUS.PAID },
                    },
                },
            },
            {
                $set: {
                    "payroll.$.status": PAYROLL_STATUS.PENDING,
                    "payroll.$.attemptedAt": new Date(),
                    "payroll.$.amount": payrollEntry.amount,
                    "payroll.$.currency": payrollEntry.currency,
                    "payroll.$.failureReason": undefined,
                },
            }
        ).exec();
        return true;
    }

    const inserted = await EmployeeModel.updateOne(
        {
            _id: employeeId,
            payroll: {
                $not: {
                    $elemMatch: {
                        year: payrollEntry.year,
                        month: payrollEntry.month,
                    },
                },
            },
        },
        {
            $push: {
                payroll: {
                    year: payrollEntry.year,
                    month: payrollEntry.month,
                    amount: payrollEntry.amount,
                    currency: payrollEntry.currency,
                    status: PAYROLL_STATUS.PENDING,
                    attemptedAt: new Date(),
                },
            },
        }
    ).exec();

    return inserted.modifiedCount > 0;
}

async function markPayrollResult(
    employeeId: mongoose.Types.ObjectId,
    year: number,
    month: number,
    result: {
        status: typeof PAYROLL_STATUS.PAID | typeof PAYROLL_STATUS.FAILED;
        transactionRef?: string;
        failureReason?: string;
    }
) {
    const update: Record<string, unknown> = {
        "payroll.$.status": result.status,
    };

    if (result.status === PAYROLL_STATUS.PAID) {
        update["payroll.$.paidAt"] = new Date();
        update["payroll.$.transactionRef"] = result.transactionRef;
        update["payroll.$.failureReason"] = undefined;
    } else {
        update["payroll.$.failureReason"] = result.failureReason;
    }

    await EmployeeModel.updateOne(
        {
            _id: employeeId,
            "payroll.year": year,
            "payroll.month": month,
        },
        { $set: update }
    ).exec();
}

async function processEmployeeSalary(
    employee: EmployeeWithUser,
    payerAccountId: mongoose.Types.ObjectId,
    payerLabel: string
): Promise<"succeeded" | "failed" | "skipped"> {
    const cycle = getCurrentPayrollCycle(employee.dateOfJoining);

    if (!cycle.isDue) {
        return "skipped";
    }

    if (isPayrollAlreadyPaid(employee.payroll, cycle.year, cycle.month)) {
        return "skipped";
    }

    if (employee.paymentMode !== SALARY_PAYMENT_MODE.AUTO) {
        return "skipped";
    }

    if (employee.status !== EMPLOYEE_STATUS.ACTIVE || employee.deletedAt) {
        return "skipped";
    }

    const salaryAmount = employee.salary;
    if (salaryAmount <= 0) {
        return "skipped";
    }

    const canProcess = await upsertPayrollAttempt(employee._id, {
        year: cycle.year,
        month: cycle.month,
        amount: salaryAmount,
        currency: employee.currency,
    });

    if (!canProcess) {
        return "skipped";
    }

    const idempotencyKey = `salary-${employee._id.toString()}-${cycle.year}-${cycle.month}`;

    try {
        let amountCents: number;
        let currency = CURRENCY.USD;

        if (employee.currency.toUpperCase() === CURRENCY.BDT) {
            const usdAmount = await convertBdtToUsd(salaryAmount);
            amountCents = usdToStripeCents(usdAmount);
        } else if (employee.currency.toUpperCase() === CURRENCY.USD) {
            amountCents = usdToStripeCents(salaryAmount);
        } else {
            throw new Error(`Unsupported salary currency: ${employee.currency}`);
        }

        const charge = await chargeStripePaymentAccount({
            paymentAccountId: payerAccountId,
            amountCents,
            currency,
            description: `Salary payment for employee ${employee._id.toString()} (${payerLabel})`,
            idempotencyKey,
            metadata: {
                employeeId: employee._id.toString(),
                payrollYear: String(cycle.year),
                payrollMonth: String(cycle.month),
            },
        });

        await markPayrollResult(employee._id, cycle.year, cycle.month, {
            status: PAYROLL_STATUS.PAID,
            transactionRef: charge.paymentIntentId,
        });

        console.log(
            `[cron:employee-payment] Paid employee ${employee._id.toString()} — ${amountCents} ${currency}`
        );

        return "succeeded";
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown payment error";

        await markPayrollResult(employee._id, cycle.year, cycle.month, {
            status: PAYROLL_STATUS.FAILED,
            failureReason: message,
        });

        console.error(
            `[cron:employee-payment] Failed employee ${employee._id.toString()}:`,
            message
        );

        return "failed";
    }
}

/**
 * Process automatic salary payments for support and assistant employees.
 */
export async function processEmployeePayments(): Promise<EmployeePaymentResult> {
    const result: EmployeePaymentResult = {
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        errors: [],
    };

    console.log("[cron:employee-payment] Starting salary payment run");

    let adminAccountId: mongoose.Types.ObjectId | null = null;

    try {
        const { account } = await findAdminTransactionAccount();
        adminAccountId = account._id as mongoose.Types.ObjectId;
    } catch (error) {
        const message = error instanceof Error ? error.message : "Admin account lookup failed";
        result.errors.push(message);
        console.error("[cron:employee-payment]", message);
    }

    const supportEmployees = (await EmployeeModel.find({
        status: EMPLOYEE_STATUS.ACTIVE,
        deletedAt: null,
        paymentMode: SALARY_PAYMENT_MODE.AUTO,
        $or: [{ companyId: null }, { companyId: { $exists: false } }],
    })
        .populate("user", "role name")
        .lean()) as unknown as EmployeeWithUser[];

    for (const employee of supportEmployees) {
        if (employee.user?.role !== USER_ROLE.SUPPORT) {
            result.skipped += 1;
            continue;
        }

        if (!adminAccountId) {
            result.skipped += 1;
            continue;
        }

        result.processed += 1;
        const status = await processEmployeeSalary(
            employee,
            adminAccountId,
            "admin-transaction-account"
        );

        if (status === "succeeded") result.succeeded += 1;
        else if (status === "failed") result.failed += 1;
        else result.skipped += 1;
    }

    const assistantEmployees = (await EmployeeModel.find({
        status: EMPLOYEE_STATUS.ACTIVE,
        deletedAt: null,
        paymentMode: SALARY_PAYMENT_MODE.AUTO,
        companyId: { $exists: true, $ne: null },
    })
        .populate("user", "role name")
        .lean()) as unknown as EmployeeWithUser[];

    for (const employee of assistantEmployees) {
        if (employee.user?.role !== USER_ROLE.ASSISTANT) {
            result.skipped += 1;
            continue;
        }

        if (!employee.companyId) {
            result.skipped += 1;
            continue;
        }

        result.processed += 1;

        try {
            const { guide, account } = await findGuideTransactionAccount(employee.companyId);
            const status = await processEmployeeSalary(
                employee,
                account._id as mongoose.Types.ObjectId,
                `guide-${guide.companyName}`
            );

            if (status === "succeeded") result.succeeded += 1;
            else if (status === "failed") result.failed += 1;
            else result.skipped += 1;
        } catch (error) {
            result.failed += 1;
            const message =
                error instanceof Error ? error.message : "Assistant payment setup failed";
            result.errors.push(`Employee ${employee._id.toString()}: ${message}`);
            console.error("[cron:employee-payment]", message);
        }
    }

    console.log(
        `[cron:employee-payment] Completed — processed=${result.processed}, succeeded=${result.succeeded}, failed=${result.failed}, skipped=${result.skipped}`
    );

    return result;
}
