"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiExclamation, HiX } from "react-icons/hi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const ConfirmDialog: React.FC<Props> = ({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}) => {
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="shrink-0"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <HiExclamation className="h-6 w-6 text-red-600" />
              </div>
            </motion.div>
            
            <div className="flex-1 pt-1">
              <AlertDialogTitle className="text-lg font-semibold text-slate-900">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm text-slate-600">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={confirming}
              className="hover:bg-slate-50"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          
          <motion.div
            whileHover={{ scale: confirming ? 1 : 1.02 }}
            whileTap={{ scale: confirming ? 1 : 0.98 }}
          >
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={confirming}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
              >
                {confirming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </AlertDialogAction>
          </motion.div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;