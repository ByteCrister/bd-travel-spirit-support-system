// src/lib/storage-providers/images/index.ts

import { STORAGE_PROVIDER } from "@/models/image.model";
import { ImageStorageProvider } from "./image-storage.interface";
import { CloudinaryImageProvider } from "./cloudinary-image.provider";
// import { S3ImageProvider } from "./s3-image.provider";
// import { LocalImageProvider } from "./local-image.provider";
// import { GCSImageProvider } from "./gcs-image.provider";

/**
 * Central registry of available image storage provider implementations.
 *
 * Keys are values from the STORAGE_PROVIDER enum, and values are concrete
 * instances implementing the ImageStorageProvider interface.
 *
 * This design allows the application to:
 * - Dynamically resolve the correct provider at runtime based on configuration.
 * - Easily add or remove providers without changing consumer code.
 * - Keep provider-specific logic encapsulated in its own class.
 *
 * To add a new provider:
 * 1. Implement the ImageStorageProvider interface.
 * 2. Import the class here.
 * 3. Register it in the `providers` map with the corresponding enum key.
 */
const providers: Partial<Record<STORAGE_PROVIDER, ImageStorageProvider>> = {
    [STORAGE_PROVIDER.CLOUDINARY]: new CloudinaryImageProvider(),
    // [STORAGE_PROVIDER.S3]: new S3ImageProvider(),
    // [STORAGE_PROVIDER.LOCAL]: new LocalImageProvider(),
    // [STORAGE_PROVIDER.GCS]: new GCSImageProvider(),
};

/**
 * Retrieves the image storage provider instance for the given enum value.
 *
 * @param provider - The STORAGE_PROVIDER enum value identifying the desired provider.
 * @returns The matching ImageStorageProvider instance.
 * @throws Error if no provider is registered for the given enum value.
 *
 * Usage example:
 * ```ts
 * const storage = getImageStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
 * await storage.upload(imageBuffer, options);
 * ```
 *
 * This function enforces that only registered providers can be used,
 * preventing silent failures or misconfigurations.
 */
export function getImageStorageProvider(provider: STORAGE_PROVIDER): ImageStorageProvider {
    const instance = providers[provider];
    if (!instance) {
        throw new Error(`No image storage provider found for: ${provider}`);
    }
    return instance;
}
