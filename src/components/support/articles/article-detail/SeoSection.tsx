'use client';

import React, { useState } from 'react';
import { useFormikContext, FormikErrors, FormikTouched } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    FiSearch,
    FiFileText,
    FiImage,
    FiCheckCircle,
    FiAlertCircle,
    FiInfo,
    FiX,
    FiEye
} from 'react-icons/fi';
import Image from 'next/image';

type SeoValues = {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string | null;
};

type Values = {
    seo?: SeoValues | null;
};

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
};

// Helper to safely get nested errors
const getSeoError = (
    errors: FormikErrors<Values>,
    field: keyof SeoValues
): string | undefined => {
    if (errors.seo && typeof errors.seo === 'object') {
        return (errors.seo as FormikErrors<SeoValues>)[field] as string | undefined;
    }
    return undefined;
};

// Helper to safely get nested touched
const getSeoTouched = (
    touched: FormikTouched<Values>,
    field: keyof SeoValues
): boolean => {
    if (touched.seo && typeof touched.seo === 'object') {
        return !!(touched.seo as FormikTouched<SeoValues>)[field];
    }
    return false;
};

// Form field component
const SeoField = ({
    label,
    icon: Icon,
    error,
    touched,
    children,
    description,
    charCount,
    maxChars,
}: {
    label: string;
    icon: React.ElementType;
    error?: string;
    touched?: boolean;
    children: React.ReactNode;
    description?: string;
    charCount?: number;
    maxChars?: number;
}) => {
    const hasError = touched && error;
    const charPercentage = charCount && maxChars ? (charCount / maxChars) * 100 : 0;

    return (
        <div className="space-y-3">
            <div className="flex items-start justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Icon className="h-4 w-4 text-gray-500" />
                    {label}
                </label>
                {description && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <FiInfo className="h-3 w-3" />
                        {description}
                    </span>
                )}
            </div>
            {children}
            <div className="flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {hasError && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xs text-red-600 flex items-center gap-1.5"
                        >
                            <FiAlertCircle className="h-3 w-3" />
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
                {charCount !== undefined && maxChars !== undefined && (
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${charCount > maxChars ? 'text-red-600' :
                            charCount > maxChars * 0.9 ? 'text-yellow-600' :
                                'text-muted-foreground'
                            }`}>
                            {charCount} / {maxChars}
                        </span>
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full ${charPercentage > 100 ? 'bg-red-500' :
                                    charPercentage > 90 ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(charPercentage, 100)}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// SEO Preview Component
const SeoPreview = ({ title, description, image, url }: {
    title: string;
    description: string;
    image?: string | null;
    url: string;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
    >
        <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <FiEye className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm">Search Preview</h3>
        </div>

        {/* Google Search Preview */}
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-700">
                <span className="font-medium">www.example.com</span>
                <span className="text-gray-400">›</span>
                <span className="text-gray-600">{url || 'article-slug'}</span>
            </div>
            <div className="text-lg text-blue-600 hover:underline cursor-pointer line-clamp-1">
                {title || 'Your article title will appear here'}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
                {description || 'Your meta description will appear here. It should be compelling and accurately describe your content.'}
            </div>
        </div>

        {/* Social Media Preview */}
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
            <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500">Social Media Preview</p>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {image ? (
                        <Image
                            src={image}
                            alt="OG Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.src = '/fallback-image.jpg'; // optional fallback
                            }}
                        />) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                            <FiImage className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                    <div className="p-3 bg-gray-50">
                        <div className="text-xs text-gray-500 uppercase mb-1">example.com</div>
                        <div className="font-semibold text-sm line-clamp-1">
                            {title || 'Your article title'}
                        </div>
                        <div className="text-xs text-gray-600 line-clamp-1 mt-1">
                            {description || 'Your meta description'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

export function SeoSection() {
    const { values, setFieldValue, errors, touched } = useFormikContext<Values>();
    const [imagePreview, setImagePreview] = useState<string | null>(values.seo?.ogImage ?? null);

    const metaTitle = values.seo?.metaTitle ?? '';
    const metaDescription = values.seo?.metaDescription ?? '';
    const ogImage = values.seo?.ogImage ?? null;

    const handleImageChange = (url: string) => {
        const trimmedUrl = url.trim() || null;
        setFieldValue('seo.ogImage', trimmedUrl);
        setImagePreview(trimmedUrl);
    };

    // SEO Score Calculator
    const calculateSeoScore = () => {
        let score = 0;
        const tips: string[] = [];

        if (metaTitle) {
            score += 30;
            if (metaTitle.length >= 50 && metaTitle.length <= 60) {
                score += 10;
            } else if (metaTitle.length < 50) {
                tips.push('Meta title is too short (aim for 50-60 characters)');
            } else if (metaTitle.length > 60) {
                tips.push('Meta title is too long (may be truncated in search results)');
            }
        } else {
            tips.push('Add a meta title');
        }

        if (metaDescription) {
            score += 30;
            if (metaDescription.length >= 150 && metaDescription.length <= 160) {
                score += 10;
            } else if (metaDescription.length < 150) {
                tips.push('Meta description is too short (aim for 150-160 characters)');
            } else if (metaDescription.length > 160) {
                tips.push('Meta description is too long (may be truncated)');
            }
        } else {
            tips.push('Add a meta description');
        }

        if (ogImage) {
            score += 20;
        } else {
            tips.push('Add an OG image for social media sharing');
        }

        return { score, tips };
    };

    const { score, tips } = calculateSeoScore();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-green-200/50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                            <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <FiSearch className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    SEO Optimization
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Optimize your article for search engines and social media
                                </p>
                            </div>
                        </div>

                        {/* SEO Score Badge */}
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">SEO Score</span>
                                <Badge
                                    variant="outline"
                                    className={`text-lg font-bold px-3 py-1 ${score >= 80 ? 'bg-green-100 text-green-700 border-green-300' :
                                        score >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                            'bg-red-100 text-red-700 border-red-300'
                                        }`}
                                >
                                    {score}%
                                </Badge>
                            </div>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full ${score >= 80 ? 'bg-green-500' :
                                        score >= 60 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Tips */}
                    {tips.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-green-200"
                        >
                            <div className="flex items-start gap-2">
                                <FiInfo className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-green-900 mb-2">
                                        Suggestions to improve your SEO:
                                    </p>
                                    <ul className="space-y-1">
                                        {tips.map((tip, idx) => (
                                            <li key={idx} className="text-xs text-green-800 flex items-center gap-2">
                                                <span className="h-1 w-1 rounded-full bg-green-600"></span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form Fields */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <Card className="p-6 shadow-sm border-gray-200/60">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <FiFileText className="h-4 w-4 text-green-600" />
                            </div>
                            Meta Information
                        </h3>

                        <div className="space-y-6">
                            <SeoField
                                label="Meta Title"
                                icon={FiFileText}
                                error={getSeoError(errors, 'metaTitle')}
                                touched={getSeoTouched(touched, 'metaTitle')}
                                description="50-60 chars"
                                charCount={metaTitle.length}
                                maxChars={60}
                            >
                                <Input
                                    value={metaTitle}
                                    onChange={(e) => setFieldValue('seo.metaTitle', e.target.value)}
                                    placeholder="Enter a compelling meta title..."
                                    className={`transition-all ${getSeoTouched(touched, 'metaTitle') && getSeoError(errors, 'metaTitle')
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'focus:ring-green-500'
                                        }`}
                                />
                            </SeoField>

                            <SeoField
                                label="Meta Description"
                                icon={FiAlertCircle}
                                error={getSeoError(errors, 'metaDescription')}
                                touched={getSeoTouched(touched, 'metaDescription')}
                                description="150-160 chars"
                                charCount={metaDescription.length}
                                maxChars={160}
                            >
                                <Textarea
                                    value={metaDescription}
                                    onChange={(e) => setFieldValue('seo.metaDescription', e.target.value)}
                                    placeholder="Write a concise and engaging meta description..."
                                    rows={4}
                                    className={`resize-none transition-all ${getSeoTouched(touched, 'metaDescription') && getSeoError(errors, 'metaDescription')
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'focus:ring-green-500'
                                        }`}
                                />
                            </SeoField>

                            <SeoField
                                label="Open Graph Image"
                                icon={FiImage}
                                error={getSeoError(errors, 'ogImage')}
                                touched={getSeoTouched(touched, 'ogImage')}
                                description="For social sharing"
                            >
                                <div className="space-y-3">
                                    <Input
                                        value={ogImage ?? ''}
                                        onChange={(e) => handleImageChange(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="focus:ring-green-500"
                                    />
                                    {imagePreview && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative rounded-lg overflow-hidden border-2 border-gray-200"
                                        >
                                            <Image
                                                src={imagePreview}
                                                alt="OG Preview"
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                unoptimized
                                                onError={() => setImagePreview(null)}
                                            />
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageChange('')}
                                                    className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
                                                >
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1 text-xs text-white">
                                                Recommended: 1200×630px
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </SeoField>
                        </div>
                    </Card>

                    {/* SEO Best Practices */}
                    <Card className="p-6 bg-blue-50/50 border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FiCheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                                    SEO Best Practices
                                </h4>
                                <ul className="space-y-2 text-xs text-gray-700">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>Include target keywords naturally in your meta title</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>Make your description compelling to encourage clicks</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>Use high-quality images with proper dimensions (1200×630px)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 mt-1">•</span>
                                        <span>Ensure meta title and description are unique for each article</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Right Column - Preview */}
                <motion.div variants={itemVariants}>
                    <Card className="p-6 shadow-sm border-gray-200/60 sticky top-6">
                        <SeoPreview
                            title={metaTitle}
                            description={metaDescription}
                            image={ogImage}
                            url="article-slug"
                        />
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}