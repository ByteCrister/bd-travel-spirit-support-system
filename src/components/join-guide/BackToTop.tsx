"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowUp } from "react-icons/fi";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Enhanced scroll detection with progress tracking
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;

      setScrollProgress(scrollPercent);
      setIsVisible(scrollTop > 300);

      // Detect when scrolling stops
      setIsScrolling(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Enhanced smooth scroll with easing
  const scrollToTop = useCallback(() => {
    const startPosition = window.pageYOffset;
    const startTime = Date.now();
    const duration = Math.min(1500, Math.max(800, startPosition / 3)); // Dynamic duration based on scroll position

    // Custom easing function (ease-out-cubic)
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animateScroll = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentPosition = startPosition * (1 - easedProgress);
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

  // Fallback to native smooth scroll for better browser compatibility
  const scrollToTopFallback = useCallback(() => {
    // Try the enhanced version first
    if ('requestAnimationFrame' in window) {
      scrollToTop();
    } else {
      // Fallback to native smooth scroll
      (window as Window).scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [scrollToTop]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.3, y: 40 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            scale: { type: "spring", stiffness: 300, damping: 30 }
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 md:bottom-8 sm:right-6 md:right-8 z-50"
        >
          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={scrollToTopFallback}
            className={`group relative inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl 
              bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 
              shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:shadow-xl
              transition-all duration-300 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 
              focus-visible:ring-offset-2 focus-visible:ring-offset-transparent 
              dark:focus-visible:ring-offset-gray-900 
              backdrop-blur-sm border border-white/10
              ${jakarta.className}`}
            whileHover={{
              scale: 1.05,
              y: -2,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1 }
            }}
          >
            {/* Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="white/20"
                strokeWidth="2"
                fill="none"
                className="opacity-30"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress)}`}
                className="opacity-60"
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </svg>

            {/* Enhanced Background Glow */}
            <motion.div
              className="absolute -inset-1 sm:-inset-2 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 opacity-0 blur-xl"
              animate={{
                opacity: isHovered ? 0.6 : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            {/* Dynamic Shine Effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{
                x: isHovered ? "100%" : "-100%",
                opacity: isHovered ? 1 : 0
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 1
              }}
            />

            {/* Pulsing effect when scrolling */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-white/10"
              animate={{
                opacity: isScrolling ? 0.3 : 0,
                scale: isScrolling ? 1.05 : 1
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Enhanced Icon with micro-animations */}
            <div className="relative flex items-center justify-center z-10">
              <motion.div
                animate={{
                  y: isHovered ? -1 : 0,
                  rotate: isScrolling ? 360 : 0
                }}
                transition={{
                  y: { duration: 0.2, ease: "easeOut" },
                  rotate: { duration: 0.6, ease: "easeInOut" }
                }}
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <FiArrowUp
                    className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-sm"
                    strokeWidth={2.5}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
                x: isHovered ? -60 : 20
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 text-sm font-medium rounded-lg backdrop-blur-sm border border-white/10 dark:border-gray-900/10 whitespace-nowrap pointer-events-none"
            >
              Back to top
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900/90 dark:border-l-gray-100/90"></div>
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}