import { STORAGE_PROVIDER } from "@/models/image.model"; // Reuse same enum for consistency across media types
import { DocumentStorageProvider } from "./document-storage.interface";
import { CloudinaryDocProvider } from "./cloudinary-doc.provider";
// import { S3DocProvider } from "./s3-doc.provider";
// import { LocalDocProvider } from "./local-doc.provider";
// import { GCSDocProvider } from "./gcs-doc.provider";

/**
 * Central registry of available document storage provider implementations.
 *
 * Keys are values from the STORAGE_PROVIDER enum, and values are concrete
 * instances implementing the DocumentStorageProvider interface.
 *
 * This registry allows the application to:
 * - Dynamically resolve the correct provider at runtime based on configuration.
 * - Keep provider-specific logic encapsulated in its own class.
 * - Easily add or remove providers without changing consumer code.
 *
 * To add a new provider:
 * 1. Implement the DocumentStorageProvider interface.
 * 2. Import the class here.
 * 3. Register it in the `providers` map with the corresponding enum key.
 */
const providers: Partial<Record<STORAGE_PROVIDER, DocumentStorageProvider>> = {
    [STORAGE_PROVIDER.CLOUDINARY]: new CloudinaryDocProvider(),
    // [STORAGE_PROVIDER.S3]: new S3DocProvider(),
    // [STORAGE_PROVIDER.LOCAL]: new LocalDocProvider(),
    // [STORAGE_PROVIDER.GCS]: new GCSDocProvider(),
};

/**
 * Retrieves the document storage provider instance for the given enum value.
 *
 * @param provider - The STORAGE_PROVIDER enum value identifying the desired provider.
 * @returns The matching DocumentStorageProvider instance.
 * @throws Error if no provider is registered for the given enum value.
 *
 * Usage example:
 * ```ts
 * const docStorage = getDocumentStorageProvider(STORAGE_PROVIDER.CLOUDINARY);
 * await docStorage.upload(buffer, "contracts/2025");
 * ```
 *
 * This function enforces that only registered providers can be used,
 * preventing silent failures or misconfigurations.
 */
export function getDocumentStorageProvider(provider: STORAGE_PROVIDER): DocumentStorageProvider {
    const instance = providers[provider];
    if (!instance) {
        throw new Error(`No document storage provider found for: ${provider}`);
    }
    return instance;
}
