"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, RotateCcw, AlertTriangle, CheckCircle2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (s: boolean) => void;
  onConfirm: (reason: string) => void | Promise<void>;
  mode: "delete" | "restore";
  employeeName: string;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  employeeName,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const validateReason = (value: string): string => {
    if (!value.trim()) return "Reason is required";
    if (value.trim().length < 10)
      return "Reason must be at least 10 characters";
    if (value.trim().length > 500)
      return "Reason must be less than 500 characters";
    return "";
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    if (touched) {
      setError(validateReason(value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateReason(reason));
  };

  const resetForm = () => {
    setReason("");
    setError("");
    setTouched(false);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    setTouched(true);

    const validationError = validateReason(reason);
    if (mode === "delete" && validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await onConfirm(reason.trim());
      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error(`${mode} failed:`, err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const config = {
    delete: {
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Delete Employee Record?",
      description:
        "This will soft delete the employee record. The record can be restored later if needed.",
      infoBg: "bg-amber-50 border-amber-200",
      infoText: "text-amber-800",
      buttonBg: "bg-red-600 hover:bg-red-700 disabled:bg-red-300",
      buttonIcon: Flame,
      buttonText: "Delete Record",
      loadingText: "Deleting...",
      placeholder: "Enter reason for deletion (minimum 10 characters)...",
    },
    restore: {
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Restore Employee Record?",
      description:
        "This will restore the employee record and make it active again in the system.",
      infoBg: "bg-green-50 border-green-200",
      infoText: "text-green-800",
      buttonBg: "bg-green-600 hover:bg-green-700 disabled:bg-green-300",
      buttonIcon: RotateCcw,
      buttonText: "Restore Record",
      loadingText: "Restoring...",
      placeholder: "Enter reason for restoration (minimum 10 characters)...",
    },
  };

  const current = config[mode];
  const Icon = current.icon;
  const ButtonIcon = current.buttonIcon;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              <AlertDialogHeader>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className={`mx-auto mb-4 w-16 h-16 rounded-full ${current.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`h-8 w-8 ${current.iconColor}`} />
                </motion.div>

                <AlertDialogTitle className="text-center text-xl">
                  {current.title}
                </AlertDialogTitle>

                <AlertDialogDescription asChild>
                  <div className="space-y-3 text-center">
                    <span className="text-muted-foreground">
                      {current.description}
                    </span>

                    {employeeName && (
                      <div
                        className={`mt-3 p-3 ${current.infoBg} rounded-lg border`}
                      >
                        <div
                          className={`text-sm ${current.infoText} font-medium`}
                        >
                          Employee: {employeeName}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              {mode === 'delete' && (<div className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Reason *
                  </label>

                  <textarea
                    id="reason"
                    value={reason}
                    onChange={handleReasonChange}
                    onBlur={handleBlur}
                    placeholder={current.placeholder}
                    rows={4}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${error && touched
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                      } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />

                  <div className="flex justify-between mt-1">
                    {error && touched && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                    <p
                      className={`text-sm ml-auto ${reason.length > 500
                          ? "text-red-600"
                          : "text-gray-500"
                        }`}
                    >
                      {reason.length}/500
                    </p>
                  </div>
                </div>
              </div>)}


              <AlertDialogFooter className="sm:flex-row sm:justify-center gap-2 mt-6">
                <AlertDialogCancel
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </AlertDialogCancel>

                {/* IMPORTANT: normal submit button, not AlertDialogAction */}
                <button
                  type="submit"
                  disabled={isLoading || !!error}
                  className={`${current.buttonBg} text-white sm:w-auto inline-flex items-center justify-center rounded-md px-4 py-2`}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      {current.loadingText}
                    </>
                  ) : (
                    <>
                      <ButtonIcon className="mr-2 h-4 w-4" />
                      {current.buttonText}
                    </>
                  )}
                </button>
              </AlertDialogFooter>
            </form>
          </motion.div>
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  );
}