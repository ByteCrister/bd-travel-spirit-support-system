'use client';

import React, { ReactNode, useState, useRef } from 'react';
import { useFormikContext } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    FiFileText,
    FiAlignLeft,
    FiImage,
    FiCheckCircle,
    FiType,
    FiTag,
    FiGrid,
    FiX,
    FiPlus,
    FiInfo,
    FiMapPin,
    FiGlobe,
    FiBook,
    FiEdit3,
    FiCloud,
    FiSun,
    FiFlag,
    FiUsers,
    FiCalendar,
    FiCoffee,
    FiCompass,
    FiUpload
} from 'react-icons/fi';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ARTICLE_TYPE } from '@/constants/article.const';
import { TOUR_CATEGORIES } from '@/constants/tour.const';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
// Import file conversion utilities
import {
    fileToBase64,
    IMAGE_EXTENSIONS,
} from '@/utils/helpers/file-conversion';
import { showToast } from '@/components/global/showToast';

// Use the imported type from validator
type Values = CreateArticleFormValues;

// Animation variants (unchanged)
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
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

/** Article type configuration - UPDATED with new ARTICLE_TYPE values */
const TYPE_CONFIG: Record<ARTICLE_TYPE, { icon: ReactNode; color: string }> = {
    [ARTICLE_TYPE.SINGLE_DESTINATION]: { icon: <FiMapPin className="h-4 w-4" />, color: 'text-blue-600' },
    [ARTICLE_TYPE.MULTI_DESTINATION]: { icon: <FiGlobe className="h-4 w-4" />, color: 'text-purple-600' },
    [ARTICLE_TYPE.CITY_GUIDE]: { icon: <FiCompass className="h-4 w-4" />, color: 'text-green-600' },
    [ARTICLE_TYPE.HILL_STATION]: { icon: <FiCloud className="h-4 w-4" />, color: 'text-teal-600' },
    [ARTICLE_TYPE.BEACH_DESTINATION]: { icon: <FiSun className="h-4 w-4" />, color: 'text-yellow-600' },
    [ARTICLE_TYPE.HISTORICAL_SITE]: { icon: <FiFlag className="h-4 w-4" />, color: 'text-red-600' },
    [ARTICLE_TYPE.CULTURAL_EXPERIENCE]: { icon: <FiUsers className="h-4 w-4" />, color: 'text-indigo-600' },
    [ARTICLE_TYPE.FESTIVAL_GUIDE]: { icon: <FiCalendar className="h-4 w-4" />, color: 'text-pink-600' },
    [ARTICLE_TYPE.FOOD_GUIDE]: { icon: <FiCoffee className="h-4 w-4" />, color: 'text-orange-600' },
    [ARTICLE_TYPE.TRAVEL_TIPS]: { icon: <FiBook className="h-4 w-4" />, color: 'text-gray-600' }
};

