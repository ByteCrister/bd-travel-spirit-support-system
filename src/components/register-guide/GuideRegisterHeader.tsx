"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { inter, jakarta } from "@/styles/fonts";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    handleSaveAndContinueLater: () => void;
}

export function GuideRegisterHeader({ handleSaveAndContinueLater }: HeaderProps) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* Left Section */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                        {/* Back to home */}
                        <Link href="/" className="shrink-0 group">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:border-emerald-400/60"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Back to Home
                                </span>
                            </Button>
                        </Link>

                        {/* Title + Subtitle */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/40">
                                        <span className={`${inter.className} text-sm sm:text-base font-bold text-white tracking-tight`}>
                                            BD
                                        </span>
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className={`${inter.className} text-xs uppercase tracking-[0.2em] text-emerald-300/80`}>
                                        Guide Application
                                    </p>
                                    <h1
                                        className={`${jakarta.className} text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight`}
                                    >
                                        <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                                            Register as Guide
                                        </span>
                                    </h1>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 max-w-xl">
                                Join{" "}
                                <span className="font-semibold text-emerald-300">
                                    BD Travel Spirit
                                </span>{" "}
                                as a verified guide and access the same premium
                                tools and audience you see on our main landing
                                page.
                            </p>
                        </div>
                    </div>

                    {/* Right Section - Save draft */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveAndContinueLater}
                            className="flex items-center gap-2 rounded-xl border-emerald-500/60 bg-white text-emerald-700 hover:bg-emerald-50"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                Save &amp; continue later
                            </span>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}