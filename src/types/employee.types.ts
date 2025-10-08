// employees.type.ts
// Purpose: Production-grade DTOs and query types for /employees admin pages.
// Design goals:
// - Constant-derived unions for zero drift with backend
// - Flat, UI-optimized list DTOs with summary fields
// - Detail DTOs preserving structure with safe client-side types
// - Strict create/update payloads aligned to backend schema
// - Strong query, filter, sort, and pagination typing

// ---------------------------------------------------------------------
// Single source unions (import your backend-shared constants in the app)
// ---------------------------------------------------------------------

import {
    EMPLOYEE_ROLE,
    EMPLOYEE_SUB_ROLE,
    EMPLOYEE_STATUS,
    EMPLOYMENT_TYPE,
    EMPLOYEE_POSITIONS,
} from "@/constants/employee.const";

export type EmployeeRole = typeof EMPLOYEE_ROLE[keyof typeof EMPLOYEE_ROLE];
export type EmployeeSubRole = typeof EMPLOYEE_SUB_ROLE[keyof typeof EMPLOYEE_SUB_ROLE];
export type EmployeeStatus = typeof EMPLOYEE_STATUS[keyof typeof EMPLOYEE_STATUS];
export type EmploymentType = typeof EMPLOYMENT_TYPE[keyof typeof EMPLOYMENT_TYPE];

// Position value union across all categories
export type EmployeePosition = (typeof EMPLOYEE_POSITIONS)[keyof typeof EMPLOYEE_POSITIONS][number];

// Position category union (keys of EMPLOYEE_POSITIONS)
export type PositionCategory = keyof typeof EMPLOYEE_POSITIONS;

// Utility
export type ValueOf<T> = T[keyof T];
export type ISODateString = string; // always ISO-8601 on the client
export type ObjectIdString = string; // Mongoose ObjectId as string in API responses

// Day-of-week union for shifts
export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// ---------------------------------------------------------------------
// Sub-DTOs (client-safe types)
// ---------------------------------------------------------------------

export interface EmergencyContactDTO {
    name: string;
    phone: string;
    relation: string;
}

export interface ContactInfoDTO {
    phone?: string;
    email?: string;
    emergencyContact?: EmergencyContactDTO;
}

export interface ShiftDTO {
    startTime: string; // "HH:mm" 24h
    endTime: string;   // "HH:mm" 24h
    days: DayOfWeek[];
}

export interface PerformanceDTO {
    rating?: number; // 1..5
    lastReview?: ISODateString;
    feedback?: string;
}

export interface DocumentDTO {
    type: string;
    url: string;
    uploadedAt: ISODateString;
}

export interface AuditDTO {
    createdBy: ObjectIdString;
    updatedBy: ObjectIdString;
}

// ---------------------------------------------------------------------
// User summary DTO (employees are users; minimal denormalized fields)
// ---------------------------------------------------------------------

export interface UserSummaryDTO {
    id: ObjectIdString;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: "traveler" | "guide" | "assistant" | "support" | "admin";
    isVerified: boolean;
    accountStatus: "pending" | "active" | "suspended" | "banned";
}

// ---------------------------------------------------------------------
// UI-optimized list item DTO (flattened for table performance)
// ---------------------------------------------------------------------

export interface EmployeeListItemDTO {
    id: ObjectIdString; // employee _id
    userId: ObjectIdString;

    // User summary for table columns
    user: Pick<UserSummaryDTO, "id" | "name" | "email" | "phone" | "avatar">;

    // Core employment fields
    role: EmployeeRole;
    subRole: EmployeeSubRole; // corrected type from model intent
    position: EmployeePosition;
    positionCategory: PositionCategory; // derived from EMPLOYEE_POSITIONS key

    status: EmployeeStatus;
    employmentType?: EmploymentType;
    department?: string;

    // Compensation summary
    salary?: number;
    salaryCurrency?: string;

    // Dates
    dateOfJoining: ISODateString;
    dateOfLeaving?: ISODateString;

    // Contact summary (flattened for quick render and filtering)
    contactPhone?: string;
    contactEmail?: string;

    // Performance summary
    rating?: number;
    lastReview?: ISODateString;

    // Shift summary (preformatted for table cell; e.g., "09:00–17:00, Mon–Fri")
    shiftSummary?: string;

    // Admin flags
    isDeleted: boolean;

    // Audit & timestamps
    createdAt: ISODateString;
    updatedAt: ISODateString;
}

// ---------------------------------------------------------------------
// Full detail DTO (dialog/preview) - preserves structure
// ---------------------------------------------------------------------

export interface EmployeeDetailDTO {
    id: ObjectIdString;
    userId: ObjectIdString;
    hostId?: ObjectIdString;

    user: UserSummaryDTO;

    role: EmployeeRole;
    subRole: EmployeeSubRole;
    position: EmployeePosition;
    positionCategory: PositionCategory;

    status: EmployeeStatus;
    employmentType?: EmploymentType;

    department?: string;
    salary?: number;
    salaryCurrency?: string;

    dateOfJoining: ISODateString;
    dateOfLeaving?: ISODateString;

