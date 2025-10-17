"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { FaInfoCircle, FaStar, FaFlag, FaQuestionCircle } from "react-icons/fa";

import AllDetails from "./AllDetails";
import ReviewsPanel from "./ReviewsPanel";
import ReportsPanel from "./ReportsPanel";
import TourFaqs from "./TourFaqs";

type Props = { companyId: string; tourId: string };

export default function TourDetailPage({ companyId, tourId }: Props) {
    const [tab, setTab] = useState<string>("details");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const hash = window.location.hash?.replace("#", "");
        if (hash) setTab(hash);
    }, []);

    const handleTabChange = useCallback((value: string) => {
        setTab(value);
    }, []);

    const handleCopy = () => {
        const link = `${window.location.origin}/tours/${companyId}/${tourId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = [
        { value: "details", label: "All details", icon: <FaInfoCircle className="w-4 h-4" /> },
        { value: "reviews", label: "Reviews", icon: <FaStar className="w-4 h-4" /> },
        { value: "reports", label: "Reports", icon: <FaFlag className="w-4 h-4" /> },
        { value: "faqs", label: "FAQs", icon: <FaQuestionCircle className="w-4 h-4" /> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 p-[1px] shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-8">
                    <div>
                        <nav className="text-sm text-slate-500 mb-3" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-2">
                                <li className="hover:underline cursor-pointer">Tours</li>
                                <li className="text-slate-300">/</li>
                                <li className="font-medium text-slate-700 dark:text-slate-200">
                                    Tour Overview
                                </li>
                            </ol>
                        </nav>

                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Tour Overview
                        </h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Manage details, reviews, reports, and FAQs for this tour.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={handleCopy}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-md transition-all duration-200 hover:scale-105"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-slate-500" />
                                        )}
                                        {copied ? "Copied!" : "Copy Link"}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Copy shareable link</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-10">
                <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl shadow-inner max-w-2xl mx-auto">
                        {tabs.map(({ value, label, icon }) => (
                            <TabsTrigger
                                key={value}
                                value={value}
                                className={`relative w-full px-6 py-3 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${tab === value
                                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {icon}
                                {label}
                                {tab === value && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-lg border-2 border-blue-500"
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    />
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="mt-8">
                        <TabsContent value="details">
                            <AllDetails companyId={companyId} tourId={tourId} />
                        </TabsContent>
                        <TabsContent value="reviews">
                            <ReviewsPanel companyId={companyId} tourId={tourId} />
                        </TabsContent>
                        <TabsContent value="reports">
                            <ReportsPanel companyId={companyId} tourId={tourId} />
                        </TabsContent>
                        <TabsContent value="faqs">
                            <TourFaqs companyId={companyId} tourId={tourId} active />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
