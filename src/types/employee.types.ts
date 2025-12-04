// employee.types.ts
// Updated to align with constants and Mongoose model (payroll, contactInfo, documents, etc.)

import {
  EMPLOYEE_ROLE,
  EMPLOYEE_STATUS,
  EMPLOYMENT_TYPE,
} from "@/constants/employee.const";

import { AccountStatus } from "@/constants/user.const";
import { AuditLog } from "./current-user.types";

/* ---------------------------------------------------------------------
  Primitive / utility types
--------------------------------------------------------------------- */

export type EmployeeRole = (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE];

export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

export type EmploymentType =
  (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];

export type ValueOf<T> = T[keyof T];

export type ISODateString = string; // client uses ISO-8601 strings
export type ObjectIdString = string; // Mongoose ObjectId as string in API responses

// Day-of-week union for shifts
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/* ---------------------------------------------------------------------
  Payroll types (mirror IPayrollRecord & PAYROLL_STATUS)
--------------------------------------------------------------------- */

export enum PAYROLL_STATUS {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
}

export interface PayrollRecordDTO {
  year: number; // 2025
  month: number; // 1–12
  amount: number;
  currency: string; // ISO currency code, uppercase
  status: PAYROLL_STATUS;
  attemptedAt?: ISODateString;
  paidAt?: ISODateString;
  failureReason?: string;
  transactionRef?: string;
  paidBy?: ObjectIdString; // admin/user who paid manually
}

/* ---------------------------------------------------------------------
  Sub-DTOs (client-safe types)
--------------------------------------------------------------------- */

export interface EmergencyContactDTO {
  name: string;
  phone: string; // Bangladesh mobile format expected
  relation: string;
}

export interface ContactInfoDTO {
  phone: string; // required by schema
  email?: string;
  emergencyContact?: EmergencyContactDTO;
  firstName?: string;
  lastName?: string;
}

export interface ShiftDTO {
  startTime: string; // "HH:mm" 24h
  endTime: string; // "HH:mm" 24h
  days: DayOfWeek[];
}


export interface DocumentDTO {
  type: string;
  // API may return either Asset id or resolved signed URL
  url: ObjectIdString;
  uploadedAt: ISODateString;
}

/* ---------------------------------------------------------------------
  Salary & Position history DTOs
--------------------------------------------------------------------- */

export interface SalaryHistoryDTO {
  amount: number;
  currency: string;
  effectiveFrom: ISODateString;
  effectiveTo?: ISODateString;
  reason?: string;
}

/* ---------------------------------------------------------------------
  User summary DTO (employees are users; minimal denormalized fields)
--------------------------------------------------------------------- */

export interface UserSummaryDTO {
  name: string;
  email: string;
  phone?: string;
  avatar?: string; // for quick rendering; may be URL or Asset id depending on API
  isVerified: boolean;
  accountStatus: AccountStatus;
}

/* ---------------------------------------------------------------------
  Employee list item DTO (UI-friendly, compact)
--------------------------------------------------------------------- */

export interface EmployeeListItemDTO {
  id: ObjectIdString;

  // minimal denormalized user fields for list/table
  user: Pick<UserSummaryDTO, "name" | "email" | "phone" | "avatar">;

  // optional IDs that backend may include
  companyId?: ObjectIdString;

  // status & employment
  status: EmployeeStatus;
  employmentType?: EmploymentType;

  // compensation summary
  salary: number;
  currency: string;

  // dates
  dateOfJoining: ISODateString;
  dateOfLeaving?: ISODateString;

  // contact summary
  contactPhone?: string;
  contactEmail?: string;

  // shift summary (preformatted for table cell)
  shiftSummary?: string;

  lastLogin?: ISODateString;

  // documents / avatar
  avatar?: ObjectIdString; // may be Asset id

  // computed/derived UI helpers (usually optional, sometimes server-provided)
  statusBadge?: {
    label: string;
    tone?: "positive" | "warning" | "danger" | "muted";
  };

  // admin flags & timestamps
  isDeleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ---------------------------------------------------------------------
  Full detail DTO (dialog/preview) - preserves structure
--------------------------------------------------------------------- */
// export interface AuditLog {
//     _id: string;
//     targetModel: string;
//     target: string;
//     actor?: string;
//     actorModel?: string;
//     action: string;
//     note?: string;
//     ip?: string;
//     userAgent?: string;
//     changes?: {
//         before?: Record<string, unknown>;
//         after?: Record<string, unknown>;
//     };
//     createdAt: string; // ISO
// }
export interface EmployeeDetailDTO {
  id: ObjectIdString;
  userId?: ObjectIdString;
  companyId?: ObjectIdString;
  avatar?: ObjectIdString; // Asset id reference
  user: UserSummaryDTO;

  role: EmployeeRole;
  status: EmployeeStatus;
  employmentType?: EmploymentType;

  // Histories
  salaryHistory: SalaryHistoryDTO[];

  // Current compensation
  salary: number;
  currency: string;

