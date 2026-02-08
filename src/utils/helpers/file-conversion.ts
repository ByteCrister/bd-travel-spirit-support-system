// src/utils/helpers/file-conversion.ts
import { DocumentDTO, ObjectIdString } from "@/types/employee/employee.types";

// Images we accept from users
export const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
] as const;

// Images that can be safely processed by canvas
export const CANVAS_COMPRESSIBLE_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "bmp",
] as const;

// Non-image but allowed files
export const DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
] as const;

// Master allow-list
export const ALLOWED_EXTENSIONS = [
  ...IMAGE_EXTENSIONS,
  ...DOCUMENT_EXTENSIONS,
] as const;

const DEFAULT_MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export type FileToBase64Options = {
  compressImages?: boolean;
  maxWidth?: number;
  quality?: number; // 0..1
  maxFileBytes?: number;
  allowedExtensions?: readonly string[];
};

/**
 * Get file extension in lowercase
 */
export function getFileExtension(fileName: string | undefined | null): string {
  if (!fileName) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

/**
 * Validate extension against allowed list
 */
export function isAllowedExtension(
  fileName: string,
  allowed: readonly string[] = ALLOWED_EXTENSIONS
): boolean {
  const ext = getFileExtension(fileName);
  return allowed.includes(ext);
}

/**
 * Compress an image File -> Blob using canvas.
 * Returns a Blob (image/jpeg) with requested quality and maxWidth.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => {
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Blob -> data URL (Base64)
 * Returns a string like "data:<mime>;base64,AAAA..."
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert a File to a Base64 data URL.
 * If the file is an image and compressImages is true, compress first.
 */
export async function fileToBase64(
  file: File,
  opts?: FileToBase64Options
): Promise<string> {
  const {
    compressImages = true,
    maxWidth = 1600,
    quality = 0.8,
    maxFileBytes = DEFAULT_MAX_FILE_BYTES,
    allowedExtensions = ALLOWED_EXTENSIONS,
  } = opts ?? {};

  if (!isAllowedExtension(file.name, allowedExtensions)) {
    throw new Error(`Unsupported file type: ${file.name}`);
  }
  if (file.size > maxFileBytes) {
    throw new Error(
      `File too large (>${Math.round(maxFileBytes / (1024 * 1024))} MB): ${file.name}`
    );
  }

  const ext = getFileExtension(file.name);
  let blobToConvert: Blob = file;

  if (compressImages &&
    (IMAGE_EXTENSIONS as readonly string[]).includes(ext)) {
    blobToConvert = await compressImageFile(file, maxWidth, quality);
  }

  return await blobToBase64(blobToConvert);
}

/**
 * Build a DocumentDTO from a File.
 * - type: file extension
 * - url: Base64 data URL (cast to ObjectIdString for compatibility with existing types)
 * - uploadedAt: ISO timestamp
 */
export async function fileToDocumentDTO(
  file: File,
  opts?: FileToBase64Options
): Promise<DocumentDTO> {
  const dataUrl = await fileToBase64(file, opts);
  const ext = getFileExtension(file.name);
  const doc: DocumentDTO = {
    type: ext,
    url: dataUrl as unknown as ObjectIdString,
    uploadedAt: new Date().toISOString(),
  };
  return doc;
}

/**
 * Convert multiple File objects (FileList or File[]) into DocumentDTO[]
 * Returns an array of DocumentDTO for successful conversions.
 * Skips invalid files and returns partial results; throws only on unexpected errors.
 */
export async function filesToDocumentDTOs(
  files: FileList | File[],
  opts?: FileToBase64Options
): Promise<DocumentDTO[]> {
  const arr = Array.from(files);
  const results: DocumentDTO[] = [];

  for (const f of arr) {
    try {
      const doc = await fileToDocumentDTO(f, opts);
      results.push(doc);
    } catch (err) {
      // swallow per-file errors; caller can show toast or handle
      console.error("fileToDocumentDTO error", f.name, err);
    }
  }

  return results;
}

/**
 * Convert a single avatar File to Base64 string for avatar storage and preview.
 * Returns the data URL string.
 */
export async function fileToAvatarBase64(
  file: File,
  opts?: FileToBase64Options
): Promise<string> {
  // reuse fileToBase64 with image compression defaults
  return await fileToBase64(file, {
    compressImages: true,
    maxWidth: 1200,
    quality: 0.8,
    ...(opts ?? {}),
  });
}


/**
 * Remove a document at a specific index from a DocumentDTO array.
 * Returns a new array (immutable) and does nothing if index is out of range.
 */
export function removeDocumentAt(docs: DocumentDTO[] | undefined, index: number): DocumentDTO[] {
  if (!docs || docs.length === 0) return [];
  if (index < 0 || index >= docs.length) return [...docs];
  const copy = docs.slice();
  copy.splice(index, 1);
  return copy;
}

/**
 * Remove documents that match a given URL (exact match).
 * Useful when you want to remove a document by its base64 data URL or asset id.
 * Returns a new array (immutable).
 */
export function removeDocumentByUrl(docs: DocumentDTO[] | undefined, urlToRemove: string): DocumentDTO[] {
  if (!docs || docs.length === 0) return [];
  return docs.filter((d) => String(d.url) !== String(urlToRemove));
}