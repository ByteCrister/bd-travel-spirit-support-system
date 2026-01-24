// src/lib/helpers/asset-checksum.ts
import { CloudinaryUploadError } from "../cloudinary/cloudinary.types";
import { ApiError } from "./withErrorHandler";

export interface MongoDuplicateKeyError {
    code: 11000;
    keyPattern?: Record<string, number>;
    keyValue?: Record<string, unknown>;
}

export function isMongoDuplicateKeyError(
    err: unknown
): err is MongoDuplicateKeyError {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: unknown }).code === 11000
    );
}

export class DuplicateAssetChecksumError extends ApiError {
    constructor(fileName?: string) {
        super(
            fileName
                ? `The file "${fileName}" is already in use. Please upload a different document.`
                : "This document is already in use. Please upload a different file.",
            409
        );
    }
}

export function isCloudinary409Error(
    err: unknown
): err is CloudinaryUploadError {
    if (typeof err !== "object" || err === null) return false;

    if (!("error" in err)) return false;

    const cloudErr = err as CloudinaryUploadError;

    return cloudErr.error?.http_code === 409;
}