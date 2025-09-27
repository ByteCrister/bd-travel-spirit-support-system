// HeroSection.tsx - Updated for better mobile responsiveness
"use client";

import { motion } from "framer-motion";
import { FiArrowRight, FiStar, FiUsers, FiGlobe } from "react-icons/fi";
import Link from "next/link";
import ImageCarousel from "./ImageCarousel";
import CountUp from "react-countup";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

type HeroSectionProps = {
  onApplyClick?: () => void;
};

export default function HeroSection({ onApplyClick }: HeroSectionProps) {
  return (
    <section
      className={`relative overflow-hidden min-h-[calc(100vh-4rem)] sm:min-h-screen flex items-center ${jakarta.className}`}
    >
      {/* Premium background with carousel - No controls for main background */}
      <div className="absolute inset-0 -z-10">
        <ImageCarousel className="h-full w-full" showControls={false} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/50 to-slate-900/80 sm:from-slate-900/60 sm:via-slate-800/40 sm:to-slate-900/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 sm:from-black/50 sm:to-black/30" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Content - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            {/* Badge - Mobile responsive */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-emerald-100 backdrop-blur-sm border border-emerald-400/30"
            >
              <FiStar className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
              <span>
                Trusted by{" "}
                <CountUp end={1000} duration={2} separator="," />+ Guides
              </span>
            </motion.div>

            {/* Main Heading - Mobile typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight"
            >
              Grow Your Travel Business with{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                BD Travel Spirit
              </span>
            </motion.h1>

            {/* Subtitle - Mobile responsive text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Join thousands of guides reaching travelers worldwide. Build your
              reputation, manage bookings effortlessly, and grow your income with
              our premium platform.
            </motion.p>

            {/* Stats - Mobile layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6 sm:gap-8"
            >
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <FiUsers className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    <CountUp end={150} duration={2.5} />K+
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">Monthly Visitors</div>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                  <FiGlobe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    <CountUp end={50} duration={2} />+
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">Countries</div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={onApplyClick}
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 touch-manipulation"
              >
                Start Your Journey
                <FiArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 touch-manipulation"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Content - Small carousel with controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageCarousel className="h-[400px] lg:h-[500px] w-full" showControls={true} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator - Mobile responsive */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/70"
        >
          <span className="text-xs sm:text-sm font-medium">Scroll to explore</span>
          <div className="h-6 w-4 sm:h-8 sm:w-5 rounded-full border-2 border-white/40 p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1 sm:h-2 sm:w-1.5 rounded-full bg-white mx-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}