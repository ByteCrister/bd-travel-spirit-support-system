// components/GuideSubscriptions/ConfirmDeleteDialog.tsx
"use client";
import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";

export interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  keyName: string;
  price?: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  title,
  keyName,
  price,
  onConfirm,
  onCancel,
  loading,
}) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Trash2 size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <span>Delete Subscription Tier</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="border-red-200 dark:border-red-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. This will permanently delete the subscription tier.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Title</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Key</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white mt-1">{keyName}</p>
            </div>
            {price != null && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Price</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">${price}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            className="gap-2"
          >
            <X size={16} />
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Trash2 size={16} />
                </motion.div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Tier
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};