// components/employees/primitives/CountUp.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
// ─────────────────────────────────────────────────────────────

interface CountUpProps {
  value: number;
  duration?: number;
}

export function CountUp({ value, duration = 0.6 }: CountUpProps) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  return (
    <motion.span aria-live="polite" role="status" className={NEU_MONO}>
      {display.toLocaleString()}
    </motion.span>
  );
}
