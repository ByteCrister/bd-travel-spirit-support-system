'use client';

import React, { useState, useRef } from 'react';
import { useFormikContext, FormikErrors, FormikTouched } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    FiSearch,
    FiFileText,
    FiImage,
    FiCheckCircle,
    FiAlertCircle,
    FiInfo,
    FiX,
    FiEye,
    FiUpload,
} from 'react-icons/fi';
import Image from 'next/image';
import { fileToBase64, IMAGE_EXTENSIONS } from '@/utils/helpers/file-conversion';
import { showToast } from '@/components/global/showToast';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6';

const NEU_SURFACE_INSET =
    'bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl';

const NEU_SURFACE_INSET_SM =
    'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] rounded-xl';

const NEU_INPUT =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_BTN_PRIMARY =
    'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-sm ' +
    'shadow-[0_4px_12px_rgba(0,0,0,0.06)] ' +
    'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] ' +
    'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
    'transition-all duration-200 px-4 py-2 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed';

const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';

const NEU_ICON_WELL_PRIMARY =
    'p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]';

const NEU_BADGE_SUCCESS =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_BADGE_WARNING =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_BADGE_DANGER =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

// ── Animation variants ────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

// ── Types ─────────────────────────────────────────────────────
type SeoValues = { metaTitle?: string; metaDescription?: string; ogImage?: string | null };
type Values = { seo?: SeoValues | null };

const getSeoError = (errors: FormikErrors<Values>, field: keyof SeoValues): string | undefined => {
    if (errors.seo && typeof errors.seo === 'object') {
        return (errors.seo as FormikErrors<SeoValues>)[field] as string | undefined;
    }
    return undefined;
};

const getSeoTouched = (touched: FormikTouched<Values>, field: keyof SeoValues): boolean => {
    if (touched.seo && typeof touched.seo === 'object') {
        return !!(touched.seo as FormikTouched<SeoValues>)[field];
    }
    return false;
};

