// components/guide/DocumentsPopover.tsx
"use client";

import { useState } from "react";
import {
  PendingGuideDocumentDTO,
  PendingGuideDTO,
} from "@/types/guide/pendingGuide.types";
import {
  BsFileEarmarkPdf,
  BsFileEarmarkText,
  BsFileEarmarkWord,
  BsImage,
  BsFileEarmarkExcel,
  BsFileEarmarkPpt,
} from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
import { HiDocumentText } from "react-icons/hi";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "@/lib/utils";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────

const NEU_TRIGGER =
  "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl " +
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/70 " +
  "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 " +
  "transition-all duration-200";

const NEU_POPOVER_CONTENT =
  "w-80 p-0 rounded-2xl border border-white/60 bg-[#E7E5E4] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const NEU_POPOVER_HEADER =
  "px-4 py-3 border-b border-[#1E2938]/10 bg-[#E7E5E4]";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm " +
  "flex items-center gap-2";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-0.5";

const NEU_DOC_BTN =
  "w-full flex items-center gap-3 p-3 rounded-xl " +
  "text-left transition-all duration-200 group " +
  "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_ICON_WELL =
  "flex-shrink-0 p-2 rounded-lg shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";

const NEU_EMPTY =
  "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40";

// ─────────────────────────────────────────────────────────────────────────────

const getFileType = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return "unknown";
  if (
    [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "svg",
      "heic",
      "heif",
    ].includes(ext)
  )
    return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx", "odt"].includes(ext)) return "word";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["ppt", "pptx"].includes(ext)) return "powerpoint";
  if (["txt", "rtf", "md"].includes(ext)) return "text";
  return "unknown";
};

const FileTypeIcon = ({
  fileName,
  className,
}: {
  fileName: string;
  className?: string;
}) => {
  const type = getFileType(fileName);
  switch (type) {
    case "image":
      return <BsImage className={className} />;
    case "pdf":
      return <BsFileEarmarkPdf className={className} />;
    case "word":
      return <BsFileEarmarkWord className={className} />;
    case "excel":
      return <BsFileEarmarkExcel className={className} />;
    case "powerpoint":
      return <BsFileEarmarkPpt className={className} />;
    default:
      return <BsFileEarmarkText className={className} />;
  }
};

const fileTypeColors: Record<string, { bg: string; icon: string }> = {
  image: { bg: "bg-[#00A63D]/10", icon: "text-[#00A63D]" },
  pdf: { bg: "bg-[#FF2157]/10", icon: "text-[#FF2157]" },
  word: { bg: "bg-[#006666]/10", icon: "text-[#006666]" },
  excel: { bg: "bg-[#00A63D]/10", icon: "text-[#00A63D]" },
  powerpoint: { bg: "bg-[#FE9900]/10", icon: "text-[#FE9900]" },
  unknown: { bg: "bg-[#1E2938]/10", icon: "text-[#1E2938]/60" },
  text: { bg: "bg-[#1E2938]/10", icon: "text-[#1E2938]/60" },
};

const DocumentsPopover = ({
  guide,
  onOpenDocument,
}: {
  guide: PendingGuideDTO;
  onOpenDocument: (
    guide: PendingGuideDTO,
    doc: PendingGuideDocumentDTO,
  ) => void;
}) => {
  const [open, setOpen] = useState(false);
  const documents = guide.documents ?? [];

  if (documents.length === 0) {
    return (
      <span className={NEU_EMPTY} aria-label="No documents uploaded">
        No documents
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={NEU_TRIGGER}
          aria-label={`View ${documents.length} attached file${documents.length !== 1 ? "s" : ""}`}
          aria-expanded={open}
        >
          <HiDocumentText className="h-4 w-4" aria-hidden="true" />
          {documents.length} {documents.length === 1 ? "file" : "files"}
        </button>
      </PopoverTrigger>

      <PopoverContent className={NEU_POPOVER_CONTENT} align="end">
        {/* Header */}
        <div className={NEU_POPOVER_HEADER}>
          <p className={NEU_HEADING}>
            <BsFileEarmarkText
              className="h-4 w-4 text-[#006666]"
              aria-hidden="true"
            />
            Attached Files
          </p>
          <p className={NEU_MUTED}>
            {documents.length} {documents.length === 1 ? "file" : "files"}{" "}
            uploaded
          </p>
        </div>

        {/* List */}
        <ul className="p-2 max-h-64 overflow-y-auto space-y-1" role="list">
          {documents.map((doc, idx) => {
            const type = getFileType(doc.fileName ?? "");
            const colors = fileTypeColors[type] ?? fileTypeColors.unknown;

            return (
              <li key={`${idx}-${doc.fileName}`} role="listitem">
                <button
                  onClick={() => {
                    onOpenDocument(guide, doc);
                    setOpen(false);
                  }}
                  className={NEU_DOC_BTN}
                  aria-label={`Open ${doc.fileName}`}
                >
                  <div className={cn(NEU_ICON_WELL, colors.bg)}>
                    <FileTypeIcon
                      fileName={doc.fileName ?? ""}
                      className={cn("h-5 w-5", colors.icon)}
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] truncate group-hover:text-[#006666] transition-colors">
                      {doc.fileName}
                    </p>
                    <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mt-0.5 capitalize">
                      {type} · Click to open
                    </p>
                  </div>
                  <FiDownload
                    className="h-4 w-4 text-[#1E2938]/30 group-hover:text-[#006666] transition-colors flex-shrink-0"
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default DocumentsPopover;
