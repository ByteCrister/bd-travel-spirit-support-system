'use client';

import { motion, Variants } from 'framer-motion';
import { spaceMono, jetbrainsMono } from '@/styles/fonts';
import { ArticleForm } from './ArticleForm';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

// ---------------------
// Design System Tokens — Neumorphism Club
// ---------------------
const NEU = {
    page: 'min-h-screen bg-[#E7E5E4]',
    // Sticky header — raised panel
    header: [
        'sticky top-0 z-40',
        'bg-[#E7E5E4]',
        'shadow-[0_4px_12px_#c8c6c4,_0_-2px_6px_#ffffff]',
    ].join(' '),
    headerInner: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between',
    // Icon badge — inset circle
    iconBadge: [
        'p-2.5 rounded-xl',
        'bg-[#E7E5E4]',
        'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    ].join(' '),
    // Back button
    backBtn: [
        'flex items-center gap-2 px-4 py-2 rounded-xl',
        'bg-[#E7E5E4] text-[#1E2938]',
        'shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff]',
        'hover:shadow-[1px_1px_3px_#c8c6c4,_-1px_-1px_3px_#ffffff]',
        'hover:text-[#006666] hover:translate-y-px',
        'active:shadow-[inset_2px_2px_4px_#c8c6c4,_inset_-2px_-2px_4px_#ffffff]',
        'transition-all duration-150',
    ].join(' '),
    // Footer
    footer: [
        'mt-16 py-8',
        'bg-[#E7E5E4]',
        'shadow-[0_-4px_10px_#c8c6c4,_0_2px_6px_#ffffff]',
    ].join(' '),
    // Typography
    fontMono: spaceMono.className,
    fontData: jetbrainsMono.className,
    textPrimary: 'text-[#1E2938]',
    textMuted: 'text-[#1E2938]/60',
    textTeal: 'text-[#006666]',
} as const;

const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Articles', href: '/support/articles' },
    { label: 'Create Article', href: '/support/articles/create' },
];

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CreateArticlePage() {
    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={NEU.page}
        >
            <Breadcrumbs items={breadcrumbItems} />

            {/* Header */}
            <motion.div variants={itemVariants} className={NEU.header}>
                <div className={NEU.headerInner}>
                    <div className="flex items-center gap-3">
                        <div className={NEU.iconBadge}>
                            <FileText className="w-5 h-5 text-[#006666]" />
                        </div>
                        <div>
                            <h1 className={`${NEU.fontMono} text-xl font-bold ${NEU.textPrimary} tracking-tight`}>
                                Create Article
                            </h1>
                            <p className={`${NEU.fontData} text-xs ${NEU.textMuted} mt-0.5`}>
                                Craft engaging travel content
                            </p>
                        </div>
                    </div>

                    <Link href="/support/articles">
                        <motion.span
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`${NEU.backBtn} ${NEU.fontMono} text-sm font-medium cursor-pointer`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </motion.span>
                    </Link>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
                variants={itemVariants}
                className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8"
            >
                <ArticleForm />
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className={NEU.footer}>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                    <p className={`${NEU.fontData} text-xs ${NEU.textMuted}`}>
                        Need help? Check out our{' '}
                        <Link
                            href="/help"
                            className={`${NEU.textTeal} hover:underline font-semibold`}
                        >
                            documentation
                        </Link>
                    </p>
                </div>
            </motion.div>
        </motion.main>
    );
}