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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentAccount } from "@/types/site-settings/stripe-payment-account.type";
import { usePaymentAccountStore } from "@/store/site-settings/strip-payment-account.store";
import { Loader2, CreditCard, Shield, Tag, Check } from "lucide-react";
import { jakarta } from "@/styles/fonts";

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
    if (result) {
      setOpen(false);
    }
  };

  const isLoading = updateStatus === "loading";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className={`sm:max-w-[500px] gap-0 p-0 border-slate-200/60 shadow-xl overflow-hidden ${jakarta.className}`}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <DialogHeader className="px-6 pt-6 pb-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent">
            <div className="flex items-start gap-3.5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/50 shadow-sm"
              >
                <CreditCard className="h-5 w-5 text-slate-700" strokeWidth={2} />
              </motion.div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
                  Edit Payment Account
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Update label or backup status for this account
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-slate-500" />
                        Account Label
                      </FormLabel>
                      <FormControl>
                        <motion.div
                          whileFocus={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            placeholder="e.g. Business card"
                            className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 transition-all duration-200"
                            {...field}
                          />
                        </motion.div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBackup"
                  render={({ field }) => (
                    <FormItem>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start space-x-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm cursor-pointer"
                      >
                        <FormControl>
                          <div className="relative">
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 transition-all duration-200"
                            />
                            <AnimatePresence>
                              {field.value && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </FormControl>
                        <div className="flex-1 space-y-1.5">
                          <FormLabel className="!mt-0 text-sm font-medium text-slate-900 cursor-pointer flex items-center gap-2">
                            Use as backup account
                            {field.value && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-white text-xs font-medium"
                              >
                                <Check className="h-3 w-3" strokeWidth={2.5} />
                                Active
                              </motion.span>
                            )}
                          </FormLabel>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            This account will be used if the primary payment method fails
                          </p>
                        </div>
                        <Shield
                          className={`h-4.5 w-4.5 mt-0.5 transition-colors duration-200 ${field.value ? 'text-slate-700' : 'text-slate-400'
                            }`}
                          strokeWidth={2}
                        />
                      </motion.div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-medium"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow transition-all duration-200 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2.5} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" strokeWidth={2.5} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </Form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}