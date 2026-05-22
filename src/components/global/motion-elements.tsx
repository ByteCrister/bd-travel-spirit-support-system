// src/components/global/motion-elements.tsx
'use client';

import { motion } from 'framer-motion';
import React from 'react';

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

export const MotionLi = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<typeof motion.li>
>((props, ref) => <motion.li ref={ref} {...props} />);
MotionLi.displayName = 'MotionLi';

export const MotionTr = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<typeof motion.tr>
>((props, ref) => <motion.tr ref={ref} {...props} />);
MotionTr.displayName = 'MotionTr';