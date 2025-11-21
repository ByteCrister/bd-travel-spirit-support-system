"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FiGlobe,
  FiArrowRight,
  FiShield,
  FiAward,
  FiUsers,
  FiHeart
} from "react-icons/fi";
import { Plus_Jakarta_Sans } from "next/font/google";
import { FooterTypes } from "@/types/join-as-guide.types";
import IconFromName from "../global/IconFromName";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Story", href: "/story" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Blog", href: "/blog" },
  ],
  guides: [
    { name: "Become a Guide", href: "/join-as-guide" },
    { name: "Guide Resources", href: "/guide-resources" },
    { name: "Guide Dashboard", href: "/guide-dashboard" },
    { name: "Guide Support", href: "/guide-support" },
    { name: "Guide Training", href: "/guide-training" },
  ],
  travelers: [
    { name: "Find Tours", href: "/tours" },
    { name: "Destinations", href: "/destinations" },
    { name: "Travel Tips", href: "/travel-tips" },
    { name: "Reviews", href: "/reviews" },
    { name: "Travel Insurance", href: "/insurance" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Safety Center", href: "/safety" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
};

// const defaultSocialLinks = [
//   { name: "Facebook", icon: FiFacebook, href: "https://facebook.com/bdtravelspirit", color: "hover:text-blue-600" },
//   { name: "Twitter", icon: FiTwitter, href: "https://twitter.com/bdtravelspirit", color: "hover:text-sky-500" },
//   { name: "Instagram", icon: FiInstagram, href: "https://instagram.com/bdtravelspirit", color: "hover:text-pink-500" },
//   { name: "LinkedIn", icon: FiLinkedin, href: "https://linkedin.com/company/bdtravelspirit", color: "hover:text-blue-700" },
//   { name: "YouTube", icon: FiYoutube, href: "https://youtube.com/bdtravelspirit", color: "hover:text-red-600" },
// ];

const defaultStats = [
  { icon: FiUsers, label: "Active Guides", end: "+" },
  { icon: FiGlobe, label: "Countries", end: "+" },
  { icon: FiAward, label: "Average Rating", end: "/5" },
  { icon: FiShield, label: "Secure Payments", end: "%" },
];

export default function Footer({ data }: { data: FooterTypes }) {
  const currentYear = new Date().getFullYear();
  const stats = [
    data.stats.active_guides,
    data.stats.destinations,
    data.stats.average_rating,
    data.stats.secure_payment,
  ];

  return (
    <footer
      className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white ${jakarta.className}`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-6 lg:gap-8 xl:gap-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="sm:col-span-2 lg:col-span-2 xl:col-span-2"
            >
              {/* Logo */}
              <div className="mb-6">
                <Link href="/" className="group flex items-center space-x-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 shadow-xl shadow-emerald-500/30">
                      <span className="text-lg font-bold text-white">BD</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent leading-tight">
                      BD Travel Spirit
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 tracking-widest uppercase">
                      Professional Guides
                    </span>
                  </div>
                </Link>
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-6 text-sm lg:text-base">
                Connecting travelers with authentic experiences through our network
                of professional guides across Bangladesh and beyond.
              </p>

              {/* Stats */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                  Our Impact
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((value, i) => {
                    const end = defaultStats[i].end;
                    const Icon = defaultStats[i].icon;
                    const label = defaultStats[i].label;
                    return (<motion.div
                      key={label}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="group relative overflow-hidden text-center p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-emerald-500/30 transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      {/* Background Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Icon Container */}
                      <div className="relative mb-3">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-300">
                          <Icon className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
                        </div>
                      </div>

                      {/* Value */}
                      <div className="relative mb-1">
                        <div className="text-lg lg:text-xl font-bold text-white group-hover:text-emerald-100 transition-colors duration-300">
                          {value}{end}
                        </div>
                      </div>

                      {/* Label */}
                      <div className="relative">
                        <div className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          {label}
                        </div>
                      </div>
                    </motion.div>)
                  })}
                </div>
              </div>
            </motion.div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([section, links], sectionIndex) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: sectionIndex * 0.1, duration: 0.6 }}
                className="lg:col-span-1 xl:col-span-1"
              >
                <div className="relative">
                  {/* Section Header with Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${section === "company" ? "bg-blue-500/20 border border-blue-500/30" :
                      section === "guides" ? "bg-emerald-500/20 border border-emerald-500/30" :
                        section === "travelers" ? "bg-purple-500/20 border border-purple-500/30" :
                          "bg-orange-500/20 border border-orange-500/30"
                      }`}>
                      {section === "company" && <FiGlobe className="h-4 w-4 text-blue-400" />}
                      {section === "guides" && <FiUsers className="h-4 w-4 text-emerald-400" />}
                      {section === "travelers" && <FiAward className="h-4 w-4 text-purple-400" />}
                      {section === "support" && <FiShield className="h-4 w-4 text-orange-400" />}
                    </div>
                    <h4 className="text-base font-semibold text-white capitalize">
                      {section === "company" && "Company"}
                      {section === "guides" && "For Guides"}
                      {section === "travelers" && "For Travelers"}
                      {section === "support" && "Support Us"}
                    </h4>
                  </div>

                  {/* Links List */}
                  <ul className="space-y-2">
                    {links.map((link, i) => (
                      <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                      >
                        <Link
                          href={link.href}
                          className="group flex items-center text-gray-300 hover:text-white transition-all duration-300 text-sm py-2 px-3 rounded-lg hover:bg-white/5"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${section === "company" ? "bg-blue-400 group-hover:bg-blue-300" :
                              section === "guides" ? "bg-emerald-400 group-hover:bg-emerald-300" :
                                section === "travelers" ? "bg-purple-400 group-hover:bg-purple-300" :
                                  "bg-orange-400 group-hover:bg-orange-300"
                              }`}></div>
                            <span className="flex-1 group-hover:translate-x-1 transition-transform duration-300">
                              {link.name}
                            </span>
                            <FiArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                          </div>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Follow Us & Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 pt-8 border-t border-gray-700/50"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
              {/* Follow Us Section */}
              <div className="lg:col-span-1 xl:col-span-1">
                <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
                <p className="text-gray-300 mb-6 text-sm lg:text-base">
                  Stay connected with us on social media for the latest updates, travel tips, and exclusive offers.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                  {data.socialLinks.map((social, i) => (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                        <IconFromName name={social.icon} className="h-3.5 w-3.5 text-emerald-400 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                        {social.name}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Newsletter Section */}
              <div className="lg:col-span-2 xl:col-span-2">
                <h3 className="text-xl font-bold text-white mb-4">Stay Updated</h3>
                <p className="text-gray-300 mb-6 text-sm lg:text-base">
                  Get the latest travel tips, guide opportunities, and exclusive offers delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all duration-300"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 whitespace-nowrap"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="lg:col-span-1 xl:col-span-1">
                <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                      <FiAward className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Become a Guide</div>
                      <div className="text-xs text-gray-400">Join our network</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                      <FiShield className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Safety First</div>
                      <div className="text-xs text-gray-400">Secure platform</div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <FiGlobe className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Global Reach</div>
                      <div className="text-xs text-gray-400">{data.stats.global_research_countries}+ countries</div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm text-center sm:text-left"
              >
                <span>© {currentYear} BD Travel Spirit. All rights reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Made with</span>
                <FiHeart className="h-4 w-4 text-red-500" />
                <span className="hidden sm:inline">in Bangladesh</span>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4 sm:gap-6 text-gray-400 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <FiShield className="h-4 w-4 text-emerald-400" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiAward className="h-4 w-4 text-yellow-400" />
                  <span>Trusted Platform</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
