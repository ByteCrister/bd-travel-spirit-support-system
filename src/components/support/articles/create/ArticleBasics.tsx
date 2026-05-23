'use client';

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
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
import { spaceMono, jetbrainsMono } from '@/styles/fonts';

// ---------------------
// Design System Tokens — Neumorphism Club
// ---------------------
const NEU = {
  // Input — inset (pressed)
  input: [
    'w-full rounded-xl border-0 bg-[#E7E5E4] text-[#1E2938] text-sm',
    'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    'placeholder:text-[#1E2938]/40',
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/30',
    'transition-all duration-150 px-4 py-2.5 h-11',
  ].join(' '),
  inputError: 'ring-2 ring-[#FF2157]/40 focus:ring-[#FF2157]/40',
  textarea: [
    'w-full rounded-xl border-0 bg-[#E7E5E4] text-[#1E2938] text-sm',
    'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    'placeholder:text-[#1E2938]/40',
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/30',
    'transition-all duration-150 px-4 py-3 resize-none',
  ].join(' '),
  // Section panel — raised
  panel: [
    'rounded-2xl p-4 bg-[#E7E5E4]',
    'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
  ].join(' '),
  // Select trigger
  selectTrigger: [
    'w-full rounded-xl border-0 bg-[#E7E5E4] text-[#1E2938] text-sm h-11',
    'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/30',
    'transition-all duration-150 px-4',
  ].join(' '),
  // Category badge — active / inactive
  catActive: [
    'cursor-pointer px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
    'bg-[#006666] text-white',
    'shadow-[2px_2px_5px_#004d4d,_-1px_-1px_4px_#008080]',
  ].join(' '),
  catInactive: [
    'cursor-pointer px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200',
    'bg-[#E7E5E4] text-[#1E2938]/70',
    'shadow-[3px_3px_6px_#c8c6c4,_-3px_-3px_6px_#ffffff]',
    'hover:text-[#006666] hover:shadow-[1px_1px_3px_#c8c6c4,_-1px_-1px_3px_#ffffff]',
  ].join(' '),
  // Tag badge
  tagBadge: [
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs',
    'bg-[#E7E5E4] text-[#1E2938]/70',
    'shadow-[2px_2px_4px_#c8c6c4,_-2px_-2px_4px_#ffffff]',
  ].join(' '),
  // Image upload drop zone
  dropZone: [
    'rounded-xl border-2 border-dashed border-[#1E2938]/20 p-8 text-center',
    'cursor-pointer transition-all duration-200',
    'hover:border-[#006666]/50 hover:shadow-[inset_2px_2px_4px_#c8c6c4,_inset_-2px_-2px_4px_#ffffff]',
  ].join(' '),
  // Upload icon circle
  uploadIcon: [
    'w-12 h-12 rounded-full mx-auto flex items-center justify-center',
    'bg-[#E7E5E4]',
    'shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]',
  ].join(' '),
  // Remove button
  removeBtn: [
    'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl',
    'bg-[#E7E5E4] text-[#FF2157]',
    'shadow-[2px_2px_4px_#c8c6c4,_-2px_-2px_4px_#ffffff]',
    'hover:shadow-[1px_1px_2px_#c8c6c4,_-1px_-1px_2px_#ffffff] hover:translate-y-px',
    'transition-all duration-150',
  ].join(' '),
  // Label
  label: `flex items-center gap-2 text-xs font-semibold text-[#1E2938] tracking-wide uppercase ${spaceMono.className}`,
  labelIcon: 'text-[#006666]',
  // Error text
  errorText: `flex items-center gap-1 text-xs text-[#FF2157] ${jetbrainsMono.className}`,
  // Hint text
  hintText: `text-xs text-[#1E2938]/50 flex items-center gap-1 ${jetbrainsMono.className}`,
  fontMono: spaceMono.className,
  fontData: jetbrainsMono.className,
} as const;

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

export function ArticleBasics({ values, errors, touched, setFieldValue }: ArticleBasicsProps) {
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

  const FieldWrapper = ({ children, error }: { children: React.ReactNode; error?: string }) => (
    <div className="space-y-2">
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={NEU.errorText}
            role="alert"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF2157] shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
      showToast.error('Invalid file type', `Please upload an image file (${IMAGE_EXTENSIONS.join(', ')})`);
      return;
    }
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file, { compressImages: true, maxWidth: 1600, quality: 0.8, maxFileBytes: 5 * 1024 * 1024, allowedExtensions: IMAGE_EXTENSIONS });
      setFieldValue('heroImage', base64);
      showToast.success('Image uploaded', 'Hero image has been successfully uploaded.');
    } catch (error) {
      showToast.error('Upload failed', error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFieldValue('heroImage', '');
    showToast.info('Image removed', 'Hero image has been removed.');
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isAllowedExtension(file.name, IMAGE_EXTENSIONS)) {
      showToast.error('Invalid file type', `Please upload an image file (${IMAGE_EXTENSIONS.join(', ')})`);
      return;
    }
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file, { compressImages: true, maxWidth: 1600, quality: 0.8, maxFileBytes: 5 * 1024 * 1024, allowedExtensions: IMAGE_EXTENSIONS });
      setFieldValue('heroImage', base64);
      showToast.success('Image uploaded', 'Hero image uploaded via drag & drop.');
    } catch (error) {
      showToast.error('Upload failed', error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-7">

      {/* ── Title ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <FieldWrapper error={titleError}>
          <label className={NEU.label}>
            <Type className={`w-4 h-4 ${NEU.labelIcon}`} />
            Article Title
            <span className="text-[#FF2157] normal-case">*</span>
          </label>
          <input
            value={values.title}
            onChange={(e) => setFieldValue('title', e.target.value)}
            placeholder="e.g., A Perfect Weekend in Sylhet"
            aria-label="Article title"
            aria-invalid={!!titleError}
            className={`${NEU.input} ${titleError ? NEU.inputError : ''}`}
          />
        </FieldWrapper>
      </motion.div>

      {/* ── Article Type ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <FieldWrapper error={articleTypeError}>
          <label className={NEU.label}>
            <FileText className={`w-4 h-4 ${NEU.labelIcon}`} />
            Article Type
            <span className="text-[#FF2157] normal-case">*</span>
          </label>
          <Select
            value={values.articleType}
            onValueChange={(v) => setFieldValue('articleType', v as ARTICLE_TYPE)}
          >
            <SelectTrigger
              className={`${NEU.selectTrigger} ${articleTypeError ? NEU.inputError : ''} ${NEU.fontData}`}
              aria-invalid={!!articleTypeError}
              aria-label="Article type"
            >
              <SelectValue placeholder="Choose article type…" />
            </SelectTrigger>
            <SelectContent className="bg-[#E7E5E4] border-0 shadow-[6px_6px_12px_#c8c6c4,_-6px_-6px_12px_#ffffff] rounded-xl">
              {Object.values(ARTICLE_TYPE).map((s) => (
                <SelectItem key={s} value={s} className={`cursor-pointer ${NEU.fontData} text-[#1E2938] text-sm`}>
                  {s.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </motion.div>

      {/* ── Categories ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="space-y-3">
        <label className={NEU.label}>
          <Layers className={`w-4 h-4 ${NEU.labelIcon}`} />
          Categories
          <span className="text-[#FF2157] normal-case">*</span>
        </label>
        <div className={NEU.panel}>
          <div className="flex flex-wrap gap-2">
            {Object.values(TOUR_CATEGORIES).map((cat, index) => {
              const active = categories.includes(cat);
              return (
                <motion.button
                  key={cat}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileTap={{ scale: 0.95 }}
                  className={`${active ? NEU.catActive : NEU.catInactive} ${NEU.fontMono}`}
                  onClick={() => {
                    const next = active
                      ? categories.filter((c): c is TOUR_CATEGORIES => typeof c === 'string' && c !== cat)
                      : [...categories, cat];
                    setFieldValue('categories', next);
                  }}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>
          <p className={`mt-3 ${NEU.hintText}`}>
            <span className="inline-block w-1 h-1 rounded-full bg-[#1E2938]/40 shrink-0" />
            Select at least one category
          </p>
        </div>
        {categoriesError && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU.errorText} role="alert">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF2157] shrink-0" />
            {categoriesError}
          </motion.p>
        )}
      </motion.div>

      {/* ── Tags ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
        <FieldWrapper error={tagsError}>
          <label className={NEU.label}>
            <Tags className={`w-4 h-4 ${NEU.labelIcon}`} />
            Tags
          </label>
          <div className={NEU.panel}>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={`${NEU.tagBadge} ${NEU.fontData}`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setFieldValue('tags', tags.filter((_, i) => i !== index))}
                        className="ml-1 text-[#FF2157] hover:opacity-70 font-bold text-xs"
                      >
                        ✕
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!currentTag.trim()) return;
                    if (tags.includes(currentTag.trim())) { showToast.error('Duplicate tag', 'This tag already exists.'); return; }
                    const tagRegex = /^[a-zA-Z0-9 ]{1,20}$/;
                    if (!tagRegex.test(currentTag.trim())) { showToast.error('Invalid tag', 'Tag must be alphanumeric and spaces, up to 20 characters.'); return; }
                    if (tags.length >= 5) { showToast.error('Maximum tags reached', 'You can only add up to 5 tags.'); return; }
                    setFieldValue('tags', [...tags, currentTag.trim()]);
                    setCurrentTag('');
                  }
                }}
                placeholder={tags.length < 5 ? 'Type a tag and press Enter' : 'Maximum 5 tags reached'}
                disabled={tags.length >= 5}
                className={`${NEU.input} disabled:opacity-50`}
              />
              <p className={NEU.hintText}>
                <span className="inline-block w-1 h-1 rounded-full bg-[#1E2938]/40 shrink-0" />
                {tags.length}/5 tags — alphanumeric, up to 20 characters each
              </p>
            </div>
          </div>
        </FieldWrapper>
      </motion.div>

      {/* ── Summary ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
        <FieldWrapper error={summaryError}>
          <div className="flex items-center justify-between">
            <label className={NEU.label}>
              <FileText className={`w-4 h-4 ${NEU.labelIcon}`} />
              Summary
              <span className="text-[#FF2157] normal-case">*</span>
            </label>
            <span className={`text-xs font-medium ${NEU.fontData} ${(values.summary?.length ?? 0) > 300 ? 'text-[#FF2157]' :
              (values.summary?.length ?? 0) > 250 ? 'text-[#FE9900]' : 'text-[#1E2938]/50'
              }`}>
              {values.summary?.length ?? 0}/300
            </span>
          </div>
          <textarea
            value={values.summary}
            onChange={(e) => setFieldValue('summary', e.target.value)}
            placeholder="Write a compelling summary that captures the essence of your article…"
            aria-label="Article summary"
            aria-invalid={!!summaryError}
            rows={4}
            className={`${NEU.textarea} min-h-[100px] ${summaryError ? NEU.inputError : ''}`}
          />
        </FieldWrapper>
      </motion.div>

      {/* ── Hero Image ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
        <FieldWrapper error={heroImageError}>
          <label className={`${NEU.label} mb-2`}>
            <ImageIcon className={`w-4 h-4 ${NEU.labelIcon}`} />
            Hero Image
            <span className="text-[#FF2157] normal-case">*</span>
          </label>
          <div className={NEU.panel}>
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
                <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-[inset_3px_3px_6px_#c8c6c4,_inset_-3px_-3px_6px_#ffffff]">
                  <Image src={values.heroImage} alt="Hero preview" fill className="object-cover" />
                </div>
                <div className="absolute inset-0 cursor-pointer z-0" onClick={() => fileInputRef.current?.click()} />
                <div className="relative z-10 flex justify-end mt-3">
                  <motion.button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`${NEU.removeBtn} ${NEU.fontMono} text-xs`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.div
                className={NEU.dropZone}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                whileTap={{ scale: 0.98 }}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#006666] animate-spin" />
                    <p className={`text-sm text-[#1E2938]/60 ${NEU.fontData}`}>Uploading image…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className={NEU.uploadIcon}>
                      <Upload className="w-5 h-5 text-[#006666]" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium text-[#1E2938] ${NEU.fontMono}`}>
                        Click to upload or drag &amp; drop
                      </p>
                      <p className={`text-xs text-[#1E2938]/50 mt-1 ${NEU.fontData}`}>
                        PNG, JPG, GIF, WEBP, BMP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            <p className={`mt-3 ${NEU.hintText}`}>
              <span className="inline-block w-1 h-1 rounded-full bg-[#1E2938]/40 shrink-0" />
              Recommended size: 1600×900px or similar aspect ratio
            </p>
          </div>
        </FieldWrapper>
      </motion.div>

      {/* ── Author Bio ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <FieldWrapper error={authorBioError}>
          <label className={NEU.label}>
            <User className={`w-4 h-4 ${NEU.labelIcon}`} />
            Author Bio
            <span className={`text-xs normal-case font-normal text-[#1E2938]/40 ml-1 ${NEU.fontData}`}>(Optional)</span>
          </label>
          <textarea
            value={values.authorBio ?? ''}
            onChange={(e) => setFieldValue('authorBio', e.target.value)}
            placeholder="Share a brief bio about yourself or the author…"
            aria-label="Author bio"
            aria-invalid={!!authorBioError}
            rows={3}
            className={`${NEU.textarea} min-h-[80px] ${authorBioError ? NEU.inputError : ''}`}
          />
        </FieldWrapper>
      </motion.div>
    </div>
  );
}