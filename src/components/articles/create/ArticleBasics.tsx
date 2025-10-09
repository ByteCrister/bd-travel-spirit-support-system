'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ARTICLE_STATUS, ARTICLE_TYPE, TRAVEL_CATEGORY } from '@/types/article.types';
import { TagInput } from './TagInput';
import { ImageUploader } from './ImageUploader';
import { FormikErrors, FormikTouched } from 'formik';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';

export interface ArticleBasicsProps {
    values: CreateArticleFormValues;
    errors: FormikErrors<CreateArticleFormValues>;
    touched: FormikTouched<CreateArticleFormValues>;
    setFieldValue: <K extends keyof CreateArticleFormValues>(
        field: K,
        value: CreateArticleFormValues[K]
    ) => void;
}

export function ArticleBasics({ values, setFieldValue }: ArticleBasicsProps) {
    const categories = values.categories ?? [];
    const tags = values.tags ?? [];

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
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                        value={values.slug}
                        onChange={(e) => setFieldValue('slug', e.target.value)}
                        placeholder="a-perfect-weekend-in-sylhet"
                        aria-label="Article slug"
                    />
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
                        <SelectTrigger>
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
                </div>
                <div>
                    <label className="text-sm font-medium">Article type</label>
                    <Select
                        value={values.articleType}
                        onValueChange={(v) => setFieldValue('articleType', v as ARTICLE_TYPE)}
                    >
                        <SelectTrigger>
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
                </div>
            </div>

            {/* Categories */}
            <div>
                <label className="text-sm font-medium">Categories</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    {Object.values(TRAVEL_CATEGORY).map((cat) => {
                        const active = categories.includes(cat);
                        return (
                            <Badge
                                key={cat}
                                variant={active ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => {
                                    const next = active
                                        ? categories.filter((c): c is TRAVEL_CATEGORY => typeof c === 'string' && c !== cat)
                                        : [...categories, cat];
                                    setFieldValue('categories', next);
                                }}
                            >
                                {cat}
                            </Badge>
                        );
                    })}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    Select at least one category.
                </p>
            </div>

            {/* Tags */}
            <div>
                <label className="text-sm font-medium">Tags</label>
                <TagInput
                    value={tags?.filter((tag): tag is string => typeof tag === 'string')}
                    onChange={(next) => setFieldValue('tags', next)}
                />
            </div>

            {/* Summary */}
            <div>
                <label className="text-sm font-medium">Summary</label>
                <Textarea
                    value={values.summary}
                    onChange={(e) => setFieldValue('summary', e.target.value)}
                    placeholder="Short summary under 300 characters"
                    aria-label="Article summary"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {values.summary?.length ?? 0}/300
                </p>
            </div>

            {/* Hero Image */}
            <div>
                <ImageUploader
                    label="Hero image"
                    value={values.heroImage}
                    onChange={(v) => setFieldValue('heroImage', v)}
                />
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
                    />
                </div>
            </div>
        </div>
    );
}
