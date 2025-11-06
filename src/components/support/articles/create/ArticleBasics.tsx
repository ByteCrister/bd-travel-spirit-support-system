'use client';

import React from 'react';
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
import { TagInput } from './TagInput';
import { ImageUploader } from './ImageUploader';
import { FormikErrors, FormikTouched } from 'formik';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { ARTICLE_STATUS, ARTICLE_TYPE } from '@/constants/article.const';
import { TRAVEL_TYPE } from '@/constants/tour.const';

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

  const titleError = fieldError(errors, touched, 'title');
  const slugError = fieldError(errors, touched, 'slug');
  const statusError = fieldError(errors, touched, 'status');
  const articleTypeError = fieldError(errors, touched, 'articleType');
  const categoriesError = fieldError(errors, touched, 'categories');
  const tagsError = fieldError(errors, touched, 'tags');
  const summaryError = fieldError(errors, touched, 'summary');
  const heroImageError = fieldError(errors, touched, 'heroImage');
  const authorBioError = fieldError(errors, touched, 'authorBio');

  const invalidClass = 'border-red-500 focus:ring-red-500'; // adjust to your theme

  return (
    <div className="space-y-6">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={values.title}
            onChange={(e) => setFieldValue('title', e.target.value)}
            placeholder="A perfect weekend in Sylhet"
            aria-label="Article title"
            aria-invalid={!!titleError}
            className={titleError ? invalidClass : ''}
          />
          {titleError && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {titleError}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            value={values.slug}
            onChange={(e) => setFieldValue('slug', e.target.value)}
            placeholder="a-perfect-weekend-in-sylhet"
            aria-label="Article slug"
            aria-invalid={!!slugError}
            className={slugError ? invalidClass : ''}
          />
          {slugError && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {slugError}
            </p>
          )}
        </div>
      </div>

      {/* Status & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select
            value={values.status}
            onValueChange={(v) => setFieldValue('status', v as ARTICLE_STATUS)}
          >
            <SelectTrigger
              className={statusError ? `${invalidClass} w-full` : 'w-full'}
              aria-invalid={!!statusError}
              aria-label="Article status"
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              {Object.values(ARTICLE_STATUS).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {statusError && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {statusError}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Article type</label>
          <Select
            value={values.articleType}
            onValueChange={(v) =>
              setFieldValue('articleType', v as ARTICLE_TYPE)
            }
          >
            <SelectTrigger
              className={articleTypeError ? `${invalidClass} w-full` : 'w-full'}
              aria-invalid={!!articleTypeError}
              aria-label="Article type"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>

            <SelectContent>
              {Object.values(ARTICLE_TYPE).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {articleTypeError && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {articleTypeError}
            </p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-sm font-medium">Categories</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.values(TRAVEL_TYPE).map((cat) => {
            const active = categories.includes(cat);
            return (
              <Badge
                key={cat}
                variant={active ? 'default' : 'outline'}
                className={`cursor-pointer ${categoriesError ? '' : ''}`}
                onClick={() => {
                  const next = active
                    ? categories.filter((c): c is TRAVEL_TYPE => typeof c === 'string' && c !== cat)
                    : [...categories, cat];
                  setFieldValue('categories', next);
                }}
              >
                {cat}
              </Badge>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Select at least one category.</p>
        {categoriesError && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {categoriesError}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium">Tags</label>
        <TagInput
          value={tags?.filter((tag): tag is string => typeof tag === 'string')}
          onChange={(next) => setFieldValue('tags', next)}
        />
        {tagsError && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {tagsError}
          </p>
        )}
      </div>

      {/* Summary */}
      <div>
        <label className="text-sm font-medium">Summary</label>
        <Textarea
          value={values.summary}
          onChange={(e) => setFieldValue('summary', e.target.value)}
          placeholder="Short summary under 300 characters"
          aria-label="Article summary"
          aria-invalid={!!summaryError}
          className={summaryError ? invalidClass : ''}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {values.summary?.length ?? 0}/300
        </p>
        {summaryError && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {summaryError}
          </p>
        )}
      </div>

      {/* Hero Image */}
      <div>
        <ImageUploader
          label="Hero image"
          value={values.heroImage ?? null}
          onChange={(v) => setFieldValue('heroImage', (v as string | null) ?? null)}
        />
        {heroImageError && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {heroImageError}
          </p>
        )}
      </div>

      {/* Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Author bio (optional)</label>
          <Textarea
            value={values.authorBio}
            onChange={(e) => setFieldValue('authorBio', e.target.value)}
            placeholder="Short author bio"
            aria-label="Author bio"
            aria-invalid={!!authorBioError}
            className={authorBioError ? invalidClass : ''}
          />
          {authorBioError && (
            <p className="mt-1 text-xs text-red-600" role="alert">
              {authorBioError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
