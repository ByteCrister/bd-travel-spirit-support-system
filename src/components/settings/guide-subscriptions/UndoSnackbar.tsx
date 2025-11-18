// components/shared/Toast/UndoSnackbar.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, X } from "lucide-react";

export interface UndoSnackbarProps {
  message: string;
  onUndo?: () => Promise<void> | void;
  timeoutMs?: number;
  actionLabel?: string;
}

export const UndoSnackbar: React.FC<UndoSnackbarProps> = ({ 
  message, 
  onUndo, 
  timeoutMs = 6000, 
  actionLabel = "Undo" 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), timeoutMs);
    return () => clearTimeout(t);
  }, [timeoutMs]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl bg-gray-900 dark:bg-gray-800 border border-gray-700 backdrop-blur-sm">
          <p className="text-sm text-white font-medium">{message}</p>
          <div className="flex items-center gap-2">
            {onUndo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onUndo();
                  setVisible(false);
                }}
                className="gap-2 hover:bg-gray-700 text-white"
              >
                <Undo2 size={16} />
                {actionLabel}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVisible(false)}
              className="h-8 w-8 p-0 hover:bg-gray-700 text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
