'use client';

import React, { ReactNode, useState, useRef } from 'react';
import { useFormikContext } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    FiFileText, FiAlignLeft, FiImage, FiCheckCircle, FiType, FiTag, FiGrid, FiX,
    FiPlus, FiInfo, FiMapPin, FiGlobe, FiBook, FiEdit3, FiCloud, FiSun, FiFlag,
    FiUsers, FiCalendar, FiCoffee, FiCompass, FiUpload,
} from 'react-icons/fi';
import Image from 'next/image';
import { ARTICLE_TYPE } from '@/constants/article.const';
import { TOUR_CATEGORIES } from '@/constants/tour.const';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { fileToBase64, IMAGE_EXTENSIONS } from '@/utils/helpers/file-conversion';
import { showToast } from '@/components/global/showToast';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6';

const NEU_SURFACE_INSET =
    'bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl';

const NEU_INPUT =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_BTN_PRIMARY =
    'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-sm ' +
    'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
    'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
    'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
    'transition-all duration-200 px-4 py-2 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed';

const NEU_BTN_GHOST =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
    'transition-all duration-200 p-1.5';

const NEU_BADGE_ACTIVE =
    'cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#006666] text-white shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] transition-all duration-200';

const NEU_BADGE_INACTIVE =
    'cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold ' +
    'bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] ' +
    'hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] transition-all duration-200';

const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';

const NEU_ICON_WELL =
    'p-2 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]';

const NEU_ICON_WELL_PRIMARY =
    'p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]';

// ── Animation ─────────────────────────────────────────────────
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
};

// ── Article type config ───────────────────────────────────────
const TYPE_CONFIG: Record<ARTICLE_TYPE, { icon: ReactNode; color: string }> = {
    [ARTICLE_TYPE.SINGLE_DESTINATION]: { icon: <FiMapPin className="h-4 w-4" />, color: 'text-[#006666]' },
    [ARTICLE_TYPE.MULTI_DESTINATION]: { icon: <FiGlobe className="h-4 w-4" />, color: 'text-[#006666]' },
    [ARTICLE_TYPE.CITY_GUIDE]: { icon: <FiCompass className="h-4 w-4" />, color: 'text-[#006666]' },
    [ARTICLE_TYPE.HILL_STATION]: { icon: <FiCloud className="h-4 w-4" />, color: 'text-[#006666]' },
    [ARTICLE_TYPE.BEACH_DESTINATION]: { icon: <FiSun className="h-4 w-4" />, color: 'text-[#FE9900]' },
    [ARTICLE_TYPE.HISTORICAL_SITE]: { icon: <FiFlag className="h-4 w-4" />, color: 'text-[#FF2157]' },
    [ARTICLE_TYPE.CULTURAL_EXPERIENCE]: { icon: <FiUsers className="h-4 w-4" />, color: 'text-[#006666]' },
    [ARTICLE_TYPE.FESTIVAL_GUIDE]: { icon: <FiCalendar className="h-4 w-4" />, color: 'text-[#FE9900]' },
    [ARTICLE_TYPE.FOOD_GUIDE]: { icon: <FiCoffee className="h-4 w-4" />, color: 'text-[#FE9900]' },
    [ARTICLE_TYPE.TRAVEL_TIPS]: { icon: <FiBook className="h-4 w-4" />, color: 'text-[#1E2938]' },
};

