"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowRight, FiZap, FiUser } from "react-icons/fi";
import HeroSection from "@/components/join-guide/HeroSection";
import WhyPartner from "@/components/join-guide/WhyPartner";
import HowItWorks from "@/components/join-guide/HowItWorks";
import Testimonials from "@/components/join-guide/Testimonials";
import ToolsFeatures from "@/components/join-guide/ToolsFeatures";
import FinalCTA from "@/components/join-guide/FinalCTA";
import BackToTop from "@/components/join-guide/BackToTop";
import Footer from "@/components/join-guide/Footer";
import LoginPopover from "@/components/join-guide/LoginPopover";
import Link from "next/link";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function JoinAsGuide() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleApplyClick = useCallback(() => {
    const target = document.querySelector("#how-it-works");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleLoginClick = useCallback(() => {
    setIsLoginOpen(true);
  }, []);

  const handleLoginClose = useCallback(() => {
    setIsLoginOpen(false);
  }, []);

  return (
    <main className={`min-h-dvh ${jakarta.className}`}>
      <header className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Enhanced Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Link href="/" className="group flex items-center space-x-3">
              {/* Logo Icon */}
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-xl shadow-emerald-500/30">
                  <span className={`${inter.className} text-lg font-bold text-white tracking-tight`}>
              BD
            </span>
                </div>
                <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-0 blur-lg transition-all duration-500 group-hover:opacity-40 group-hover:scale-110"></div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </div>

              {/* Logo Text */}
              <div className="flex flex-col space-y-1">
                <div className="relative">
                  <span className={`${inter.className} text-2xl font-bold bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent leading-tight tracking-tight`}>
                    BD Travel Spirit
                  </span>
                  {/* Text Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-sm opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                  <span className={`${jakarta.className} text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase`}>
                    Professional Guides
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Support Login Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              onClick={handleLoginClick}
              className="group relative inline-flex items-center gap-2.5 rounded-2xl 
    bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800
    border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm
    px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 
    shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50
    hover:shadow-xl hover:shadow-gray-300/60 dark:hover:shadow-gray-800/60
    hover:scale-105 hover:border-emerald-300/40 dark:hover:border-emerald-500/40
    transition-all duration-300
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 
    focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
    overflow-hidden"
            >
              {/* Background Glow Effect - contained within button */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              
              {/* Icon Container */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-200/30 dark:border-emerald-500/20 group-hover:border-emerald-300/50 dark:group-hover:border-emerald-400/40 transition-all duration-300">
                  <FiUser className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
                </div>
              </div>
              
              {/* Text Content */}
              <div className="relative z-10 flex flex-col items-start">
                <span className="hidden sm:inline text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 dark:group-hover:from-emerald-300 dark:group-hover:to-teal-300 transition-all duration-300">
                  Log in as support member
                </span>
                <span className="sm:hidden text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-teal-700 dark:group-hover:from-emerald-300 dark:group-hover:to-teal-300 transition-all duration-300">
                  Support Login
            </span>
                <div className="hidden sm:block h-0.5 w-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 group-hover:w-full"></div>
              </div>
              
              {/* Shine Effect - contained within button */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 -translate-x-full transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-full"></div>
            </motion.button>

            {/* Enhanced Apply Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            onClick={handleApplyClick}
              className="group relative inline-flex items-center gap-2 rounded-2xl 
    bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 
    px-5 py-3 text-sm font-semibold text-white 
    shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 
    hover:scale-105 transition-all duration-300
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 
    focus-visible:ring-offset-2 focus-visible:ring-offset-transparent 
    dark:focus-visible:ring-offset-gray-900
    overflow-hidden"
            >
              {/* Background Glow - contained within button */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-30"></div>

              {/* Button Content */}
              <div className="relative z-10 flex items-center gap-2">
                <FiZap className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                <span>Apply Now</span>
                <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>

              {/* Shine Effect - contained within button */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 -translate-x-full transition-all duration-1000 group-hover:opacity-100 group-hover:translate-x-full"></div>
            </motion.button>
          </div>

        </div>
      </header>

      <HeroSection onApplyClick={handleApplyClick} />
      <WhyPartner />
      <HowItWorks />
      <Testimonials />
      <ToolsFeatures />
      <FinalCTA onApplyClick={handleApplyClick} />

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      <BackToTop />

      {/* Login Popover */}
      <LoginPopover isOpen={isLoginOpen} onClose={handleLoginClose} />
    </main>
  );
}
