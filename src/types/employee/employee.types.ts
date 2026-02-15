// employee.types.ts
// Updated to align with constants and Mongoose model (payroll, contactInfo, documents, etc.)

import {
  EmployeeStatus,
  EmploymentType,
  PayrollStatus,
  SalaryPaymentMode,
} from "@/constants/employee.const";
import { Currency } from "@/constants/tour.const";
import { AuditLog } from "../user/current-user.types";

/* ---------------------------------------------------------------------
  1. PRIMITIVE / UTILITY TYPES
--------------------------------------------------------------------- */

export type ISODateString = string; // client uses ISO-8601 strings
export type ObjectIdString = string; // Mongoose ObjectId as string in API responses
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type SortOrder = "asc" | "desc";
export type ValueOf<T> = T[keyof T];

/* ---------------------------------------------------------------------
  2. SUB-ENTITY DTOs (Leaf Types)
--------------------------------------------------------------------- */

export interface EmergencyContactDTO {
  name: string;
  phone: string; // Bangladesh mobile format expected
  relation: string;
}

export interface ContactInfoDTO {
  phone: string; // required by schema
  email: string;
  emergencyContact: EmergencyContactDTO;
}

export interface ShiftDTO {
  startTime: string; // "HH:mm" 24h
  endTime: string; // "HH:mm" 24h
  days: DayOfWeek[];
}

export interface DocumentDTO {
  type: string;
  url: ObjectIdString; // in frontend this will carry cloudinary url
  uploadedAt: ISODateString;
}

export interface SalaryHistoryDTO {
  amount: number;
  currency: string;
  effectiveFrom: ISODateString;
  effectiveTo?: ISODateString;
  reason?: string;
}

export interface PayrollRecordDTO {
  year: number; // 2025
  month: number; // 1–12
  amount: number;
  currency: string; // ISO currency code, uppercase
  status: PayrollStatus;
  attemptedAt?: ISODateString;
  paidAt?: ISODateString;
  failureReason?: string;
  transactionRef?: string;
  paidBy?: ObjectIdString; // admin/user who paid manually
}

export interface UserSummaryDTO {
  name: string;
  email: string;
  phone?: string;
  avatar?: string; // URL or Asset id depending on API
}

export interface CurrentMonthPaymentStatusDTO {
  status: PayrollStatus; // "pending" | "paid" | "failed"
  amount: number;
  currency: string;
  dueDate?: ISODateString; // When the payment is due
  attemptedAt?: ISODateString;
  paidAt?: ISODateString;
  transactionRef?: string;
  failureReason?: string;
}

/* ---------------------------------------------------------------------
  3. CORE EMPLOYEE DTOs
--------------------------------------------------------------------- */

// Status badge UI helper (reusable)
export interface StatusBadgeDTO {
  label: string;
  tone?: "positive" | "warning" | "danger" | "muted";
}

// List item DTO (compact, for tables/lists)
export interface EmployeeListItemDTO {
  // Core identifiers
  id: ObjectIdString;
  companyId?: ObjectIdString;

  // User information
  user: Pick<UserSummaryDTO, "name" | "email" | "phone" | "avatar">;

  // Employment details
  status: EmployeeStatus;
  employmentType?: EmploymentType;

  // Compensation
  salary: number;
  currency: string;
  paymentMode: SalaryPaymentMode; // auto | manual
  currentMonthPayment?: CurrentMonthPaymentStatusDTO; // current month payment status

  // Dates
  dateOfJoining: ISODateString;
  dateOfLeaving?: ISODateString;
  lastLogin?: ISODateString;

  // Contact summary
  contactPhone?: string;
  contactEmail?: string;

  // UI/display helpers
  shiftSummary?: string;
  avatar?: ObjectIdString; // Asset id
  statusBadge?: StatusBadgeDTO;

  // Metadata
  isDeleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// Detail DTO (full entity, for view/edit)
export interface EmployeeDetailDTO {
  // Core identifiers
  id: ObjectIdString;
  userId?: ObjectIdString;
  companyId?: ObjectIdString;

  // User information
  user: UserSummaryDTO;
  avatar?: string; // Asset id reference

  // Employment details
  status: EmployeeStatus;
  employmentType?: EmploymentType;

