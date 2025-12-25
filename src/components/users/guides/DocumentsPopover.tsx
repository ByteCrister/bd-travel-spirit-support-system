"use client";

import { PendingGuideDocumentDTO, PendingGuideDTO } from "@/types/pendingGuide.types";
import { motion } from "framer-motion";
import { useState } from "react";
import { 
  BsFileEarmarkPdf, 
  BsFileEarmarkText, 
  BsFileEarmarkWord,
  BsImage,
  BsFileEarmarkExcel,
  BsFileEarmarkPpt
} from "react-icons/bs";
import { FiDownload } from "react-icons/fi";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { HiDocumentText } from "react-icons/hi";

// Helper function to determine file type from filename or URL
const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'unknown';
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'heic', 'heif'];
  const pdfExtensions = ['pdf'];
  const wordExtensions = ['doc', 'docx', 'odt'];
  const excelExtensions = ['xls', 'xlsx', 'csv'];
  const powerpointExtensions = ['ppt', 'pptx'];
  const textExtensions = ['txt', 'rtf', 'md'];
  
  if (imageExtensions.includes(extension)) return 'image';
  if (pdfExtensions.includes(extension)) return 'pdf';
  if (wordExtensions.includes(extension)) return 'word';
  if (excelExtensions.includes(extension)) return 'excel';
  if (powerpointExtensions.includes(extension)) return 'powerpoint';
  if (textExtensions.includes(extension)) return 'text';
  
  return 'unknown';
};

// Component for file icon based on type
const FileTypeIcon = ({ fileName, className }: { fileName: string, className?: string }) => {
  const fileType = getFileType(fileName);
  
  switch (fileType) {
    case 'image':
      return <BsImage className={className} />;
    case 'pdf':
      return <BsFileEarmarkPdf className={className} />;
    case 'word':
      return <BsFileEarmarkWord className={className} />;
    case 'excel':
      return <BsFileEarmarkExcel className={className} />;
    case 'powerpoint':
      return <BsFileEarmarkPpt className={className} />;
    case 'text':
      return <BsFileEarmarkText className={className} />;
    default:
      return <BsFileEarmarkText className={className} />;
  }
};

// Component for file type color
const getFileTypeColor = (fileName: string) => {
  const fileType = getFileType(fileName);
  
  switch (fileType) {
    case 'image':
      return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600' };
    case 'pdf':
      return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600' };
    case 'word':
      return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' };
    case 'excel':
      return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600' };
    case 'powerpoint':
      return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-100', text: 'text-gray-600' };
  }
};

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
                        Attached Files
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {documents.length} {documents.length === 1 ? 'file' : 'files'} uploaded
                    </p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                    {documents.map((doc, idx) => {
                        const fileType = getFileType(doc.fileName??"");
                        const colors = getFileTypeColor(doc.fileName??"");
                        
                        return (
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
                                <div className={`flex-shrink-0 p-2 rounded-lg ${colors.bg} border ${colors.border} group-hover:${colors.bg.replace('50', '100')} group-hover:border-${colors.text.split('-')[1]}-200 transition-colors`}>
                                    <FileTypeIcon 
                                        fileName={doc.fileName??""} 
                                        className={`h-5 w-5 ${colors.text}`}
                                    />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                        {doc.fileName}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 capitalize">
                                        {fileType} • Click to {fileType === 'image' ? 'view' : 'open'}
                                    </p>
                                </div>
                                <FiDownload className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                            </motion.button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default DocumentsPopover;