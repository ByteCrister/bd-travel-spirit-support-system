"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiImage, FiMaximize2 } from "react-icons/fi";

type BottomCarouselStripProps = {
  images: string[];
  /** Auto-play interval in ms. Set to 0 to disable. */
  autoPlayIntervalMs?: number;
};

export default function BottomCarouselStrip({
  images,
  autoPlayIntervalMs = 4000,
}: BottomCarouselStripProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (idx: number, dir: 1 | -1) => {
      setDirection(dir);
      setActiveIndex(idx);
    },
    []
  );

  const next = useCallback(() => {
    if (images.length === 0) return;
    go((activeIndex + 1) % images.length, 1);
  }, [activeIndex, images.length, go]);

  const prev = useCallback(() => {
    if (images.length === 0) return;
    go((activeIndex - 1 + images.length) % images.length, -1);
  }, [activeIndex, images.length, go]);

  // Auto-play
  useEffect(() => {
    if (autoPlayIntervalMs <= 0 || images.length <= 1 || isDragging) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => next(), autoPlayIntervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, next, autoPlayIntervalMs, images.length, isDragging]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const thumb = thumbsRef.current.children[activeIndex] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x > 40) prev();
    else if (info.offset.x < -40) next();
  };

  if (images.length === 0) return null;

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80, scale: 0.98 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80, scale: 0.98 }),
  };

  return (
    <div className="w-full bg-black/60 dark:bg-black/80 backdrop-blur-md border-t border-white/10">
      {/* ── BIG panoramic carousel ── */}
      <div className="relative w-full h-52 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            {imgErrors[activeIndex] ? (
              <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                <FiImage className="h-12 w-12 text-gray-500" />
              </div>
            ) : (
              <Image
                src={images[activeIndex]}
                alt={`Destination ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-cover select-none"
                priority={activeIndex === 0}
                quality={85}
                unoptimized
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [activeIndex]: true }))
                }
              />
            )}
            {/* Cinematic gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Slide counter badge */}
        <div className="absolute top-3 left-4 sm:top-4 sm:left-5 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-white/90 text-xs font-semibold tracking-wide">
            <FiMaximize2 className="h-3 w-3 opacity-70" />
            <span>{activeIndex + 1}</span>
            <span className="opacity-40">/</span>
            <span className="opacity-60">{images.length}</span>
          </div>
        </div>

        {/* Auto-play progress bar */}
        {autoPlayIntervalMs > 0 && images.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-10 overflow-hidden">
            <motion.div
              key={`progress-${activeIndex}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: autoPlayIntervalMs / 1000, ease: "linear" }}
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400"
              style={{ transformOrigin: "left", width: "100%" }}
            />
          </div>
        )}

        {/* Prev / Next buttons */}
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 border border-white/20 hover:border-white/40 text-white p-2 sm:p-2.5 backdrop-blur-sm transition-all duration-200 active:scale-95"
            >
              <FiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              aria-label="Next image"
              onClick={next}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/65 border border-white/20 hover:border-white/40 text-white p-2 sm:p-2.5 backdrop-blur-sm transition-all duration-200 active:scale-95"
            >
              <FiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </>
        )}

        {/* Bottom caption area */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-6 pb-3 sm:pb-4">
          <motion.p
            key={activeIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-white/80 text-xs sm:text-sm font-medium tracking-wide truncate"
          >
            {images[activeIndex]?.split("/").pop()?.replace(/[-_]/g, " ").replace(/\.\w+$/, "") ||
              `Destination ${activeIndex + 1}`}
          </motion.p>
        </div>
      </div>

      {/* ── Small thumbnail strip ── */}
      <div className="bg-black/80 dark:bg-black/90 px-3 sm:px-4 py-3 border-t border-white/5">
        {/* Header label */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-white/50 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
            Gallery
          </span>
          <span className="text-white/30 text-[10px] sm:text-xs">
            {images.length} photos
          </span>
        </div>

        {/* Scrollable thumbnail row */}
        <div
          ref={thumbsRef}
          className="flex gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((src, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => go(i, i > activeIndex ? 1 : -1)}
                className={`relative flex-shrink-0 rounded-md overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isActive
                    ? "ring-2 ring-emerald-400 ring-offset-1 ring-offset-black scale-105 shadow-lg shadow-emerald-500/30"
                    : "ring-1 ring-white/10 opacity-50 hover:opacity-80 hover:ring-white/30"
                }`}
                style={{ width: 64, height: 44 }}
                aria-label={`Go to image ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                {imgErrors[i] ? (
                  <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                    <FiImage className="h-4 w-4 text-gray-600" />
                  </div>
                ) : (
                  <Image
                    src={src}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    quality={60}
                    unoptimized
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [i]: true }))
                    }
                  />
                )}
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="thumb-active-dot"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dot indicators for mobile fallback */}
        <div className="flex items-center justify-center gap-1.5 mt-3 sm:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > activeIndex ? 1 : -1)}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "w-4 h-1.5 bg-emerald-400"
                  : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