// ── FormField wrapper ─────────────────────────────────────────
const FormField = ({
    label, icon: Icon, error, touched, children, required = false, description,
}: {
    label: string; icon: React.ElementType; error?: string; touched?: boolean;
    children: React.ReactNode; required?: boolean; description?: string;
}) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <label className={`flex items-center gap-2 ${NEU_LABEL}`}>
                <Icon className="h-3.5 w-3.5" />
                {label}
                {required && <span className="text-[#FF2157]">*</span>}
            </label>
            {description && (
                <span className={`${NEU_MUTED} text-xs flex items-center gap-1`}>
                    <FiInfo className="h-3 w-3" />
                    {description}
                </span>
            )}
        </div>
        {children}
        <AnimatePresence mode="wait">
            {touched && error && (
                <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-xs text-[#FF2157] flex items-center gap-1 font-[family-name:var(--font-jetbrains-mono)]"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF2157]" />
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

// ── Main component ────────────────────────────────────────────
type Values = CreateArticleFormValues;

export function OverviewSection() {
    const { values, errors, touched, setFieldValue } = useFormikContext<Values>();
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(values.heroImage ?? null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingTag, setEditingTag] = useState<{ original: string; value: string } | null>(null);
    const [undoStack, setUndoStack] = useState<{ tag: string; timeoutId: number }[]>([]);
    const [tagError, setTagError] = useState<string | null>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImageError(null);
        setIsUploading(true);
        try {
            const base64String = await fileToBase64(file, { compressImages: true, maxWidth: 1600, quality: 0.8, maxFileBytes: 5 * 1024 * 1024, allowedExtensions: IMAGE_EXTENSIONS });
            setFieldValue('heroImage', base64String);
            setImagePreview(base64String);
        } catch (error) {
            setImageError(error instanceof Error ? error.message : 'Failed to upload image');
            showToast.warning('Failed to upload hero image', error instanceof Error ? error.message : '');
            setImagePreview(null);
            setFieldValue('heroImage', null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveImage = () => { setImagePreview(null); setFieldValue('heroImage', null); setImageError(null); };

    const normalize = (s: string) => s.trim();

    const addTagsFromString = (raw: string) => {
        setTagError(null);
        const parts = raw.split(/,|\n|;/).map(normalize).filter(Boolean);
        if (parts.length === 0) return;
        const newUnique = parts.filter((p) => !values.tags.includes(p));
        if (newUnique.length === 0) { setTagError('Tag already exists'); return; }
        const tooLong = newUnique.find((t) => t.length > 100);
        if (tooLong) { setTagError('Tag too long'); return; }
        setFieldValue('tags', [...values.tags, ...newUnique]);
        setTagInput('');
    };

    const addTag = () => addTagsFromString(tagInput);
    const handleTagPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        if (/,|\n|;/.test(text)) { e.preventDefault(); addTagsFromString(text); }
    };

    const removeTag = (tagToRemove: string) => {
        setFieldValue('tags', values.tags.filter((t) => t !== tagToRemove));
        const timeoutId = window.setTimeout(() => setUndoStack((s) => s.filter((u) => u.tag !== tagToRemove)), 5000);
        setUndoStack((s) => [...s, { tag: tagToRemove, timeoutId }]);
    };

    const undoRemove = (tag: string) => {
        setUndoStack((stack) => { const item = stack.find((i) => i.tag === tag); if (item) clearTimeout(item.timeoutId); return stack.filter((i) => i.tag !== tag); });
        if (!values.tags.includes(tag)) setFieldValue('tags', [...values.tags, tag]);
    };

    const startEditTag = (tag: string) => setEditingTag({ original: tag, value: tag });
    const cancelEdit = () => { setEditingTag(null); setTagError(null); };
    const saveEdit = () => {
        if (!editingTag) return;
        const newValue = normalize(editingTag.value);
        if (!newValue) { setTagError('Tag cannot be empty'); return; }
        if (newValue !== editingTag.original && values.tags.includes(newValue)) { setTagError('Tag already exists'); return; }
        setFieldValue('tags', values.tags.map((t) => (t === editingTag.original ? newValue : t)));
        setEditingTag(null); setTagError(null);
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); addTag(); }
        else if (e.key === ',') { e.preventDefault(); addTagsFromString(tagInput); }
        else if (e.key === 'Escape') { setTagInput(''); setTagError(null); setEditingTag(null); }
    };

    const charCount = values.summary?.length || 0;
    const maxChars = 300;
    const charPct = Math.min((charCount / maxChars) * 100, 100);

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

            {/* Page header */}
            <motion.div variants={itemVariants}>
                <div className={NEU_CARD}>
                    <div className="flex items-start gap-3">
                        <div className={NEU_ICON_WELL_PRIMARY}>
                            <FiFileText className="h-5 w-5 text-[#006666]" />
                        </div>
                        <div>
                            <h2 className={`${NEU_HEADING} text-xl`}>Article Overview</h2>
                            <p className={NEU_MUTED}>Configure the basic details and metadata for your article</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Left: Basic info */}
                <motion.div variants={itemVariants} className="xl:col-span-2 space-y-5">
                    <div className={NEU_CARD}>
                        <div className="flex items-center gap-2 mb-6">
                            <div className={NEU_ICON_WELL}>
                                <FiFileText className="h-4 w-4 text-[#1E2938]/60" />
                            </div>
                            <h3 className={`${NEU_HEADING} text-base`}>Basic Information</h3>
                        </div>

                        <div className="space-y-5">
                            <FormField label="Title (English)" icon={FiType} error={errors.title} touched={touched.title} required>
                                <Input
                                    value={values.title}
                                    onChange={(e) => setFieldValue('title', e.target.value)}
                                    placeholder="Enter an engaging article title in English..."
                                    className={NEU_INPUT}
                                />
                            </FormField>

                            <FormField label="Title (Bangla)" icon={FiType} error={errors.banglaTitle} touched={touched.banglaTitle} required>
                                <Input
                                    value={values.banglaTitle || ''}
                                    onChange={(e) => setFieldValue('banglaTitle', e.target.value)}
                                    placeholder="বাংলায় একটি আকর্ষণীয় শিরোনাম লিখুন..."
                                    className={NEU_INPUT}
                                />
                            </FormField>

                            <FormField label="Summary" icon={FiAlignLeft} error={errors.summary} touched={touched.summary} required>
                                <div className="space-y-2">
                                    <Textarea
                                        value={values.summary}
                                        onChange={(e) => setFieldValue('summary', e.target.value)}
                                        placeholder="Write a compelling summary that captures the essence of your article..."
                                        className={`${NEU_INPUT} min-h-[140px] resize-none`}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className={`${NEU_MUTED} text-xs ${charCount > maxChars ? 'text-[#FF2157]' : ''}`}>
                                            {charCount} / {maxChars}
                                        </span>
                                        <div className={`${NEU_SURFACE_INSET} w-28 h-1.5 overflow-hidden`}>
                                            <motion.div
                                                className={`h-full ${charPct > 100 ? 'bg-[#FF2157]' : charPct > 80 ? 'bg-[#FE9900]' : 'bg-[#006666]'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${charPct}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </FormField>

                            {/* Hero Image */}
                            <FormField label="Hero Image" icon={FiImage} error={imageError || errors.heroImage} touched={touched.heroImage} description="1200×630px, max 5MB">
                                {!imagePreview ? (
                                    <div className={`${NEU_SURFACE_INSET} flex flex-col items-center justify-center p-8 text-center`}>
                                        <FiUpload className="h-10 w-10 text-[#1E2938]/25 mb-3" />
                                        <p className={`${NEU_MUTED} mb-4`}>Click to upload or drag and drop</p>
                                        <input ref={fileInputRef} type="file" accept={IMAGE_EXTENSIONS.map((e) => `.${e}`).join(',')} onChange={handleImageUpload} className="hidden" id="hero-image-upload" />
                                        <label htmlFor="hero-image-upload" className="cursor-pointer">
                                            <button type="button" className={NEU_BTN_PRIMARY} disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
                                                <FiImage className="h-4 w-4" />
                                                {isUploading ? 'Uploading...' : 'Choose Image'}
                                            </button>
                                        </label>
                                        <p className={`${NEU_MUTED} text-xs mt-2`}>{IMAGE_EXTENSIONS.join(', ').toUpperCase()}, max 5MB</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-xl overflow-hidden shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff]">
                                        <div className="relative h-64 w-full">
                                            <Image src={imagePreview} alt="Hero preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" unoptimized
                                                onError={() => { setImageError('Failed to load image'); setImagePreview(null); }} />
                                        </div>
                                        <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 h-8 w-8 rounded-full bg-[#FF2157] hover:bg-[#e0001e] text-white flex items-center justify-center shadow-lg transition-all" disabled={isUploading}>
                                            <FiX className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                )}
                            </FormField>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Types, categories, tags */}
                <motion.div variants={itemVariants} className="space-y-5">
                    {/* Article Type */}
                    <div className={NEU_CARD}>
                        <div className="flex items-center gap-2 mb-5">
                            <div className={NEU_ICON_WELL}>
                                <FiCheckCircle className="h-4 w-4 text-[#1E2938]/60" />
                            </div>
                            <h3 className={`${NEU_HEADING} text-base`}>Article Types</h3>
                        </div>

                        <FormField label="Article Type" icon={FiGrid} error={errors.articleType} touched={touched.articleType} required>
                            <Select value={values.articleType} onValueChange={(v) => setFieldValue('articleType', v)}>
                                <SelectTrigger className={`${NEU_INPUT} h-11`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-[#E7E5E4] border border-white/60 shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
                                    {Object.values(ARTICLE_TYPE).map((t) => {
                                        const config = TYPE_CONFIG[t];
                                        return (
                                            <SelectItem key={t} value={t} className="font-[family-name:var(--font-jetbrains-mono)] hover:bg-white/40">
                                                <div className="flex items-center gap-2">
                                                    <span className={config.color}>{config.icon}</span>
                                                    <span>{t.replace(/_/g, ' ')}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    {/* Categories */}
                    <div className={NEU_CARD}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className={NEU_ICON_WELL}>
                                <FiGrid className="h-4 w-4 text-[#1E2938]/60" />
                            </div>
                            <h3 className={`${NEU_HEADING} text-base`}>Categories</h3>
                        </div>
                        <p className={`${NEU_MUTED} mb-4`}>Select relevant categories for your article</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(TOUR_CATEGORIES).map((c) => {
                                const selected = values.categories.includes(c);
                                return (
                                    <motion.button
                                        key={c}
                                        type="button"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        className={selected ? NEU_BADGE_ACTIVE : NEU_BADGE_INACTIVE}
                                        onClick={() => {
                                            const next = selected ? values.categories.filter((x) => x !== c) : [...values.categories, c];
                                            setFieldValue('categories', next);
                                        }}
                                    >
                                        {selected && <FiCheckCircle className="h-3 w-3" />}
                                        {c}
                                    </motion.button>
                                );
                            })}
                        </div>
                        {touched.categories && errors.categories && (
                            <p className="text-xs text-[#FF2157] mt-2 font-[family-name:var(--font-jetbrains-mono)]">{String(errors.categories)}</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div className={NEU_CARD}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className={NEU_ICON_WELL}>
                                <FiTag className="h-4 w-4 text-[#1E2938]/60" />
                            </div>
                            <h3 className={`${NEU_HEADING} text-base`}>Tags</h3>
                        </div>
                        <p className={`${NEU_MUTED} mb-4`}>Add relevant tags to improve discoverability</p>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    onPaste={handleTagPaste}
                                    placeholder="Type a tag, press Enter..."
                                    className={`flex-1 ${NEU_INPUT}`}
                                    aria-label="Tag input"
                                />
                                <button type="button" onClick={addTag} disabled={!tagInput.trim()} className={NEU_BTN_PRIMARY} aria-label="Add tag">
                                    <FiPlus className="h-4 w-4" />
                                    Add
                                </button>
                            </div>

                            {tagError && <p className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">{tagError}</p>}

                            {values.tags.length > 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${NEU_SURFACE_INSET} flex flex-wrap gap-2 p-3`}>
                                    <AnimatePresence>
                                        {values.tags.map((tag) => (
                                            <motion.div key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                                                {editingTag && editingTag.original === tag ? (
                                                    <div className="flex items-center gap-1.5 bg-white/60 rounded-lg px-2 py-1 shadow-sm">
                                                        <FiTag className="h-3 w-3 text-[#1E2938]/40" />
                                                        <input
                                                            value={editingTag.value}
                                                            onChange={(e) => setEditingTag({ ...editingTag, value: e.target.value })}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }}
                                                            onBlur={saveEdit}
                                                            className="w-28 bg-transparent outline-none text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]"
                                                            autoFocus
                                                        />
                                                        <button type="button" onClick={cancelEdit} className="text-[#1E2938]/40 hover:text-[#1E2938]"><FiX className="h-3 w-3" /></button>
                                                    </div>
                                                ) : (
                                                    <div className={`${NEU_BADGE_INACTIVE} py-1`}>
                                                        <FiTag className="h-3 w-3 text-[#1E2938]/40" />
                                                        <span className="text-xs">{tag}</span>
                                                        <div className="flex items-center gap-0.5 ml-1">
                                                            <button type="button" onClick={() => startEditTag(tag ?? '')} className={NEU_BTN_GHOST} aria-label={`Edit ${tag}`}>
                                                                <FiEdit3 className="h-3 w-3" />
                                                            </button>
                                                            <button type="button" onClick={() => removeTag(tag ?? '')} className={`${NEU_BTN_GHOST} hover:text-[#FF2157]`} aria-label={`Remove ${tag}`}>
                                                                <FiX className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <div className={`${NEU_SURFACE_INSET} text-center py-6`}>
                                    <p className={NEU_MUTED}>No tags added yet</p>
                                </div>
                            )}
                        </div>

                        {touched.tags && errors.tags && (
                            <p className="text-xs text-[#FF2157] mt-2 font-[family-name:var(--font-jetbrains-mono)]">{String(errors.tags)}</p>
                        )}

                        {/* Undo snackbar */}
                        <div aria-live="polite" className="fixed bottom-6 right-6 space-y-2 z-50">
                            <AnimatePresence>
                                {undoStack.map((u) => (
                                    <motion.div
                                        key={u.tag}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 12 }}
                                        className="flex items-center gap-3 rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60 px-4 py-2"
                                    >
                                        <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]">
                                            Removed <strong>{u.tag}</strong>
                                        </span>
                                        <button onClick={() => undoRemove(u.tag)} className="text-sm text-[#006666] font-[family-name:var(--font-space-mono)] font-bold hover:underline">
                                            Undo
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}