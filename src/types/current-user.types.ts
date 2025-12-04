// types/current-user.types.ts

import { USER_ROLE } from "@/constants/user.const";
import { ContactInfoDTO, DocumentDTO, EmployeeRole, EmploymentType, ISODateString, ObjectIdString, SalaryHistoryDTO, ShiftDTO } from "./employee.types";

/**
 * Roles allowed in the admin dashboard
 */
export type AdminRole = USER_ROLE.ADMIN | USER_ROLE.SUPPORT | USER_ROLE.ASSISTANT;

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
    role: USER_ROLE.ADMIN;
    fullName?: string;
}

/**
 * Extended information for Employee (support)
 */
export type IEmployeeInfo = {
    id: ObjectIdString;
    userId?: ObjectIdString;
    avatar?: ObjectIdString;

    role: EmployeeRole;
    employmentType?: EmploymentType;

    // Histories
    salaryHistory: SalaryHistoryDTO[];

    // Current compensation
    salary: number;
    currency: string;

    dateOfJoining: ISODateString;
    dateOfLeaving?: ISODateString;

    contactInfo: ContactInfoDTO;

    shifts?: ShiftDTO[];

    documents?: DocumentDTO[];
    lastLogin?: ISODateString;

    createdAt: ISODateString;
    updatedAt: ISODateString;
};

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
    action: string;
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

    // Status
    baseMeta: RequestMeta;
    fullMeta: RequestMeta;
    auditsMeta: RequestMeta;

    // Abort controllers to cancel inflight requests
    _abortBase?: AbortController | null;
    _abortFull?: AbortController | null;
    _abortAudits?: AbortController | null;

    // Actions
    fetchBaseUser: (opts?: { force?: boolean }) => Promise<IBaseUser | null>;
    fetchFullUser: (role: AdminRole, opts?: { force?: boolean }) => Promise<CurrentUser | null>;
    fetchUserAudits: (opts?: { page?: number; pageSize?: number; force?: boolean, append?: boolean; }) => Promise<AuditLog[] | null>;
    markStale: (scope: "base" | "full" | "audits") => void;
    clearUser: () => void;
}