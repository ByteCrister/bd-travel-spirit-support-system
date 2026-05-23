// components/PaymentAccounts/EditPaymentAccountDialog.tsx
"use client";

import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { PaymentAccount } from "@/types/site-settings/stripe-payment-account.type";
import { usePaymentAccountStore } from "@/store/site-settings/strip-payment-account.store";
import { Loader2, CreditCard, Shield, Tag, Check, X } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const DIALOG_CONTENT =
  "sm:max-w-[480px] gap-0 p-0 bg-[#E7E5E4] border border-white/60 overflow-hidden rounded-2xl " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const DIALOG_HEADER =
  "px-6 pt-6 pb-5 border-b border-[#1E2938]/08";

const DIALOG_ICON_WELL =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const DIALOG_TITLE =
  "font-[family-name:var(--font-space-mono)] font-bold text-xl text-[#1E2938] tracking-tight";

const DIALOG_DESC =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/45 mt-1";

const FIELD_LABEL =
  "flex items-center gap-2 text-xs font-bold uppercase tracking-widest " +
  "font-[family-name:var(--font-space-mono)] text-[#1E2938]/55 mb-1.5";

const NEU_INPUT =
  "w-full h-11 px-3 rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/35 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const BACKUP_CARD =
  "flex items-start gap-4 rounded-xl p-4 cursor-pointer transition-all duration-200 " +
  "bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]";

const BACKUP_CARD_ACTIVE =
  "flex items-start gap-4 rounded-xl p-4 cursor-pointer transition-all duration-200 " +
  "bg-[#E7E5E4] shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "ring-2 ring-[#006666]/30";

const BACKUP_TITLE =
  "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]";

const BACKUP_DESC =
  "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/45 mt-0.5 leading-relaxed";

const ACTIVE_BADGE =
  "inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666] text-white shadow-[2px_2px_4px_#004d4d]";

const DIVIDER = "border-t border-[#1E2938]/08";

const BTN_CANCEL =
  "flex-1 h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border-none " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "disabled:opacity-40 transition-all duration-200 flex items-center justify-center gap-2";

const BTN_SAVE =
  "flex-1 h-11 rounded-xl bg-[#006666] text-white " +
  "font-[family-name:var(--font-space-mono)] font-bold text-sm " +
  "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] border-none " +
  "hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] " +
  "disabled:opacity-40 transition-all duration-200 flex items-center justify-center gap-2";
// ─────────────────────────────────────────────────────────────

const formSchema = z.object({
  label: z.string().optional(),
  isBackup: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  account: PaymentAccount;
  children: ReactNode;
}

export function EditPaymentAccountDialog({ account, children }: Props) {
  const [open, setOpen] = useState(false);
  const { updateAccount, updateStatus } = usePaymentAccountStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: account.label || "",
      isBackup: account.isBackup,
    },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await updateAccount(account.id, values);
    if (result) setOpen(false);
  };

  const isLoading = updateStatus === "loading";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={DIALOG_CONTENT}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <DialogHeader className={DIALOG_HEADER}>
            <div className="flex items-start gap-3.5">
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                className={DIALOG_ICON_WELL}
              >
                <CreditCard size={20} className="text-[#006666]" />
              </motion.span>
              <div>
                <DialogTitle className={DIALOG_TITLE}>Edit Payment Account</DialogTitle>
                <DialogDescription className={DIALOG_DESC}>
                  Update label or backup status for this account
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
              {/* Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FIELD_LABEL}>
                      <Tag size={13} />
                      Account Label
                    </FormLabel>
                    <FormControl>
                      <input
                        placeholder="e.g. Business card"
                        className={NEU_INPUT}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]" />
                  </FormItem>
                )}
              />

              {/* Backup toggle */}
              <FormField
                control={form.control}
                name="isBackup"
                render={({ field }) => (
                  <FormItem>
                    <div
                      className={field.value ? BACKUP_CARD_ACTIVE : BACKUP_CARD}
                      onClick={() => field.onChange(!field.value)}
                    >
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#006666] mt-0.5"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className={`${BACKUP_TITLE} cursor-pointer flex items-center`}>
                          Use as backup account
                          <AnimatePresence>
                            {field.value && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={ACTIVE_BADGE}
                              >
                                <Check size={11} strokeWidth={2.5} />
                                Active
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </FormLabel>
                        <p className={BACKUP_DESC}>
                          This account will be used if the primary payment method fails
                        </p>
                      </div>
                      <Shield
                        size={18}
                        className={`mt-0.5 transition-colors duration-200 ${field.value ? "text-[#006666]" : "text-[#1E2938]/25"
                          }`}
                      />
                    </div>
                    <FormMessage className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]" />
                  </FormItem>
                )}
              />

              {/* Footer */}
              <div className={`flex gap-3 pt-5 ${DIVIDER}`}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className={BTN_CANCEL}
                >
                  <X size={15} />
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className={BTN_SAVE}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}