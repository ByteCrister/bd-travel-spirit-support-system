"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup"
import { FiArrowRight, FiCheck, FiUsers, FiGlobe, FiTrendingUp } from "react-icons/fi";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

type FinalCTAProps = {
  onApplyClick?: () => void;
};

const benefits = [
  "Free to join",
  "No setup fees",
  "24/7 support",
  "Global reach",
];

export default function FinalCTA({ onApplyClick }: FinalCTAProps) {
  return (
    <section className={"relative py-24 sm:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 sm:p-16 text-white shadow-2xl"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10"></div>
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-teal-500/20 to-transparent blur-3xl"></div>

          <div className="relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-emerald-200 mb-6 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Join Today
                  </div>

                  <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                    Become a Guide{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      Today
                    </span>
                  </h2>

                  <p className="text-xl text-slate-200 leading-relaxed mb-8 max-w-2xl">
                    Start your application in minutes and reach travelers across Bangladesh and beyond.
                    Join the leading platform trusted by thousands of professional guides.
                  </p>

                  {/* Benefits */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {benefits.map((benefit, i) => (
                      <motion.div
                        key={benefit}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                          <FiCheck className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-slate-200 font-medium">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    onClick={onApplyClick}
                    className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-105"
                  >
                    Start Your Application
                    <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Right Content - Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              >
                {/* Active Guides */}
                <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-4">
                    <FiUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <CountUp end={1000} duration={2} separator="," suffix="+" enableScrollSpy scrollSpyOnce />
                  </div>
                  <div className="text-sm text-slate-300">Active Guides</div>
                </div>

                {/* Countries */}
                <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-4">
                    <FiGlobe className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <CountUp end={50} duration={2} separator="," suffix="+" enableScrollSpy scrollSpyOnce />
                  </div>
                  <div className="text-sm text-slate-300">Countries</div>
                </div>

                {/* Monthly Visitors */}
                <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 sm:col-span-3 lg:col-span-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4">
                    <FiTrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">
                    <CountUp end={150000} duration={2} separator="," suffix="+" enableScrollSpy scrollSpyOnce />
                  </div>
                  <div className="text-sm text-slate-300">Monthly Visitors</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


