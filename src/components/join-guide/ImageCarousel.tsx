"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type ImageCarouselProps = {
  autoPlayIntervalMs?: number;
  className?: string;
};

const imageFilenames = [
  "amphitheater-fortaleza-san-felipe-puerta-plata-dominican-republic.jpg",
  "beautiful-nature-landscape-with-black-sandy-beach-ocean.jpg",
  "dreamy-rainbow-countryside.jpg",
  "fishing-boat.jpg",
  "green-trunk-mountains-foggy-mist-scenic.jpg",
  "indian-city-buildings-scene.jpg",
  "life-mexico-landscape-with-lake.jpg",
  "person-traveling-enjoying-their-vacation.jpg",
  "pexels-khanshaheb-9711952.jpg",
  "pexels-rasel69-948437.jpg",
  "pexels-sayeedxchowdhury-33447786.jpg",
  "vertical-aerial-shot-different-boats-parked-edge-shore-near-water.jpg",
];

export default function ImageCarousel({ autoPlayIntervalMs = 5000, className }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const images = useMemo(
    () => imageFilenames.map((f) => ({ src: `/images/join_as_guide/${f}`, alt: f.replace(/[-_]/g, " ") })),
    []
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
    if (autoPlayIntervalMs <= 0 || images.length <= 1) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => next(), autoPlayIntervalMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, next, autoPlayIntervalMs, images.length]);

  // Basic drag/swipe support using Framer Motion drag
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info?.offset?.x > 50) {
      prev();
    } else if (info?.offset?.x < -50) {
      next();
    }
  };

  return (
    <div className={"relative w-full overflow-hidden " + (className ?? "")}> 
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border bg-black/10 shadow-xl ring-1 ring-black/5 dark:ring-white/5">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="relative h-full w-full"
          >
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        <button
          aria-label="Previous slide"
          onClick={prev}
          className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-black/40 p-2 text-white shadow-md backdrop-blur transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next slide"
          onClick={next}
          className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-black/40 p-2 text-white shadow-md backdrop-blur transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transform rounded-full bg-black/35 px-2 py-1 backdrop-blur">
        <div className="flex items-center gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={
                "h-2 w-2 rounded-full transition " +
                (i === index ? "bg-white" : "bg-white/50 hover:bg-white/80")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}


