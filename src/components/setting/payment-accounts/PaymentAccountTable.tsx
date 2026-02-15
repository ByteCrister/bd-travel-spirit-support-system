"use client";

import { PaymentAccount } from "@/types/site-settings/stripe-payment-account.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Edit, 
  Trash2, 
  CreditCard, 
  Shield, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { EditPaymentAccountDialog } from "./EditPaymentAccountDialog";
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
import { usePaymentAccountStore } from "@/store/site-settings/strip-payment-account.store";
import { jakarta } from "@/styles/fonts";

interface Props {
  accounts: PaymentAccount[];
}

// Animation variants
const rowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }),
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 }
  }
};

const getBrandColor = (brand?: string) => {
  const colors: Record<string, string> = {
    visa: "bg-blue-100 text-blue-700 border-blue-200",
    mastercard: "bg-orange-100 text-orange-700 border-orange-200",
    amex: "bg-cyan-100 text-cyan-700 border-cyan-200",
    discover: "bg-amber-100 text-amber-700 border-amber-200",
    default: "bg-slate-100 text-slate-700 border-slate-200"
  };
  return colors[brand?.toLowerCase() || "default"] || colors.default;
};

const getOwnerTypeColor = (ownerType: string) => {
  const colors: Record<string, string> = {
    personal: "bg-emerald-100 text-emerald-700 border-emerald-200",
    business: "bg-indigo-100 text-indigo-700 border-indigo-200",
    default: "bg-slate-100 text-slate-700 border-slate-200"
  };
  return colors[ownerType?.toLowerCase()] || colors.default;
};

export function PaymentAccountTable({ accounts }: Props) {
  const { setActive, setBackup, deleteAccount } = usePaymentAccountStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const formatExpiry = (expMonth?: number, expYear?: number) => {
    if (!expMonth || !expYear) return "N/A";
    return `${expMonth.toString().padStart(2, "0")}/${expYear.toString().slice(-2)}`;
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAccount(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className={`overflow-hidden ${jakarta.className}`}>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              <TableHead className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  Card Details
                </div>
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Label
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Owner Type
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Purpose
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  Active
                </div>
              </TableHead>
              <TableHead className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Backup
              </TableHead>
              <TableHead className="text-right font-bold text-slate-900 text-xs uppercase tracking-wider">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {accounts.map((account, index) => (
                <motion.tr
                  key={account.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200"
                  layout
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      {account.card?.brand && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge 
                            variant="outline" 
                            className={`${getBrandColor(account.card.brand)} border font-semibold uppercase text-xs px-2.5 py-0.5`}
                          >
                            {account.card.brand}
                          </Badge>
                        </motion.div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">
                          •••• {account.card?.last4}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>Expires {formatExpiry(
                            account.card?.expMonth,
                            account.card?.expYear,
                          )}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-medium text-slate-900">
                      {account.label || <span className="text-slate-400">—</span>}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge 
                      variant="secondary" 
                      className={`${getOwnerTypeColor(account.ownerType)} border font-semibold capitalize`}
                    >
                      {account.ownerType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-slate-700 font-medium capitalize">
                      {account.purpose}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Switch
                        checked={account.isActive}
                        onCheckedChange={(checked) =>
                          setActive(account.id, checked)
                        }
                        className="data-[state=checked]:bg-slate-900"
                      />
                    </motion.div>
                  </TableCell>
                  <TableCell className="py-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Switch
                        checked={account.isBackup}
                        onCheckedChange={(checked) =>
                          setBackup(account.id, checked)
                        }
                        className="data-[state=checked]:bg-slate-900"
                      />
                    </motion.div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-1.5">
                      <EditPaymentAccountDialog account={account}>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-slate-100 hover:text-slate-900 transition-colors group"
                          >
                            <Edit className="h-4 w-4 text-slate-600 group-hover:text-slate-900" />
                          </Button>
                        </motion.div>
                      </EditPaymentAccountDialog>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(account.id)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors group"
                        >
                          <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-600" />
                        </Button>
                      </motion.div>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className={`${jakarta.className} border-slate-200 shadow-xl`}>
          <AlertDialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center"
            >
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </motion.div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 text-center">
              Delete Payment Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-center leading-relaxed">
              This action cannot be undone. This will permanently delete the
              payment account from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto border-slate-300 hover:bg-slate-50 font-semibold">
              Cancel
            </AlertDialogCancel>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <AlertDialogAction 
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg shadow-red-600/20"
              >
                Delete Account
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}