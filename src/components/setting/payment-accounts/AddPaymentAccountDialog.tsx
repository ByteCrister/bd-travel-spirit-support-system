// components/payment-accounts/AddPaymentAccountDialog.tsx
"use client";

import { ReactNode, useState } from "react";
import { Formik, Form, useField, FieldInputProps } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PAYMENT_OWNER_TYPE, PAYMENT_PURPOSE, CARD_BRAND } from "@/constants/payment.const";
import { usePaymentAccountStore } from "@/store/site-settings/strip-payment-account.store";
import { createPaymentAccountSchema } from "@/utils/validators/site-settings/payment-account-setting.validator";
import { CreateStripePaymentMethodDTO } from "@/types/site-settings/stripe-payment-account.type";
import {
    CreditCard,
    Shield,
    Mail,
    User,
    Hash,
    Calendar,
    Building2,
    Target,
    Tag,
    Loader2,
    Plus,
    AlertCircle
} from "lucide-react";
import { jakarta } from "@/styles/fonts";

type FormValues = CreateStripePaymentMethodDTO;

const initialValues: FormValues = {
    ownerType: PAYMENT_OWNER_TYPE.ADMIN,
    purpose: PAYMENT_PURPOSE.ALL,
    isBackup: false,
    email: "",
    name: "",
    label: "",
    stripeCustomerId: "",
    stripePaymentMethodId: "",
    stripeConnectedAccountId: "",
    card: {
        brand: CARD_BRAND.UNKNOWN,
        last4: "",
        expMonth: undefined,
        expYear: undefined,
    },
};

type FormFieldProps<Name extends keyof FormValues | string> = {
    label: string;
    name: Name;
    children: (fieldProps: FieldInputProps<string>) => ReactNode;
    icon?: ReactNode;
    required?: boolean;
};

