// types/pendingGuide.types.ts

import { GuideDocumentCategory, GuideDocumentType, GuideStatus } from "@/constants/guide.const";

/** Address DTO */
export interface PendingGuideAddressDTO {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
}

/** Document DTO */
export interface PendingGuideDocumentDTO {
    category: GuideDocumentCategory;
    base64Content: string; // ⚠️ Consider replacing with fileUrl in production
    fileType: GuideDocumentType;
    fileName?: string;
    uploadedAt: string; // Dates should be serialized as ISO strings in JSON
}

/** Main Pending Guide DTO */
export interface PendingGuideDTO {
    _id: string; // maps from MongoDB _id
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    address?: PendingGuideAddressDTO;
    companyName: string;
    bio?: string;
    social?: string;
    documents: PendingGuideDocumentDTO[];
    status: GuideStatus;
    appliedAt: string;
    reviewComment?: string;
    reviewer?: string; // reviewer’s userId as string
    reviewedAt?: string;
    suspendedUntil?:string;
    suspensionReason: string;
    createdAt: string;
    updatedAt: string;
}
