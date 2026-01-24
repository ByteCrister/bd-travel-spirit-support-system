// src/lib/cloudinary/cloudinary.types.ts

import { ResourceType } from "cloudinary";

export interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    resource_type: ResourceType;
    format?: string;
    original_filename: string;
    bytes: number;
}

export interface CloudinaryApiResource {
    public_id: string;
    secure_url: string;
    resource_type: ResourceType;
    format?: string;
    original_filename: string;
    bytes: number;
}

export interface CloudinaryUploadError {
    error: {
        message: string;
        http_code?: number;
    };
}