// user.table.types.ts
import { ACCOUNT_STATUS, USER_ROLE } from "@/constants/user.const";
import { Suspension } from "./user.types";

/**
 * ======================================
 * USER TABLE TYPE (admin listing)
 * ======================================
 */
export interface UserTableRow {
    /** Unique MongoDB ID */
    _id: string;

    /** Profile picture URL */
    avatar?: string;

    /** Full name of the user */
    name: string;

    /** Email address */
    email: string;

    /** Role assigned to the user */
    role: USER_ROLE;

    /** Whether the email is verified */
    isVerified: boolean;

    /** Current account lifecycle state */
    accountStatus: ACCOUNT_STATUS;

    /** Whether the account is currently active */
    isActive: boolean;

    /** Last login timestamp */
    lastLogin?: string;

    /** Account creation timestamp */
    createdAt: string;

    /** Suspension details, if any */
    suspension?: Suspension;
}


export const USER_SORTABLE_FIELDS = [
    "name",
    "email",
    "role",
    "accountStatus",
    "createdAt",
    "lastLogin",
] as const;

export type UserSortableField = (typeof USER_SORTABLE_FIELDS)[number];

export type UserAction =
    | "viewProfile"
    | "edit"
    | "activate"
    | "suspend"
    | "verify"
    | "upgradeOrganizer"
    | "resetPassword"
    | "delete";