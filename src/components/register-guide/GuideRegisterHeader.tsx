"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
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
            className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/60"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* Left Section */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                        {/* Back Button */}
                        <Link href="/" className="shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back to Home</span>
                            </Button>
                        </Link>

                        {/* Title + Subtitle */}
                        <div>
                            <h1
                                className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent"
                                style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
                            >
                                Register as Guide
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 max-w-lg">
                                Join <span className="font-medium text-blue-600">BD Travel Spirit</span> as a verified guide and start your journey.
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveAndContinueLater}
                            className="flex items-center gap-2 hover:bg-gray-100"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Save & Continue Later</span>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
