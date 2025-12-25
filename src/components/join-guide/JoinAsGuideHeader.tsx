'use client'

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { FiArrowRight, FiUser, FiZap } from 'react-icons/fi'
import { motion } from 'framer-motion'
import useJoinAsGuideStore from '@/store/join-as-guide.store';
import { inter, jakarta } from '@/styles/fonts'
import { useRouter } from 'next/navigation'

const JoinAsGuideHeader = () => {
    const { openLogin } = useJoinAsGuideStore();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
    const router = useRouter();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollThreshold = 10; // Minimum scroll distance to trigger hide/show
            const hideThreshold = 100; // Scroll position where header starts hiding

            // Determine scroll direction
            if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
                if (currentScrollY > lastScrollY && currentScrollY > hideThreshold) {
                    // Scrolling down and past threshold
                    setScrollDirection('down');
                    setIsVisible(false);
                } else if (currentScrollY < lastScrollY) {
                    // Scrolling up
                    setScrollDirection('up');
                    setIsVisible(true);
                }
                setLastScrollY(currentScrollY);
            }

            // Always show header when at top of page
            if (currentScrollY < hideThreshold) {
                setIsVisible(true);
            }

            // Debounce: show header if user stops scrolling
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (currentScrollY > hideThreshold) {
                    setIsVisible(true);
                }
            }, 2000); // Show after 2 seconds of no scrolling
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [lastScrollY]);

    return (
        <motion.header
            animate={{
                y: isVisible ? 0 : -100,
                opacity: isVisible ? 1 : 0
            }}
            transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1], // Custom easing for smooth feel
                opacity: { duration: 0.2 }
            }}
            className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60" style={{
                willChange: 'transform, opacity' // Optimize for animations
            }}
        >
            <motion.div
                transition={{ duration: 0.3 }}
                className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
            >
                {/* Enhanced Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-shrink-0"
                >
                    <Link href="/" className="group flex items-center space-x-2 sm:space-x-3">
                        {/* Logo Icon */}
                        <div className="relative">
                            <div className="flex h-8 w-8 sm:h-10 md:h-12 sm:w-10 md:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-lg sm:shadow-xl shadow-emerald-500/30">
                                <span className={`${inter.className} text-sm sm:text-base md:text-lg font-bold text-white tracking-tight`}>
                                    BD
                                </span>
                            </div>
                            <div className="absolute -inset-1 sm:-inset-2 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-0 blur-lg transition-all duration-500 group-hover:opacity-40 group-hover:scale-110"></div>
                            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                        </div>

                        {/* Logo Text - Responsive */}
                        <div className="flex flex-col space-y-0.5 sm:space-y-1 min-w-0">
                            <div className="relative">
                                {/* Mobile: Shorter text */}
                                <span className={`${inter.className} block sm:hidden text-lg font-bold bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent leading-tight tracking-tight`}>
                                    BD Travel
                                </span>
                                {/* Desktop: Full text */}
                                <span className={`${inter.className} hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent leading-tight tracking-tight`}>
                                    BD Travel Spirit
                                </span>
                                {/* Text Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <div className="h-0.5 sm:h-1 w-4 sm:w-6 md:w-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                                <span className={`${jakarta.className} text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wider sm:tracking-widest uppercase truncate`}>
                                    <span className="hidden sm:inline">Professional </span>Guides
                                </span>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                    {/* Support Login Button */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        onClick={openLogin}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative inline-flex items-center gap-1.5 sm:gap-2.5 rounded-xl sm:rounded-2xl 
            bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800
            border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm
            px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 
            shadow-md sm:shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
            hover:shadow-lg sm:hover:shadow-xl hover:shadow-gray-300/60 dark:hover:shadow-gray-800/60
            hover:border-emerald-300/40 dark:hover:border-emerald-500/40
            transition-all duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 
            focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
            overflow-hidden"
                    >
                        {/* Background Glow Effect */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                        {/* Icon Container */}
                        <div className="relative z-10 flex items-center justify-center flex-shrink-0">
                            <div className="flex h-5 w-5 sm:h-6 md:h-7 sm:w-6 md:w-7 items-center justify-center rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-200/30 dark:border-emerald-500/20 group-hover:border-emerald-300/50 dark:group-hover:border-emerald-400/40 transition-all duration-300">
                                <FiUser className="h-2.5 w-2.5 sm:h-3 md:h-3.5 sm:w-3 md:w-3.5 text-emerald-600 dark:text-emerald-400 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
                            </div>
                        </div>

                        {/* Text Content - Responsive */}
                        <div className="relative z-10 flex flex-col items-start min-w-0">
                            {/* Mobile: Short text */}
                            <span className="sm:hidden text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 dark:group-hover:from-emerald-300 dark:group-hover:to-teal-300 transition-all duration-300 truncate">
                                Support
                            </span>
                            {/* Tablet: Medium text */}
                            <span className="hidden sm:inline md:hidden text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 dark:group-hover:from-emerald-300 dark:group-hover:to-teal-300 transition-all duration-300">
                                Support Login
                            </span>
                            {/* Desktop: Full text */}
                            <span className="hidden md:inline text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 dark:group-hover:from-emerald-300 dark:group-hover:to-teal-300 transition-all duration-300">
                                Log in as support member
                            </span>
                            <div className="hidden md:block h-0.5 w-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 group-hover:w-full"></div>
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 -translate-x-full transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-full"></div>
                    </motion.button>

                    {/* Enhanced Apply Button */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                        onClick={() => { router.push('/register-as-guide') }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl 
            bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 
            px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold text-white 
            shadow-lg sm:shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 
            transition-all duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 
            focus-visible:ring-offset-2 focus-visible:ring-offset-transparent 
            dark:focus-visible:ring-offset-gray-900
            overflow-hidden flex-shrink-0"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-30"></div>

                        {/* Button Content */}
                        <div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                            <FiZap className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:rotate-12 flex-shrink-0" />
                            <span className="whitespace-nowrap">Apply Now</span>
                            <FiArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" />
                        </div>

                        {/* Shine Effect */}
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 -translate-x-full transition-all duration-1000 group-hover:opacity-100 group-hover:translate-x-full"></div>
                    </motion.button>
                </div>
            </motion.div>

            {/* Subtle scroll indicator line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: scrollDirection === 'up' ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
            />
        </motion.header>
    )
}

export default JoinAsGuideHeader