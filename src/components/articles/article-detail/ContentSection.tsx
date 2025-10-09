// components/articles/ContentSection.tsx
'use client';

import React, { useState } from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    FiMapPin,
    FiGlobe,
    FiMap,
    FiAlignLeft,
    FiImage,
    FiStar,
    FiPlus,
    FiTrash2,
    FiPackage,
    FiActivity,
    FiX,
    FiEdit3,
} from 'react-icons/fi';
import Image from 'next/image';
import { ImageUploader } from '../create/ImageUploader';

type Destination = {
    city: string;
    country: string;
    region?: string | null;
    description: string;
    content: { type: 'paragraph' | 'link' | 'heading'; text?: string; href?: string }[];
    highlights?: string[];
    attractions?: {
        title: string;
        description: string;
        bestFor?: string;
        insiderTip?: string;
        address?: string;
        openingHours?: string;
        images: string[];
        coordinates?: { lat: number; lng: number } | null;
    }[];
    activities?: {
        title: string;
        url?: string | null;
        provider?: string | null;
        duration?: string | null;
        price?: string | null;
        rating?: number | null;
    }[];
    images?: string[];
};

type Values = { destinations: Destination[] };

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
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

const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: 'spring', stiffness: 120, damping: 20 }
    },
    exit: {
        opacity: 0,
        x: 20,
        transition: { duration: 0.2 }
    }
};

