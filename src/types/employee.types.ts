// employees.type.ts

import {
  EMPLOYEE_ROLE,
  EMPLOYEE_SUB_ROLE,
  EMPLOYEE_STATUS,
  EMPLOYMENT_TYPE,
  EMPLOYEE_POSITIONS,
} from "@/constants/employee.const";

import { ACCOUNT_STATUS } from "@/constants/user.const";

/* ---------------------------------------------------------------------
  Primitive/utility types
--------------------------------------------------------------------- */

export type EmployeeRole = (typeof EMPLOYEE_ROLE)[keyof typeof EMPLOYEE_ROLE];

export type EmployeeSubRole =
  (typeof EMPLOYEE_SUB_ROLE)[keyof typeof EMPLOYEE_SUB_ROLE];

export type EmployeeStatus =
  (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

export type EmploymentType =
  (typeof EMPLOYMENT_TYPE)[keyof typeof EMPLOYMENT_TYPE];

// Position value union across all categories
export type EmployeePosition =
  (typeof EMPLOYEE_POSITIONS)[keyof typeof EMPLOYEE_POSITIONS][number];

// Position category union (keys of EMPLOYEE_POSITIONS)
export type PositionCategory = keyof typeof EMPLOYEE_POSITIONS;

export type ValueOf<T> = T[keyof T];

export type ISODateString = string; // client uses ISO-8601 strings
export type ObjectIdString = string; // Mongoose ObjectId as string in API responses

// Day-of-week union for shifts
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

/* ---------------------------------------------------------------------
  Sub-DTOs (client-safe types)
--------------------------------------------------------------------- */

export interface EmergencyContactDTO {
  name: string;
  phone: string;
  relation: string;
}

export interface ContactInfoDTO {
  phone?: string;
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

export interface PerformanceDTO {
  rating?: number; // 1..5
  lastReview?: ISODateString;
  feedback?: string;
}

export interface DocumentDTO {
  type: string;
  // API may return either Asset id or resolved signed URL
  url: ObjectIdString | string;
  uploadedAt: ISODateString;
}

export interface AuditDTO {
  createdBy: ObjectIdString;
  updatedBy: ObjectIdString;
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

export interface PositionHistoryDTO {
  // keep flexible: backend often returns the position string (value)
  position: EmployeePosition | string;
  department?: string;
  effectiveFrom: ISODateString;
  effectiveTo?: ISODateString;
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
  accountStatus: ACCOUNT_STATUS;
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

  // Role and position fields
  role?: EmployeeRole;
  subRole: EmployeeSubRole;
  position: EmployeePosition;
  positionCategory?: PositionCategory;

  // status & employment
  status: EmployeeStatus;
  employmentType?: EmploymentType;

  // compensation summary
  salary: number;
  salaryCurrency: string;

  // dates
  dateOfJoining: ISODateString;
  dateOfLeaving?: ISODateString;

  // contact summary
  contactPhone?: string;
  contactEmail?: string;

  // performance summary
  rating?: number;
  lastReview?: ISODateString;

  // shift summary (preformatted for table cell)
  shiftSummary?: string;

  // denormalized/misc model fields useful in UI
  department?: string;
  failedLoginAttempts?: number;
  lastFailedAt?: ISODateString;
  lockedUntil?: ISODateString;
  lastLogin?: ISODateString;
  permissions?: string[];

  // documents / avatar
  avatar?: ObjectIdString; // may be Asset id
  avatarUrl?: string; // resolved URL for quick img src (optional)
  initials?: string; // UI fallback

  // computed/derived UI helpers (usually optional, sometimes server-provided)
  statusBadge?: { label: string; tone?: "positive" | "warning" | "danger" | "muted" };
  tenureMonths?: number;
  isLocked?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  salaryDisplay?: string; // formatted salary + currency

  // admin flags & timestamps
  isDeleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ---------------------------------------------------------------------
  Full detail DTO (dialog/preview) - preserves structure
--------------------------------------------------------------------- */

export interface EmployeeDetailDTO {
  id: ObjectIdString;
  userId?: ObjectIdString;
  companyId?: ObjectIdString;
  avatar?: ObjectIdString; // Asset id reference
  avatarUrl?: string; // optional resolved URL
  user: UserSummaryDTO;

  role: EmployeeRole;
  subRole: EmployeeSubRole;
  position?: EmployeePosition;
  positionCategory?: PositionCategory;
  status: EmployeeStatus;
  employmentType?: EmploymentType;

  // Histories
  salaryHistory: SalaryHistoryDTO[];
  positionHistory: PositionHistoryDTO[];

  // Current compensation
  salary: number;
  salaryCurrency: string;

  dateOfJoining: ISODateString;
  dateOfLeaving?: ISODateString;

  contactInfo: ContactInfoDTO;

  permissions: string[];

  shifts?: ShiftDTO[];

  performance: PerformanceDTO;

  documents?: DocumentDTO[];

  notes?: string;

  audit: AuditDTO;

  // account & admin fields
  failedLoginAttempts?: number;
  lastFailedAt?: ISODateString;
  lockedUntil?: ISODateString;
  lastLogin?: ISODateString;

  isDeleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ---------------------------------------------------------------------
  Create/Update payloads (align to backend schema)
--------------------------------------------------------------------- */

export interface CreateEmployeePayload {
  companyId?: ObjectIdString;
  role: EmployeeRole;
  subRole: EmployeeSubRole;
  position: EmployeePosition;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  avatar?: ObjectIdString; // Asset id
  salaryHistory?: SalaryHistoryDTO[];
  positionHistory?: PositionHistoryDTO[];
  dateOfJoining?: ISODateString;
  dateOfLeaving?: ISODateString;
  contactInfo: ContactInfoDTO;
  permissions?: string[];
  shifts?: ShiftDTO[];
  performance?: PerformanceDTO;
  documents?: DocumentDTO[];
  notes?: string;
  audit: AuditDTO;
}

export interface UpdateEmployeePayload {
  id: ObjectIdString;
  companyId?: ObjectIdString;
  role?: EmployeeRole;
  subRole?: EmployeeSubRole;
  position?: EmployeePosition;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  avatar?: ObjectIdString;
  salaryHistory?: SalaryHistoryDTO[];
  positionHistory?: PositionHistoryDTO[];
  dateOfJoining?: ISODateString;
  dateOfLeaving?: ISODateString;
  contactInfo?: ContactInfoDTO;
  permissions?: string[];
  shifts?: ShiftDTO[];
  performance?: PerformanceDTO;
  documents?: DocumentDTO[];
  notes?: string;
  audit?: AuditDTO; // updatedBy should be set on write
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
  | "subRole"
  | "position"
  | "status"
  | "employmentType"
  | "salary"
  | "dateOfJoining"
  | "dateOfLeaving"
  | "createdAt"
  | "updatedAt"
  | "rating"
  | "lastReview";

export interface EmployeeFilters {
  roles?: EmployeeRole[];
  subRoles?: EmployeeSubRole[];
  positions?: EmployeePosition[];
  positionCategories?: PositionCategory[];
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
  positions: "employees:positions",
  enums: "employees:enums",
} as const;

export type EmployeesCacheKey = ValueOf<typeof EMPLOYEES_CACHE_KEYS>;

/* ---------------------------------------------------------------------
  Table & sorting helpers for UI
--------------------------------------------------------------------- */

export type EmployeeTableColumn =
  | "user.name"
  | "user.email"
  | "subRole"
  | "position"
  | "status"
  | "employmentType"
  | "salary"
  | "rating"
  | "dateOfJoining"
  | "dateOfLeaving"
  | "createdAt"
  | "updatedAt";

export type SortableEmployeeKey = EmployeeTableColumn;

export const sortableEmployeeFields = [
  "user.name",
  "user.email",
  "subRole",
  "position",
  "employmentType",
  "status",
  "salary",
  "rating",
  "dateOfJoining",
  "dateOfLeaving",
  "createdAt",
  "updatedAt",
] as const;

export type SortableEmployeeField = typeof sortableEmployeeFields[number];
