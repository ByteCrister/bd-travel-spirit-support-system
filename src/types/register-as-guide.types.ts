// src/types/register-as-guide.types.ts
import { GUIDE_SOCIAL_PLATFORM } from "@/constants/guide.const";

// Types for form data
export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    street: string;
    zip: string;
    city: string;
    division: string;
    country: string;
}

export interface CompanyDetails {
    companyName: string;
    bio: string;
    social: {
        platform: GUIDE_SOCIAL_PLATFORM;
        url: string;
    }[];
}

export interface DocumentFile {
    name: string;
    base64: string;
    uploadedAt: string;
    type: string;
    size: number;
}

export interface SegmentedDocuments {
    governmentId: DocumentFile[];
    businessLicense: DocumentFile[];
    professionalPhoto: DocumentFile[];
    certifications: DocumentFile[];
}

export interface FormData {
    personalInfo: PersonalInfo;
    companyDetails: CompanyDetails;
    documents: SegmentedDocuments;
}