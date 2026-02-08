import type {
    ISODateString,
    GuideBannerFormValues,
    GuideBannerFormErrors,
} from "@/types/site-settings/guide-banner-settings.types";
import { GUIDE_BANNER_CONSTRAINTS } from "@/types/site-settings/guide-banner-settings.types";

/**
 * Format ISO date string into compact readable format: YYYY-MM-DD HH:mm.
 */
export function formatISODate(date?: ISODateString): string {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildAssetSrc(asset?: string | null) {
  if (typeof asset !== "string" || asset.length === 0) return null;

  // already a data URL
  if (asset.startsWith("data:")) return asset;

  // plain http(s) url
  if (asset.startsWith("http://") || asset.startsWith("https://")) return asset;

  // heuristic: base64 blob
  const base64Candidate = asset.replace(/\s+/g, "");
  const isLikelyBase64 =
    /^[A-Za-z0-9+/=]+$/.test(base64Candidate) &&
    base64Candidate.length > 200;

  if (isLikelyBase64) {
    return `data:image/png;base64,${base64Candidate}`;
  }

  return null;
}

/**
 * Validate form against constraints. Returns a map of errors per field.
 */
export function validateForm(values: GuideBannerFormValues): GuideBannerFormErrors {
    const errors: GuideBannerFormErrors = {};
    const { alt, caption, order } = values;

    if (alt && alt.length > GUIDE_BANNER_CONSTRAINTS.altMaxLength) {
        errors.alt = `Alt exceeds ${GUIDE_BANNER_CONSTRAINTS.altMaxLength} characters`;
    }
    if (caption && caption.length > GUIDE_BANNER_CONSTRAINTS.captionMaxLength) {
        errors.caption = `Caption exceeds ${GUIDE_BANNER_CONSTRAINTS.captionMaxLength} characters`;
    }
    if (Number.isNaN(order)) {
        errors.order = "Order must be a valid number";
    } else {
        if (order < GUIDE_BANNER_CONSTRAINTS.minOrder) {
            errors.order = `Order must be >= ${GUIDE_BANNER_CONSTRAINTS.minOrder}`;
        } else if (order > GUIDE_BANNER_CONSTRAINTS.maxOrder) {
            errors.order = `Order must be <= ${GUIDE_BANNER_CONSTRAINTS.maxOrder}`;
        }
    }
    return errors;
}

/**
 * Compress an image using canvas, return base64 string, size, and mime.
 * Attempts progressive quality reduction to fit below maxBytes.
 */
export async function imageFileToCompressedBase64(
    file: File,
    maxBytes: number
): Promise<{ base64: string; size: number; mime: string }> {
    const mime = file.type || "image/jpeg";
    const blobToImage = (blob: Blob): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = (e) => {
                URL.revokeObjectURL(url);
                reject(e);
            };
            img.src = url;
        });

    // Read original file as blob -> image
    const originalImage = await blobToImage(file);

    // Create canvas with same aspect, downscale if needed
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    // Start with original size
    let width = originalImage.naturalWidth || originalImage.width;
    let height = originalImage.naturalHeight || originalImage.height;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(originalImage, 0, 0, width, height);

    // Progressive compression
    let quality = 0.92; // initial quality
    let dataUrl = canvas.toDataURL(mime, quality);
    let size = Math.ceil((dataUrl.length * 3) / 4); // approximate byte length from base64

    // If larger than maxBytes, reduce quality and optionally downscale
    let iteration = 0;
    while (size > maxBytes && iteration < 10) {
        quality = Math.max(0.4, quality - 0.1);
        // Optional small downscale step
        width = Math.max(1, Math.round(width * 0.9));
        height = Math.max(1, Math.round(height * 0.9));
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(originalImage, 0, 0, width, height);
        dataUrl = canvas.toDataURL(mime, quality);
        size = Math.ceil((dataUrl.length * 3) / 4);
        iteration += 1;
    }

    // Strip prefix to return only base64 data if needed
    const base64 = dataUrl.split(",")[1] || dataUrl;
    return { base64, size, mime };
}