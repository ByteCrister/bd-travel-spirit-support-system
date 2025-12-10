// src/components/global/motion-elements.ts
'use client';

import { motion } from 'framer-motion';
import React from 'react';

// Simple wrapper components without complex generic types
export const MotionDiv = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof motion.div>
>((props, ref) => <motion.div ref={ref} {...props} />);
MotionDiv.displayName = 'MotionDiv';

export const MotionSpan = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof motion.span>
>((props, ref) => <motion.span ref={ref} {...props} />);
MotionSpan.displayName = 'MotionSpan';

export const MotionP = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof motion.p>
>((props, ref) => <motion.p ref={ref} {...props} />);
MotionP.displayName = 'MotionP';

// Add other components as needed
export const MotionButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof motion.button>
>((props, ref) => <motion.button ref={ref} {...props} />);
MotionButton.displayName = 'MotionButton';

export const MotionSection = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof motion.section>
>((props, ref) => <motion.section ref={ref} {...props} />);
MotionSection.displayName = 'MotionSection';