  dateOfJoining: ISODateString;
  dateOfLeaving?: ISODateString;

  contactInfo: ContactInfoDTO;

  // Payroll records (optional, may be paginated separately)
  payroll?: PayrollRecordDTO[];

  shifts?: ShiftDTO[];

  documents?: DocumentDTO[];

  notes?: string;

  audit: AuditLog[];

  lastLogin?: ISODateString;

  isDeleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ---------------------------------------------------------------------
  Create/Update payloads (align to backend schema)
--------------------------------------------------------------------- */

export interface CreateEmployeePayload {
  password: string;
  role: EmployeeRole;
  employmentType?: EmploymentType;
  avatar?: ObjectIdString; // Asset id
  salary: number;
  currency: string;
  dateOfJoining?: ISODateString;
  contactInfo: ContactInfoDTO; // phone is required by schema
  shifts?: ShiftDTO[];
  documents?: DocumentDTO[];
  notes?: string;
}

export interface UpdateEmployeePayload {
  id: ObjectIdString;
  password: string;
  role?: EmployeeRole;
  employmentType?: EmploymentType;
  avatar?: ObjectIdString;
  status?: EmployeeStatus;
  salary: number;
  currency: string;
  dateOfJoining?: ISODateString;
  dateOfLeaving?: ISODateString;
  contactInfo?: ContactInfoDTO;
  shifts?: ShiftDTO[];
  documents?: DocumentDTO[];
  notes?: string;
}

/* Soft delete/restore payloads */
export interface SoftDeleteEmployeePayload {
  id: ObjectIdString;
}
export interface RestoreEmployeePayload {
  id: ObjectIdString;
}

/* ---------------------------------------------------------------------
  Query, sorting, filters, and pagination
--------------------------------------------------------------------- */

export type SortOrder = "asc" | "desc";

export type EmployeeSortKey =
  | "user.name"
  | "user.email"
  | "role"
  | "status"
  | "employmentType"
  | "salary"
  | "dateOfJoining"
  | "dateOfLeaving"
  | "createdAt"
  | "updatedAt";

export interface EmployeeFilters {
  roles?: EmployeeRole[];
  statuses?: EmployeeStatus[];
  employmentTypes?: EmploymentType[];

  // Text search on user.name/email/phone and department
  search?: string;

  // Range filters
  salaryMin?: number;
  salaryMax?: number;
  joinedAfter?: ISODateString;
  joinedBefore?: ISODateString;
  leftAfter?: ISODateString;
  leftBefore?: ISODateString;

  // Include soft-deleted records
  includeDeleted?: boolean;
}

export interface EmployeesQuery {
  page?: number; // default: 1
  limit?: number; // default: 10/20 as per UI
  sortBy?: EmployeeSortKey;
  sortOrder?: SortOrder;
  filters?: EmployeeFilters;
}

/* Generic paginated response wrapper */
export interface PaginatedResponse<T> {
  docs: T[];
  total: number;
  page: number;
  pages: number;
}

export type EmployeesListResponse = PaginatedResponse<EmployeeListItemDTO>;

/* ---------------------------------------------------------------------
  Dialog selection / UI states
--------------------------------------------------------------------- */

export type EmployeeDialogId = ObjectIdString | null;

/* ---------------------------------------------------------------------
  Error/Result shapes (for API layer)
--------------------------------------------------------------------- */

export interface ApiError {
  code: string; // machine-readable code (e.g., "VALIDATION_ERROR")
  message: string; // human-readable
  details?: Record<string, unknown>;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
}

/* ---------------------------------------------------------------------
  Cache key helpers (to be reused in zustand store)
--------------------------------------------------------------------- */

export const EMPLOYEES_CACHE_KEYS = {
  list: (q: EmployeesQuery) =>
    `employees:list:${JSON.stringify({
      page: q.page ?? 1,
      limit: q.limit ?? 20,
      sortBy: q.sortBy ?? "createdAt",
      sortOrder: q.sortOrder ?? "desc",
      filters: q.filters ?? {},
    })}`,
  detail: (id: ObjectIdString) => `employees:detail:${id}`,
  enums: "employees:enums",
} as const;

export type EmployeesCacheKey = ValueOf<typeof EMPLOYEES_CACHE_KEYS>;

/* ---------------------------------------------------------------------
  Table & sorting helpers for UI
--------------------------------------------------------------------- */

export type EmployeeTableColumn =
  | "avatar"
  | "user.name"
  | "user.email"
  | "status"
  | "employmentType"
  | "salary"
  | "dateOfJoining"
  | "dateOfLeaving"
  | "createdAt"
  | "updatedAt";

export type SortableEmployeeKey = EmployeeTableColumn;

export const sortableEmployeeFields = [
  "user.name",
  "user.email",
  "employmentType",
  "status",
  "salary",
  "rating",
  "dateOfJoining",
  "dateOfLeaving",
  "createdAt",
  "updatedAt",
] as const;

export type SortableEmployeeField = (typeof sortableEmployeeFields)[number];