    contactInfo: ContactInfoDTO;
    permissions: string[];
    shifts?: ShiftDTO[];

    performance: PerformanceDTO;
    documents?: DocumentDTO[];
    notes?: string;

    audit: AuditDTO;
    isDeleted: boolean;

    createdAt: ISODateString;
    updatedAt: ISODateString;

    // Derived labels for UI (optional convenience)
    roleLabel?: string;
    subRoleLabel?: string;
    positionLabel?: string;
}

// ---------------------------------------------------------------------
// Create/Update payloads (align to backend schema; client-side types)
// ---------------------------------------------------------------------

// Minimal payload to create a new employee
export interface CreateEmployeePayload {
    userId: ObjectIdString;
    hostId?: ObjectIdString;

    role: EmployeeRole;
    subRole: EmployeeSubRole;
    position: EmployeePosition;

    status?: EmployeeStatus; // default: "active" on backend
    employmentType?: EmploymentType;

    department?: string;
    salary?: number;
    salaryCurrency?: string;

    dateOfJoining?: ISODateString; // default: now on backend
    dateOfLeaving?: ISODateString;

    contactInfo: ContactInfoDTO;
    permissions?: string[];
    shifts?: ShiftDTO[];

    performance?: PerformanceDTO;
    documents?: DocumentDTO[];
    notes?: string;

    audit: AuditDTO;
}

// Strict update payload: allow partial updates, but validate business rules in services
export interface UpdateEmployeePayload {
    id: ObjectIdString; // employee id (path or body)

    hostId?: ObjectIdString;

    role?: EmployeeRole;
    subRole?: EmployeeSubRole;
    position?: EmployeePosition;

    status?: EmployeeStatus;
    employmentType?: EmploymentType;

    department?: string;
    salary?: number;
    salaryCurrency?: string;

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

// Soft delete/restore payloads
export interface SoftDeleteEmployeePayload {
    id: ObjectIdString;
}

export interface RestoreEmployeePayload {
    id: ObjectIdString;
}

// ---------------------------------------------------------------------
// Query, sorting, filters, and pagination
// ---------------------------------------------------------------------

export type SortOrder = "asc" | "desc";

// Allowed sort keys for /employees table
export type EmployeeSortKey =
    | "user.name"
    | "user.email"
    | "role"
    | "subRole"
    | "position"
    | "status"
    | "employmentType"
    | "department"
    | "salary"
    | "dateOfJoining"
    | "dateOfLeaving"
    | "createdAt"
    | "updatedAt"
    | "rating"
    | "lastReview";

// Filters accepted by listing endpoint/UI
export interface EmployeeFilters {
    roles?: EmployeeRole[];
    subRoles?: EmployeeSubRole[];
    positions?: EmployeePosition[];
    positionCategories?: PositionCategory[];
    statuses?: EmployeeStatus[];
    employmentTypes?: EmploymentType[];
    departments?: string[];

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

// Paginated query for listing
export interface EmployeesQuery {
    page?: number; // default: 1
    limit?: number; // default: 10/20 as per UI
    sortBy?: EmployeeSortKey;
    sortOrder?: SortOrder;
    filters?: EmployeeFilters;
}

// Generic paginated response wrapper
export interface PaginatedResponse<T> {
    docs: T[];
    total: number;
    page: number;
    pages: number;
}

// List response DTO
export type EmployeesListResponse = PaginatedResponse<EmployeeListItemDTO>;

// ---------------------------------------------------------------------
// Dialog selection / UI states
// ---------------------------------------------------------------------

export type EmployeeDialogId = ObjectIdString | null;

// ---------------------------------------------------------------------
// Error/Result shapes (for API layer)
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Cache key helpers (to be reused in zustand store)
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Type-safe mapping hints (for your service layer; optional):
// - Derive positionCategory by scanning EMPLOYEE_POSITIONS keys.
// - Convert backend Date to ISO strings for all date fields.
// - Flatten contactInfo.phone/email to contactPhone/contactEmail in list DTO.
// - Compute shiftSummary (e.g., "09:00–17:00, Mon–Fri") for list render.
// ---------------------------------------------------------------------


// For /User-management page
export type EmployeeTableColumns =
    | "user.name"
    | "user.email"
    | "role"
    | "subRole"
    | "position"
    | "department"
    | "status"
    | "employmentType"
    | "salary"
    | "rating"
    | "dateOfJoining"
    | "dateOfLeaving"
    | "createdAt"
    | "updatedAt";

export type SortableEmployeeKey =
    | "user.name"
    | "user.email"
    | "role"
    | "subRole"
    | "position"
    | "department"
    | "employmentType"
    | "status"
    | "salary"
    | "rating"
    | "dateOfJoining"
    | "dateOfLeaving"
    | "createdAt"
    | "updatedAt";


export const sortableEmployeeFields: SortableEmployeeKey[] = [
    "user.name",
    "user.email",
    "role",
    "subRole",
    "position",
    "department",
    "employmentType",
    "status",
    "salary",
    "rating",
    "dateOfJoining",
    "dateOfLeaving",
    "createdAt",
    "updatedAt",
];

