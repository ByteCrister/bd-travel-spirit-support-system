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

// ── Neumorphism Style Tokens ──────────────────────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";
const NEU_SURFACE_RAISED = "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";
const NEU_SURFACE_INSET = "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-bold tracking-wide " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] " +
    "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
    "text-sm shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_HEADING = "font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "text-sm text-[#1E2938]/50";

const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

const NEU_DIVIDER = "border-[#1E2938]/10";

const NEU_SELECT_TRIGGER =
    "h-11 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm border-none " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
    "focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_SECTION_DIVIDER = "flex items-center gap-3 py-1";
const NEU_SECTION_DIVIDER_LINE = "h-px flex-1 bg-[#1E2938]/10";
const NEU_SECTION_DIVIDER_LABEL = "text-[10px] font-bold text-[#1E2938]/40 uppercase tracking-[0.15em] flex items-center gap-1.5";

// ─────────────────────────────────────────────────────────────────────────────

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
                className={`${NEU_LABEL} flex items-center gap-1.5`}
                style={{ fontFamily: "var(--font-space-mono)" }}
            >
                {icon && <span className="text-[#006666]/70">{icon}</span>}
                {label}
                {required && <span className="text-[#FF2157] ml-0.5">*</span>}
            </Label>
            {children(field)}
            <AnimatePresence>
                {meta.touched && meta.error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-1.5 text-xs text-[#FF2157] font-medium"
                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    >
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
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
            <DialogContent
                className={`sm:max-w-[600px] max-h-[90vh] gap-0 p-0 border-0 shadow-none bg-transparent overflow-hidden`}
                style={{ fontFamily: "var(--font-space-mono)" }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`${NEU_CARD} overflow-hidden flex flex-col max-h-[90vh]`}
                >
                    {/* Header */}
                    <DialogHeader className={`px-6 pt-6 pb-5 border-b ${NEU_DIVIDER} ${NEU_SURFACE} flex-shrink-0`}>
                        <div className="flex items-start gap-4">
                            <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.12, duration: 0.3, type: "spring", stiffness: 200 }}
                                className={`${NEU_ICON_WELL_PRIMARY} flex-shrink-0`}
                            >
                                <Plus className="h-5 w-5 text-[#006666]" strokeWidth={2.5} />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <DialogTitle
                                    className={`text-lg ${NEU_HEADING}`}
                                    style={{ fontFamily: "var(--font-space-mono)" }}
                                >
                                    Add Stripe Payment Method
                                </DialogTitle>
                                <DialogDescription
                                    className={`${NEU_MUTED} mt-1 leading-relaxed`}
                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                >
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
                            <Form className={`${NEU_SURFACE} flex flex-col flex-1 min-h-0`}>
                                {/* Scrollable body */}
                                <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">

                                    {/* ── Account Configuration ── */}
                                    <div className="space-y-4">
                                        <div className={NEU_SECTION_DIVIDER}>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
                                            <span className={NEU_SECTION_DIVIDER_LABEL}>
                                                Account Configuration
                                            </span>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
                                        </div>

                                        {/* Owner Type */}
                                        <FormField
                                            label="Owner Type"
                                            name="ownerType"
                                            icon={<Building2 className="h-3 w-3" />}
                                            required
                                        >
                                            {({ value }) => (
                                                <Select
                                                    value={value ?? ""}
                                                    onValueChange={(val) => {
                                                        if (val !== value) setFieldValue("ownerType", val);
                                                    }}
                                                >
                                                    <SelectTrigger className={NEU_SELECT_TRIGGER}>
                                                        <SelectValue placeholder="Select owner type" />
                                                    </SelectTrigger>
                                                    <SelectContent className={`${NEU_SURFACE_RAISED} border-0 rounded-xl`}>
                                                        <SelectItem value={PAYMENT_OWNER_TYPE.ADMIN}>Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </FormField>

                                        {/* Purpose */}
                                        <FormField
                                            label="Purpose"
                                            name="purpose"
                                            icon={<Target className="h-3 w-3" />}
                                            required
                                        >
                                            {({ value }) => (
                                                <Select
                                                    value={value}
                                                    onValueChange={(val) => setFieldValue("purpose", val)}
                                                >
                                                    <SelectTrigger className={NEU_SELECT_TRIGGER}>
                                                        <SelectValue placeholder="Select purpose" />
                                                    </SelectTrigger>
                                                    <SelectContent className={`${NEU_SURFACE_RAISED} border-0 rounded-xl`}>
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
                                            icon={<Tag className="h-3 w-3" />}
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="label"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="e.g. Business card"
                                                    className={`h-11 ${NEU_INPUT}`}
                                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                />
                                            )}
                                        </FormField>

                                        {/* isBackup Checkbox */}
                                        <motion.div
                                            whileHover={{ scale: 1.005 }}
                                            transition={{ duration: 0.2 }}
                                            className={`flex items-start gap-4 rounded-xl p-4 cursor-pointer transition-all duration-200 ${NEU_SURFACE_INSET}`}
                                            onClick={() => setFieldValue("isBackup", !values.isBackup)}
                                        >
                                            <Checkbox
                                                id="isBackup"
                                                checked={values.isBackup}
                                                onCheckedChange={(checked) => setFieldValue("isBackup", checked)}
                                                className="mt-0.5 flex-shrink-0 data-[state=checked]:bg-[#006666] data-[state=checked]:border-[#006666]"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex-1 space-y-0.5">
                                                <Label
                                                    htmlFor="isBackup"
                                                    className="text-sm font-bold text-[#1E2938] cursor-pointer"
                                                    style={{ fontFamily: "var(--font-space-mono)" }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Use as backup account
                                                </Label>
                                                <p
                                                    className={`text-xs ${NEU_MUTED} leading-relaxed`}
                                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                >
                                                    This account will be used if the primary payment method fails
                                                </p>
                                            </div>
                                            <Shield className="h-4 w-4 text-[#006666]/50 mt-0.5 flex-shrink-0" strokeWidth={2} />
                                        </motion.div>
                                    </div>

                                    {/* ── Customer Information ── */}
                                    <div className="space-y-4">
                                        <div className={NEU_SECTION_DIVIDER}>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
                                            <span className={NEU_SECTION_DIVIDER_LABEL}>
                                                Customer Information
                                            </span>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
                                        </div>

                                        {/* Email */}
                                        <FormField
                                            label="Email"
                                            name="email"
                                            icon={<Mail className="h-3 w-3" />}
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
                                                    className={`h-11 ${NEU_INPUT}`}
                                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                />
                                            )}
                                        </FormField>

                                        {/* Name */}
                                        <FormField
                                            label="Name on Card"
                                            name="name"
                                            icon={<User className="h-3 w-3" />}
                                            required
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="name"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="John Doe"
                                                    className={`h-11 ${NEU_INPUT}`}
                                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                />
                                            )}
                                        </FormField>
                                    </div>

                                    {/* ── Stripe Integration ── */}
                                    <div className="space-y-4">
                                        <div className={NEU_SECTION_DIVIDER}>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
                                            <span className={NEU_SECTION_DIVIDER_LABEL}>
                                                Stripe Integration
                                            </span>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
                                        </div>

                                        {/* Stripe Customer ID */}
                                        <FormField
                                            label="Stripe Customer ID"
                                            name="stripeCustomerId"
                                            icon={<Hash className="h-3 w-3" />}
                                            required
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="stripeCustomerId"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="cus_xxx"
                                                    className={`h-11 ${NEU_INPUT}`}
                                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                />
                                            )}
                                        </FormField>

                                        {/* Stripe Payment Method ID */}
                                        <FormField
                                            label="Stripe Payment Method ID"
                                            name="stripePaymentMethodId"
                                            icon={<Hash className="h-3 w-3" />}
                                            required
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="stripePaymentMethodId"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="pm_xxx"
                                                    className={`h-11 ${NEU_INPUT}`}
                                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                />
                                            )}
                                        </FormField>

                                        {/* Stripe Connected Account ID */}
                                        <FormField
                                            label="Connected Account ID"
                                            name="stripeConnectedAccountId"
                                            icon={<Hash className="h-3 w-3" />}
                                        >
                                            {({ value, onChange, onBlur }) => (
                                                <Input
                                                    name="stripeConnectedAccountId"
                                                    value={value}
                                                    onChange={onChange}
                                                    onBlur={onBlur}
                                                    placeholder="acct_xxx (optional)"
                                                    className={`h-11 ${NEU_INPUT}`}
                                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                />
                                            )}
                                        </FormField>
                                    </div>

                                    {/* ── Card Details ── */}
                                    <div className="space-y-4">
                                        <div className={NEU_SECTION_DIVIDER}>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
                                            <span className={NEU_SECTION_DIVIDER_LABEL}>
                                                <CreditCard className="h-3 w-3" />
                                                Card Details
                                            </span>
                                            <div className={NEU_SECTION_DIVIDER_LINE} />
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
                                                        <SelectTrigger className={NEU_SELECT_TRIGGER}>
                                                            <SelectValue placeholder="Select brand" />
                                                        </SelectTrigger>
                                                        <SelectContent className={`${NEU_SURFACE_RAISED} border-0 rounded-xl`}>
                                                            <SelectItem value={CARD_BRAND.VISA}>Visa</SelectItem>
                                                            <SelectItem value={CARD_BRAND.MASTERCARD}>Mastercard</SelectItem>
                                                            <SelectItem value={CARD_BRAND.AMEX}>Amex</SelectItem>
                                                            <SelectItem value={CARD_BRAND.UNIONPAY}>UnionPay</SelectItem>
                                                            <SelectItem value={CARD_BRAND.UNKNOWN}>Unknown</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </FormField>

                                            {/* Last 4 */}
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
                                                        className={`h-11 ${NEU_INPUT}`}
                                                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                    />
                                                )}
                                            </FormField>

                                            {/* Exp Month */}
                                            <FormField
                                                label="Expiry Month"
                                                name="card.expMonth"
                                                icon={<Calendar className="h-3 w-3" />}
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
                                                        className={`h-11 ${NEU_INPUT}`}
                                                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                    />
                                                )}
                                            </FormField>

                                            {/* Exp Year */}
                                            <FormField
                                                label="Expiry Year"
                                                name="card.expYear"
                                                icon={<Calendar className="h-3 w-3" />}
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
                                                        className={`h-11 ${NEU_INPUT}`}
                                                        style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                                    />
                                                )}
                                            </FormField>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div
                                    className={`flex gap-3 px-6 py-4 border-t ${NEU_DIVIDER} ${NEU_SURFACE} flex-shrink-0`}
                                >
                                    <Button
                                        type="button"
                                        className={`flex-1 h-11 text-sm ${NEU_BTN_GHOST}`}
                                        style={{ fontFamily: "var(--font-space-mono)" }}
                                        onClick={() => setOpen(false)}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                                        <Button
                                            type="submit"
                                            className={`w-full h-11 text-sm ${NEU_BTN_PRIMARY}`}
                                            style={{ fontFamily: "var(--font-space-mono)" }}
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