"use client";

import { motion, Variants } from "framer-motion";
import {
    PAYROLL_STATUS,
    PayrollStatus,
    SalaryPaymentMode,
} from "@/constants/employee.const";
import {
    Calendar,
    Clock,
    CreditCard,
    FileText,
    Mail,
    Phone,
    User,
    AlertCircle,
    CheckCircle,
    XCircle,
    TrendingUp,
    History,
    ExternalLink,
    Banknote,
} from "lucide-react";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { format } from "date-fns";
import SupportEmployeeInfoSkeleton from "./skeletons/SupportEmployeeInfoSkeleton";
import getDocLink from "@/utils/helpers/get-doc-links";
import { IEmployeeInfo } from "@/types/user/current-user.types";

// ── Neumorphism tokens ────────────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO =
    "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_ICON_WELL =
    "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_PRIMARY =
    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Animation variants ────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 20 } },
};

// ── Sub-components ────────────────────────────────────────────
function SectionCard({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className={NEU_CARD}>
            <div className={`p-5 border-b ${NEU_DIVIDER} flex items-center gap-3`}>
                <div className={NEU_ICON_WELL}>
                    <Icon className="h-4 w-4 text-[#006666]" />
                </div>
                <h3 className={`text-base ${NEU_HEADING}`}>{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
            <span className={NEU_LABEL}>{label}</span>
            <span className={`${NEU_MONO} text-sm font-medium`}>{value}</span>
        </div>
    );
}

interface SupportEmployeeInfoProps {
    employeeInfo: IEmployeeInfo | null;
    isLoading?: boolean;
}

export default function SupportEmployeeInfo({ employeeInfo, isLoading }: SupportEmployeeInfoProps) {
    if (isLoading) return <SupportEmployeeInfoSkeleton />;

    if (!employeeInfo) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={`${NEU_CARD} p-12 text-center`}>
                    <div className={`h-20 w-20 rounded-full ${NEU_SURFACE_INSET_SM} mx-auto mb-6 flex items-center justify-center`}>
                        <AlertCircle className="h-9 w-9 text-[#FE9900]" />
                    </div>
                    <h3 className={`text-xl mb-2 ${NEU_HEADING}`}>Employee Information Not Available</h3>
                    <p className={NEU_MUTED}>Your employee details could not be loaded at this time.</p>
                </div>
            </motion.div>
        );
    }

    const getPaymentStatusBadge = (status: PayrollStatus) => {
        switch (status) {
            case PAYROLL_STATUS.PAID:
                return <span className={NEU_BADGE_SUCCESS}><CheckCircle className="h-3 w-3" />Paid</span>;
            case PAYROLL_STATUS.PENDING:
                return <span className={NEU_BADGE_WARNING}><Clock className="h-3 w-3" />Pending</span>;
            case PAYROLL_STATUS.FAILED:
                return <span className={NEU_BADGE_DANGER}><XCircle className="h-3 w-3" />Failed</span>;
            default:
                return <span className={NEU_BADGE}>{status}</span>;
        }
    };

    const getPaymentModeBadge = (mode: SalaryPaymentMode) => (
        <span className={mode === "auto" ? NEU_BADGE_PRIMARY : NEU_BADGE}>
            <Banknote className="h-3 w-3" />
            {mode === "auto" ? "Auto Payment" : "Manual Payment"}
        </span>
    );

    const formatCurrency = (amount: number, currency: string) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left column ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <motion.div variants={itemVariants}>
                        <SectionCard icon={User} title="Personal Information">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InfoRow label="Employment Type" value={employeeInfo.employmentType || "Not specified"} />
                                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "transparent" }}>
                                        <span className={NEU_LABEL}>Payment Mode</span>
                                        {getPaymentModeBadge(employeeInfo.paymentMode)}
                                    </div>
                                    <InfoRow
                                        label="Date of Joining"
                                        value={format(new Date(employeeInfo.dateOfJoining), "MMM d, yyyy")}
                                    />
                                </div>

                                {/* Salary highlight */}
                                <div className={`p-5 rounded-2xl ${NEU_SURFACE_INSET_SM} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                                    <div>
                                        <p className={`mb-1 flex items-center gap-1.5 ${NEU_LABEL}`}>
                                            <FaBangladeshiTakaSign className="h-3 w-3" />
                                            Monthly Salary
                                        </p>
                                        <p className={`text-2xl sm:text-3xl ${NEU_HEADING}`}>
                                            {formatCurrency(employeeInfo.salary, employeeInfo.currency)}
                                        </p>
                                    </div>
                                    <div className={`${NEU_ICON_WELL} text-[#006666]`}>
                                        <FaBangladeshiTakaSign className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Date of leaving notice */}
                                {employeeInfo.dateOfLeaving && (
                                    <div className={`flex items-start gap-3 p-4 rounded-xl bg-[#FE9900]/10 border border-[#FE9900]/30`}>
                                        <AlertCircle className="h-5 w-5 text-[#FE9900] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#FE9900]">Employment Ended</p>
                                            <p className={`text-sm mt-0.5 ${NEU_MUTED}`}>
                                                Left on {format(new Date(employeeInfo.dateOfLeaving), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {employeeInfo.notes && (
                                    <div className="space-y-2">
                                        <p className={`flex items-center gap-1.5 ${NEU_LABEL}`}>
                                            <FileText className="h-3 w-3" /> Notes
                                        </p>
                                        <p className={`p-4 rounded-xl ${NEU_SURFACE_INSET_SM} text-sm ${NEU_MONO}`}>
                                            {employeeInfo.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </motion.div>

                    {/* Contact Information */}
                    {employeeInfo.contactInfo && (
                        <motion.div variants={itemVariants}>
                            <SectionCard icon={Phone} title="Contact Information">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {/* Primary */}
                                    <div className="space-y-3">
                                        <p className={NEU_LABEL}>Primary Contact</p>
                                        <div className={`flex items-center gap-3 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                            <Phone className="h-4 w-4 text-[#006666] shrink-0" />
                                            <span className={`${NEU_MONO} text-sm font-medium`}>{employeeInfo.contactInfo.phone}</span>
                                        </div>
                                        <div className={`flex items-center gap-3 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                            <Mail className="h-4 w-4 text-[#006666] shrink-0" />
                                            <span className={`${NEU_MONO} text-sm font-medium break-all`}>{employeeInfo.contactInfo.email}</span>
                                        </div>
                                    </div>

                                    {/* Emergency */}
                                    {employeeInfo.contactInfo.emergencyContact && (
                                        <div className="space-y-3">
                                            <p className={NEU_LABEL}>Emergency Contact</p>
                                            <div className={`p-4 rounded-xl bg-[#FF2157]/5 border border-[#FF2157]/20 space-y-3`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#FF2157]">
                                                        {employeeInfo.contactInfo.emergencyContact.name}
                                                    </span>
                                                    <span className={NEU_BADGE_DANGER}>{employeeInfo.contactInfo.emergencyContact.relation}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-[#FF2157]" />
                                                    <span className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]">
                                                        {employeeInfo.contactInfo.emergencyContact.phone}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>
                        </motion.div>
                    )}

                    {/* Documents */}
                    {employeeInfo.documents && employeeInfo.documents.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <SectionCard icon={FileText} title="Documents">
                                <div className="space-y-3">
                                    {employeeInfo.documents.map((doc, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl ${NEU_SURFACE_INSET_SM} gap-4`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={NEU_ICON_WELL}>
                                                    <FileText className="h-4 w-4 text-[#006666]" />
                                                </div>
                                                <div>
                                                    <p className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">{doc.type}</p>
                                                    <p className={`flex items-center gap-1 mt-0.5 ${NEU_MUTED} text-xs`}>
                                                        <Calendar className="h-3 w-3" />
                                                        Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={getDocLink(doc.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#006666] hover:text-[#008080] transition-colors"
                                            >
                                                View <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        </motion.div>
                                    ))}
                                </div>
                            </SectionCard>
                        </motion.div>
                    )}

                    {/* Salary History */}
                    {employeeInfo.salaryHistory && employeeInfo.salaryHistory.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <SectionCard icon={History} title="Salary History">
                                <div className="space-y-3">
                                    {employeeInfo.salaryHistory.map((history, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className={`p-4 rounded-xl ${NEU_SURFACE_INSET_SM} space-y-2`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-[#006666]" />
                                                    <span className={`font-bold text-sm ${NEU_HEADING}`}>
                                                        {formatCurrency(history.amount, history.currency)}
                                                    </span>
                                                </div>
                                                {index === 0 && <span className={NEU_BADGE_SUCCESS}>Current</span>}
                                            </div>
                                            <p className={`text-xs ${NEU_MUTED}`}>
                                                Effective from {format(new Date(history.effectiveFrom), "MMM d, yyyy")}
                                                {history.effectiveTo && <> to {format(new Date(history.effectiveTo), "MMM d, yyyy")}</>}
                                            </p>
                                            {history.reason && (
                                                <p className={`text-xs p-2 rounded-lg ${NEU_SURFACE_INSET_SM} ${NEU_MONO}`}>{history.reason}</p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </SectionCard>
                        </motion.div>
                    )}
                </div>

                {/* ── Right column ── */}
                <div className="space-y-6">
                    {/* Current Month Payment */}
                    {employeeInfo.currentMonthPayment && (
                        <motion.div variants={itemVariants}>
                            <SectionCard icon={CreditCard} title="Current Month Payment">
                                <div className="space-y-3">
                                    <div className={`flex items-center justify-between p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                        <span className={NEU_LABEL}>Status</span>
                                        {getPaymentStatusBadge(employeeInfo.currentMonthPayment.status)}
                                    </div>

                                    <div className={`p-4 rounded-xl bg-[#006666]/10 border border-[#006666]/20`}>
                                        <p className={`text-xs mb-1 ${NEU_LABEL}`}>Amount</p>
                                        <p className={`text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#006666]`}>
                                            {formatCurrency(
                                                employeeInfo.currentMonthPayment.amount,
                                                employeeInfo.currentMonthPayment.currency,
                                            )}
                                        </p>
                                    </div>

                                    {employeeInfo.currentMonthPayment.dueDate && (
                                        <InfoRow
                                            label="Due Date"
                                            value={format(new Date(employeeInfo.currentMonthPayment.dueDate), "MMM d, yyyy")}
                                        />
                                    )}

                                    {employeeInfo.currentMonthPayment.paidAt && (
                                        <div className={`flex items-center justify-between p-3 rounded-xl bg-[#00A63D]/10 border border-[#00A63D]/20`}>
                                            <span className={`${NEU_LABEL} text-[#00A63D]`}>Paid Date</span>
                                            <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] font-medium text-[#00A63D]">
                                                {format(new Date(employeeInfo.currentMonthPayment.paidAt), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    )}

                                    {employeeInfo.currentMonthPayment.transactionRef && (
                                        <div className="space-y-1.5">
                                            <p className={NEU_LABEL}>Transaction Ref</p>
                                            <p className={`text-xs font-mono p-3 rounded-xl break-all ${NEU_SURFACE_INSET_SM} ${NEU_MUTED}`}>
                                                {employeeInfo.currentMonthPayment.transactionRef}
                                            </p>
                                        </div>
                                    )}

                                    {employeeInfo.currentMonthPayment.failureReason && (
                                        <div className={`p-4 rounded-xl bg-[#FF2157]/10 border border-[#FF2157]/20`}>
                                            <p className="font-[family-name:var(--font-space-mono)] font-bold text-xs text-[#FF2157] mb-1">Failure Reason</p>
                                            <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#FF2157]">
                                                {employeeInfo.currentMonthPayment.failureReason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>
                        </motion.div>
                    )}

                    {/* Shift Schedule */}
                    {employeeInfo.shifts && employeeInfo.shifts.length > 0 && (
                        <motion.div variants={itemVariants}>
                            <SectionCard icon={Clock} title="Shift Schedule">
                                <div className="space-y-3">
                                    {employeeInfo.shifts.map((shift, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            className={`p-4 rounded-xl ${NEU_SURFACE_INSET_SM} space-y-3`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                                                    {shift.startTime} – {shift.endTime}
                                                </span>
                                                <span className={NEU_BADGE}>{shift.days.length} days</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {shift.days.map((day) => (
                                                    <span key={day} className={NEU_BADGE_PRIMARY}>{day}</span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </SectionCard>
                        </motion.div>
                    )}

                    {/* Metadata */}
                    <motion.div variants={itemVariants}>
                        <SectionCard icon={Calendar} title="Metadata">
                            <div className="space-y-3">
                                <InfoRow label="Created" value={format(new Date(employeeInfo.createdAt), "MMM d, yyyy")} />
                                <InfoRow label="Last Updated" value={format(new Date(employeeInfo.updatedAt), "MMM d, yyyy")} />
                                {employeeInfo.lastLogin && (
                                    <div className={`flex items-center justify-between p-3 rounded-xl bg-[#00A63D]/10 border border-[#00A63D]/20`}>
                                        <span className={`${NEU_LABEL} text-[#00A63D]`}>Last Login</span>
                                        <span className="text-xs font-[family-name:var(--font-jetbrains-mono)] font-medium text-[#00A63D]">
                                            {format(new Date(employeeInfo.lastLogin), "MMM d, yyyy HH:mm")}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}