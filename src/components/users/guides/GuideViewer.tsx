// components/guide/GuideViewer.tsx
"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PendingGuideDTO,
  PendingGuideDocumentDTO,
} from "@/types/guide/pendingGuide.types";
import Image from "next/image";
import { GUIDE_DOCUMENT_TYPE } from "@/constants/guide.const";
import { useMemo } from "react";
import {
  FiDownload,
  FiMaximize2,
  FiFile,
  FiUser,
  FiCalendar,
  FiFolder,
} from "react-icons/fi";
import { HiDocumentText } from "react-icons/hi";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_DIALOG_CONTENT =
  "max-w-7xl h-[95vh] p-0 gap-0 overflow-hidden rounded-2xl " +
  "border border-white/60 bg-[#E7E5E4] " +
  "shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff]";

const NEU_HEADER = "border-b border-[#1E2938]/10 bg-[#E7E5E4] px-6 py-5";

const NEU_ICON_WELL =
  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl " +
  "bg-[#006666]/10 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const NEU_HEADING =
  "text-xl font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight truncate";

const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_META =
  "flex items-center gap-1.5 text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/60";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm h-10 " +
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "transition-all duration-200";

const NEU_CONTENT_AREA =
  "flex-1 overflow-hidden bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const NEU_VIEWER_FRAME =
  "h-full w-full overflow-hidden rounded-xl border border-white/60 bg-white " +
  "shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]";

const NEU_FOOTER =
  "border-t border-[#1E2938]/10 bg-[#E7E5E4] px-6 py-3 flex items-center justify-between";

const NEU_FOOTER_MUTED =
  "flex items-center gap-2 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40";

const NEU_LINK =
  "text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#006666] " +
  "hover:underline transition-colors";

// Badge colors per type
const typeBadge: Record<string, string> = {
  [GUIDE_DOCUMENT_TYPE.PDF]: "bg-[#FF2157]/10 text-[#FF2157]",
  [GUIDE_DOCUMENT_TYPE.IMAGE]: "bg-[#00A63D]/10 text-[#00A63D]",
  [GUIDE_DOCUMENT_TYPE.DOCX]: "bg-[#006666]/10 text-[#006666]",
};

// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  guide?: PendingGuideDTO;
  doc?: PendingGuideDocumentDTO;
  onClose: () => void;
};

export function GuideViewer({ open, guide, doc, onClose }: Props) {
  const filename = doc?.fileName || "Untitled";
  const type = doc?.fileType;

  const src = useMemo(() => {
    if (!doc?.base64Content) return undefined;

    if (type === GUIDE_DOCUMENT_TYPE.IMAGE) {
      return doc.base64Content.startsWith("http")
        ? doc.base64Content
        : `data:image/*;base64,${doc.base64Content}`;
    }

    if (doc.base64Content.startsWith("http")) return doc.base64Content;

    const mimeType =
      type === GUIDE_DOCUMENT_TYPE.PDF
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const blob = new Blob(
      [Uint8Array.from(atob(doc.base64Content), (c) => c.charCodeAt(0))],
      { type: mimeType },
    );
    return URL.createObjectURL(blob);
  }, [doc?.base64Content, type]);

  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = filename;
    a.click();
  };

  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={NEU_DIALOG_CONTENT}>
        {/* Header */}
        <DialogHeader className={cn(NEU_HEADER, "space-y-0")}>
          <div className="flex items-start justify-between gap-4">
            {/* Doc Info */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={NEU_ICON_WELL}>
                <HiDocumentText
                  className="h-6 w-6 text-[#006666]"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className={NEU_HEADING}>{filename}</DialogTitle>

                {/* Type badge + meta */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {type && (
                    <span
                      className={cn(
                        NEU_BADGE,
                        typeBadge[type] ?? "bg-[#1E2938]/10 text-[#1E2938]/60",
                      )}
                    >
                      <FiFile className="h-3 w-3" aria-hidden="true" />
                      {type.toUpperCase()}
                    </span>
                  )}
                  {doc.category && (
                    <span className={NEU_META}>
                      <FiFolder
                        className="h-3.5 w-3.5 text-[#1E2938]/40"
                        aria-hidden="true"
                      />
                      {doc.category}
                    </span>
                  )}
                  {doc.uploadedAt && (
                    <span className={NEU_META}>
                      <FiCalendar
                        className="h-3.5 w-3.5 text-[#1E2938]/40"
                        aria-hidden="true"
                      />
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  )}
                  {guide?.name && (
                    <span className={NEU_META}>
                      <FiUser
                        className="h-3.5 w-3.5 text-[#1E2938]/40"
                        aria-hidden="true"
                      />
                      {guide.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleDownload}
              className={NEU_BTN_GHOST}
              aria-label={`Download ${filename}`}
            >
              <FiDownload className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
          </div>
        </DialogHeader>

        {/* Viewer */}
        <div className={NEU_CONTENT_AREA}>
          <div className="h-full overflow-auto p-5">
            {/* Image */}
            {type === GUIDE_DOCUMENT_TYPE.IMAGE && src && (
              <motion.div
                className="flex h-full items-center justify-center"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 }}
              >
                <div
                  className={cn(
                    NEU_VIEWER_FRAME,
                    "overflow-hidden max-h-full max-w-full w-fit",
                  )}
                >
                  <Image
                    src={src}
                    alt={filename}
                    className="max-h-full max-w-full object-contain"
                    width={1920}
                    height={1080}
                    unoptimized
                  />
                </div>
              </motion.div>
            )}

            {/* PDF */}
            {type === GUIDE_DOCUMENT_TYPE.PDF && src && (
              <motion.div
                className={cn(NEU_VIEWER_FRAME, "h-full w-full")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <iframe
                  src={src}
                  title={filename}
                  className="h-full w-full"
                  aria-label="PDF document viewer"
                />
              </motion.div>
            )}

            {/* DOCX */}
            {type === GUIDE_DOCUMENT_TYPE.DOCX && src && (
              <motion.div
                className="flex h-full flex-col items-center gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <div className={cn(NEU_VIEWER_FRAME, "h-full w-full")}>
                  <iframe
                    className="h-full w-full"
                    src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(src)}`}
                    title={filename}
                    aria-label="DOCX document viewer"
                  />
                </div>
                <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50">
                  Preview not loading?{" "}
                  <button
                    onClick={handleDownload}
                    className="font-[family-name:var(--font-space-mono)] font-bold text-[#006666] underline hover:text-[#007777]"
                  >
                    Download the file
                  </button>{" "}
                  instead.
                </p>
              </motion.div>
            )}

            {/* No Source */}
            {!src && (
              <motion.div
                className="flex h-full flex-col items-center justify-center gap-4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="p-8 rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
                  <FiFile
                    className="h-16 w-16 text-[#1E2938]/20"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-center">
                  <h4 className="text-base font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] mb-1">
                    Document Unavailable
                  </h4>
                  <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50">
                    The document source could not be loaded.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={NEU_FOOTER}>
          <span className={NEU_FOOTER_MUTED}>
            <FiMaximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            Press ESC to close
          </span>
          {src && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className={NEU_LINK}
              aria-label="Open document in new tab"
            >
              Open in new tab ↗
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
