// ImageCarousel.tsx – Fixed aspect ratio, no height conflicts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";

type ImageCarouselProps = {
  Images: string[];
  autoPlayIntervalMs?: number;
  className?: string;
  showControls?: boolean;
};

export default function ImageCarousel({
  Images,
  autoPlayIntervalMs = 5000,
  className,
  showControls = true,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const images = useMemo(
    () =>
      Images.map((f) => ({
        src: `/images/join_as_guide/${f}`,
        alt: f.replace(/[-_]/g, " "),
      })),
    [Images]
  );

  const next = useCallback(() => {
    if (images.length === 0) return;
    setDirection(1);
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    if (images.length === 0) return;
    setDirection(-1);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Auto-play
  useEffect(() => {
    if (autoPlayIntervalMs <= 0 || images.length <= 1 || isDragging) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => next(), autoPlayIntervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, next, autoPlayIntervalMs, images.length, isDragging]);

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 30;
    if (info.offset.x > threshold) prev();
    else if (info.offset.x < -threshold) next();
  };

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <FiImage className="h-12 w-12 text-gray-400" />
        <span className="sr-only">No images available</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden ${className ?? ""}`}>
      {/* Main carousel container – uses aspect-video for consistency */}
      <div className="relative w-full aspect-video overflow-hidden rounded-xl border bg-black/5 shadow-lg ring-1 ring-black/5 dark:ring-white/5">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="relative h-full w-full cursor-grab active:cursor-grabbing"
          >
            {!imgErrors[index] ? (
              <Image
                src={images[index].src}
                alt={images[index].alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                className="object-cover select-none"
                priority={index === 0}
                quality={85}
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [index]: true }))
                }
              />
            ) : (
              <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <FiImage className="h-12 w-12 text-gray-500" />
                <span className="sr-only">Image failed to load</span>
              </div>
            )}
            {/* Gradient overlay (light/dark aware) */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent dark:from-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls – improved visibility for light/dark */}
      {showControls && images.length > 1 && (
        <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-between px-2 md:px-4">
          <button
            aria-label="Previous slide"
            onClick={prev}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full
                       bg-white/60 hover:bg-white/80 dark:bg-black/50 dark:hover:bg-black/70
                       p-1.5 sm:p-2 md:p-2.5 text-gray-800 dark:text-white shadow-md backdrop-blur-sm
                       transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/50
                       touch-manipulation active:scale-95"
          >
            <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            aria-label="Next slide"
            onClick={next}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full
                       bg-white/60 hover:bg-white/80 dark:bg-black/50 dark:hover:bg-black/70
                       p-1.5 sm:p-2 md:p-2.5 text-gray-800 dark:text-white shadow-md backdrop-blur-sm
                       transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/50
                       touch-manipulation active:scale-95"
          >
            <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      )}

      {/* Dot Indicators – theme‑aware */}
      {images.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/60 dark:bg-black/50 px-2 sm:px-3 py-1 backdrop-blur-sm">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-200
                  touch-manipulation active:scale-125 ${
                    i === index
                      ? "bg-gray-800 dark:bg-white shadow-sm"
                      : "bg-gray-500/60 dark:bg-white/40 hover:bg-gray-700 dark:hover:bg-white/70"
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Progress indicator (only when auto‑playing) */}
      {autoPlayIntervalMs > 0 && images.length > 1 && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <motion.div
            key={`progress-${index}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: autoPlayIntervalMs / 1000, ease: "linear" }}
            className="h-0.5 w-8 sm:w-10 rounded-full overflow-hidden bg-white/40 dark:bg-white/30"
            style={{ transformOrigin: "left" }}
          >
            <div className="h-full w-full bg-white dark:bg-white/80 rounded-full" />
          </motion.div>
        </div>
      )}
    </div>
  );
}