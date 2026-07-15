import { SALARY_PAYMENT_MODE, PAYROLL_STATUS } from "@/constants/employee.const";
import { EmployeeListItemDTO } from "@/types/employee/employee.types";

/** Manual employee with due payroll, active status, and a linked Stripe account */
export function isManualPayrollPayable(row: EmployeeListItemDTO): boolean {
    if (row.paymentMode !== SALARY_PAYMENT_MODE.MANUAL) return false;
    if (row.status !== "active" || row.isDeleted) return false;
    if (!row.hasPaymentAccount) return false;
    if (!row.salary || row.salary <= 0) return false;

    const status = row.currentMonthPayment?.status;
    return status !== PAYROLL_STATUS.PAID;
}

export function getPayableManualEmployees(rows: EmployeeListItemDTO[]): EmployeeListItemDTO[] {
    return rows.filter(isManualPayrollPayable);
}

export function sumPayrollAmount(rows: EmployeeListItemDTO[]): { total: number; currency: string } {
    if (rows.length === 0) return { total: 0, currency: "BDT" };
    const currency = rows[0].currency;
    const total = rows.reduce((sum, row) => sum + (row.salary ?? 0), 0);
    return { total, currency };
}
