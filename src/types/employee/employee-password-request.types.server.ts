/* -----------------------------------------
   Populated sub-documents (lean-safe)
------------------------------------------ */

import { RequestStatus } from "@/constants/reset-password-request.const";
import { Types } from "mongoose";

export interface PopulatedUserLite {
    _id: Types.ObjectId;
    email: string;
    name: string;
    role: string;
}

export interface PopulatedEmployeeLite {
    _id: Types.ObjectId;
    contactInfo?: {
        phone?: string;
        email?: string;
    };
    status?: string;
}

/* -----------------------------------------
   Fully populated reset request (lean)
------------------------------------------ */

export interface ResetPasswordRequestPopulated {
    _id: Types.ObjectId;

    user: PopulatedUserLite;
    employee?: PopulatedEmployeeLite;

    description?: string;
    denialReason?: string;
    status: RequestStatus;

    requestedAt: Date;
    reviewedAt?: Date;
    fulfilledAt?: Date;

    requestedFromIP?: string;
    requestedAgent?: string;

    createdAt: Date;
    updatedAt: Date;
}