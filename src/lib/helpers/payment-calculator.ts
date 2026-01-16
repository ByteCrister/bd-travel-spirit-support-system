// utils/payment-calculator.ts
import { PayrollStatus } from "@/constants/employee.const";
import { ISODateString,  } from "@/types/employee.types";

/**
 * Calculate payment status for an employee based on joining date
 * @param dateOfJoining - Employee's joining date
 * @param currentDate - Current date (defaults to today)
 * @returns Payment status info for the current month
 */
export function calculateCurrentMonthPayment(
    dateOfJoining: ISODateString,
    salary: number,
    currency: string,
    paymentMode: string,
    currentDate: Date = new Date()
): {
    status: PayrollStatus;
    amount: number;
    currency: string;
    dueDate: ISODateString;
} {
    const joiningDate = new Date(dateOfJoining);
    const today = new Date(currentDate);

    // Reset times for accurate day calculation
    joiningDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Calculate days since joining
    const timeDiff = today.getTime() - joiningDate.getTime();
    const daysSinceJoining = Math.floor(timeDiff / (1000 * 3600 * 24));

    // Calculate payment cycle (30 days from joining, then every 30 days)
    const daysInCycle = 30;
    const completedCycles = Math.floor(daysSinceJoining / daysInCycle);
    const daysInCurrentCycle = daysSinceJoining % daysInCycle;

    // Determine if payment is due in the current cycle
    const nextCycleDue = completedCycles * daysInCycle + daysInCycle;
    const dueDate = new Date(joiningDate);
    dueDate.setDate(dueDate.getDate() + nextCycleDue);

    // Determine status based on days in current cycle
    let status: PayrollStatus;

    if (daysInCurrentCycle < daysInCycle) {
        // Payment not yet due
        status = "pending" as PayrollStatus; // Not yet processed
    } else if (daysInCurrentCycle === daysInCycle) {
        // Due today
        status = "pending" as PayrollStatus; // Due for processing
    } else {
        // Overdue
        status = "pending" as PayrollStatus; // Should have been processed
    }

    return {
        status,
        amount: salary,
        currency,
        dueDate: dueDate.toISOString(),
    };
}

/**
 * Update payment status based on actual transaction results
 * @param baseStatus - Base calculated status
 * @param payrollRecords - Existing payroll records for the employee
 * @param currentYear - Current year
 * @param currentMonth - Current month (1-12)
 * @returns Updated status with transaction info if exists
 */
export function getActualPaymentStatus(
    baseStatus: ReturnType<typeof calculateCurrentMonthPayment>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payrollRecords: any[] = [],
    currentYear: number = new Date().getFullYear(),
    currentMonth: number = new Date().getMonth() + 1
) {
    // Check if there's a payroll record for the current month
    const currentMonthRecord = payrollRecords.find(
        record => record.year === currentYear && record.month === currentMonth
    );

    if (currentMonthRecord) {
        return {
            ...baseStatus,
            status: currentMonthRecord.status,
            attemptedAt: currentMonthRecord.attemptedAt,
            paidAt: currentMonthRecord.paidAt,
            transactionRef: currentMonthRecord.transactionRef,
            failureReason: currentMonthRecord.failureReason,
        };
    }

    return baseStatus;
}