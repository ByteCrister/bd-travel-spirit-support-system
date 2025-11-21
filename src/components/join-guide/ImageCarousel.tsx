// ImageCarousel.tsx - Mobile-Responsive Version
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type ImageCarouselProps = {
  Images: string[]
  autoPlayIntervalMs?: number;
  className?: string;
  showControls?: boolean;
};

export default function ImageCarousel({ Images, autoPlayIntervalMs = 5000, className, showControls = true }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const images = useMemo(
    () => Images.map((f) => ({ src: `/images/join_as_guide/${f}`, alt: f.replace(/[-_]/g, " ") })),
    [Images]
  );

  const next = useCallback(() => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (autoPlayIntervalMs <= 0 || images.length <= 1 || isDragging) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => next(), autoPlayIntervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, next, autoPlayIntervalMs, images.length, isDragging]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 30; // Reduced threshold for mobile
    if (info?.offset?.x > threshold) {
      prev();
    } else if (info?.offset?.x < -threshold) {
      next();
    }
  };

  return (
    <div className={`relative w-full overflow-hidden ${className ?? ""}`}>
      {/* Main carousel container with responsive aspect ratio */}
      <div className="relative w-full aspect-video sm:aspect-video md:aspect-[4/3] lg:aspect-[16/9] overflow-hidden rounded-lg sm:rounded-xl border bg-black/10 shadow-lg sm:shadow-xl ring-1 ring-black/5 dark:ring-white/5">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1], // Custom easing for smoother mobile animations
              opacity: { duration: 0.3 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="relative h-full w-full cursor-grab active:cursor-grabbing"
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
              className="object-cover select-none"
              priority={index === 0}
              quality={85}
            />
            {/* Gradient overlay - lighter on mobile for better visibility */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 sm:from-black/30 via-black/5 sm:via-black/10 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls - Conditional rendering based on props and screen size */}
      {showControls && (
        <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-between px-1 sm:px-2 md:px-4">
          <button
            aria-label="Previous slide"
            onClick={prev}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full 
                     bg-black/30 hover:bg-black/50 sm:bg-black/40 sm:hover:bg-black/60 
                     p-1.5 sm:p-2 md:p-2.5 text-white shadow-md backdrop-blur-sm 
                     transition-all duration-200 
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1
                     touch-manipulation active:scale-95"
          >
            <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            aria-label="Next slide"
            onClick={next}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full 
                     bg-black/30 hover:bg-black/50 sm:bg-black/40 sm:hover:bg-black/60 
                     p-1.5 sm:p-2 md:p-2.5 text-white shadow-md backdrop-blur-sm 
                     transition-all duration-200 
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1
                     touch-manipulation active:scale-95"
          >
            <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}

      {/* Dot Indicators - Responsive sizing and positioning */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 transform rounded-full bg-black/25 sm:bg-black/35 px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-200 touch-manipulation active:scale-125 ${i === index
                  ? "bg-white shadow-sm"
                  : "bg-white/40 hover:bg-white/70"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Loading indicator for better UX */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
        <motion.div
          key={`progress-${index}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: autoPlayIntervalMs / 1000, ease: "linear" }}
          className="h-0.5 w-8 sm:w-10 bg-white/30 rounded-full overflow-hidden"
          style={{ transformOrigin: "left" }}
        >
          <div className="h-full w-full bg-white/80 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}