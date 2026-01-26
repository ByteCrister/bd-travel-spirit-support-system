"use client";

import { motion, Variants } from "framer-motion";
import { IEmployeeInfo } from "@/types/current-user.types";
import { PAYROLL_STATUS, PayrollStatus, SalaryPaymentMode } from "@/constants/employee.const";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    CreditCard,
    FileText,
    Mail,
    Phone,
    User,
    Briefcase,
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

interface SupportEmployeeInfoProps {
    employeeInfo: IEmployeeInfo | null;
    isLoading?: boolean;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
        },
    },
};

export default function SupportEmployeeInfo({ employeeInfo, isLoading }: SupportEmployeeInfoProps) {
    if (isLoading) {
        return <SupportEmployeeInfoSkeleton />;
    }

    if (!employeeInfo) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden"
            >
                <Card className="border border-gray-200 dark:border-gray-800">
                    <CardContent className="pt-6">
                        <div className="text-center py-16">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-900 mx-auto mb-6 flex items-center justify-center"
                            >
                                <AlertCircle className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                                Employee Information Not Available
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Your employee details could not be loaded at this time.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    const getPaymentStatusBadge = (status: PayrollStatus) => {
        switch (status) {
            case PAYROLL_STATUS.PAID:
                return (
                    <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Paid
                    </Badge>
                );
            case PAYROLL_STATUS.PENDING:
                return (
                    <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        Pending
                    </Badge>
                );
            case PAYROLL_STATUS.FAILED:
                return (
                    <Badge className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Failed
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentModeBadge = (mode: SalaryPaymentMode) => {
        return (
            <Badge className={
                mode === "auto"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
            }>
                <Banknote className="h-3 w-3 mr-1" />
                {mode === "auto" ? "Auto Payment" : "Manual Payment"}
            </Badge>
        );
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full space-y-6"
        >
            {/* Main Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                {/* Left Column - Personal & Contact Info */}
                <div className="lg:col-span-2 space-y-6 w-full">
                    {/* Personal Information */}
                    <motion.div variants={itemVariants} className="w-full">
                        <Card className="border border-gray-200 dark:border-gray-800">
                            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                                <CardTitle className="text-lg flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                        Personal Information
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Employment Type
                                        </p>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                            <Briefcase className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            <span className="font-medium">{employeeInfo.employmentType || "Not specified"}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Payment Mode
                                        </p>
                                        {getPaymentModeBadge(employeeInfo.paymentMode)}
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Date of Joining
                                        </p>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            <span className="font-medium">
                                                {format(new Date(employeeInfo.dateOfJoining), "MMM d, yyyy")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Salary Display */}
                                <div className="mt-6">
                                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                                    <FaBangladeshiTakaSign className="h-4 w-4" />
                                                    Monthly Salary
                                                </p>
                                                <p className="text-2xl sm:text-3xl font-semibold text-gray-800 dark:text-gray-200">
                                                    {formatCurrency(employeeInfo.salary, employeeInfo.currency)}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                                <FaBangladeshiTakaSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {employeeInfo.dateOfLeaving && (
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            <div>
                                                <span className="font-medium text-amber-800 dark:text-amber-300">Employment Ended</span>
                                                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                                    Left on {format(new Date(employeeInfo.dateOfLeaving), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {employeeInfo.notes && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Notes
                                        </p>
                                        <p className="text-sm p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                            {employeeInfo.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Contact Information */}
                    {employeeInfo.contactInfo && (
                        <motion.div variants={itemVariants} className="w-full">
                            <Card className="border border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                            Contact Information
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Contact</p>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                                    <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                    <span className="font-medium">{employeeInfo.contactInfo.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                                    <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                    <span className="font-medium break-all">{employeeInfo.contactInfo.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact</p>
                                            {employeeInfo.contactInfo.emergencyContact && (
                                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-red-800 dark:text-red-300">
                                                            {employeeInfo.contactInfo.emergencyContact.name}
                                                        </span>
                                                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                            {employeeInfo.contactInfo.emergencyContact.relation}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                            {employeeInfo.contactInfo.emergencyContact.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Documents */}
                    {employeeInfo.documents && employeeInfo.documents.length > 0 && (
                        <motion.div variants={itemVariants} className="w-full">
                            <Card className="border border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                            Documents
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        {employeeInfo.documents.map((doc, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900 gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                                        <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{doc.type}</p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Uploaded {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                                >
                                                    View
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Metadata */}
                    <motion.div variants={itemVariants} className="w-full">
                        <Card className="border border-gray-200 dark:border-gray-800">
                            <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                                <CardTitle className="text-lg flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                        <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                        Metadata
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
                                        <span className="text-sm font-medium">
                                            {format(new Date(employeeInfo.createdAt), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                                        <span className="text-sm font-medium">
                                            {format(new Date(employeeInfo.updatedAt), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    {employeeInfo.lastLogin && (
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                            <span className="text-sm text-green-700 dark:text-green-400">Last Login</span>
                                            <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                                {format(new Date(employeeInfo.lastLogin), "MMM d, yyyy HH:mm")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Salary History */}
                    {employeeInfo.salaryHistory && employeeInfo.salaryHistory.length > 0 && (
                        <motion.div variants={itemVariants} className="w-full">
                            <Card className="border border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                            <History className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                            Salary History
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {employeeInfo.salaryHistory.map((history, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                            <p className="font-semibold">
                                                                {formatCurrency(history.amount, history.currency)}
                                                            </p>
                                                        </div>
                                                        {index === 0 && (
                                                            <Badge className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Effective from {format(new Date(history.effectiveFrom), "MMM d, yyyy")}
                                                        {history.effectiveTo && (
                                                            <> to {format(new Date(history.effectiveTo), "MMM d, yyyy")}</>
                                                        )}
                                                    </p>
                                                    {history.reason && (
                                                        <p className="text-sm mt-2 p-2 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                            {history.reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - Status & Shifts Only */}
                <div className="space-y-6 w-full">
                    {/* Current Month Payment Status */}
                    {employeeInfo.currentMonthPayment && (
                        <motion.div variants={itemVariants} className="w-full">
                            <Card className="border border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                            Current Month Payment
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                            {getPaymentStatusBadge(employeeInfo.currentMonthPayment.status)}
                                        </div>
                                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <span className="text-sm text-blue-700 dark:text-blue-400 block mb-1">Amount</span>
                                            <span className="text-xl font-semibold text-blue-800 dark:text-blue-300">
                                                {formatCurrency(employeeInfo.currentMonthPayment.amount, employeeInfo.currentMonthPayment.currency)}
                                            </span>
                                        </div>
                                        {employeeInfo.currentMonthPayment.dueDate && (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
                                                <span className="text-sm font-medium">
                                                    {format(new Date(employeeInfo.currentMonthPayment.dueDate), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        )}
                                        {employeeInfo.currentMonthPayment.paidAt && (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                                <span className="text-sm text-green-700 dark:text-green-400">Paid Date</span>
                                                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                                    {format(new Date(employeeInfo.currentMonthPayment.paidAt), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                        )}
                                        {employeeInfo.currentMonthPayment.transactionRef && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Reference</p>
                                                <p className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 break-all">
                                                    {employeeInfo.currentMonthPayment.transactionRef}
                                                </p>
                                            </div>
                                        )}
                                        {employeeInfo.currentMonthPayment.failureReason && (
                                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">Failure Reason</p>
                                                <p className="text-sm text-red-600 dark:text-red-400">{employeeInfo.currentMonthPayment.failureReason}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Shift Information */}
                    {employeeInfo.shifts && employeeInfo.shifts.length > 0 && (
                        <motion.div variants={itemVariants} className="w-full">
                            <Card className="border border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-800">
                                    <CardTitle className="text-lg flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <span className="text-gray-800 dark:text-gray-200 font-semibold">
                                            Shift Schedule
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {employeeInfo.shifts.map((shift, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-medium">{shift.startTime} - {shift.endTime}</span>
                                                    <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                                                        {shift.days.length} days
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {shift.days.map((day) => (
                                                        <Badge key={day} variant="outline" className="text-xs">
                                                            {day}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}