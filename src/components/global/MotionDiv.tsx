"use client";

import { motion, Variants, Transition } from "framer-motion";

type Props = {
    children: React.ReactNode;
    variants?: Variants;
    initial?: string | false;
    animate?: string;
    exit?: string;
    transition?: Transition;
    className?: string;
};

export default function MotionDiv({
    children,
    variants,
    initial = "hidden",
    animate = "visible",
    exit,
    transition,
    className,
}: Props) {
    return (
        <motion.div
            className={className}
            variants={variants}
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
        >
            {children}
        </motion.div>
    );
}
