"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
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
            className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
                    
                    {/* Left Section: Logo & Title */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href="/" className="shrink-0 group hidden sm:block">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Home</span>
                            </Button>
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/30 shrink-0">
                                <span className={`${inter.className} text-sm sm:text-base font-bold text-white tracking-tight`}>
                                    BD
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <h1 className={`${jakarta.className} text-base sm:text-lg font-semibold tracking-tight leading-tight`}>
                                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                                        Guide Registration
                                    </span>
                                </h1>
                                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest hidden sm:block">
                                    BD Travel Spirit
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Desktop Guide Site Button */}
                        <Link 
                            href="https://bd-travel-spirit-guide-system.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hidden md:flex items-center gap-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>Guide Site</span>
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveAndContinueLater}
                            className="flex items-center gap-2 rounded-xl border-emerald-500/30 bg-background text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Save Draft</span>
                        </Button>

                        <a href="#registration-form">
                            <Button
                                size="sm"
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:from-emerald-400 hover:to-teal-400 transition-all duration-300"
                            >
                                Apply Now
                            </Button>
                        </a>

                        {/* Mobile Guide Site Button */}
                        <Link 
                            href="https://bd-travel-spirit-guide-system.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="md:hidden"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