// ── Char-count bar sub-component ──────────────────────────────
function CharBar({ count, max }: { count: number; max: number }) {
    const pct = Math.min((count / max) * 100, 100);
    const color = pct > 100 ? 'bg-[#FF2157]' : pct > 90 ? 'bg-[#FE9900]' : 'bg-[#00A63D]';
    return (
        <div className="flex items-center gap-2">
            <span className={`font-[family-name:var(--font-jetbrains-mono)] text-xs ${count > max ? 'text-[#FF2157]' : 'text-[#1E2938]/50'}`}>
                {count} / {max}
            </span>
            <div className={`${NEU_SURFACE_INSET_SM} w-20 h-1.5 overflow-hidden`}>
                <motion.div
                    className={`h-full ${color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
}

// ── SeoField wrapper ──────────────────────────────────────────
function SeoField({
    label,
    icon: Icon,
    error,
    touched,
    description,
    charCount,
    maxChars,
    children,
}: {
    label: string;
    icon: React.ElementType;
    error?: string;
    touched?: boolean;
    description?: string;
    charCount?: number;
    maxChars?: number;
    children: React.ReactNode;
}) {
    const hasError = touched && error;
    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between">
                <label className={`flex items-center gap-2 ${NEU_LABEL}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                </label>
                {description && (
                    <span className={`${NEU_MUTED} text-xs flex items-center gap-1`}>
                        <FiInfo className="h-3 w-3" />
                        {description}
                    </span>
                )}
            </div>
            {children}
            <div className="flex items-center justify-between min-h-[1.25rem]">
                <AnimatePresence mode="wait">
                    {hasError && (
                        <motion.p
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="text-xs text-[#FF2157] flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)]"
                        >
                            <FiAlertCircle className="h-3 w-3" />
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
                {charCount !== undefined && maxChars !== undefined && (
                    <CharBar count={charCount} max={maxChars} />
                )}
            </div>
        </div>
    );
}

// ── SEO Search/Social preview ─────────────────────────────────
function SeoPreview({ title, description, image, url }: {
    title: string; description: string; image?: string | null; url: string;
}) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
            <div className="flex items-center gap-2">
                <div className={NEU_ICON_WELL_PRIMARY}>
                    <FiEye className="h-4 w-4 text-[#006666]" />
                </div>
                <h3 className={`${NEU_HEADING} text-sm`}>Search Preview</h3>
            </div>

            {/* Google preview */}
            <div className={`${NEU_SURFACE_INSET} p-4 space-y-1.5`}>
                <div className="flex items-center gap-1.5 text-xs text-[#00A63D] font-[family-name:var(--font-jetbrains-mono)]">
                    <span>www.example.com</span>
                    <span className="text-[#1E2938]/30">›</span>
                    <span className="text-[#1E2938]/50">{url || 'article-slug'}</span>
                </div>
                <div className="text-base text-[#006666] font-[family-name:var(--font-space-mono)] font-bold line-clamp-1 hover:underline cursor-pointer">
                    {title || 'Your article title will appear here'}
                </div>
                <div className="text-sm text-[#1E2938]/60 font-[family-name:var(--font-jetbrains-mono)] line-clamp-2">
                    {description || 'Your meta description will appear here. Make it compelling and accurate.'}
                </div>
            </div>

            {/* Social preview */}
            <div>
                <p className={`${NEU_LABEL} mb-2`}>Social Preview</p>
                <div className={`${NEU_SURFACE_INSET} overflow-hidden rounded-xl`}>
                    {image ? (
                        <div className="relative h-40 w-full">
                            <Image src={image} alt="OG Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
                        </div>
                    ) : (
                        <div className="w-full h-40 flex items-center justify-center">
                            <FiImage className="h-10 w-10 text-[#1E2938]/20" />
                        </div>
                    )}
                    <div className="p-3">
                        <div className={`${NEU_LABEL} mb-1`}>example.com</div>
                        <div className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938] line-clamp-1">
                            {title || 'Your article title'}
                        </div>
                        <div className={`${NEU_MUTED} text-xs line-clamp-1 mt-0.5`}>
                            {description || 'Your meta description'}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ── Main component ────────────────────────────────────────────
export function SeoSection() {
    const { values, setFieldValue, errors, touched } = useFormikContext<Values>();
    const [imagePreview, setImagePreview] = useState<string | null>(values.seo?.ogImage ?? null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const metaTitle = values.seo?.metaTitle ?? '';
    const metaDescription = values.seo?.metaDescription ?? '';
    const ogImage = values.seo?.ogImage ?? null;

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImageError(null);
        setIsUploading(true);
        try {
            const base64String = await fileToBase64(file, { compressImages: true, maxWidth: 1200, quality: 0.8, maxFileBytes: 5 * 1024 * 1024, allowedExtensions: IMAGE_EXTENSIONS });
            setFieldValue('seo.ogImage', base64String);
            setImagePreview(base64String);
        } catch (error) {
            setImageError(error instanceof Error ? error.message : 'Failed to upload image');
            showToast.warning('Failed to upload seo og image', error instanceof Error ? error.message : 'Failed to upload image');
            setImagePreview(null);
            setFieldValue('seo.ogImage', null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFieldValue('seo.ogImage', null);
        setImageError(null);
    };

    // SEO score
    const calculateSeoScore = () => {
        let score = 0;
        const tips: string[] = [];
        if (metaTitle) {
            score += 30;
            if (metaTitle.length >= 50 && metaTitle.length <= 60) score += 10;
            else if (metaTitle.length < 50) tips.push('Meta title is too short (aim for 50–60 chars)');
            else tips.push('Meta title is too long (may be truncated)');
        } else tips.push('Add a meta title');
        if (metaDescription) {
            score += 30;
            if (metaDescription.length >= 150 && metaDescription.length <= 160) score += 10;
            else if (metaDescription.length < 150) tips.push('Meta description too short (aim for 150–160 chars)');
            else tips.push('Meta description too long (may be truncated)');
        } else tips.push('Add a meta description');
        if (ogImage) score += 20; else tips.push('Add an OG image for social sharing');
        return { score, tips };
    };

    const { score, tips } = calculateSeoScore();
    const scoreBadge = score >= 80 ? NEU_BADGE_SUCCESS : score >= 60 ? NEU_BADGE_WARNING : NEU_BADGE_DANGER;
    const scoreBar = score >= 80 ? 'bg-[#00A63D]' : score >= 60 ? 'bg-[#FE9900]' : 'bg-[#FF2157]';

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

            {/* Header card */}
            <motion.div variants={itemVariants}>
                <div className={NEU_CARD}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className={NEU_ICON_WELL_PRIMARY}>
                                <FiSearch className="h-5 w-5 text-[#006666]" />
                            </div>
                            <div>
                                <h2 className={`${NEU_HEADING} text-xl`}>SEO Optimization</h2>
                                <p className={NEU_MUTED}>Optimize your article for search engines and social media</p>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <span className={`${NEU_LABEL}`}>SEO Score</span>
                                <span className={scoreBadge}>{score}%</span>
                            </div>
                            <div className={`${NEU_SURFACE_INSET_SM} w-32 h-2 overflow-hidden`}>
                                <motion.div
                                    className={`h-full ${scoreBar}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    {tips.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-5 pt-5 border-t border-[#1E2938]/10"
                        >
                            <div className="flex items-start gap-2">
                                <FiInfo className="h-4 w-4 text-[#006666] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className={`${NEU_LABEL} mb-2`}>Suggestions to improve your SEO</p>
                                    <ul className="space-y-1">
                                        {tips.map((tip, i) => (
                                            <li key={i} className={`${NEU_MUTED} flex items-center gap-2`}>
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#006666] flex-shrink-0" />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Meta fields */}
                <motion.div variants={itemVariants} className="space-y-5">
                    <div className={NEU_CARD}>
                        <div className="flex items-center gap-2 mb-6">
                            <div className={NEU_ICON_WELL_PRIMARY}>
                                <FiFileText className="h-4 w-4 text-[#006666]" />
                            </div>
                            <h3 className={`${NEU_HEADING} text-base`}>Meta Information</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Meta Title */}
                            <SeoField
                                label="Meta Title"
                                icon={FiFileText}
                                error={getSeoError(errors, 'metaTitle')}
                                touched={getSeoTouched(touched, 'metaTitle')}
                                description="50–60 chars"
                                charCount={metaTitle.length}
                                maxChars={60}
                            >
                                <Input
                                    value={metaTitle}
                                    onChange={(e) => setFieldValue('seo.metaTitle', e.target.value)}
                                    placeholder="Enter a compelling meta title..."
                                    className={NEU_INPUT}
                                />
                            </SeoField>

                            {/* Meta Description */}
                            <SeoField
                                label="Meta Description"
                                icon={FiAlertCircle}
                                error={getSeoError(errors, 'metaDescription')}
                                touched={getSeoTouched(touched, 'metaDescription')}
                                description="150–160 chars"
                                charCount={metaDescription.length}
                                maxChars={160}
                            >
                                <Textarea
                                    value={metaDescription}
                                    onChange={(e) => setFieldValue('seo.metaDescription', e.target.value)}
                                    placeholder="Write a concise and engaging meta description..."
                                    rows={4}
                                    className={`${NEU_INPUT} resize-none`}
                                />
                            </SeoField>

                            {/* OG Image */}
                            <SeoField
                                label="Open Graph Image"
                                icon={FiImage}
                                error={imageError || getSeoError(errors, 'ogImage')}
                                touched={getSeoTouched(touched, 'ogImage')}
                                description="1200×630px recommended"
                            >
                                {!imagePreview ? (
                                    <div className={`${NEU_SURFACE_INSET} flex flex-col items-center justify-center p-8 text-center`}>
                                        <FiUpload className="h-8 w-8 text-[#1E2938]/30 mb-3" />
                                        <p className={`${NEU_MUTED} mb-3`}>
                                            Click to upload or drag and drop
                                            <br />
                                            <span className="text-xs">Recommended: 1200×630px</span>
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={IMAGE_EXTENSIONS.map((e) => `.${e}`).join(',')}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="og-image-upload"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={NEU_BTN_PRIMARY}
                                            disabled={isUploading}
                                        >
                                            <FiImage className="h-4 w-4" />
                                            {isUploading ? 'Uploading...' : 'Choose Image'}
                                        </button>
                                        <p className={`${NEU_MUTED} text-xs mt-2`}>
                                            {IMAGE_EXTENSIONS.join(', ').toUpperCase()}, max 5MB
                                        </p>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="relative rounded-xl overflow-hidden shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff]"
                                    >
                                        <div className="relative h-56 w-full">
                                            <Image src={imagePreview} alt="OG Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" unoptimized
                                                onError={() => { setImageError('Failed to load image'); setImagePreview(null); }} />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#FF2157] hover:bg-[#e0001e] text-white flex items-center justify-center shadow-lg transition-all"
                                            disabled={isUploading}
                                        >
                                            <FiX className="h-4 w-4" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-[#1E2938]/70 backdrop-blur-sm px-3 py-1.5 text-xs text-white font-[family-name:var(--font-jetbrains-mono)] text-center">
                                            Recommended: 1200×630px
                                        </div>
                                    </motion.div>
                                )}
                            </SeoField>
                        </div>
                    </div>

                    {/* Best practices */}
                    <div className={`${NEU_CARD}`}>
                        <div className="flex items-start gap-3">
                            <div className={NEU_ICON_WELL_PRIMARY}>
                                <FiCheckCircle className="h-4 w-4 text-[#006666]" />
                            </div>
                            <div>
                                <h4 className={`${NEU_HEADING} text-sm mb-2`}>SEO Best Practices</h4>
                                <ul className="space-y-2">
                                    {[
                                        'Include target keywords naturally in your meta title',
                                        'Make your description compelling to encourage clicks',
                                        'Use high-quality images with proper dimensions (1200×630px)',
                                        'Ensure meta title and description are unique for each article',
                                    ].map((tip, i) => (
                                        <li key={i} className={`${NEU_MUTED} text-xs flex items-start gap-2`}>
                                            <span className="h-1.5 w-1.5 mt-1.5 rounded-full bg-[#006666] flex-shrink-0" />
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Preview */}
                <motion.div variants={itemVariants}>
                    <div className={`${NEU_CARD} lg:sticky lg:top-6`}>
                        <SeoPreview
                            title={metaTitle}
                            description={metaDescription}
                            image={ogImage}
                            url="article-slug"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}