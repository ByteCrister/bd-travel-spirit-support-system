'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FormikErrors, FormikTouched } from 'formik';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { ARTICLE_TYPE } from '@/constants/article.const';
import { TOUR_CATEGORIES } from '@/constants/tour.const';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, FileText, Tags, Image as ImageIcon, User, Layers, Upload, X, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { fileToBase64, isAllowedExtension, IMAGE_EXTENSIONS } from '@/utils/helpers/file-conversion';
import { showToast } from '@/components/global/showToast';
import Image from 'next/image';

export interface ArticleBasicsProps {
  values: CreateArticleFormValues;
  errors: FormikErrors<CreateArticleFormValues>;
  touched: FormikTouched<CreateArticleFormValues>;
  setFieldValue: <K extends keyof CreateArticleFormValues>(
    field: K,
    value: CreateArticleFormValues[K]
  ) => void;
}

function fieldError<T extends keyof CreateArticleFormValues>(
  errors: FormikErrors<CreateArticleFormValues>,
  touched: FormikTouched<CreateArticleFormValues>,
  field: T
): string | undefined {
  const err = errors[field] as unknown;
  const t = touched[field] as unknown;
  if (t && typeof err === 'string') return err;
  return undefined;
}

export function ArticleBasics({
  values,
  errors,
  touched,
  setFieldValue,
}: ArticleBasicsProps) {
  const categories = values.categories ?? [];
  const tags = values.tags ?? [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [currentTag, setCurrentTag] = useState('');

  const titleError = fieldError(errors, touched, 'title');
  const articleTypeError = fieldError(errors, touched, 'articleType');
  const categoriesError = fieldError(errors, touched, 'categories');
  const tagsError = fieldError(errors, touched, 'tags');
  const summaryError = fieldError(errors, touched, 'summary');
  const heroImageError = fieldError(errors, touched, 'heroImage');
  const authorBioError = fieldError(errors, touched, 'authorBio');

  const inputBaseClass = "transition-all duration-200 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const invalidClass = 'border-red-400 focus:border-red-500 focus:ring-red-100';

  const FieldWrapper = ({ children, error }: { children: React.ReactNode; error?: string }) => (
    <div className="space-y-2">
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-600 flex items-center gap-1"
            role="alert"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
      showToast.error('Invalid file type', `Please upload an image file (${IMAGE_EXTENSIONS.join(', ')})`);
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file, {
        compressImages: true,
        maxWidth: 1600,
        quality: 0.8,
        maxFileBytes: 5 * 1024 * 1024, // 5MB
        allowedExtensions: IMAGE_EXTENSIONS,
      });

      setFieldValue('heroImage', base64);
      showToast.success('Image uploaded', 'Hero image has been successfully uploaded.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      showToast.error('Upload failed', errorMessage);
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFieldValue('heroImage', '');
    showToast.info('Image removed', 'Hero image has been removed.');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Validate file type
    if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
      showToast.error('Invalid file type', `Please upload an image file (${IMAGE_EXTENSIONS.join(', ')})`);
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file, {
        compressImages: true,
        maxWidth: 1600,
        quality: 0.8,
        maxFileBytes: 5 * 1024 * 1024,
        allowedExtensions: IMAGE_EXTENSIONS,
      });

      setFieldValue('heroImage', base64);
      showToast.success('Image uploaded', 'Hero image has been successfully uploaded via drag & drop.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      showToast.error('Upload failed', errorMessage);
      console.error('Image upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FieldWrapper error={titleError}>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Type className="w-4 h-4 text-blue-600" />
            Article Title
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={values.title}
            onChange={(e) => setFieldValue('title', e.target.value)}
            placeholder="e.g., A Perfect Weekend in Sylhet"
            aria-label="Article title"
            aria-invalid={!!titleError}
            className={`${inputBaseClass} ${titleError ? invalidClass : ''} text-base h-11`}
          />
        </FieldWrapper>
      </motion.div>

      {/* Article Type */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <FieldWrapper error={articleTypeError}>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="w-4 h-4 text-blue-600" />
            Article Type
            <span className="text-red-500">*</span>
          </label>
          <Select
            value={values.articleType}
            onValueChange={(v) =>
              setFieldValue('articleType', v as ARTICLE_TYPE)
            }
          >
            <SelectTrigger
              className={`${inputBaseClass} ${articleTypeError ? invalidClass : ''} w-full h-11`}
              aria-invalid={!!articleTypeError}
              aria-label="Article type"
            >
              <SelectValue placeholder="Choose article type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ARTICLE_TYPE).map((s) => (
                <SelectItem key={s} value={s} className="cursor-pointer">
                  {s.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </motion.div>

      {/* Categories Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Layers className="w-4 h-4 text-blue-600" />
          Categories
          <span className="text-red-500">*</span>
        </label>
        <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {Object.values(TOUR_CATEGORIES).map((cat, index) => {
              const active = categories.includes(cat);
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={active ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all duration-200 px-3 py-1.5 ${active
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    onClick={() => {
                      const next = active
                        ? categories.filter((c): c is TOUR_CATEGORIES => typeof c === 'string' && c !== cat)
                        : [...categories, cat];
                      setFieldValue('categories', next);
                    }}
                  >
                    {cat}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
            Select at least one category
          </p>
        </div>
        {categoriesError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-600 flex items-center gap-1"
            role="alert"
          >
            <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
            {categoriesError}
          </motion.p>
        )}
      </motion.div>

      {/* Tags Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <FieldWrapper error={tagsError}>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Tags className="w-4 h-4 text-blue-600" />
            Tags
          </label>
          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                <AnimatePresence>
                  {tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge
                        variant="outline"
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const newTags = tags.filter((_, i) => i !== index);
                            setFieldValue('tags', newTags);
                          }}
                          className="ml-2 text-xs font-bold hover:text-red-700"
                        >
                          ✕
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Validate and add tag
                    if (currentTag.trim()) {
                      // Check for duplicates
                      if (tags.includes(currentTag.trim())) {
                        showToast.error('Duplicate tag', 'This tag already exists.');
                        return;
                      }
                      // Validate tag format
                      const tagRegex = /^[a-zA-Z0-9 ]{1,20}$/;
                      if (!tagRegex.test(currentTag.trim())) {
                        showToast.error('Invalid tag', 'Tag must be alphanumeric and spaces, up to 20 characters.');
                        return;
                      }
                      // Check maximum tags
                      if (tags.length >= 5) {
                        showToast.error('Maximum tags reached', 'You can only add up to 5 tags.');
                        return;
                      }
                      setFieldValue('tags', [...tags, currentTag.trim()]);
                      setCurrentTag('');
                    }
                  }
                }}
                placeholder={tags.length < 5 ? "Type a tag and press Enter" : "Maximum 5 tags reached"}
                disabled={tags.length >= 5}
                className="w-full border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
                {tags.length}/5 tags. Tags must be alphanumeric and spaces, up to 20 characters each.
              </p>
            </div>
          </div>
        </FieldWrapper>
      </motion.div>

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <FieldWrapper error={summaryError}>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FileText className="w-4 h-4 text-blue-600" />
              Summary
              <span className="text-red-500">*</span>
            </label>
            <span className={`text-xs font-medium ${(values.summary?.length ?? 0) > 300
              ? 'text-red-600'
              : (values.summary?.length ?? 0) > 250
                ? 'text-amber-600'
                : 'text-slate-500'
              }`}>
              {values.summary?.length ?? 0}/300
            </span>
          </div>
          <Textarea
            value={values.summary}
            onChange={(e) => setFieldValue('summary', e.target.value)}
            placeholder="Write a compelling summary that captures the essence of your article..."
            aria-label="Article summary"
            aria-invalid={!!summaryError}
            className={`${inputBaseClass} ${summaryError ? invalidClass : ''} min-h-[100px] resize-none`}
          />
        </FieldWrapper>
      </motion.div>

      {/* Hero Image Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <FieldWrapper error={heroImageError}>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Hero Image
            <span className="text-red-500">*</span>
          </label>
          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />

            {values.heroImage ? (
              <div className="relative">
                {/* Image */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden z-0">
                  <Image src={values.heroImage} alt="Hero preview" fill className="object-cover" />
                </div>

                {/* Click-to-change layer */}
                <div
                  className="absolute inset-0 cursor-pointer z-0"
                  onClick={() => fileInputRef.current?.click()}
                />

                {/* Controls */}
                <div className="relative z-10 flex justify-end mt-3">
                  <motion.button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </motion.button>
                </div>
              </div>

            ) : (
              <motion.div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-sm text-slate-600">Uploading image...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, GIF, WEBP, BMP up to 5MB
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-slate-400" />
              Recommended size: 1600x900px or similar aspect ratio
            </p>
          </div>
        </FieldWrapper>
      </motion.div>

      {/* Author Bio Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <FieldWrapper error={authorBioError}>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <User className="w-4 h-4 text-blue-600" />
            Author Bio
            <span className="text-xs font-normal text-slate-500 ml-1">(Optional)</span>
          </label>
          <Textarea
            value={values.authorBio ?? ''}
            onChange={(e) => setFieldValue('authorBio', e.target.value)}
            placeholder="Share a brief bio about yourself or the author..."
            aria-label="Author bio"
            aria-invalid={!!authorBioError}
            className={`${inputBaseClass} ${authorBioError ? invalidClass : ''} min-h-[80px] resize-none`}
          />
        </FieldWrapper>
      </motion.div>
    </div>
  );
}