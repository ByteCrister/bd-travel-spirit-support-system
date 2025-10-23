/** ============================================================
 * GUIDE CONSTANTS
 * ------------------------------------------------------------
 * These enums define the fixed values used throughout the
 * guide (tour organizer) application and verification process.
 * Keeping them centralized ensures consistency across both
 * backend (Mongoose models) and frontend (Next.js DTOs).
 * ============================================================ */
// Utility type to extract enum values
type EnumValues<T> = T[keyof T];
/**
 * File types supported for guide document uploads.
 * Used to validate and restrict the kind of files
 * applicants can submit during the verification process.
 */
export enum GUIDE_DOCUMENT_TYPE {
  IMAGE = "image", // Standard image formats (JPEG, PNG, etc.)
  PDF = "pdf", // Portable Document Format
  DOCX = "docx", // Microsoft Word document
}
export type GuideDocumentType = EnumValues<typeof GUIDE_DOCUMENT_TYPE>;

/**
 * Categories of documents required or accepted
 * for verifying a guide’s identity and credentials.
 * Each uploaded document must belong to one of these categories.
 */
export enum GUIDE_DOCUMENT_CATEGORY {
  GOVERNMENT_ID = "government_id", // Passport, National ID, Driver’s License
  BUSINESS_LICENSE = "business_license", // Proof of business registration
  PROFESSIONAL_PHOTO = "professional_photo", // Profile photo for public display
  CERTIFICATION = "certification", // Relevant training or skill certificates
}
export type GuideDocumentCategory = EnumValues<typeof GUIDE_DOCUMENT_CATEGORY>;

/** Organizer profile verification states */
export enum GUIDE_STATUS {
  /** Awaiting admin review */
  PENDING = "pending",

  /** Approved and allowed to create/manage tours */
  APPROVED = "approved",

  /** Rejected after review */
  REJECTED = "rejected",
}
export type GuideStatus = EnumValues<GUIDE_STATUS>;

// =========================
// SOCIAL PLATFORM ENUM
// =========================
export enum GUIDE_SOCIAL_PLATFORM {
  FACEBOOK = "facebook",
  WHATSAPP = "whatsapp",
  IMO = "imo",
  TWITTER = "twitter",
  INSTAGRAM = "instagram",
}
export type GuideSocialPlatform = EnumValues<GUIDE_SOCIAL_PLATFORM>;