'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { FormikErrors, FormikHelpers, FormikTouched } from 'formik';
import { Search, Eye, AlertCircle, CheckCircle2, X, Upload, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { fileToBase64, IMAGE_EXTENSIONS } from '@/utils/helpers/file-conversion';
import Image from 'next/image';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE_RAISED =
    'bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]';
const NEU_SURFACE_INSET =
    'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_INPUT =
    'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 border-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';
const NEU_INPUT_ERROR =
    'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 border-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ring-2 ring-[#FF2157]/50 ' +
    'focus:outline-none focus:ring-2 focus:ring-[#FF2157]/60 transition-all duration-200';
const NEU_TEXTAREA =
    'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-3 border-none resize-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';
const NEU_TEXTAREA_ERROR =
    'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-3 border-none resize-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ring-2 ring-[#FF2157]/50 ' +
    'focus:outline-none transition-all duration-200';
const NEU_BTN_ICON =
    'rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 ' +
    'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
    'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40';
const NEU_BTN_DANGER_ICON =
    'rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 ' +
    'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
    'hover:text-[#FF2157] hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'transition-all duration-200';
const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_DROP_ZONE =
    'rounded-2xl border-2 border-dashed border-[#006666]/30 ' +
    'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] ' +
    'p-8 text-center cursor-pointer transition-all duration-200 ' +
    'hover:border-[#006666]/60';
const NEU_DROP_ZONE_ACTIVE =
    'rounded-2xl border-2 border-dashed border-[#006666]/60 ' +
    'bg-[#E7E5E4] shadow-[inset_6px_6px_12px_#c8c6c5,inset_-6px_-6px_12px_#ffffff] ' +
    'p-8 text-center cursor-pointer transition-all duration-200';

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

    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const calculateSeoScore = () => {
        let score = 0;
        if (seo.metaTitle && seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60) score += 33;
        if (seo.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160) score += 33;
        if (seo.ogImage) score += 34;
        return Math.min(score, 100);
    };

    const seoScore = calculateSeoScore();

    const scoreConfig = seoScore >= 70
        ? { color: 'text-[#00A63D]', bg: 'bg-[#00A63D]/10', ring: 'ring-[#00A63D]/30', label: 'Excellent' }
        : seoScore >= 40
            ? { color: 'text-[#FE9900]', bg: 'bg-[#FE9900]/10', ring: 'ring-[#FE9900]/30', label: 'Good' }
            : { color: 'text-[#1E2938]/40', bg: 'bg-[#1E2938]/5', ring: 'ring-[#1E2938]/10', label: 'Needs work' };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    const handleFileUpload = async (file: File) => {
        setUploadError(null);
        setIsUploading(true);
        try {
            const fileName = file.name.toLowerCase();
            const isValidImage = IMAGE_EXTENSIONS.some(ext => fileName.endsWith(`.${ext}`));
            if (!isValidImage) throw new Error(`Please upload a valid image file (${IMAGE_EXTENSIONS.join(', ')})`);
            if (file.size > 5 * 1024 * 1024) throw new Error('Image size must be less than 5MB');
            const base64Image = await fileToBase64(file, {
                compressImages: true,
                maxWidth: 1200,
                quality: 0.8,
                maxFileBytes: 5 * 1024 * 1024,
                allowedExtensions: IMAGE_EXTENSIONS,
            });
            setFieldValue('seo.ogImage', base64Image);
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
            console.error('Image upload error:', error);
        } finally {
            setIsUploading(false);
            setIsReplacing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeImage = () => {
        setFieldValue('seo.ogImage', null);
        setUploadError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startReplaceImage = () => setIsReplacing(true);
    const cancelReplaceImage = () => setIsReplacing(false);
    const triggerFileInput = () => fileInputRef.current?.click();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isReplacing && dropZoneRef.current && !dropZoneRef.current.contains(event.target as Node)) {
                setIsReplacing(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isReplacing]);

    const titleOk = seo.metaTitle && seo.metaTitle.length >= 30 && seo.metaTitle.length <= 60;
    const descOk = seo.metaDescription && seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160;

    return (
        <div className="space-y-5">
            {/* SEO Score Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`${NEU_CARD} p-5`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${scoreConfig.bg} shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]`}>
                            <Search className={`w-5 h-5 ${scoreConfig.color}`} />
                        </div>
                        <div>
                            <p className={`${NEU_HEADING} text-sm`}>SEO Score</p>
                            <p className={`${NEU_MUTED} text-xs mt-0.5`}>Optimize for search engines</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`font-[family-name:var(--font-space-mono)] text-3xl font-bold ${scoreConfig.color}`}>
                            {seoScore}%
                        </div>
                        <p className={`${NEU_LABEL} normal-case text-[10px] mt-0.5 ${scoreConfig.color}`}>
                            {scoreConfig.label}
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 rounded-full shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]">
                    <motion.div
                        className={`h-full rounded-full ${seoScore >= 70 ? 'bg-[#00A63D]' : seoScore >= 40 ? 'bg-[#FE9900]' : 'bg-[#1E2938]/20'} transition-all duration-500`}
                        initial={{ width: 0 }}
                        animate={{ width: `${seoScore}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    />
                </div>

                {/* Checklist */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                        { ok: !!titleOk, label: 'Meta title (30–60 chars)' },
                        { ok: !!descOk, label: 'Description (120–160 chars)' },
                        { ok: !!seo.ogImage, label: 'OG image' },
                    ].map(({ ok, label }) => (
                        <div key={label} className="flex items-center gap-2">
                            {ok ? (
                                <CheckCircle2 className="w-4 h-4 text-[#00A63D] flex-shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-[#1E2938]/25 flex-shrink-0" />
                            )}
                            <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Meta Title */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
                <div className={`${NEU_CARD} p-5 space-y-3`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <label className={`${NEU_LABEL} block mb-0.5`}>Meta Title</label>
                            <p className={`${NEU_MUTED} text-xs`}>Keep it between 30–60 characters</p>
                        </div>
                        <span className={`font-[family-name:var(--font-jetbrains-mono)] text-xs font-bold px-2 py-1 rounded-lg ${titleOk ? 'text-[#00A63D] bg-[#00A63D]/10' : 'text-[#1E2938]/40 bg-[#1E2938]/5'} shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]`}>
                            {seo.metaTitle.length}/60
                        </span>
                    </div>
                    <input
                        className={errors?.metaTitle && touched?.metaTitle ? NEU_INPUT_ERROR : NEU_INPUT}
                        value={seo.metaTitle}
                        onChange={(e) => setFieldValue('seo.metaTitle', e.target.value)}
                        placeholder="e.g., Discover Hidden Gems in Bali | Travel Guide 2025"
                        aria-label="Meta title"
                        maxLength={60}
                    />
                    <AnimatePresence>
                        {errors?.metaTitle && touched?.metaTitle && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]"
                            >
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                {errors.metaTitle}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Preview */}
                    <div className={`rounded-xl p-3 ${NEU_SURFACE_INSET}`}>
                        <p className={`${NEU_LABEL} text-[10px] mb-1`}>Search Preview</p>
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666] truncate">
                            {seo.metaTitle || 'Your meta title will appear here…'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Meta Description */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                <div className={`${NEU_CARD} p-5 space-y-3`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <label className={`${NEU_LABEL} block mb-0.5`}>Meta Description</label>
                            <p className={`${NEU_MUTED} text-xs`}>Keep it between 120–160 characters</p>
                        </div>
                        <span className={`font-[family-name:var(--font-jetbrains-mono)] text-xs font-bold px-2 py-1 rounded-lg ${descOk ? 'text-[#00A63D] bg-[#00A63D]/10' : 'text-[#1E2938]/40 bg-[#1E2938]/5'} shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]`}>
                            {seo.metaDescription.length}/160
                        </span>
                    </div>
                    <textarea
                        className={errors?.metaDescription && touched?.metaDescription ? NEU_TEXTAREA_ERROR : NEU_TEXTAREA}
                        value={seo.metaDescription}
                        onChange={(e) => setFieldValue('seo.metaDescription', e.target.value)}
                        placeholder="Write a compelling description that summarizes your article and encourages clicks…"
                        aria-label="Meta description"
                        maxLength={160}
                        rows={3}
                    />
                    <AnimatePresence>
                        {errors?.metaDescription && touched?.metaDescription && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]"
                            >
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                {errors.metaDescription}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Preview */}
                    <div className={`rounded-xl p-3 ${NEU_SURFACE_INSET}`}>
                        <p className={`${NEU_LABEL} text-[10px] mb-1`}>Search Preview</p>
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70 line-clamp-2">
                            {seo.metaDescription || 'Your meta description will appear here…'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* OG Image */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <div className={`${NEU_CARD} p-5 space-y-3`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-[#006666]" />
                        <label className={NEU_LABEL}>Open Graph Image</label>
                    </div>
                    <p className={`${NEU_MUTED} text-xs`}>
                        Used when sharing on social media — 1200×630px recommended
                    </p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />

                    {seo.ogImage && !isReplacing ? (
                        <div className="space-y-3">
                            <div className={`rounded-xl p-3 flex items-center gap-3 ${NEU_SURFACE_RAISED}`}>
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                                    <Image
                                        src={seo.ogImage}
                                        alt="Open Graph preview"
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]">
                                        Image uploaded
                                    </p>
                                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-0.5">
                                        Ready for social media sharing
                                    </p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={startReplaceImage}
                                        className={NEU_BTN_ICON}
                                        aria-label="Replace image"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className={NEU_BTN_DANGER_ICON}
                                        aria-label="Remove image"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={startReplaceImage}
                                className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#006666] hover:text-[#007777] font-medium transition-colors duration-150"
                            >
                                Replace with a different image →
                            </button>
                        </div>
                    ) : (
                        <div
                            ref={dropZoneRef}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={triggerFileInput}
                            className={isReplacing ? NEU_DROP_ZONE_ACTIVE : NEU_DROP_ZONE}
                        >
                            <div className="flex flex-col items-center gap-3">
                                {isUploading ? (
                                    <>
                                        <div className="w-11 h-11 rounded-xl bg-[#006666]/10 flex items-center justify-center shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                                            <div className="w-5 h-5 rounded-full border-2 border-[#006666] border-t-transparent animate-spin" />
                                        </div>
                                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666]">
                                            {isReplacing ? 'Replacing image…' : 'Uploading image…'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-11 h-11 rounded-xl bg-[#006666]/10 flex items-center justify-center shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                                            {isReplacing
                                                ? <RefreshCw className="w-5 h-5 text-[#006666]" />
                                                : <Upload className="w-5 h-5 text-[#006666]" />
                                            }
                                        </div>
                                        <div>
                                            <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]/70">
                                                {isReplacing ? 'Replace Open Graph Image' : 'Upload Open Graph Image'}
                                            </p>
                                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 mt-1">
                                                Drag & drop or click to browse
                                            </p>
                                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/30 mt-0.5">
                                                {IMAGE_EXTENSIONS.join(', ')} · Max 5MB
                                            </p>
                                        </div>
                                        {isReplacing && (
                                            <motion.button
                                                type="button"
                                                initial={{ opacity: 0, y: -6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onClick={(e) => { e.stopPropagation(); cancelReplaceImage(); }}
                                                className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 hover:text-[#1E2938]/80 px-3 py-1.5 rounded-xl hover:shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] transition-all duration-150"
                                            >
                                                Cancel replacement
                                            </motion.button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {(uploadError || (errors?.ogImage && touched?.ogImage)) && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="flex items-center gap-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]"
                            >
                                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                {uploadError || (errors as { ogImage?: string })?.ogImage}
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
                className={`${NEU_CARD} p-5`}
            >
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#006666]/10 flex items-center justify-center flex-shrink-0 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                        <Search className="w-4 h-4 text-[#006666]" />
                    </div>
                    <div>
                        <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938] uppercase tracking-widest mb-2">
                            SEO Best Practices
                        </p>
                        <ul className="space-y-1.5 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/60">
                            <li className="flex items-start gap-2"><span className="text-[#006666] mt-0.5">→</span>Include your primary keyword in the title and description</li>
                            <li className="flex items-start gap-2"><span className="text-[#006666] mt-0.5">→</span>Make your description compelling to increase click-through rates</li>
                            <li className="flex items-start gap-2"><span className="text-[#006666] mt-0.5">→</span>Use high-quality images for social sharing (1200×630px)</li>
                            <li className="flex items-start gap-2"><span className="text-[#006666] mt-0.5">→</span>Keep titles concise and descriptions detailed but brief</li>
                        </ul>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}