// Custom Field wrapper to show errors
const FormField = <Name extends keyof FormValues | string>({
    label,
    name,
    children,
    icon,
    required = false,
}: FormFieldProps<Name>) => {
    const [field, meta] = useField(name as string);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
        >
            <Label
                htmlFor={name as string}
                className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
                {icon}
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>
            {children(field)}
            <AnimatePresence>
                {meta.touched && meta.error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-sm text-red-600"
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {meta.error}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

interface Props {
    children: ReactNode;
}

export function AddPaymentAccountDialog({ children }: Props) {
    const [open, setOpen] = useState(false);
    const { createStripePaymentMethod, createStatus } = usePaymentAccountStore();

    const handleSubmit = async (values: FormValues) => {
        const result = await createStripePaymentMethod({
            ...values,
            ownerId: null,
        });
        if (result) {
            setOpen(false);
        }
    };

    const isLoading = createStatus === "loading";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className={`sm:max-w-[600px] max-h-[90vh] gap-0 p-0 border-slate-200/60 shadow-xl overflow-hidden ${jakarta.className}`}>
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
                                <Plus className="h-5 w-5 text-slate-700" strokeWidth={2} />
                            </motion.div>
                            <div className="flex-1">
                                <DialogTitle className="text-xl font-semibold text-slate-900 tracking-tight">
                                    Add Stripe Payment Method
                                </DialogTitle>
                                <DialogDescription className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                                    Fill in the details to add a new payment account
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={createPaymentAccountSchema}
                        onSubmit={handleSubmit}
                        validateOnBlur
                    >
                        {({ isSubmitting, setFieldValue, values }) => (
                            <Form className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                <div className="space-y-6">
                                    {/* Account Configuration Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2">
                                            <div className="h-px flex-1 bg-slate-200" />
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Account Configuration
                                            </span>
                                            <div className="h-px flex-1 bg-slate-200" />
                                        </div>

                                        {/* Owner Type */}
                                        <FormField
                                            label="Owner Type"
                                            name="ownerType"
                                            icon={<Building2 className="h-3.5 w-3.5 text-slate-500" />}
                                            required
                                        >
                                            {({ value }) => (
                                                <Select
                                                    value={value ?? ""}
                                                    onValueChange={(val) => {
                                                        if (val !== value) {
                                                            setFieldValue("ownerType", val);
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20">
                                                        <SelectValue placeholder="Select owner type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={PAYMENT_OWNER_TYPE.ADMIN}>Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </FormField>

                                        {/* Purpose */}
                                        <FormField
                                            label="Purpose"
                                            name="purpose"
                                            icon={<Target className="h-3.5 w-3.5 text-slate-500" />}
                                            required
                                        >
                                            {({ value }) => (
                                                <Select
                                                    value={value}
                                                    onValueChange={(val) => setFieldValue("purpose", val)}
                                                >
                                                    <SelectTrigger className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20">
                                                        <SelectValue placeholder="Select purpose" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={PAYMENT_PURPOSE.ALL}>All Purposes</SelectItem>
                                                        <SelectItem value={PAYMENT_PURPOSE.EMPLOYEE_WAGES}>Employee Wages</SelectItem>
                                                        <SelectItem value={PAYMENT_PURPOSE.REFUND}>Refund</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </FormField>

                                        {/* Label */}
                                        <FormField
                                            label="Label"
                                            name="label"
                                            icon={<Tag className="h-3.5 w-3.5 text-slate-500" />}
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="label"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="e.g. Business card"
                                                    className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                                                />
                                            )}
                                        </FormField>

                                        {/* isBackup Checkbox */}
                                        <motion.div
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ duration: 0.2 }}
                                            className="flex items-start space-x-3.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                                        >
                                            <Checkbox
                                                id="isBackup"
                                                checked={values.isBackup}
                                                onCheckedChange={(checked) => setFieldValue("isBackup", checked)}
                                                className="mt-0.5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                                            />
                                            <div className="flex-1 space-y-1">
                                                <Label
                                                    htmlFor="isBackup"
                                                    className="text-sm font-medium text-slate-900 cursor-pointer"
                                                >
                                                    Use as backup account
                                                </Label>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                    This account will be used if the primary payment method fails
                                                </p>
                                            </div>
                                            <Shield className="h-4 w-4 text-slate-400 mt-0.5" strokeWidth={2} />
                                        </motion.div>
                                    </div>

                                    {/* Customer Information Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2">
                                            <div className="h-px flex-1 bg-slate-200" />
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Customer Information
                                            </span>
                                            <div className="h-px flex-1 bg-slate-200" />
                                        </div>

                                        {/* Email */}
                                        <FormField
                                            label="Email"
                                            name="email"
                                            icon={<Mail className="h-3.5 w-3.5 text-slate-500" />}
                                            required
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    type="email"
                                                    name="email"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="customer@example.com"
                                                    className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                                                />
                                            )}
                                        </FormField>

                                        {/* Name */}
                                        <FormField
                                            label="Name on Card"
                                            name="name"
                                            icon={<User className="h-3.5 w-3.5 text-slate-500" />}
                                            required
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="name"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="John Doe"
                                                    className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                                                />
                                            )}
                                        </FormField>
                                    </div>

                                    {/* Stripe Integration Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2">
                                            <div className="h-px flex-1 bg-slate-200" />
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Stripe Integration
                                            </span>
                                            <div className="h-px flex-1 bg-slate-200" />
                                        </div>

                                        {/* Stripe Customer ID */}
                                        <FormField
                                            label="Stripe Customer ID"
                                            name="stripeCustomerId"
                                            icon={<Hash className="h-3.5 w-3.5 text-slate-500" />}
                                            required
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="stripeCustomerId"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="cus_xxx"
                                                    className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 font-mono text-sm"
                                                />
                                            )}
                                        </FormField>

                                        {/* Stripe Payment Method ID */}
                                        <FormField
                                            label="Stripe Payment Method ID"
                                            name="stripePaymentMethodId"
                                            icon={<Hash className="h-3.5 w-3.5 text-slate-500" />}
                                            required
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="stripePaymentMethodId"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="pm_xxx"
                                                    className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 font-mono text-sm"
                                                />
                                            )}
                                        </FormField>

                                        {/* Stripe Connected Account ID */}
                                        <FormField
                                            label="Connected Account ID"
                                            name="stripeConnectedAccountId"
                                            icon={<Hash className="h-3.5 w-3.5 text-slate-500" />}
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="stripeConnectedAccountId"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="acct_xxx (optional)"
                                                    className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 font-mono text-sm"
                                                />
                                            )}
                                        </FormField>
                                    </div>

                                    {/* Card Details Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-2">
                                            <div className="h-px flex-1 bg-slate-200" />
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                Card Details
                                            </span>
                                            <div className="h-px flex-1 bg-slate-200" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Brand */}
                                            <FormField
                                                label="Brand"
                                                name="card.brand"
                                                required
                                            >
                                                {({ value }) => (
                                                    <Select
                                                        value={value ?? ""}
                                                        onValueChange={(val) => setFieldValue("card.brand", val)}
                                                    >
                                                        <SelectTrigger className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20">
                                                            <SelectValue placeholder="Select brand" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={CARD_BRAND.VISA}>Visa</SelectItem>
                                                            <SelectItem value={CARD_BRAND.MASTERCARD}>Mastercard</SelectItem>
                                                            <SelectItem value={CARD_BRAND.AMEX}>Amex</SelectItem>
                                                            <SelectItem value={CARD_BRAND.UNIONPAY}>UnionPay</SelectItem>
                                                            <SelectItem value={CARD_BRAND.UNKNOWN}>Unknown</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </FormField>

                                            {/* Last4 */}
                                            <FormField
                                                label="Last 4 Digits"
                                                name="card.last4"
                                                required
                                            >
                                                {({ value, onChange, onBlur }) => (
                                                    <Input
                                                        name="card.last4"
                                                        value={value}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        placeholder="4242"
                                                        maxLength={4}
                                                        className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 font-mono"
                                                    />
                                                )}
                                            </FormField>

                                            {/* Exp Month */}
                                            <FormField
                                                label="Expiry Month"
                                                name="card.expMonth"
                                                icon={<Calendar className="h-3.5 w-3.5 text-slate-500" />}
                                                required
                                            >
                                                {({ value, onChange, onBlur }) => (
                                                    <Input
                                                        type="number"
                                                        name="card.expMonth"
                                                        value={value === undefined ? "" : value}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        placeholder="12"
                                                        min="1"
                                                        max="12"
                                                        className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                                                    />
                                                )}
                                            </FormField>

                                            {/* Exp Year */}
                                            <FormField
                                                label="Expiry Year"
                                                name="card.expYear"
                                                icon={<Calendar className="h-3.5 w-3.5 text-slate-500" />}
                                                required
                                            >
                                                {({ value, onChange, onBlur }) => (
                                                    <Input
                                                        type="number"
                                                        name="card.expYear"
                                                        value={value === undefined ? "" : value}
                                                        onChange={onChange}
                                                        onBlur={onBlur}
                                                        placeholder="2028"
                                                        min={new Date().getFullYear()}
                                                        className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                                                    />
                                                )}
                                            </FormField>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100 sticky bottom-0 bg-white">
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
                                            disabled={isSubmitting || isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" strokeWidth={2.5} />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
                                                    Add Payment Method
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}