// Input field wrapper component (unchanged)
const FormField = ({
    label,
    icon: Icon,
    error,
    touched,
    children,
    required = false,
    description
}: {
    label: string;
    icon: React.ElementType;
    error?: string;
    touched?: boolean;
    children: React.ReactNode;
    required?: boolean;
    description?: string;
}) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Icon className="h-4 w-4 text-gray-500" />
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {description && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <FiInfo className="h-3 w-3" />
                    {description}
                </span>
            )}
        </div>
        {children}
        <AnimatePresence mode="wait">
            {touched && error && (
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs text-red-600 flex items-center gap-1"
                >
                    <span className="h-1 w-1 rounded-full bg-red-600"></span>
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

export function OverviewSection() {
    const { values, errors, touched, setFieldValue } = useFormikContext<Values>();
    const [tagInput, setTagInput] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(values.heroImage ?? null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Ref for file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset error
        setImageError(null);
        setIsUploading(true);

        try {
            // Convert file to base64 using the utility function
            const base64String = await fileToBase64(file, {
                compressImages: true,
                maxWidth: 1600,
                quality: 0.8,
                maxFileBytes: 5 * 1024 * 1024, // 5MB
                allowedExtensions: IMAGE_EXTENSIONS
            });

            // Set the base64 string as the hero image value
            setFieldValue('heroImage', base64String);
            setImagePreview(base64String);
        } catch (error) {
            setImageError(error instanceof Error ? error.message : 'Failed to upload image');
            showToast.warning('Failed to upload hero image', error instanceof Error ? error.message : '')
            setImagePreview(null);
            setFieldValue('heroImage', null);
        } finally {
            setIsUploading(false);
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setFieldValue('heroImage', null);
        setImageError(null);
    };

    const [editingTag, setEditingTag] = useState<{ original: string; value: string } | null>(null);
    const [undoStack, setUndoStack] = useState<{ tag: string; timeoutId: number }[]>([]);
    const [tagError, setTagError] = useState<string | null>(null);

    // normalize helper
    const normalize = (s: string) => s.trim();

    // Add one or many tags (supports comma, newline, semicolon)
    const addTagsFromString = (raw: string) => {
        setTagError(null);
        const parts = raw
            .split(/,|\n|;/)
            .map(normalize)
            .filter(Boolean);
        if (parts.length === 0) return;

        // dedupe against existing tags
        const newUnique = parts.filter((p) => !values.tags.includes(p));
        if (newUnique.length === 0) {
            setTagError('Tag already exists');
            return;
        }

        // max length guard (optional)
        const tooLong = newUnique.find((t) => t.length > 100);
        if (tooLong) {
            setTagError('Tag too long');
            return;
        }

        setFieldValue('tags', [...values.tags, ...newUnique]);
        setTagInput('');
    };

    // simple single-tag add (keeps existing API)
    const addTag = () => addTagsFromString(tagInput);

    // paste handler: if user pastes comma separated tags, bulk-add
    const handleTagPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        if (/,|\n|;/.test(text)) {
            e.preventDefault();
            addTagsFromString(text);
        }
    };

    // Remove with undo (soft delete)
    const removeTag = (tagToRemove: string) => {
        // remove immediately from form
        setFieldValue('tags', values.tags.filter((t) => t !== tagToRemove));

        // push to undo stack with 5s timer
        const timeoutId = window.setTimeout(() => {
            setUndoStack((s) => s.filter((u) => u.tag !== tagToRemove));
        }, 5000);

        setUndoStack((s) => [...s, { tag: tagToRemove, timeoutId }]);
    };

    // Undo handler
    const undoRemove = (tag: string) => {
        // clear timeout and remove from undo stack
        setUndoStack((stack) => {
            const item = stack.find((i) => i.tag === tag);
            if (item) clearTimeout(item.timeoutId);
            return stack.filter((i) => i.tag !== tag);
        });
        if (!values.tags.includes(tag)) setFieldValue('tags', [...values.tags, tag]);
    };

    // Inline edit: start, cancel, save
    const startEditTag = (tag: string) => setEditingTag({ original: tag, value: tag });
    const cancelEdit = () => {
        setEditingTag(null);
        setTagError(null);
    };
    const saveEdit = () => {
        if (!editingTag) return;
        const newValue = normalize(editingTag.value);
        if (!newValue) {
            setTagError('Tag cannot be empty');
            return;
        }
        if (newValue !== editingTag.original && values.tags.includes(newValue)) {
            setTagError('Tag already exists');
            return;
        }
        const newTags = values.tags.map((t) => (t === editingTag.original ? newValue : t));
        setFieldValue('tags', newTags);
        setEditingTag(null);
        setTagError(null);
    };

    // key handlers for tag input
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === ',') {
            e.preventDefault();
            addTagsFromString(tagInput);
        } else if (e.key === 'Escape') {
            setTagInput('');
            setTagError(null);
            setEditingTag(null);
        }
    };

    const charCount = values.summary?.length || 0;
    const maxChars = 300;
    const charPercentage = (charCount / maxChars) * 100;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <FiFileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Article Overview</h2>
                            <p className="text-sm text-gray-600">
                                Configure the basic details and metadata for your article
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <motion.div variants={itemVariants} className="xl:col-span-2 space-y-6">
                    <Card className="p-6 shadow-sm border-gray-200/60">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FiFileText className="h-4 w-4 text-blue-600" />
                            </div>
                            Basic Information
                        </h3>

                        <div className="space-y-6">
                            {/* English Title */}
                            <FormField
                                label="Title (English)"
                                icon={FiType}
                                error={errors.title}
                                touched={touched.title}
                                required
                            >
                                <Input
                                    value={values.title}
                                    onChange={(e) => setFieldValue('title', e.target.value)}
                                    placeholder="Enter an engaging article title in English..."
                                    className={`transition-all ${touched.title && errors.title
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'focus:ring-blue-500'
                                        }`}
                                />
                            </FormField>

                            {/* Bangla Title - NEW FIELD */}
                            <FormField
                                label="Title (Bangla)"
                                icon={FiType}
                                error={errors.banglaTitle}
                                touched={touched.banglaTitle}
                                required
                            >
                                <Input
                                    value={values.banglaTitle || ''}
                                    onChange={(e) => setFieldValue('banglaTitle', e.target.value)}
                                    placeholder="বাংলায় একটি আকর্ষণীয় শিরোনাম লিখুন..."
                                    className={`transition-all ${touched.banglaTitle && errors.banglaTitle
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'focus:ring-blue-500'
                                        }`}
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Summary"
                                icon={FiAlignLeft}
                                error={errors.summary}
                                touched={touched.summary}
                                required
                            >
                                <div className="space-y-2">
                                    <Textarea
                                        value={values.summary}
                                        onChange={(e) => setFieldValue('summary', e.target.value)}
                                        placeholder="Write a compelling summary that captures the essence of your article..."
                                        className={`min-h-[140px] resize-none transition-all ${touched.summary && errors.summary
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'focus:ring-blue-500'
                                            }`}
                                    />
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`${charCount > maxChars ? 'text-red-600' : 'text-muted-foreground'
                                            }`}>
                                            {charCount} / {maxChars} characters
                                        </span>
                                        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${charPercentage > 100 ? 'bg-red-500' :
                                                    charPercentage > 80 ? 'bg-yellow-500' :
                                                        'bg-blue-500'
                                                    }`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(charPercentage, 100)}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </FormField>

                            {/* Hero Image Upload - UPDATED */}
                            <FormField
                                label="Hero Image"
                                icon={FiImage}
                                error={imageError || errors.heroImage}
                                touched={touched.heroImage}
                                description="Recommended: 1200x630px, JPG/PNG/WebP, max 5MB"
                            >
                                <div className="space-y-3">
                                    {!imagePreview ? (
                                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                                            <FiUpload className="h-10 w-10 text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 mb-4">
                                                Click to upload or drag and drop
                                            </p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="hero-image-upload"
                                            />
                                            <label htmlFor="hero-image-upload" className="cursor-pointer" >
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="gap-2"
                                                    disabled={isUploading}
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    {isUploading ? (
                                                        <>Uploading...</>
                                                    ) : (
                                                        <>
                                                            <FiImage className="h-4 w-4" />
                                                            Choose Image
                                                        </>
                                                    )}
                                                </Button>
                                            </label>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {IMAGE_EXTENSIONS.join(', ').toUpperCase()}, max 5MB
                                            </p>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative rounded-lg overflow-hidden border-2 border-gray-200"
                                        >
                                            <div className="relative h-64 w-full">
                                                <Image
                                                    src={imagePreview}
                                                    alt="Hero preview"
                                                    fill
                                                    className="object-cover rounded-md"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    onError={() => {
                                                        setImageError('Failed to load image');
                                                        setImagePreview(null);
                                                    }}
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all"
                                                    disabled={isUploading}
                                                >
                                                    <FiX className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </FormField>
                        </div>
                    </Card>
                </motion.div>

                {/* Right Column - Settings & Metadata */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Article Types */}
                    <Card className="p-6 shadow-sm border-gray-200/60">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FiCheckCircle className="h-4 w-4 text-purple-600" />
                            </div>
                            Article Types
                        </h3>

                        <div className="space-y-4">
                            <FormField
                                label="Article Type"
                                icon={FiGrid}
                                error={errors.articleType}
                                touched={touched.articleType}
                                required
                            >
                                <Select value={values.articleType} onValueChange={(v) => setFieldValue('articleType', v)}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ARTICLE_TYPE).map((t) => {
                                            const config = TYPE_CONFIG[t];
                                            return (
                                                <SelectItem key={t} value={t}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`${config.color} inline-flex items-center justify-center`}>
                                                            {config.icon}
                                                        </span>
                                                        <span className="font-medium">{t.replace(/_/g, ' ')}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>
                    </Card>


                    {/* Categories - UPDATED to use TOUR_CATEGORIES */}
                    <Card className="p-6 shadow-sm border-gray-200/60">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <FiGrid className="h-4 w-4 text-green-600" />
                            </div>
                            Categories
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select relevant categories for your article
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(TOUR_CATEGORIES).map((c) => {
                                const selected = values.categories.includes(c);
                                return (
                                    <motion.div
                                        key={c}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Badge
                                            variant={selected ? 'default' : 'outline'}
                                            className={`cursor-pointer transition-all text-xs py-1.5 px-3 ${selected
                                                ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                                                : 'hover:border-blue-400 hover:text-blue-600'
                                                }`}
                                            onClick={() => {
                                                const next = selected
                                                    ? values.categories.filter((x) => x !== c)
                                                    : [...values.categories, c];
                                                setFieldValue('categories', next);
                                            }}
                                        >
                                            {selected && <FiCheckCircle className="h-3 w-3 mr-1" />}
                                            {c}
                                        </Badge>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {touched.categories && errors.categories && (
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-red-600"></span>
                                {String(errors.categories)}
                            </p>
                        )}
                    </Card>

                    {/* Tags (unchanged) */}
                    <Card className="p-6 shadow-sm border-gray-200/60">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <FiTag className="h-4 w-4 text-orange-600" />
                            </div>
                            Tags
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4">
                            Add relevant tags to improve discoverability
                        </p>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    onPaste={handleTagPaste}
                                    placeholder="Type a tag and press Enter (comma or paste multiple)"
                                    className="flex-1 focus:ring-blue-500"
                                    aria-label="Tag input"
                                />
                                <Button
                                    type="button"
                                    onClick={addTag}
                                    disabled={!tagInput.trim()}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                    aria-label="Add tag"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>

                            {tagError && <div className="text-sm text-red-600" role="alert">{tagError}</div>}

                            {values.tags.length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <AnimatePresence>
                                        {values.tags.map((tag) => (
                                            <motion.div
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                whileHover={{ scale: 1.03 }}
                                                className="flex items-center"
                                            >
                                                {editingTag && editingTag.original === tag ? (
                                                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded py-1 px-2">
                                                        <FiTag className="h-4 w-4 text-gray-500" />
                                                        <input
                                                            value={editingTag.value}
                                                            onChange={(e) => setEditingTag({ ...editingTag, value: e.target.value })}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            onBlur={saveEdit}
                                                            className="w-36 bg-transparent outline-none text-sm"
                                                            aria-label={`Edit tag ${tag}`}
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={cancelEdit}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                            aria-label="Cancel edit"
                                                        >
                                                            <FiX className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded py-1.5 px-3">
                                                        <FiTag className="h-3 w-3 text-gray-500" />
                                                        <span className="text-sm font-medium">{tag}</span>

                                                        <div className="ml-2 flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => startEditTag(tag ?? '')}
                                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                                aria-label={`Edit ${tag}`}
                                                            >
                                                                <FiEdit3 className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTag(tag ?? '')}
                                                                className="p-1 text-gray-400 hover:text-red-600"
                                                                aria-label={`Remove ${tag}`}
                                                            >
                                                                <FiX className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground">No tags added yet</div>
                            )}
                        </div>

                        {touched.tags && errors.tags && (
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-red-600"></span>
                                {String(errors.tags)}
                            </p>
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
                                        className="flex items-center gap-3 rounded bg-white border px-4 py-2 shadow"
                                    >
                                        <div className="text-sm">Removed <strong>{u.tag}</strong></div>
                                        <button
                                            onClick={() => undoRemove(u.tag)}
                                            className="text-sm text-blue-600 hover:underline"
                                            aria-label={`Undo remove ${u.tag}`}
                                        >
                                            Undo
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}