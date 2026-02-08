// components/guide/GuideViewer.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PendingGuideDTO, PendingGuideDocumentDTO } from "@/types/guide/pendingGuide.types";
import Image from "next/image";
import { GUIDE_DOCUMENT_TYPE } from "@/constants/guide.const";
import { useMemo } from "react";
import {
    FiDownload,
    FiMaximize2,
    FiFile,
    FiUser,
    FiCalendar,
    FiFolder
} from "react-icons/fi";
import { HiDocumentText } from "react-icons/hi";
import { cn } from "@/lib/utils";

type Props = {
    open: boolean;
    guide?: PendingGuideDTO;
    doc?: PendingGuideDocumentDTO;
    onClose: () => void;
};

export function GuideViewer({ open, guide, doc, onClose }: Props) {
    const filename = doc?.fileName || "Untitled";
    const type = doc?.fileType;

    // Convert base64 to Blob URL for non-image files
    const src = useMemo(() => {
        if (!doc?.base64Content) return undefined;

        if (type === GUIDE_DOCUMENT_TYPE.IMAGE) {
            return doc.base64Content.startsWith("http")
                ? doc.base64Content
                : `data:image/*;base64,${doc.base64Content}`;
        }

        if (doc.base64Content.startsWith("http")) {
            return doc.base64Content;
        }

        const mimeType =
            type === GUIDE_DOCUMENT_TYPE.PDF
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        const blob = new Blob(
            [Uint8Array.from(atob(doc.base64Content), (c) => c.charCodeAt(0))],
            { type: mimeType }
        );

        return URL.createObjectURL(blob);
    }, [doc?.base64Content, type]);

    const handleDownload = () => {
        if (!src) return;
        const link = document.createElement("a");
        link.href = src;
        link.download = filename;
        link.click();
    };

    if (!doc) return null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-7xl h-[95vh] p-0 gap-0 overflow-hidden">
                {/* Gradient Header */}
                <DialogHeader className="relative border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-5 space-y-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5" />

                    <div className="relative flex items-start justify-between gap-4">
                        {/* Document Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg ring-4 ring-blue-100">
                                    <HiDocumentText className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-xl font-bold text-gray-900 truncate">
                                        {filename}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                            type === GUIDE_DOCUMENT_TYPE.PDF && "bg-red-100 text-red-700",
                                            type === GUIDE_DOCUMENT_TYPE.IMAGE && "bg-green-100 text-green-700",
                                            type === GUIDE_DOCUMENT_TYPE.DOCX && "bg-blue-100 text-blue-700"
                                        )}>
                                            <FiFile className="h-3 w-3" />
                                            {type?.toUpperCase() || "FILE"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                {doc.category && (
                                    <div className="flex items-center gap-1.5">
                                        <FiFolder className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">{doc.category}</span>
                                    </div>
                                )}
                                {doc.uploadedAt && (
                                    <div className="flex items-center gap-1.5">
                                        <FiCalendar className="h-4 w-4 text-gray-400" />
                                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {guide?.name && (
                                    <div className="flex items-center gap-1.5">
                                        <FiUser className="h-4 w-4 text-gray-400" />
                                        <span>{guide.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                className="h-10 gap-2 bg-white hover:bg-gray-50 border-gray-300 shadow-sm"
                            >
                                <FiDownload className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden bg-gray-50">
                    <div className="h-full overflow-auto p-6">
                        {/* Image Preview */}
                        {type === GUIDE_DOCUMENT_TYPE.IMAGE && src && (
                            <motion.div
                                className="flex h-full items-center justify-center"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="relative max-h-full max-w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-200">
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

                        {/* PDF Preview */}
                        {type === GUIDE_DOCUMENT_TYPE.PDF && src && (
                            <motion.div
                                className="h-full w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-200"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <iframe
                                    src={src}
                                    title={filename}
                                    className="h-full w-full"
                                    aria-label="PDF document"
                                />
                            </motion.div>
                        )}

                        {/* DOCX Preview */}
                        {type === GUIDE_DOCUMENT_TYPE.DOCX && src && (
                            <motion.div
                                className="flex h-full flex-col items-center justify-center gap-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="h-full w-full overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-gray-200">
                                    <iframe
                                        className="h-full w-full"
                                        src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(src)}`}
                                        title={filename}
                                        aria-label="DOCX document"
                                    />
                                </div>
                                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                                    <p>
                                        Preview not loading?{" "}
                                        <button
                                            onClick={handleDownload}
                                            className="font-semibold underline hover:text-blue-900"
                                        >
                                            Download the file
                                        </button>
                                        {" "}instead.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* No Source */}
                        {!src && (
                            <motion.div
                                className="flex h-full flex-col items-center justify-center gap-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gray-400/20 rounded-full blur-2xl" />
                                    <div className="relative bg-gray-100 p-8 rounded-full">
                                        <FiFile className="h-20 w-20 text-gray-400" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                        Document Unavailable
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        The document source could not be loaded.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer with Additional Actions */}
                <div className="border-t border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <FiMaximize2 className="h-3.5 w-3.5" />
                            <span>Press ESC to close</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {src && (
                                <a
                                    href={src}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    Open in new tab
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}