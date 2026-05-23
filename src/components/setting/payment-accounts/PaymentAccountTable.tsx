// components/PaymentAccounts/PaymentAccountTable.tsx
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
import {
  Edit,
  Trash2,
  CreditCard,
  Shield,
  Calendar,
  AlertTriangle,
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
import { Switch } from "@/components/ui/switch";
import { usePaymentAccountStore } from "@/store/site-settings/strip-payment-account.store";

// ── Neumorphism style tokens ──────────────────────────────────
const TABLE_CARD =
  "rounded-2xl bg-[#E7E5E4] border border-white/60 overflow-hidden " +
  "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";

const TABLE_HEAD_ROW = "border-b border-[#1E2938]/08 hover:bg-transparent";

const TH =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-widest text-[#1E2938]/55 py-3.5";

const TABLE_BODY_ROW =
  "border-b border-[#1E2938]/06 hover:bg-white/30 transition-colors duration-150";

const CARD_KEY =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm";

const CARD_EXPIRY =
  "flex items-center gap-1.5 text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/45 mt-0.5";

const LABEL_TEXT =
  "font-[family-name:var(--font-jetbrains-mono)] font-medium text-[#1E2938] text-sm";

const LABEL_EMPTY =
  "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/30 text-sm";

const PURPOSE_TEXT =
  "font-[family-name:var(--font-jetbrains-mono)] font-medium text-[#1E2938]/70 text-sm capitalize";

const BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-none " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";

const BTN_ICON_DELETE =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] border-none " +
  "hover:text-[#FF2157] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200";

// Brand badge colors
const BRAND_COLORS: Record<string, string> = {
  visa: "bg-blue-500/10 text-blue-700 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  mastercard: "bg-orange-500/10 text-orange-700 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  amex: "bg-cyan-500/10 text-cyan-700 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  discover: "bg-amber-500/10 text-amber-700 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  default: "bg-[#1E2938]/08 text-[#1E2938]/60 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
};

const OWNER_COLORS: Record<string, string> = {
  personal: "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  business: "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
  default: "bg-[#1E2938]/08 text-[#1E2938]/50 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]",
};

const NEU_BADGE_BASE =
  "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold uppercase";

// Alert Dialog styles
const ALERT_CONTENT =
  "bg-[#E7E5E4] border border-white/60 rounded-2xl " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const ALERT_TITLE =
  "font-[family-name:var(--font-space-mono)] font-bold text-xl text-[#1E2938] text-center";

const ALERT_DESC =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/55 text-center leading-relaxed";

const ALERT_ICON_WELL =
  "mx-auto w-16 h-16 mb-4 rounded-2xl flex items-center justify-center " +
  "bg-[#FF2157]/10 shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]";

const BTN_ALERT_CANCEL =
  "w-full sm:w-auto h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border-none " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";

const BTN_ALERT_DELETE =
  "w-full sm:w-auto h-11 rounded-xl bg-[#FF2157] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#c8c6c5,-2px_-2px_6px_#ffffff] border-none " +
  "hover:bg-[#e01f4f] transition-all duration-200";
// ─────────────────────────────────────────────────────────────

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: "spring", stiffness: 120, damping: 18 },
  }),
  exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
};

const getBrandStyle = (brand?: string) =>
  BRAND_COLORS[brand?.toLowerCase() ?? "default"] ?? BRAND_COLORS.default;

const getOwnerStyle = (ownerType: string) =>
  OWNER_COLORS[ownerType?.toLowerCase()] ?? OWNER_COLORS.default;

interface Props {
  accounts: PaymentAccount[];
}

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
      <div className={TABLE_CARD}>
        <Table>
          <TableHeader>
            <TableRow className={TABLE_HEAD_ROW}>
              <TableHead className={TH}>
                <span className="flex items-center gap-2">
                  <CreditCard size={14} />
                  Card Details
                </span>
              </TableHead>
              <TableHead className={TH}>Label</TableHead>
              <TableHead className={TH}>Owner Type</TableHead>
              <TableHead className={TH}>Purpose</TableHead>
              <TableHead className={TH}>
                <span className="flex items-center gap-2">
                  <Shield size={14} />
                  Active
                </span>
              </TableHead>
              <TableHead className={TH}>Backup</TableHead>
              <TableHead className={`${TH} text-right`}>Actions</TableHead>
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
                  layout
                  className={TABLE_BODY_ROW}
                >
                  {/* Card Details */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      {account.card?.brand && (
                        <span className={`${NEU_BADGE_BASE} ${getBrandStyle(account.card.brand)}`}>
                          {account.card.brand}
                        </span>
                      )}
                      <div>
                        <p className={CARD_KEY}>•••• {account.card?.last4}</p>
                        <div className={CARD_EXPIRY}>
                          <Calendar size={12} />
                          Expires {formatExpiry(account.card?.expMonth, account.card?.expYear)}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Label */}
                  <TableCell className="py-4">
                    {account.label
                      ? <span className={LABEL_TEXT}>{account.label}</span>
                      : <span className={LABEL_EMPTY}>—</span>
                    }
                  </TableCell>

                  {/* Owner Type */}
                  <TableCell className="py-4">
                    <span className={`${NEU_BADGE_BASE} ${getOwnerStyle(account.ownerType)}`}>
                      {account.ownerType}
                    </span>
                  </TableCell>

                  {/* Purpose */}
                  <TableCell className="py-4">
                    <span className={PURPOSE_TEXT}>{account.purpose}</span>
                  </TableCell>

                  {/* Active */}
                  <TableCell className="py-4">
                    <Switch
                      checked={account.isActive}
                      onCheckedChange={(checked) => setActive(account.id, checked)}
                      className="data-[state=checked]:bg-[#006666]"
                    />
                  </TableCell>

                  {/* Backup */}
                  <TableCell className="py-4">
                    <Switch
                      checked={account.isBackup}
                      onCheckedChange={(checked) => setBackup(account.id, checked)}
                      className="data-[state=checked]:bg-[#006666]"
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <EditPaymentAccountDialog account={account}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.93 }}
                          className={BTN_ICON}
                          aria-label="Edit account"
                        >
                          <Edit size={15} />
                        </motion.button>
                      </EditPaymentAccountDialog>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setDeleteId(account.id)}
                        className={BTN_ICON_DELETE}
                        aria-label="Delete account"
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className={ALERT_CONTENT}>
          <AlertDialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className={ALERT_ICON_WELL}
            >
              <AlertTriangle size={28} className="text-[#FF2157]" />
            </motion.div>
            <AlertDialogTitle className={ALERT_TITLE}>
              Delete Payment Account?
            </AlertDialogTitle>
            <AlertDialogDescription className={ALERT_DESC}>
              This action cannot be undone. The payment account will be permanently deleted from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <AlertDialogCancel className={BTN_ALERT_CANCEL}>
              Cancel
            </AlertDialogCancel>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <AlertDialogAction onClick={handleDelete} className={BTN_ALERT_DELETE}>
                Delete Account
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}