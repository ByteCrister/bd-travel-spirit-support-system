"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { PaymentAccountTable } from "./PaymentAccountTable";
import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    CreditCard,
    Sparkles,
    ArrowRight
} from "lucide-react";
import { AddPaymentAccountDialog } from "./AddPaymentAccountDialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { usePaymentAccountStore } from "@/store/site-settings/strip-payment-account.store";
import { PaymentAccountSkeleton } from "./skeletons/PaymentAccountSkeleton";
import { jakarta } from "@/styles/fonts";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
        }
    }
};

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Payments", href: "/setting/payment-accounts" },
];

export default function PaymentAccountsPage() {
    const {
        fetchList,
        fetchStatus,
        listTotal,
        page,
        pageSize,
        allIds,
        byId,
    } = usePaymentAccountStore();

    useEffect(() => {
        fetchList(page, pageSize);
    }, [fetchList, page, pageSize]);

    const accounts = allIds.map((id) => byId[id]);

    const totalPages = Math.ceil(listTotal / pageSize);

    const handlePageChange = (newPage: number) => {
        fetchList(newPage, pageSize);
    };

    if (fetchStatus === "loading" && accounts.length === 0) {
        return <PaymentAccountSkeleton />;
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 ${jakarta.className}`}>
            <Breadcrumbs items={breadcrumbItems} />
            <motion.div
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header Section */}
                <motion.div
                    className="mb-8 lg:mb-10"
                    variants={itemVariants}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    initial={{ rotate: -180, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: 0.2
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-900/20">
                                        <CreditCard className="h-6 w-6 text-white" />
                                    </div>
                                </motion.div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                                    Payment Accounts
                                </h1>
                            </div>
                            <p className="text-sm text-slate-600 font-medium ml-[60px]">
                                Manage your payment methods and billing information
                            </p>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <AddPaymentAccountDialog>
                                <Button
                                    size="lg"
                                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/30 font-semibold"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Payment Method
                                </Button>
                            </AddPaymentAccountDialog>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Content Section */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden backdrop-blur-sm"
                    variants={cardVariants}
                >
                    <AnimatePresence mode="wait">
                        {accounts.length === 0 ? (
                            <motion.div
                                key="empty-state"
                                className="text-center py-24 px-4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15,
                                        delay: 0.2
                                    }}
                                >
                                    <div className="mx-auto w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-inner relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200/20 to-transparent" />
                                        <CreditCard className="h-10 w-10 text-slate-400 relative z-10" />
                                        <motion.div
                                            className="absolute top-2 right-2"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 10, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 1
                                            }}
                                        >
                                            <Sparkles className="h-4 w-4 text-slate-300" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                                <motion.h3
                                    className="text-xl font-bold text-slate-900 mb-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    No payment accounts yet
                                </motion.h3>
                                <motion.p
                                    className="text-sm text-slate-600 mb-8 max-w-md mx-auto font-medium leading-relaxed"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Get started by adding your first payment method to enable seamless transactions and manage your billing
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <AddPaymentAccountDialog>
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 transition-all duration-300 font-semibold shadow-sm group"
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                                            Add Your First Payment Method
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
                                        </Button>
                                    </AddPaymentAccountDialog>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="accounts-list"
                                className="divide-y divide-slate-100"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <PaymentAccountTable accounts={accounts} />

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <motion.div
                                        className="px-6 py-5 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/50"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <p className="text-sm text-slate-600 font-medium">
                                                Showing <span className="font-bold text-slate-900">{((page - 1) * pageSize) + 1}</span> to{" "}
                                                <span className="font-bold text-slate-900">{Math.min(page * pageSize, listTotal)}</span> of{" "}
                                                <span className="font-bold text-slate-900">{listTotal}</span> accounts
                                            </p>
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationItem>
                                                        <motion.div
                                                            whileHover={{ scale: page > 1 ? 1.05 : 1 }}
                                                            whileTap={{ scale: page > 1 ? 0.95 : 1 }}
                                                        >
                                                            <PaginationPrevious
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (page > 1) handlePageChange(page - 1);
                                                                }}
                                                                className={
                                                                    page <= 1
                                                                        ? "pointer-events-none opacity-40"
                                                                        : "hover:bg-slate-100 transition-all duration-200 hover:shadow-sm font-medium"
                                                                }
                                                            />
                                                        </motion.div>
                                                    </PaginationItem>
                                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                        let pageNum;
                                                        if (totalPages <= 7) {
                                                            pageNum = i + 1;
                                                        } else if (page <= 4) {
                                                            pageNum = i + 1;
                                                        } else if (page >= totalPages - 3) {
                                                            pageNum = totalPages - 6 + i;
                                                        } else {
                                                            pageNum = page - 3 + i;
                                                        }
                                                        return (
                                                            <PaginationItem key={pageNum}>
                                                                <motion.div
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                >
                                                                    <PaginationLink
                                                                        href="#"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            handlePageChange(pageNum);
                                                                        }}
                                                                        isActive={page === pageNum}
                                                                        className={
                                                                            page === pageNum
                                                                                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20 font-bold"
                                                                                : "hover:bg-slate-100 transition-all duration-200 font-medium"
                                                                        }
                                                                    >
                                                                        {pageNum}
                                                                    </PaginationLink>
                                                                </motion.div>
                                                            </PaginationItem>
                                                        );
                                                    })}
                                                    <PaginationItem>
                                                        <motion.div
                                                            whileHover={{ scale: page < totalPages ? 1.05 : 1 }}
                                                            whileTap={{ scale: page < totalPages ? 0.95 : 1 }}
                                                        >
                                                            <PaginationNext
                                                                href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (page < totalPages) handlePageChange(page + 1);
                                                                }}
                                                                className={
                                                                    page >= totalPages
                                                                        ? "pointer-events-none opacity-40"
                                                                        : "hover:bg-slate-100 transition-all duration-200 hover:shadow-sm font-medium"
                                                                }
                                                            />
                                                        </motion.div>
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
}