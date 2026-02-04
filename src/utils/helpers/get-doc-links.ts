/**
 * Returns the best possible "view" URL for a document.
 *
 * Goal:
 * - Open files in a new tab when possible
 * - Let the browser preview natively supported formats
 * - Use Google Docs Viewer for Office / text-based files
 * - Gracefully fall back to the original URL for unknown types
 */
export const getDocLink = (url: string) => {
  if (!url) return "#";

  const ext = url.split(".").pop()?.split(/[#?]/)[0].toLowerCase() || "";

  const imageExts = ["png","jpg","jpeg","gif","bmp","webp","tiff","svg"];
  const pdfExts = ["pdf"];
  const officeExts = ["doc","docx","xls","xlsx","ppt","pptx"];
  const textExts = ["txt","csv","md","json","xml","log"];

  // Images → open normally
  if (imageExts.includes(ext)) return url;

  // PDFs → open normally if not in raw/upload; else fallback to Google Docs Viewer
  if (pdfExts.includes(ext)) {
    if (url.includes("/raw/upload/")) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  }

  // Office / Text files → always use Google Docs Viewer
  if (officeExts.includes(ext) || textExts.includes(ext)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    // optional: Office Online Viewer
    // return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }

  // Fallback
  return url;
};

export default getDocLink;