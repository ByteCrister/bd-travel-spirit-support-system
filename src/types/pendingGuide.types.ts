// types/pendingGuide.types.ts

import { GUIDE_DOCUMENT_CATEGORY, GUIDE_DOCUMENT_TYPE } from "@/constants/guide.const";
import { GUIDE_STATUS } from "@/constants/guide.const";

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
    category: GUIDE_DOCUMENT_CATEGORY;
    base64Content: string; // ⚠️ Consider replacing with fileUrl in production
    fileType: GUIDE_DOCUMENT_TYPE;
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
    status: GUIDE_STATUS;
    appliedAt: string;
    reviewComment?: string;
    reviewer?: string; // reviewer’s userId as string
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}
