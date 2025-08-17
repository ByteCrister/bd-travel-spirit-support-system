'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useClickAway } from 'react-use';
import {  Copy as CopyIcon, Trash2 } from 'lucide-react';

interface ContextMenuPopoverProps {
    isOpen: boolean;
    anchorPosition: { x: number; y: number } | null;
    canDelete: boolean;
    onClose: () => void;
    onDelete: () => void;
    onReply: () => void;
    onCopy: () => void;
}

export default function ContextMenuPopover({
    isOpen,
    anchorPosition,
    canDelete,
    onClose,
    onDelete,
    onCopy,
}: ContextMenuPopoverProps) {
    const ref = React.useRef<HTMLDivElement>(null);

    // click outside → close
    useClickAway(ref, onClose);

    // escape → close
    React.useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // if we're closed or have no coords, render nothing
    if (!isOpen || !anchorPosition) return null;

    return (
        <div
            ref={ref}
            style={{
                position: 'fixed',
                top: anchorPosition.y,
                left: anchorPosition.x,
                zIndex: 9999,
            }}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
        >
            <motion.ul
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="divide-y divide-gray-100 w-44"
            >
               
                <li
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center gap-2"
                    onClick={() => {
                        onCopy();
                        onClose();
                    }}
                >
                    <CopyIcon className="w-4 h-4" />
                    <span>Copy</span>
                </li>

                {canDelete && (
                    <li
                        className="px-4 py-2 hover:bg-red-50 cursor-pointer text-red-600 flex items-center gap-2"
                        onClick={() => {
                            onDelete();
                            onClose();
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </li>
                )}
            </motion.ul>
        </div>
    );
}
