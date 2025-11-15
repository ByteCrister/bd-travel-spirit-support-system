// lib/fonts.ts
import { Inter } from 'next/font/google';

export const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const fontClassName = inter.className;
