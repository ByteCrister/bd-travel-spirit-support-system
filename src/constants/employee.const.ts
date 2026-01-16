/* ------------------------------------------------------------------
   ENUM CONSTANTS — Single source of truth for roles, statuses, types
------------------------------------------------------------------- */

/**
 * Core job roles determining base permissions.
 */
export const EMPLOYEE_ROLE = {
  ASSISTANT: "assistant",   // limited scope, task-based
  SUPPORT: "support",       // customer/order/product support
} as const;


/**
 * Lifecycle states for employee HR workflows.
 */
export const EMPLOYEE_STATUS = {
  ACTIVE: "active",
  ON_LEAVE: "onLeave",
  SUSPENDED: "suspended",
  TERMINATED: "terminated",
} as const;

/**
 * Contract types affecting payroll and benefits.
 */
export const EMPLOYMENT_TYPE = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  CONTRACT: "contract",
  INTERN: "intern",
} as const;


export enum PAYROLL_STATUS {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
}

export type PayrollStatus = `${PAYROLL_STATUS}`;

export enum SALARY_PAYMENT_MODE {
  AUTO = "auto",
  MANUAL = "manual",
}
export type SalaryPaymentMode = `${SALARY_PAYMENT_MODE}`;

/* ------------------------------------------------------------------
   TYPE DERIVATIONS — Always in sync with constants
------------------------------------------------------------------- */

export type EmployeeRole = (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE];
export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export type EmploymentType =
  (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];