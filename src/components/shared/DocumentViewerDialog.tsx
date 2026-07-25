"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiDownload, FiFile, FiFolder, FiCalendar } from "react-icons/fi";
import { HiDocumentText } from "react-icons/hi";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Neu-morphic styles
const NEU_DIALOG_CONTENT =
  "border-[#E7E5E4] bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] sm:max-w-4xl p-0 overflow-hidden flex flex-col h-[90vh] md:h-[85vh]";
const NEU_HEADER = "border-b border-[#1E2938]/5 bg-[#E7E5E4]/50 p-5";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]";
const NEU_ICON_WELL =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_GHOST =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-[#1E2938]/70 hover:text-[#1E2938] hover:bg-[#1E2938]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#006666]/20";
const NEU_CONTENT_AREA = "flex-1 overflow-hidden bg-[#E7E5E4]/30";
const NEU_VIEWER_FRAME =
  "rounded-2xl border border-white/60 bg-[#E7E5E4] p-2 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

export interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  url: string;
  filename?: string;
  type?: string; // extension or mime type
  uploadedAt?: string;
}

export function DocumentViewerDialog({
  open,
  onClose,
  url,
  filename = "Document",
  type = "",
  uploadedAt,
}: DocumentViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    // If it's a data URI, convert to blob URL for better handling
    if (open && url?.startsWith("data:")) {
      try {
        const match = url.match(/^data:(.*?);base64,(.*)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
          
          return () => {
            URL.revokeObjectURL(objectUrl);
          };
        }
      } catch (e) {
        console.error("Failed to parse base64 data url", e);
      }
    }
  }, [open, url]);

  if (!url) return null;

  const activeSrc = url.startsWith("data:") ? blobUrl : url;

  // Determine actual type for display
  const lowerType = type.toLowerCase();
  const isImage =
    lowerType.includes("image") ||
    lowerType.match(/^(jpg|jpeg|png|gif|webp|svg)$/) ||
    url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
  const isPdf = lowerType.includes("pdf") || lowerType === "pdf" || url.match(/\.pdf$/i);
  const isDocx =
    lowerType.includes("wordprocessingml") ||
    lowerType.match(/^(doc|docx)$/) || url.match(/\.(doc|docx)$/i);

  const handleDownload = () => {
    if (!activeSrc) return;
    const a = document.createElement("a");
    a.href = activeSrc;
    a.download = filename;
    a.click();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={NEU_DIALOG_CONTENT}>
        {/* Header */}
        <DialogHeader className={cn(NEU_HEADER, "space-y-0")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={NEU_ICON_WELL}>
                <HiDocumentText className="h-6 w-6 text-[#006666]" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className={NEU_HEADING}>{filename}</DialogTitle>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {type && (
                    <span className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938]/60">
                      <FiFile className="h-3 w-3" />
                      {type.toUpperCase().replace("IMAGE/", "")}
                    </span>
                  )}
                  {uploadedAt && (
                    <span className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-jetbrains-mono)] font-bold text-[#1E2938]/60">
                      <FiCalendar className="h-3.5 w-3.5" />
                      {new Date(uploadedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className={NEU_BTN_GHOST}
              aria-label={`Download ${filename}`}
            >
              <FiDownload className="h-4 w-4" />
              Download
            </button>
          </div>
        </DialogHeader>

        {/* Viewer */}
        <div className={NEU_CONTENT_AREA}>
          <div className="h-full overflow-auto p-5">
            {isImage && activeSrc && (
              <motion.div
                className="flex h-full items-center justify-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className={cn(NEU_VIEWER_FRAME, "overflow-hidden max-h-full max-w-full w-fit")}>
                  <Image
                    src={activeSrc}
                    alt={filename}
                    className="max-h-full max-w-full object-contain"
                    width={1920}
                    height={1080}
                    unoptimized
                  />
                </div>
              </motion.div>
            )}

            {isPdf && activeSrc && (
              <motion.div
                className={cn(NEU_VIEWER_FRAME, "h-full w-full")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <iframe
                  src={activeSrc}
                  title={filename}
                  className="h-full w-full"
                  aria-label="PDF document viewer"
                />
              </motion.div>
            )}

            {isDocx && activeSrc && (
              <motion.div
                className="flex h-full flex-col items-center gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {activeSrc.startsWith("http") && !activeSrc.includes("localhost") ? (
                  <div className={cn(NEU_VIEWER_FRAME, "h-full w-full")}>
                    <iframe
                      className="h-full w-full"
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                        activeSrc
                      )}`}
                      title={filename}
                      aria-label="DOCX document viewer"
                    />
                  </div>
                ) : (
                  <div className="m-auto text-center p-8 bg-[#E7E5E4] rounded-2xl shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]">
                    <FiFile className="mx-auto h-12 w-12 text-[#1E2938]/30 mb-4" />
                    <p className="text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] mb-2">
                      Local DOCX Preview Unavailable
                    </p>
                    <p className="text-xs text-[#1E2938]/60 mb-6 max-w-sm">
                      DOCX previews require a public URL to be rendered by Microsoft Office Viewer. Since this file hasn't been uploaded yet, please download it to view.
                    </p>
                    <button
                      onClick={handleDownload}
                      className="bg-[#006666] text-white px-6 py-2.5 rounded-xl font-bold font-[family-name:var(--font-space-mono)] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] hover:bg-[#007777] transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {!isImage && !isPdf && !isDocx && activeSrc && (
              <motion.div
                className="flex h-full flex-col items-center justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center p-8 bg-[#E7E5E4] rounded-2xl shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]">
                  <FiFile className="mx-auto h-12 w-12 text-[#1E2938]/30 mb-4" />
                  <p className="text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] mb-2">
                    Preview not available
                  </p>
                  <p className="text-xs text-[#1E2938]/60 mb-6 max-w-sm">
                    No native viewer is available for this file type ({type}). You can download the file to view it on your device.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="bg-[#006666] text-white px-6 py-2.5 rounded-xl font-bold font-[family-name:var(--font-space-mono)] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] hover:bg-[#007777] transition-colors"
                  >
                    Download File
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
