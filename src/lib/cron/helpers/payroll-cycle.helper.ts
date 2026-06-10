import { PAYROLL_STATUS } from "@/constants/employee.const";
import { IPayrollRecord } from "@/models/employees/employees.model";

export type PayrollCycleInfo = {
    year: number;
    month: number;
    isDue: boolean;
    dueDate: Date;
};

/**
 * Derive the current 30-day payroll cycle from an employee joining date.
 * Matches the cycle logic used in employee list/detail builders.
 */
export function getCurrentPayrollCycle(
    dateOfJoining: Date,
    referenceDate: Date = new Date()
): PayrollCycleInfo {
    const joiningDate = new Date(dateOfJoining);
    const today = new Date(referenceDate);

    joiningDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysSinceJoining = Math.floor(
        (today.getTime() - joiningDate.getTime()) / (1000 * 3600 * 24)
    );

    const currentCycle = Math.floor(daysSinceJoining / 30);
    const cycleDate = new Date(joiningDate);
    cycleDate.setDate(cycleDate.getDate() + currentCycle * 30);

    const dueDate = new Date(joiningDate);
    dueDate.setDate(dueDate.getDate() + (currentCycle + 1) * 30);

    return {
        year: cycleDate.getFullYear(),
        month: cycleDate.getMonth() + 1,
        isDue: daysSinceJoining >= currentCycle * 30 && currentCycle > 0,
        dueDate,
    };
}

export function findPayrollRecord(
    payroll: IPayrollRecord[] | undefined,
    year: number,
    month: number
): IPayrollRecord | undefined {
    return payroll?.find((record) => record.year === year && record.month === month);
}

export function isPayrollAlreadyPaid(
    payroll: IPayrollRecord[] | undefined,
    year: number,
    month: number
): boolean {
    const record = findPayrollRecord(payroll, year, month);
    return record?.status === PAYROLL_STATUS.PAID;
}
