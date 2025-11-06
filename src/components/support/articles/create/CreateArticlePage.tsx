'use client';

import { motion, Variants } from 'framer-motion';
import { inter, playfair } from '@/styles/fonts';
import { ArticleForm } from './ArticleForm';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';

const breadcrumbItems = [
    { label: "Home", href: '/' },
    { label: "Articles", href: "/support/articles" },
    { label: "Create Articles", href: "/support/articles/create" },
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
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

export default function CreateArticlePage() {
    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50"
        >
            <Breadcrumbs items={breadcrumbItems} />
            {/* Header Section */}
            <motion.div variants={itemVariants} className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className={`${playfair.className} text-3xl font-bold text-slate-900`}>
                                    Create Article
                                </h1>
                                <p className={`${inter.className} text-sm text-slate-500`}>
                                    Craft engaging travel content
                                </p>
                            </div>
                        </div>
                        <Link href="/articles">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className={`${inter.className} text-sm font-medium`}>Back</span>
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
                <ArticleForm />
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-16 border-t border-slate-200 bg-slate-50 py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                    <p className={`${inter.className} text-sm text-slate-500`}>
                        Need help? Check out our{' '}
                        <Link href="/help" className="text-blue-600 hover:text-blue-700 font-medium">
                            documentation
                        </Link>
                    </p>
                </div>
            </motion.div>
        </motion.main>
    );
}