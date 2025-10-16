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
 * Sub-categories of each role (support/assistant).
 */
export const EMPLOYEE_SUB_ROLE = {
  PRODUCT: "product",       // catalog, packages
  ORDER: "order",           // bookings, cancellations
  SUPPORT: "support",       // customer queries
  MARKETING: "marketing",   // campaigns, SEO
  FINANCE: "finance",       // invoices, payroll
  ANALYTICS: "analytics",   // reporting, BI
  HR: "hr",                 // employee management
  IT: "it",                 // system maintenance
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

export const EMPLOYEE_POSITIONS = {
  finance: ["Junior Accountant", "Senior Accountant", "Finance Manager"],
  hr: ["HR Executive", "HR Manager", "Recruiter"],
  marketing: ["SEO Specialist", "Marketing Executive", "Campaign Manager"],
  product: ["Catalog Executive", "Inventory Specialist"],
  order: ["Order Associate", "Booking Manager"],
  analytics: ["Data Analyst", "Business Analyst"],
  customer: ["Customer Care Executive", "Customer Support Lead"],
  technical: ["Tech Support Executive", "Escalation Engineer"],
} as const;

/* ------------------------------------------------------------------
   TYPE DERIVATIONS — Always in sync with constants
------------------------------------------------------------------- */

export type EmployeeRole = (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE];
export type EmployeeSubRole =
  (typeof EMPLOYEE_SUB_ROLE)[keyof typeof EMPLOYEE_SUB_ROLE];
export type EmployeePosition =
  (typeof EMPLOYEE_POSITIONS)[keyof typeof EMPLOYEE_POSITIONS][number];
export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export type EmploymentType =
  (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];
