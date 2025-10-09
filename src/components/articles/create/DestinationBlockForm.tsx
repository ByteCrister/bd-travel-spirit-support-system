'use client';

import { FormikErrors, FormikTouched } from 'formik';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';
import { ImageUploader } from './ImageUploader';
import { RichTextEditor } from './RichTextEditor';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { DestinationBlock, Activity, RichTextBlock } from '@/types/article.types';
import { Plus, Trash2, MapPin, Image as ImageIcon, Calendar, DollarSign } from 'lucide-react';
import { useState } from 'react';

export type DestinationBlockFormTypes = Omit<
    DestinationBlock,
    'highlights' | 'images' | 'attractions' | 'activities'
> & {
    highlights: (string | undefined)[];
    images: (string | undefined)[];
    attractions: {
        title: string;
        description: string;
        bestFor: string | null;
        insiderTip: string | null;
        address: string | null;
        openingHours: string | null;
        images: (string | undefined)[];
        coordinates: { lat: number; lng: number } | null;
    }[];
    activities: Activity[];
};

export interface DestinationBlockFormProps {
    values: CreateArticleFormValues;
    errors: FormikErrors<CreateArticleFormValues>;
    touched: FormikTouched<CreateArticleFormValues>;
    setFieldValue: <K extends keyof CreateArticleFormValues>(
        field: K,
        value: CreateArticleFormValues[K]
    ) => void;
}

