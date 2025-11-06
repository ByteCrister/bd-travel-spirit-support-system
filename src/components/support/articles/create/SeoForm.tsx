'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from './ImageUploader';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { FormikErrors, FormikHelpers, FormikTouched } from 'formik';
import { Search, Eye, AlertCircle, CheckCircle2 } from 'lucide-react';
import { inter, playfair } from '@/styles/fonts';

interface SeoFormProps {
    values: CreateArticleFormValues;
    setFieldValue: FormikHelpers<CreateArticleFormValues>['setFieldValue'];
    errors: FormikErrors<CreateArticleFormValues['seo']>;
    touched: FormikTouched<CreateArticleFormValues['seo']>;
}

export function SeoForm({ values, setFieldValue, errors, touched }: SeoFormProps) {
    const seo = typeof values.seo === 'object' && values.seo !== null
        ? values.seo
        : { metaTitle: '', metaDescription: '', ogImage: null };

    // SEO Score calculation
    const calculateSeoScore = () => {
        let score = 0;
        if (seo.metaTitle && seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60) score += 33;
        if (seo.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160) score += 33;
        if (seo.ogImage) score += 34;
        return Math.min(score, 100);
    };

    const seoScore = calculateSeoScore();
    const scoreColor = seoScore >= 70 ? 'text-green-600' : seoScore >= 40 ? 'text-amber-600' : 'text-slate-400';
    const scoreBgColor = seoScore >= 70 ? 'bg-green-50' : seoScore >= 40 ? 'bg-amber-50' : 'bg-slate-50';

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <div className="space-y-6">
            {/* SEO Score Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`rounded-xl border border-slate-200 p-6 ${scoreBgColor} transition-all duration-300`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white border border-slate-200">
                            <Search className={`w-6 h-6 ${scoreColor}`} />
                        </div>
                        <div>
                            <p className={`${inter.className} text-sm font-semibold text-slate-900`}>
                                SEO Optimization Score
                            </p>
                            <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                                Optimize your content for search engines
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`${playfair.className} text-3xl font-bold ${scoreColor}`}>
                            {seoScore}%
                        </div>
                        <p className={`${inter.className} text-xs text-slate-500 mt-1`}>
                            {seoScore >= 70 ? 'Excellent' : seoScore >= 40 ? 'Good' : 'Needs work'}
                        </p>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                        {seo.metaTitle && seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                        )}
                        <span className={`${inter.className} text-xs text-slate-600`}>
                            Meta title (30-60 chars)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {seo.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160 ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                        )}
                        <span className={`${inter.className} text-xs text-slate-600`}>
                            Meta description (120-160 chars)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {seo.ogImage ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-slate-300" />
                        )}
                        <span className={`${inter.className} text-xs text-slate-600`}>
                            Open Graph image
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Meta Title */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <label className={`${inter.className} block text-sm font-semibold text-slate-900 mb-1`}>
                                Meta Title
                            </label>
                            <p className={`${inter.className} text-xs text-slate-500`}>
                                Keep it between 30-60 characters
                            </p>
                        </div>
                        <div className={`${inter.className} text-xs font-medium ${seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60
                            ? 'text-green-600 bg-green-50'
                            : 'text-slate-500 bg-slate-100'
                            } px-2 py-1 rounded`}>
                            {seo.metaTitle.length}/60
                        </div>
                    </div>
                    <Input
                        value={seo.metaTitle}
                        onChange={(e) => setFieldValue('seo.metaTitle', e.target.value)}
                        placeholder="e.g., Discover Hidden Gems in Bali | Travel Guide 2024"
                        aria-label="Meta title"
                        maxLength={60}
                        className={`${inter.className} rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors?.metaTitle && touched?.metaTitle ? 'border-red-500 bg-red-50' : ''
                            }`}
                    />
                    <AnimatePresence>
                        {errors?.metaTitle && touched?.metaTitle && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={`${inter.className} mt-2 flex items-center gap-1.5 text-xs text-red-600`}
                            >
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                {errors.metaTitle}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                        <p className={`${inter.className} text-xs text-slate-500 mb-1`}>Preview:</p>
                        <p className={`${inter.className} text-sm text-blue-600 truncate`}>
                            {seo.metaTitle || 'Your meta title will appear here'}
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Meta Description */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <label className={`${inter.className} block text-sm font-semibold text-slate-900 mb-1`}>
                                Meta Description
                            </label>
                            <p className={`${inter.className} text-xs text-slate-500`}>
                                Keep it between 120-160 characters
                            </p>
                        </div>
                        <div className={`${inter.className} text-xs font-medium ${seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160
                            ? 'text-green-600 bg-green-50'
                            : 'text-slate-500 bg-slate-100'
                            } px-2 py-1 rounded`}>
                            {seo.metaDescription.length}/160
                        </div>
                    </div>
                    <Textarea
                        value={seo.metaDescription}
                        onChange={(e) => setFieldValue('seo.metaDescription', e.target.value)}
                        placeholder="Write a compelling description that summarizes your article and encourages clicks from search results..."
                        aria-label="Meta description"
                        maxLength={160}
                        rows={3}
                        className={`${inter.className} rounded-lg border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${errors?.metaDescription && touched?.metaDescription ? 'border-red-500 bg-red-50' : ''
                            }`}
                    />
                    <AnimatePresence>
                        {errors?.metaDescription && touched?.metaDescription && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={`${inter.className} mt-2 flex items-center gap-1.5 text-xs text-red-600`}
                            >
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                {errors.metaDescription}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                        <p className={`${inter.className} text-xs text-slate-500 mb-1`}>Preview:</p>
                        <p className={`${inter.className} text-sm text-slate-700 line-clamp-2`}>
                            {seo.metaDescription || 'Your meta description will appear here'}
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Open Graph Image */}
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
            >
                <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <label className={`${inter.className} block text-sm font-semibold text-slate-900 mb-1`}>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-blue-600" />
                                    Open Graph Image
                                </div>
                            </label>
                            <p className={`${inter.className} text-xs text-slate-500`}>
                                Used when sharing on social media (1200x630px recommended)
                            </p>
                        </div>
                    </div>
                    <ImageUploader
                        label=""
                        value={seo?.ogImage ?? undefined}
                        onChange={(v) => setFieldValue('seo.ogImage', v)}
                    />
                    <AnimatePresence>
                        {errors?.ogImage && touched?.ogImage && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={`${inter.className} mt-2 flex items-center gap-1.5 text-xs text-red-600`}
                            >
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                {errors.ogImage}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* SEO Tips */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-blue-200 bg-blue-50 p-5"
            >
                <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className={`${inter.className} text-sm font-semibold text-blue-900 mb-2`}>
                            SEO Best Practices
                        </p>
                        <ul className={`${inter.className} space-y-1 text-xs text-blue-800`}>
                            <li>• Include your primary keyword in the title and description</li>
                            <li>• Make your description compelling to increase click-through rates</li>
                            <li>• Use high-quality images for social sharing (1200x630px)</li>
                            <li>• Keep titles concise and descriptions detailed but brief</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}