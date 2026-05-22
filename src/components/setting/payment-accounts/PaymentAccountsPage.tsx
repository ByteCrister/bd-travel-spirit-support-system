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
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

// ── Neumorphism Style Tokens ──────────────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-bold " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 border border-white/60 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_HEADING = "font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "text-sm text-[#1E2938]/50";

const NEU_ICON_WELL_PRIMARY =
    "p-3 rounded-xl bg-[#006666]/10 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

const NEU_DIVIDER = "border-[#1E2938]/10";

const NEU_PAGINATION_ACTIVE =
    "rounded-lg bg-[#006666] text-white font-bold " +
    "shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] " +
    "hover:bg-[#007777] border-0";

const NEU_PAGINATION_ITEM =
    "rounded-lg bg-[#E7E5E4] text-[#1E2938] font-medium " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 border-0";

// ── Animation Variants ────────────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 20 }
    }
};

// ─────────────────────────────────────────────────────────────────────────────

const breadcrumbItems = [
    { label: "Home", href: "/" },
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
        <div
            className={`${NEU_PAGE_BG} p-4 lg:p-6 xl:p-8`}
            style={{ fontFamily: "var(--font-space-mono)" }}
        >
            <Breadcrumbs items={breadcrumbItems} />

            <motion.div
                className="max-w-6xl mx-auto py-8 lg:py-10 space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ── Header ── */}
                <motion.div variants={itemVariants}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Title */}
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ rotate: -180, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                                className={NEU_ICON_WELL_PRIMARY}
                            >
                                <CreditCard className="h-6 w-6 text-[#006666]" />
                            </motion.div>
                            <div>
                                <h1
                                    className={`text-2xl lg:text-3xl ${NEU_HEADING}`}
                                    style={{ fontFamily: "var(--font-space-mono)" }}
                                >
                                    Payment Accounts
                                </h1>
                                <p
                                    className={`${NEU_MUTED} mt-0.5`}
                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                >
                                    Manage your payment methods and billing information
                                </p>
                            </div>
                        </div>

                        {/* CTA */}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                            <AddPaymentAccountDialog>
                                <Button
                                    size="lg"
                                    className={`${NEU_BTN_PRIMARY} px-5 h-11 text-sm`}
                                    style={{ fontFamily: "var(--font-space-mono)" }}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Payment Method
                                </Button>
                            </AddPaymentAccountDialog>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ── Content Card ── */}
                <motion.div className={NEU_CARD} variants={cardVariants}>
                    <AnimatePresence mode="wait">
                        {accounts.length === 0 ? (
                            /* Empty State */
                            <motion.div
                                key="empty-state"
                                className="text-center py-20 px-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Icon well */}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
                                    className="mx-auto w-20 h-20 mb-6 flex items-center justify-center rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_10px_#c8c6c5,inset_-4px_-4px_10px_#ffffff] relative"
                                >
                                    <CreditCard className="h-9 w-9 text-[#1E2938]/30" />
                                    <motion.div
                                        className="absolute top-2 right-2"
                                        animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                                    >
                                        <Sparkles className="h-3.5 w-3.5 text-[#006666]/40" />
                                    </motion.div>
                                </motion.div>

                                <motion.h3
                                    className={`text-lg ${NEU_HEADING} mb-2`}
                                    style={{ fontFamily: "var(--font-space-mono)" }}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    No payment accounts yet
                                </motion.h3>
                                <motion.p
                                    className={`${NEU_MUTED} mb-8 max-w-sm mx-auto leading-relaxed`}
                                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    Get started by adding your first payment method to enable seamless transactions
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="inline-block"
                                >
                                    <AddPaymentAccountDialog>
                                        <Button
                                            size="lg"
                                            className={`${NEU_BTN_GHOST} group px-6 h-11 text-sm`}
                                            style={{ fontFamily: "var(--font-space-mono)" }}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
                                            Add Your First Payment Method
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
                                        </Button>
                                    </AddPaymentAccountDialog>
                                </motion.div>
                            </motion.div>
                        ) : (
                            /* Accounts List */
                            <motion.div
                                key="accounts-list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <PaymentAccountTable accounts={accounts} />

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <motion.div
                                        className={`px-6 py-5 border-t ${NEU_DIVIDER}`}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            {/* Count summary */}
                                            <p
                                                className={`${NEU_MUTED} text-xs`}
                                                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                                            >
                                                Showing{" "}
                                                <span className="font-bold text-[#1E2938]">
                                                    {(page - 1) * pageSize + 1}
                                                </span>{" "}
                                                –{" "}
                                                <span className="font-bold text-[#1E2938]">
                                                    {Math.min(page * pageSize, listTotal)}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-bold text-[#1E2938]">{listTotal}</span>{" "}
                                                accounts
                                            </p>

                                            {/* Page links */}
                                            <Pagination>
                                                <PaginationContent className="gap-1.5">
                                                    {/* Previous */}
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
                                                                        ? `${NEU_PAGINATION_ITEM} pointer-events-none opacity-40`
                                                                        : NEU_PAGINATION_ITEM
                                                                }
                                                            />
                                                        </motion.div>
                                                    </PaginationItem>

                                                    {/* Page numbers */}
                                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                        let pageNum: number;
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
                                                                    whileHover={{ scale: 1.08 }}
                                                                    whileTap={{ scale: 0.94 }}
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
                                                                                ? NEU_PAGINATION_ACTIVE
                                                                                : NEU_PAGINATION_ITEM
                                                                        }
                                                                    >
                                                                        {pageNum}
                                                                    </PaginationLink>
                                                                </motion.div>
                                                            </PaginationItem>
                                                        );
                                                    })}

                                                    {/* Next */}
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
                                                                        ? `${NEU_PAGINATION_ITEM} pointer-events-none opacity-40`
                                                                        : NEU_PAGINATION_ITEM
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