  // Compensation
  salary: number;
  currency: Currency;
  salaryHistory: SalaryHistoryDTO[];
  paymentMode: SalaryPaymentMode; // auto | manual
  currentMonthPayment?: CurrentMonthPaymentStatusDTO; // current month payment status

  // Dates
  dateOfJoining: ISODateString;
  dateOfLeaving?: ISODateString;
  lastLogin?: ISODateString;

  // Relationships
  contactInfo: ContactInfoDTO;
  payroll?: PayrollRecordDTO[];
  shifts?: ShiftDTO[];
  documents?: DocumentDTO[];
  audit: AuditLog[];

  // Metadata
  notes?: string;
  isDeleted: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/* ---------------------------------------------------------------------
  4. API PAYLOAD TYPES
--------------------------------------------------------------------- */

export interface CreateEmployeePayload {
  id?: string;
  name: string;
  password: string;
  employmentType: EmploymentType;
  avatar: ObjectIdString;
  salary: number | null;
  currency: Currency;
  paymentMode: SalaryPaymentMode; // auto | manual
  dateOfJoining: ISODateString;
  contactInfo: ContactInfoDTO; // phone is required
  shifts: ShiftDTO[];
  documents: DocumentDTO[];
  notes?: string;
}

export type UpdateEmployeePayload = Omit<CreateEmployeePayload, "password" | "id" | "salary"> & {
  id: ObjectIdString;
  status: EmployeeStatus;
  salary: number;
  dateOfLeaving?: ISODateString;
};

export interface RestoreEmployeePayload {
  id: ObjectIdString;
}

export interface RetrySalaryPaymentPayload {
  id: ObjectIdString;
}

/* ---------------------------------------------------------------------
  5. QUERY & FILTER TYPES
--------------------------------------------------------------------- */

// Sorting
export type EmployeeSortKey =
  | "user.name"
  | "user.email"
  | "status"
  | "employmentType"
  | "salary"
  | "dateOfJoining"
  | "dateOfLeaving"
  | "createdAt"
  | "updatedAt"
  | "paymentStatus"; // sort by payment status


// Filter criteria
export interface EmployeeFilters {
  // Status filters
  statuses?: EmployeeStatus[];
  employmentTypes?: EmploymentType[];

  // Payment status filter
  paymentStatuses?: PayrollStatus[]; // filter by current month payment status

  // Text search
  search?: string;

  // Range filters
  salaryMin?: number;
  salaryMax?: number;
  joinedAfter?: ISODateString;
  joinedBefore?: ISODateString;
  leftAfter?: ISODateString;
  leftBefore?: ISODateString;

  // Soft delete filter
  includeDeleted?: boolean;
}

// Query parameters
export interface EmployeesQuery {
  page?: number; // default: 1
  limit?: number; // default: 10/20 as per UI
  sortBy?: EmployeeSortKey;
  sortOrder?: SortOrder;
  filters?: EmployeeFilters;
}

/* ---------------------------------------------------------------------
  6. RESPONSE TYPES
--------------------------------------------------------------------- */

// Paginated response wrapper
export interface PaginatedResponse<T> {
  docs: T[];
  total: number;
  page: number;
  pages: number;
}

// Specific list response
export type EmployeesListResponse = PaginatedResponse<EmployeeListItemDTO>;

// Error response
export interface ApiError {
  code: string; // machine-readable (e.g., "VALIDATION_ERROR")
  message: string; // human-readable
  details?: Record<string, unknown>;
}

/* ---------------------------------------------------------------------
  7. CACHE TYPES
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
  8. UI-SPECIFIC TYPES
--------------------------------------------------------------------- */

// Dialog/Modal state
export type EmployeeDialogId = ObjectIdString | null;

// Table configuration
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
  "dateOfJoining",
  "dateOfLeaving",
  "createdAt",
  "updatedAt",
] as const;

export type SortableEmployeeField = (typeof sortableEmployeeFields)[number];

/* ---------------------------------------------------------------------
  9. PAYMENT ACTION TYPES (Add new section)
--------------------------------------------------------------------- */

export interface SalaryPaymentRetryResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  payment: CurrentMonthPaymentStatusDTO;
  employee?: EmployeeDetailDTO; // Optional full employee data
}