export function ContentSection() {
    const { values, setFieldValue } = useFormikContext<Values>();
    const [highlightInputs, setHighlightInputs] = useState<{ [key: number]: string }>({});

    const addHighlight = (idx: number) => {
        const val = highlightInputs[idx]?.trim();
        if (val) {
            const current = values.destinations[idx].highlights ?? [];
            if (!current.includes(val)) {
                setFieldValue(`destinations.${idx}.highlights`, [...current, val]);
            }
            setHighlightInputs({ ...highlightInputs, [idx]: '' });
        }
    };

    const removeHighlight = (destIdx: number, highlightIdx: number) => {
        const current = values.destinations[destIdx].highlights ?? [];
        setFieldValue(`destinations.${destIdx}.highlights`, current.filter((_, i) => i !== highlightIdx));
    };

    const removeImage = (destIdx: number, imageIdx: number) => {
        const current = values.destinations[destIdx].images ?? [];
        setFieldValue(`destinations.${destIdx}.images`, current.filter((_, i) => i !== imageIdx));
    };

    const addAttraction = (idx: number) => {
        const current = values.destinations[idx].attractions ?? [];
        setFieldValue(`destinations.${idx}.attractions`, [
            ...current,
            {
                title: '',
                description: '',
                bestFor: '',
                insiderTip: '',
                address: '',
                openingHours: '',
                images: [],
                coordinates: null,
            }
        ]);
    };

    const removeAttraction = (destIdx: number, attractionIdx: number) => {
        const current = values.destinations[destIdx].attractions ?? [];
        setFieldValue(`destinations.${destIdx}.attractions`, current.filter((_, i) => i !== attractionIdx));
    };

    const addActivity = (idx: number) => {
        const current = values.destinations[idx].activities ?? [];
        setFieldValue(`destinations.${idx}.activities`, [
            ...current,
            {
                title: '',
                url: null,
                provider: null,
                duration: null,
                price: null,
                rating: null,
            }
        ]);
    };

    const removeActivity = (destIdx: number, activityIdx: number) => {
        const current = values.destinations[destIdx].activities ?? [];
        setFieldValue(`destinations.${destIdx}.activities`, current.filter((_, i) => i !== activityIdx));
    };

    // Helper: update destination partially
    const handleDestinationChange = (index: number, updated: Destination) => {
        const newDestinations = [...values.destinations];
        newDestinations[index] = updated;
        setFieldValue('destinations', newDestinations);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <FiMapPin className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    Destinations & Content
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Add destinations, attractions, and activities to enrich your article
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Main Content */}
            <FieldArray name="destinations">
                {(arrayHelpers) => (
                    <motion.div variants={itemVariants} className="space-y-4">
                        {/* Add Destination Button */}
                        <Card className="p-4 border-dashed border-2 hover:border-purple-400 transition-colors">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                    arrayHelpers.push({
                                        city: '',
                                        country: '',
                                        region: '',
                                        description: '',
                                        content: [],
                                        highlights: [],
                                        attractions: [],
                                        activities: [],
                                        images: [],
                                    })
                                }
                                className="w-full h-16 gap-3 text-base hover:bg-purple-50"
                            >
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FiPlus className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="font-semibold">Add New Destination</span>
                            </Button>
                        </Card>

                        {/* Empty State */}
                        {(!values.destinations || values.destinations.length === 0) && (
                            <Card className="p-12 text-center border-dashed">
                                <div className="max-w-sm mx-auto space-y-4">
                                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                                        <FiMapPin className="h-10 w-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        No destinations added yet
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Start by adding your first destination to build your travel article
                                    </p>
                                </div>
                            </Card>
                        )}

                        {/* Destinations List */}
                        <AnimatePresence>
                            {values.destinations?.map((dest, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <Card className="overflow-hidden shadow-md border-gray-200/60">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value={`dest-${idx}`} className="border-none">
                                                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex items-center gap-4 flex-1 text-left">
                                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                                                            <FiMapPin className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                                                                {dest.city && dest.country
                                                                    ? `${dest.city}, ${dest.country}`
                                                                    : dest.city || dest.country || `Destination ${idx + 1}`}
                                                            </h3>
                                                            {dest.region && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {dest.region}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {(dest.highlights?.length ?? 0)} highlights
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {(dest.attractions?.length ?? 0)} attractions
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {(dest.activities?.length ?? 0)} activities
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>

                                                <AccordionContent className="px-6 pb-6">
                                                    <div className="space-y-6 pt-2">
                                                        {/* Basic Information */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                    <FiEdit3 className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <h4 className="font-semibold text-sm">Basic Information</h4>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium flex items-center gap-1.5">
                                                                        <FiMapPin className="h-3 w-3 text-gray-500" />
                                                                        City
                                                                    </label>
                                                                    <Input
                                                                        value={dest.city}
                                                                        onChange={(e) => setFieldValue(`destinations.${idx}.city`, e.target.value)}
                                                                        placeholder="e.g., Paris"
                                                                        className="h-10"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium flex items-center gap-1.5">
                                                                        <FiGlobe className="h-3 w-3 text-gray-500" />
                                                                        Country
                                                                    </label>
                                                                    <Input
                                                                        value={dest.country}
                                                                        onChange={(e) => setFieldValue(`destinations.${idx}.country`, e.target.value)}
                                                                        placeholder="e.g., France"
                                                                        className="h-10"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium flex items-center gap-1.5">
                                                                        <FiMap className="h-3 w-3 text-gray-500" />
                                                                        Region
                                                                    </label>
                                                                    <Input
                                                                        value={dest.region ?? ''}
                                                                        onChange={(e) => setFieldValue(`destinations.${idx}.region`, e.target.value)}
                                                                        placeholder="e.g., Île-de-France"
                                                                        className="h-10"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <label className="text-xs font-medium flex items-center gap-1.5">
                                                                    <FiAlignLeft className="h-3 w-3 text-gray-500" />
                                                                    Description
                                                                </label>
                                                                <Textarea
                                                                    value={dest.description}
                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.description`, e.target.value)}
                                                                    placeholder="Describe this destination..."
                                                                    rows={3}
                                                                    className="resize-none"
                                                                />
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* Highlights */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                                                                    <FiStar className="h-4 w-4 text-yellow-600" />
                                                                </div>
                                                                <h4 className="font-semibold text-sm">Highlights</h4>
                                                            </div>

                                                            {(dest.highlights?.length ?? 0) > 0 && (
                                                                <div className="flex flex-wrap gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                                    <AnimatePresence>
                                                                        {dest.highlights?.map((h, hi) => (
                                                                            <motion.div
                                                                                key={hi}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                            >
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="gap-2 bg-white hover:bg-red-50 cursor-pointer group"
                                                                                    onClick={() => removeHighlight(idx, hi)}
                                                                                >
                                                                                    {h}
                                                                                    <FiX className="h-3 w-3 text-gray-400 group-hover:text-red-600" />
                                                                                </Badge>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={highlightInputs[idx] ?? ''}
                                                                    onChange={(e) => setHighlightInputs({ ...highlightInputs, [idx]: e.target.value })}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addHighlight(idx);
                                                                        }
                                                                    }}
                                                                    placeholder="Add a highlight..."
                                                                    className="h-10"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => addHighlight(idx)}
                                                                    disabled={!highlightInputs[idx]?.trim()}
                                                                    className="gap-2 bg-yellow-600 hover:bg-yellow-700"
                                                                >
                                                                    <FiPlus className="h-4 w-4" />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* Images */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                                    <FiImage className="h-4 w-4 text-green-600" />
                                                                </div>
                                                                <h4 className="font-semibold text-sm">Images</h4>
                                                            </div>

                                                            {(dest.images?.length ?? 0) > 0 && (
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                    <AnimatePresence>
                                                                        {dest.images?.map((img, imgIdx) => (
                                                                            <motion.div
                                                                                key={imgIdx}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                                className="relative group aspect-video rounded-lg overflow-hidden border-2 border-gray-200"
                                                                            >
                                                                                {img ? (
                                                                                    <Image
                                                                                        src={img}
                                                                                        alt={`Image ${imgIdx + 1}`}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                                                        unoptimized
                                                                                        onError={(e) => {
                                                                                            const target = e.currentTarget as HTMLImageElement;
                                                                                            target.src = '/fallback-image.jpg';
                                                                                        }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
                                                                                        No image
                                                                                    </div>
                                                                                )}
                                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                    <Button
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant="destructive"
                                                                                        onClick={() => removeImage(idx, imgIdx)}
                                                                                        className="gap-2"
                                                                                    >
                                                                                        <FiTrash2 className="h-3 w-3" />
                                                                                        Remove
                                                                                    </Button>
                                                                                </div>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}

                                                            {/* ✅ Replaced URL + Add button with ImageUploader */}
                                                            <ImageUploader
                                                                multiple
                                                                label="Add new images"
                                                                value={dest.images ?? []}
                                                                onChange={(newImages) => {
                                                                    const imagesArray = Array.isArray(newImages) ? newImages : newImages ? [newImages] : [];
                                                                    handleDestinationChange(idx, { ...dest, images: imagesArray });
                                                                }}
                                                            />
                                                        </div>

                                                        <Separator />

                                                        {/* Attractions */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                                                        <FiPackage className="h-4 w-4 text-purple-600" />
                                                                    </div>
                                                                    <h4 className="font-semibold text-sm">Attractions</h4>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => addAttraction(idx)}
                                                                    className="gap-2"
                                                                >
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add
                                                                </Button>
                                                            </div>

                                                            {(dest.attractions?.length ?? 0) === 0 ? (
                                                                <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                                                                    No attractions added yet
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {dest.attractions?.map((attr, attrIdx) => (
                                                                        <div
                                                                            key={attrIdx}
                                                                            className="p-4 bg-purple-50/50 rounded-lg border border-purple-200 space-y-3"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-semibold text-purple-700">
                                                                                    Attraction {attrIdx + 1}
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => removeAttraction(idx, attrIdx)}
                                                                                    className="h-7 w-7 p-0 text-destructive hover:bg-red-100"
                                                                                >
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <Input
                                                                                value={attr.title}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.attractions.${attrIdx}.title`, e.target.value)}
                                                                                placeholder="Attraction title"
                                                                                className="h-9 bg-white"
                                                                            />
                                                                            <Textarea
                                                                                value={attr.description}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.attractions.${attrIdx}.description`, e.target.value)}
                                                                                placeholder="Description"
                                                                                rows={2}
                                                                                className="resize-none bg-white"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator />

                                                        {/* Activities */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                                        <FiActivity className="h-4 w-4 text-orange-600" />
                                                                    </div>
                                                                    <h4 className="font-semibold text-sm">Activities</h4>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => addActivity(idx)}
                                                                    className="gap-2"
                                                                >
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add
                                                                </Button>
                                                            </div>

                                                            {(dest.activities?.length ?? 0) === 0 ? (
                                                                <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                                                                    No activities added yet
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {dest.activities?.map((act, actIdx) => (
                                                                        <div
                                                                            key={actIdx}
                                                                            className="p-4 bg-orange-50/50 rounded-lg border border-orange-200 space-y-3"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-semibold text-orange-700">
                                                                                    Activity {actIdx + 1}
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => removeActivity(idx, actIdx)}
                                                                                    className="h-7 w-7 p-0 text-destructive hover:bg-red-100"
                                                                                >
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <Input
                                                                                value={act.title}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.activities.${actIdx}.title`, e.target.value)}
                                                                                placeholder="Activity title"
                                                                                className="h-9 bg-white"
                                                                            />
                                                                            <Input
                                                                                value={act.url ?? ''}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.activities.${actIdx}.url`, e.target.value || null)}
                                                                                placeholder="Booking URL"
                                                                                className="h-9 bg-white"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Delete Destination */}
                                                        <div className="flex justify-end pt-4 border-t">
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                onClick={() => arrayHelpers.remove(idx)}
                                                                className="gap-2"
                                                            >
                                                                <FiTrash2 className="h-4 w-4" />
                                                                Remove Destination
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </FieldArray>
        </motion.div>
    );
}