export function DestinationBlockForm({
    values,
    errors,
    touched,
    setFieldValue,
}: DestinationBlockFormProps) {
    const [highlightInputs, setHighlightInputs] = useState<{ [key: number]: string }>({});

    const destinations: DestinationBlockFormTypes[] = (values.destinations ?? []).map((d) => ({
        city: d.city ?? '',
        country: d.country ?? '',
        region: d.region ?? '',
        description: d.description ?? '',
        content: (d.content ?? []).map((c) => ({
            type: c.type ?? 'paragraph',
            text: c.text ?? undefined,
            href: c.href ?? undefined,
        })),
        highlights: (d.highlights ?? []).filter(Boolean),
        images: (d.images ?? []).filter(Boolean),
        attractions: (d.attractions ?? []).map((a) => ({
            title: a.title ?? '',
            description: a.description ?? '',
            bestFor: a.bestFor ?? null,
            insiderTip: a.insiderTip ?? null,
            address: a.address ?? null,
            openingHours: a.openingHours ?? null,
            images: (a.images ?? []).filter(Boolean),
            coordinates: a.coordinates ?? null,
        })),
        activities: (d.activities ?? []).map((a) => ({
            title: a.title ?? '',
            url: a.url ?? undefined,
            provider: a.provider ?? undefined,
            duration: a.duration ?? undefined,
            price: a.price ?? undefined,
            rating: a.rating ?? undefined,
        })),
    }));

    const addDestination = () => {
        const next: DestinationBlockFormTypes[] = [
            ...destinations,
            {
                city: '',
                country: '',
                region: '',
                description: '',
                content: [] as RichTextBlock[],
                highlights: [],
                images: [],
                attractions: [],
                activities: [],
            },
        ];
        setFieldValue('destinations', next);
    };

    const updateAt = (index: number, patch: Partial<DestinationBlockFormTypes>) => {
        const next = [...destinations];
        next[index] = { ...next[index], ...patch };
        setFieldValue('destinations', next);
    };

    const removeDestination = (index: number) => {
        const next = destinations.filter((_, i) => i !== index);
        setFieldValue('destinations', next);
    };

    const addHighlight = (destIndex: number) => {
        const val = highlightInputs[destIndex]?.trim();
        if (val) {
            const currentHighlights = destinations[destIndex].highlights.filter(Boolean);
            if (!currentHighlights.includes(val)) {
                updateAt(destIndex, { highlights: [...currentHighlights, val] });
            }
            setHighlightInputs({ ...highlightInputs, [destIndex]: '' });
        }
    };

    const removeHighlight = (destIndex: number, highlightIndex: number) => {
        const next = destinations[destIndex].highlights.filter((_, i) => i !== highlightIndex);
        updateAt(destIndex, { highlights: next });
    };

    const addAttraction = (destIndex: number) => {
        const newAttraction = {
            title: '',
            description: '',
            bestFor: null,
            insiderTip: null,
            address: null,
            openingHours: null,
            images: [] as (string | undefined)[],
            coordinates: null,
        };
        updateAt(destIndex, {
            attractions: [...destinations[destIndex].attractions, newAttraction]
        });
    };

    const updateAttraction = (
        destIndex: number,
        attractionIndex: number,
        patch: Partial<typeof destinations[0]['attractions'][0]>
    ) => {
        const next = [...destinations[destIndex].attractions];
        next[attractionIndex] = { ...next[attractionIndex], ...patch };
        updateAt(destIndex, { attractions: next });
    };

    const removeAttraction = (destIndex: number, attractionIndex: number) => {
        const next = destinations[destIndex].attractions.filter((_, i) => i !== attractionIndex);
        updateAt(destIndex, { attractions: next });
    };

    const addActivity = (destIndex: number) => {
        const newActivity: Activity = {
            title: '',
            url: '',
            provider: '',
            duration: '',
            price: '',
            rating: undefined,
        };
        updateAt(destIndex, {
            activities: [...destinations[destIndex].activities, newActivity]
        });
    };

    const updateActivity = (
        destIndex: number,
        activityIndex: number,
        patch: Partial<Activity>
    ) => {
        const next = [...destinations[destIndex].activities];
        next[activityIndex] = { ...next[activityIndex], ...patch };
        updateAt(destIndex, { activities: next });
    };

    const removeActivity = (destIndex: number, activityIndex: number) => {
        const next = destinations[destIndex].activities.filter((_, i) => i !== activityIndex);
        updateAt(destIndex, { activities: next });
    };

    const getFieldError = (field: string) => {
        const keys = field.split('.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let error: any = errors;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let touch: any = touched;

        for (const key of keys) {
            error = error?.[key];
            touch = touch?.[key];
        }

        return touch && error ? String(error) : undefined;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Destinations</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add destinations, attractions, and activities to your article
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={addDestination}
                    className="
    inline-flex items-center gap-2
    rounded-md px-4 py-2
    bg-indigo-600 text-white font-medium
    shadow-sm
    hover:bg-indigo-700
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
    transition-colors duration-200
  "
                >
                    <Plus className="h-4 w-4" />
                    Add Destination
                </Button>

            </div>

            {destinations.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        No destinations added yet. Click the button above to add your first destination.
                    </p>
                </div>
            )}

            <Accordion type="single" collapsible className="w-full space-y-3">
                {destinations.map((d, idx) => (
                    <AccordionItem
                        key={idx}
                        value={`dest-${idx}`}
                        className="border rounded-lg px-4 shadow-sm bg-card"
                    >
                        <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3 text-left">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        {d.city && d.country
                                            ? `${d.city}, ${d.country}`
                                            : d.city || d.country || `Destination ${idx + 1}`}
                                    </div>
                                    {d.region && (
                                        <div className="text-xs text-muted-foreground">{d.region}</div>
                                    )}
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="space-y-6 pb-4">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">City *</label>
                                        <Input
                                            placeholder="e.g., Paris"
                                            value={d.city}
                                            onChange={(e) => updateAt(idx, { city: e.target.value })}
                                            className={getFieldError(`destinations.${idx}.city`) ? 'border-destructive' : ''}
                                        />
                                        {getFieldError(`destinations.${idx}.city`) && (
                                            <p className="text-xs text-destructive">
                                                {getFieldError(`destinations.${idx}.city`)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Country *</label>
                                        <Input
                                            placeholder="e.g., France"
                                            value={d.country}
                                            onChange={(e) => updateAt(idx, { country: e.target.value })}
                                            className={getFieldError(`destinations.${idx}.country`) ? 'border-destructive' : ''}
                                        />
                                        {getFieldError(`destinations.${idx}.country`) && (
                                            <p className="text-xs text-destructive">
                                                {getFieldError(`destinations.${idx}.country`)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Region</label>
                                        <Input
                                            placeholder="e.g., Île-de-France"
                                            value={d.region}
                                            onChange={(e) => updateAt(idx, { region: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Description</label>
                                    <Textarea
                                        placeholder="Describe this destination..."
                                        value={d.description}
                                        onChange={(e) => updateAt(idx, { description: e.target.value })}
                                        rows={3}
                                        className={getFieldError(`destinations.${idx}.description`) ? 'border-destructive' : ''}
                                    />
                                    {getFieldError(`destinations.${idx}.description`) && (
                                        <p className="text-xs text-destructive">
                                            {getFieldError(`destinations.${idx}.description`)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Highlights */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Highlights</h4>
                                <div className="flex flex-wrap gap-2">
                                    {d.highlights.filter(Boolean).map((h, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium"
                                        >
                                            {h}
                                            <button
                                                type="button"
                                                onClick={() => removeHighlight(idx, i)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a highlight (e.g., Historic landmarks)"
                                        value={highlightInputs[idx] ?? ''}
                                        onChange={(e) => setHighlightInputs({
                                            ...highlightInputs,
                                            [idx]: e.target.value
                                        })}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addHighlight(idx);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => addHighlight(idx)}
                                        disabled={!highlightInputs[idx]?.trim()}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Structured Content */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm">Detailed Content</h4>
                                <RichTextEditor
                                    value={d.content}
                                    onChange={(next) => updateAt(idx, { content: next })}
                                />
                            </div>

                            {/* Images */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" />
                                    <h4 className="font-medium text-sm">Destination Images</h4>
                                </div>
                                <ImageUploader
                                    label=""
                                    multiple
                                    value={d.images.filter(Boolean) as string[]} // remove undefined
                                    onChange={(images) =>
                                        updateAt(idx, {
                                            images: Array.isArray(images) ? images : [images],
                                        })
                                    }
                                />
                            </div>

                            {/* Attractions */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Attractions</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addAttraction(idx)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Attraction
                                    </Button>
                                </div>

                                {d.attractions.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        No attractions added yet
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {d.attractions.map((a, ai) => (
                                        <div key={ai} className="rounded-lg border bg-muted/50 p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Attraction {ai + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeAttraction(idx, ai)}
                                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <Input
                                                placeholder="Attraction title"
                                                value={a.title}
                                                onChange={(e) => updateAttraction(idx, ai, { title: e.target.value })}
                                            />

                                            <Textarea
                                                placeholder="Description"
                                                value={a.description}
                                                onChange={(e) => updateAttraction(idx, ai, { description: e.target.value })}
                                                rows={2}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <Input
                                                    placeholder="Best for (e.g., Families)"
                                                    value={a.bestFor ?? ''}
                                                    onChange={(e) => updateAttraction(idx, ai, { bestFor: e.target.value || null })}
                                                />
                                                <Input
                                                    placeholder="Address"
                                                    value={a.address ?? ''}
                                                    onChange={(e) => updateAttraction(idx, ai, { address: e.target.value || null })}
                                                />
                                            </div>

                                            <Input
                                                placeholder="Opening hours (e.g., 9 AM - 6 PM)"
                                                value={a.openingHours ?? ''}
                                                onChange={(e) => updateAttraction(idx, ai, { openingHours: e.target.value || null })}
                                            />

                                            <Textarea
                                                placeholder="Insider tip"
                                                value={a.insiderTip ?? ''}
                                                onChange={(e) => updateAttraction(idx, ai, { insiderTip: e.target.value || null })}
                                                rows={2}
                                            />

                                            <ImageUploader
                                                label="Attraction images"
                                                multiple
                                                value={a.images.filter(Boolean) as string[]}
                                                onChange={(images) => updateAttraction(idx, ai, { images: Array.isArray(images) ? images : [images] })}
                                            />

                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activities */}
                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">Activities</h4>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addActivity(idx)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add Activity
                                    </Button>
                                </div>

                                {d.activities.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">
                                        No activities added yet
                                    </p>
                                )}

                                <div className="space-y-3">
                                    {d.activities.map((a, ai) => (
                                        <div key={ai} className="rounded-lg border bg-muted/50 p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Activity {ai + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeActivity(idx, ai)}
                                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <Input
                                                placeholder="Activity title"
                                                value={a.title}
                                                onChange={(e) => updateActivity(idx, ai, { title: e.target.value })}
                                            />

                                            <Input
                                                placeholder="Booking URL"
                                                type="url"
                                                value={a.url ?? ''}
                                                onChange={(e) => updateActivity(idx, ai, { url: e.target.value })}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <Input
                                                    placeholder="Provider"
                                                    value={a.provider ?? ''}
                                                    onChange={(e) => updateActivity(idx, ai, { provider: e.target.value })}
                                                />
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Duration"
                                                        value={a.duration ?? ''}
                                                        onChange={(e) => updateActivity(idx, ai, { duration: e.target.value })}
                                                        className="pl-10"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Price"
                                                        value={a.price ?? ''}
                                                        onChange={(e) => updateActivity(idx, ai, { price: e.target.value })}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <Input
                                                placeholder="Rating (0-5)"
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={a.rating ?? ''}
                                                onChange={(e) => updateActivity(idx, ai, {
                                                    rating: e.target.value ? parseFloat(e.target.value) : undefined
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t">
                                <Button
                                    type="button"
                                    onClick={() => removeDestination(idx)}
                                    className="
    inline-flex items-center gap-2
    rounded-md px-3 py-1.5
    bg-red-600 text-white text-sm font-medium
    shadow-sm
    hover:bg-red-700
    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1
    transition-colors duration-200
  "
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Remove Destination
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="
    inline-flex items-center gap-2
    rounded-lg px-4 py-2
    text-sm font-medium text-slate-700
    bg-white
    shadow-sm
    hover:bg-slate-50 hover:text-slate-900
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
    transition-all duration-200
  "
                                >
                                    Back to Top
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}