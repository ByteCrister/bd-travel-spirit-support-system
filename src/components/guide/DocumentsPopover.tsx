"use client";
import { PendingGuideDocumentDTO, PendingGuideDTO } from "@/types/pendingGuide.types";
import { motion } from "framer-motion";
import { useState } from "react";
import { BsFileEarmarkPdf, BsFileEarmarkText } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { HiDocumentText } from "react-icons/hi";

const DocumentsPopover = ({
    guide,
    onOpenDocument
}: {
    guide: PendingGuideDTO;
    onOpenDocument: (guide: PendingGuideDTO, doc: PendingGuideDocumentDTO) => void;
}) => {
    const [open, setOpen] = useState(false);
    const documents = guide.documents || [];

    if (documents.length === 0) {
        return (
            <div className="flex items-center justify-center">
                <span className="text-xs text-gray-400">No documents</span>
            </div>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all">
                    <HiDocumentText className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                        {documents.length} {documents.length === 1 ? 'file' : 'files'}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <BsFileEarmarkText className="h-4 w-4 text-gray-500" />
                        Attached Documents
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {documents.length} {documents.length === 1 ? 'document' : 'documents'} uploaded
                    </p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                    {documents.map((doc, idx) => (
                        <motion.button
                            key={`${idx}-${doc.fileName}`}
                            onClick={() => {
                                onOpenDocument(guide, doc);
                                setOpen(false);
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 border border-blue-100 group-hover:bg-blue-100 group-hover:border-blue-200 transition-colors">
                                <BsFileEarmarkPdf className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                    {doc.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Click to view
                                </p>
                            </div>
                            <FiDownload className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                        </motion.button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default DocumentsPopover;