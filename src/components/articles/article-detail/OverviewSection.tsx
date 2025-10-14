// components/articles/OverviewSection.tsx
'use client';

import React, { useState } from 'react';
import { useFormikContext } from 'formik';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    FiFileText,
    FiLink,
    FiAlignLeft,
    FiImage,
    FiCheckCircle,
    FiType,
    FiTag,
    FiGrid,
    FiX,
    FiPlus,
    FiInfo
} from 'react-icons/fi';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ARTICLE_STATUS, ARTICLE_TYPE } from '@/constants/article.const';
import { TRAVEL_TYPE } from '@/constants/tour.const';

type Values = {
    title: string;
    slug: string;
    summary: string;
    heroImage: string | null;
    status: ARTICLE_STATUS;
    articleType: ARTICLE_TYPE;
    categories: TRAVEL_TYPE[];
    tags: string[];
};

// Animation variants
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

// Status configuration
const STATUS_CONFIG = {
    [ARTICLE_STATUS.DRAFT]: {
        color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        icon: '📝',
        description: 'Work in progress'
    },
    [ARTICLE_STATUS.PUBLISHED]: {
        color: 'bg-green-100 text-green-700 hover:bg-green-200',
        icon: '✅',
        description: 'Live and visible'
    },
    [ARTICLE_STATUS.ARCHIVED]: {
        color: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
        icon: '📦',
        description: 'No longer active'
    },
};

// Article type configuration
const TYPE_CONFIG = {
    [ARTICLE_TYPE.SINGLE_DESTINATION]: { icon: '📍', color: 'text-blue-600' },
    [ARTICLE_TYPE.MULTI_DESTINATION]: { icon: '🗺️', color: 'text-purple-600' },
    [ARTICLE_TYPE.GENERAL_TIPS]: { icon: '📖', color: 'text-green-600' }
};

// Input field wrapper component
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
    const [imagePreview, setImagePreview] = useState<string | null>(values.heroImage);

    const handleImageChange = (url: string) => {
        setFieldValue('heroImage', url || null);
        setImagePreview(url || null);
    };

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !values.tags.includes(tag)) {
            setFieldValue('tags', [...values.tags, tag]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFieldValue('tags', values.tags.filter(t => t !== tagToRemove));
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
                            <FormField
                                label="Title"
                                icon={FiType}
                                error={errors.title}
                                touched={touched.title}
                                required
                            >
                                <Input
                                    value={values.title}
                                    onChange={(e) => setFieldValue('title', e.target.value)}
                                    placeholder="Enter an engaging article title..."
                                    className={`transition-all ${touched.title && errors.title
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'focus:ring-blue-500'
                                        }`}
                                />
                            </FormField>

                            <FormField
                                label="URL Slug"
                                icon={FiLink}
                                error={errors.slug}
                                touched={touched.slug}
                                required
                                description="kebab-case"
                            >
                                <div className="relative">
                                    <Input
                                        value={values.slug}
                                        onChange={(e) => setFieldValue('slug', e.target.value)}
                                        placeholder="article-url-slug"
                                        className={`font-mono text-sm ${touched.slug && errors.slug
                                            ? 'border-red-300 focus:ring-red-500'
                                            : 'focus:ring-blue-500'
                                            }`}
                                    />
                                </div>
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

                            {imagePreview && (
                                <FormField
                                    label="Hero Image"
                                    icon={FiImage}
                                    error={errors.heroImage}
                                    touched={touched.heroImage}
                                >
                                    <div className="space-y-3">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative rounded-lg overflow-hidden border-2 border-gray-200"
                                        >
                                            <Image
                                                src={imagePreview}
                                                alt="Hero preview"
                                                fill
                                                className="object-cover rounded-md"
                                                onError={() => setImagePreview(null)}
                                                unoptimized // <-- optional: allow dynamic URLs (like blob: or data:)
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
                                        </motion.div>

                                    </div>
                                </FormField>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Right Column - Settings & Metadata */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Status & Type */}
                    <Card className="p-6 shadow-sm border-gray-200/60">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <FiCheckCircle className="h-4 w-4 text-purple-600" />
                            </div>
                            Status & Type
                        </h3>

                        <div className="space-y-4">
                            <FormField
                                label="Publication Status"
                                icon={FiCheckCircle}
                                error={errors.status}
                                touched={touched.status}
                                required
                            >
                                <Select
                                    value={values.status}
                                    onValueChange={(v) => setFieldValue('status', v)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ARTICLE_STATUS).map((s) => {
                                            const config = STATUS_CONFIG[s];
                                            return (
                                                <SelectItem key={s} value={s}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{config.icon}</span>
                                                        <div>
                                                            <div className="font-medium">{s}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {config.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField
                                label="Article Type"
                                icon={FiGrid}
                                error={errors.articleType}
                                touched={touched.articleType}
                                required
                            >
                                <Select
                                    value={values.articleType}
                                    onValueChange={(v) => setFieldValue('articleType', v)}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ARTICLE_TYPE).map((t) => {
                                            const config = TYPE_CONFIG[t];
                                            return (
                                                <SelectItem key={t} value={t}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{config.icon}</span>
                                                        <span className="font-medium">{t}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>
                    </Card>

                    {/* Categories */}
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
                            {Object.values(TRAVEL_TYPE).map((c) => {
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

                    {/* Tags */}
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
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                    placeholder="Type a tag and press Enter"
                                    className="flex-1 focus:ring-blue-500"
                                />
                                <Button
                                    type="button"
                                    onClick={addTag}
                                    disabled={!tagInput.trim()}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <FiPlus className="h-4 w-4" />
                                    Add
                                </Button>
                            </div>

                            {values.tags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <AnimatePresence>
                                        {values.tags.map((tag) => (
                                            <motion.div
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    className="gap-2 py-1.5 px-3 bg-white border border-gray-300 hover:border-red-400 group cursor-pointer"
                                                    onClick={() => removeTag(tag)}
                                                >
                                                    <FiTag className="h-3 w-3 text-gray-500" />
                                                    {tag}
                                                    <FiX className="h-3 w-3 text-gray-400 group-hover:text-red-600 transition-colors" />
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {values.tags.length === 0 && (
                                <div className="text-center py-6 text-sm text-muted-foreground">
                                    No tags added yet
                                </div>
                            )}
                        </div>

                        {touched.tags && errors.tags && (
                            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                <span className="h-1 w-1 rounded-full bg-red-600"></span>
                                {String(errors.tags)}
                            </p>
                        )}
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}