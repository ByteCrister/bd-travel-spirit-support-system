// Utility type to extract enum values
type EnumValues<T> = T[keyof T];

export enum STORAGE_PROVIDER {
    S3 = "s3",
    GCS = "gcs",
    LOCAL = "local",
    CLOUDINARY = "cloudinary",
}
export type StorageProvider = EnumValues<typeof STORAGE_PROVIDER>;
// "s3" | "gcs" | "local" | "cloudinary"

export enum VISIBILITY {
    PRIVATE = "private",
    UNLISTED = "unlisted",
    PUBLIC = "public",
}
export type Visibility = EnumValues<typeof VISIBILITY>;
// "private" | "unlisted" | "public"

export enum MODERATION_STATUS {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}
export type ModerationStatus = EnumValues<typeof MODERATION_STATUS>;
// "pending" | "approved" | "rejected"

export enum ASSET_TYPE {
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document",
    AUDIO = "audio",
    OTHER = "other",
}
export type AssetType = EnumValues<typeof ASSET_TYPE>;
// "image" | "video" | "document" | "audio" | "other"
