// employees.types.ts
// DTOs for the employees page: /companies/[companyId]/employees
// Includes table row and optional side-panel detail view.

import {
    EmployeeRole,
    EmployeeStatus,
    EmployeeSubRole,
    EmploymentType,
} from "@/constants/employee.const";

/**
 * Emergency contact for urgent communication.
 */
export interface EmergencyContactDTO {
    name: string;
    phone: string;
    relation: string;
}

/**
 * Strongly typed employee permissions instead of string[]
 */
export interface EmployeePermissionDTO {
    code: string; // e.g., "can_edit_orders"
    scope?: string; // optional scope like "finance" or "orders"
    grantedBy: string;
    grantedAt: string;
}

/**
 * Payroll and benefits snapshot
 */
export interface EmployeePayrollDTO {
    baseSalary: number;
    currency: string;
    bonuses?: number;
    deductions?: number;
    lastPaidAt?: string;
}

/**
 * Lightweight employee reference
 * Useful for dropdowns, lookups, or relations
 */
export interface EmployeeRefDTO {
    id: string;
    name: string;
    profileImage?: string;
    role: EmployeeRole;
    department?: string;
    position?: string;
}

/**
 * Public-facing employee profile
 * For external or client-facing contexts
 */
export interface EmployeePublicProfileDTO {
    id: string;
    name: string;
    position: string;
    department: string;
    profileImage?: string;
    contactEmail?: string; // only work email
}

/**
 * Full employee detail for side panels or dedicated pages.
 */
export interface EmployeeDetailDTO {
    id: string;
    userId: string;
    hostId?: string;

    // Personal info
    fullName: string;
    profileImage?: string;
    dob?: string; // ISO date
    gender?: "male" | "female" | "other";

    // Job info
    role: EmployeeRole;
    subRole: EmployeeSubRole;
    position: string;
    status: EmployeeStatus;
    employmentType?: EmploymentType;
    department?: string;
    team?: string;
    managerId?: string;
    employeeCode?: string; // HR/payroll code
    workLocation?: string; // onsite, remote, or branch

    // Pay & payroll
    salary?: {
        amount: number;
        currency?: string;
    };
    payroll?: EmployeePayrollDTO;

    // Lifecycle
    dateOfJoining: string;
    dateOfLeaving?: string;

    // Contact
    contactInfo: {
        phone?: string;
        email?: string;
        emergencyContact?: EmergencyContactDTO;
    };

    // Permissions
    permissions: EmployeePermissionDTO[];

    // Shifts — local time in "HH:mm", weekday abbreviations
    shifts: Array<{
        startTime: string; // "HH:mm"
        endTime: string; // "HH:mm"
        days: Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">;
    }>;

    // Performance tracking
    performance?: {
        rating?: number; // 1–5
        lastReview?: string;
        feedback?: string;
    };

    // Uploaded documents
    documents: Array<{
        type: string;
        url: string;
        uploadedAt: string;
    }>;

    notes?: string;

    // Audit trail
    audit: {
        createdBy: string;
        updatedBy: string;
    };

    isDeleted: boolean;

    createdAt: string;
    updatedAt: string;
}

/**
 * Optional table column hints for Employees.
 */
export type EmployeeTableColumns =
    | "fullName"
    | "profileImage"
    | "position"
    | "role"
    | "subRole"
    | "department"
    | "team"
    | "status"
    | "employmentType"
    | "salary"
    | "contact"
    | "dateOfJoining"
    | "dateOfLeaving";

/**
 * EmployeeListItemDTO — optimized for table rows.
 * Derived from EmployeeDetailDTO to avoid drift.
 */
export type EmployeeListItemDTO = Pick<
    EmployeeDetailDTO,
    | "id"
    | "userId"
    | "hostId"
    | "fullName"
    | "profileImage"
    | "role"
    | "subRole"
    | "position"
    | "department"
    | "team"
    | "status"
    | "employmentType"
    | "salary"
    | "dateOfJoining"
    | "dateOfLeaving"
    | "isDeleted"
    | "audit"
    | "createdAt"
    | "updatedAt"
> & {
    /**
     * Lightweight contact info for table display.
     * Derived from EmployeeDetailDTO.contactInfo but flattened.
     */
    contact?: {
        phone?: string;
        email?: string;
    };

    /**
     * Optional quick metrics for list view (not in detail).
     */
    performanceSummary?: {
        rating?: number; // 1–5
    };
};


// --- Define sortable fields ---
export const sortableEmployeeFields: Array<EmployeeTableColumns | "createdAt" | "updatedAt"> = [
    "fullName",
    "position",
    "role",
    "subRole",
    "department",
    "team",
    "employmentType",
    "status",
    "salary",
    "dateOfJoining",
    "dateOfLeaving",
    "createdAt",
    "updatedAt",
];