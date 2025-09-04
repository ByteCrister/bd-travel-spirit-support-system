"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FiGlobe, FiCreditCard, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

const benefits = [
  {
    icon: FiGlobe,
    title: "Global Exposure",
    desc: "Reach travelers worldwide with marketplace visibility and SEO optimization.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
  },
  {
    icon: FiCalendar,
    title: "Smart Booking Management",
    desc: "Manage availability, requests, and messaging in one unified dashboard.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
  },
  {
    icon: FiCreditCard,
    title: "Secure Payments",
    desc: "Reliable payouts with transparent fees and comprehensive protection.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  },
  {
    icon: FiTrendingUp,
    title: "Marketing Support",
    desc: "Promotions, featured spots, newsletters, and social media boosts.",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
  },
];

export default function WhyPartner() {
  return (
    <section className={"relative py-24 sm:py-32 " + jakarta.className}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Why Choose Us
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl mb-6">
            Partner with the{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Leading Platform
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of successful guides who have transformed their business with our comprehensive platform and dedicated support.
          </p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay: 0.2, duration: 0.8 }}
      className="mb-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Monthly Visitors */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/50">
          <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            <CountUp end={150000} duration={2} separator="," suffix="+" enableScrollSpy scrollSpyOnce />
          </div>
          <div className="text-gray-600 dark:text-gray-300 font-medium">Monthly Visitors</div>
        </div>

        {/* Bookings Processed */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            <CountUp end={12000} duration={2} separator="," suffix="+" enableScrollSpy scrollSpyOnce />
          </div>
          <div className="text-gray-600 dark:text-gray-300 font-medium">Bookings Processed</div>
        </div>

        {/* Active Guides */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            <CountUp end={1000} duration={2} separator="," suffix="+" enableScrollSpy scrollSpyOnce />
          </div>
          <div className="text-gray-600 dark:text-gray-300 font-medium">Active Guides</div>
        </div>
      </div>
    </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
              className="group relative"
            >
              <div className={`relative h-full p-8 rounded-2xl bg-gradient-to-br ${benefit.bgGradient} border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-900/10 dark:hover:shadow-gray-100/10 hover:-translate-y-2`}>
                {/* Background Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${benefit.gradient} mb-6 shadow-lg`}>
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {benefit.desc}
                </p>
                
                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


