// types/current-user.types.ts

import { USER_ROLE } from "@/constants/user.const";
// import { EmployeeDetailDTO } from "./employee.types";
import { EmployeeRole } from "@/constants/employee.const";
import { AuditAction } from "@/constants/audit-action.const";
import { EmployeeDetailDTO } from "../employee/employee.types";

/**
 * Roles allowed in the admin dashboard
 */
export type AdminRole = `${USER_ROLE.ADMIN}` | `${USER_ROLE.SUPPORT}`;

/**
 * Base information for the currently logged-in user
 */
export interface IBaseUser {
    _id: string;
    email: string;
    role: AdminRole;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}

/**
 * Extended information for Owner (platform administrator)
 */
export interface IOwnerInfo {
    email: string;
    fullName?: string;
    role: USER_ROLE.ADMIN;
}

/**
 * Extended information for Employee (support)
 */
export type IEmployeeInfo = Omit<EmployeeDetailDTO,
    "companyId"
    | "user"
    | "status"
    | "audit"
    | "isDeleted"
> & {
    fullName?: string;
    email: string;
    role: EmployeeRole;
    phone: string;
}

/**
 * Union for full/expanded user
 */
export type CurrentUser = IOwnerInfo | IEmployeeInfo;

/**
 * Audit log entry aligned with audit.model.ts
 */
export interface AuditLog {
    _id: string;
    targetModel: string;
    target: string;
    actor?: string;
    actorModel?: string;
    action: AuditAction;
    note?: string;
    ip?: string;
    userAgent?: string;
    changes?: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
    };
    createdAt: string; // ISO
}

/**
 * Audit list API response (paginated)
 */
export interface AuditListApiResponse {
    success: boolean;
    audits: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
}
/**
 * Date range filter for audits
 */
export interface AuditDateFilter {
    startDate?: string; // ISO string
    endDate?: string; // ISO string
    // Single date for quick filter
    date?: string; // ISO string
}
/**
 * Audit query parameters
 */
export interface AuditQueryParams {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    date?: string;
}
/**
 * Request status flags for robust UI logic
 */
export interface RequestMeta {
    loading: boolean;
    inFlight: boolean;
    error?: string | null;
    lastFetchedAt?: number | null;
    stale: boolean;

    // Infinite scroll support
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
}


/**
 * Zustand store state for current user
 */
export interface CurrentUserState {
    // Data
    baseUser: IBaseUser | null;
    fullUser: CurrentUser | null;
    audits: AuditLog[];

    // Filters
    auditFilters: AuditDateFilter & {
        currentPage: number;
        pageSize: number;
        hasMore: boolean;
    };

    // Status
    baseMeta: RequestMeta;
    fullMeta: RequestMeta;
    auditsMeta: RequestMeta;

    // update meta
    updateNameMeta?: RequestMeta;
    updatePasswordMeta?: RequestMeta;

    // Abort controllers to cancel inflight requests
    _abortBase?: AbortController | null;
    _abortFull?: AbortController | null;
    _abortAudits?: AbortController | null;

    // Abort controllers for update operations
    _abortUpdateName?: AbortController | null;
    _abortUpdatePassword?: AbortController | null;

    // Actions
    fetchBaseUser: (opts?: { force?: boolean }) => Promise<IBaseUser | null>;
    fetchFullUser: (role: AdminRole, opts?: { force?: boolean }) => Promise<CurrentUser | null>;
    fetchUserAudits: (opts?:
        {
            page?: number;
            pageSize?: number;
            force?: boolean;
            append?: boolean;
            startDate?: string;
            endDate?: string;
            date?: string;
        }) => Promise<AuditLog[] | null>;

    setAuditDateFilter: (filter: Partial<AuditDateFilter>) => void;
    resetAuditFilters: () => void;
    loadMoreAudits: () => Promise<AuditLog[] | null>;

    updateUserName: (data: { name: string }) => Promise<CurrentUser | null>;
    updateUserPassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;

    markStale: (scope: "base" | "full" | "audits") => void;
    clearUser: () => void;
}