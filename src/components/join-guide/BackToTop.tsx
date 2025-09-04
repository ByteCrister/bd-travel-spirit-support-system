"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowUp } from "react-icons/fi";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50"
        >
          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={scrollToTop}
            className={`group relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl 
    bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 
    shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 
    transition-all duration-300 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 
    focus-visible:ring-offset-2 focus-visible:ring-offset-transparent 
    dark:focus-visible:ring-offset-gray-900 ${jakarta.className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-0 blur-lg"
              animate={{ opacity: isHovered ? 0.4 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: isHovered ? "100%" : "-100%", opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            {/* Icon */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ y: isHovered ? -2 : 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <FiArrowUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </motion.div>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
