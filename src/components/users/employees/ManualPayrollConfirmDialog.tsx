"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, CheckCircle2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmployeeListItemDTO } from "@/types/employee/employee.types";
import { sumPayrollAmount } from "@/utils/helpers/manual-payroll.helpers";

const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl border-none";

const NEU_BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm sm:w-auto " +
  "font-[family-name:var(--font-space-mono)] px-4 py-2 " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-1.5 rounded-xl bg-[#006666] text-white text-sm sm:w-auto " +
  "font-[family-name:var(--font-space-mono)] font-bold px-4 py-2 " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
  "hover:bg-[#007777] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200";

const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

interface ManualPayrollConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeListItemDTO[];
  onConfirm: (manualReference?: string) => Promise<void>;
}

export default function ManualPayrollConfirmDialog({
  open,
  onOpenChange,
  employees,
  onConfirm,
}: ManualPayrollConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [manualReference, setManualReference] = useState("");

  const { total, currency } = sumPayrollAmount(employees);
  const isBulk = employees.length > 1;

  const reset = () => {
    setManualReference("");
    setIsLoading(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    reset();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(manualReference.trim() || undefined);
      onOpenChange(false);
      reset();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleCancel();
      }}
    >
      <AlertDialogContent className="sm:max-w-lg rounded-2xl bg-[#E7E5E4] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-white/60 p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
            >
              <div className="p-6 space-y-5">
                <AlertDialogHeader>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-2 w-14 h-14 rounded-2xl bg-[#006666]/10 flex items-center justify-center shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]"
                  >
                    <Banknote className="h-7 w-7 text-[#006666]" />
                  </motion.div>

                  <AlertDialogTitle className={`text-center text-lg ${NEU_HEADING}`}>
                    {isBulk ? `Confirm Manual Payroll (${employees.length})` : "Confirm Manual Payroll"}
                  </AlertDialogTitle>

                  <AlertDialogDescription asChild>
                    <div className="space-y-3 text-center">
                      <span className={NEU_MUTED}>
                        {isBulk
                          ? "You are about to mark salary as paid for the selected manual employees."
                          : "You are about to mark this employee's salary as paid in cash or bank transfer."}
                      </span>

                      <div className="mt-2 p-4 rounded-xl bg-[#006666]/5 border border-[#006666]/20 text-left space-y-2">
                        <p className={`text-sm ${NEU_HEADING}`}>
                          Total: {currency} {total.toLocaleString()}
                        </p>
                        <div className="max-h-36 overflow-y-auto space-y-1">
                          {employees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center justify-between text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/80"
                            >
                              <span className="truncate pr-2">{emp.user.name}</span>
                              <span className="shrink-0">
                                {emp.currency} {emp.salary.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                  <label htmlFor="manualReference" className={NEU_LABEL}>
                    Reference (optional)
                  </label>
                  <input
                    id="manualReference"
                    type="text"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    placeholder="Receipt #, bKash trx ID, etc."
                    disabled={isLoading}
                    className={`w-full h-10 px-3 ${NEU_SURFACE_INSET} text-[#1E2938] font-[family-name:var(--font-jetbrains-mono)] text-sm placeholder:text-[#1E2938]/40 focus:outline-none focus:ring-2 focus:ring-[#006666]/50 disabled:opacity-50`}
                  />
                </div>
              </div>

              <AlertDialogFooter className="px-6 pb-6 sm:flex-row sm:justify-center gap-2">
                <AlertDialogCancel
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={NEU_BTN_GHOST}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </AlertDialogCancel>

                <button
                  type="submit"
                  disabled={isLoading || employees.length === 0}
                  className={NEU_BTN_PRIMARY}
                >
                  {isLoading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                      />
                      Processing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirm Payment
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
