// components/forms/article/create/ContentSection.tsx
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
    FiCoffee,
    FiCalendar,
    FiPackage,
    FiX,
    FiEdit3,
    FiNavigation,
    FiHome,
} from 'react-icons/fi';
import Image from 'next/image';
import { ComboBox } from '@/components/ui/combobox';
import {
    ARTICLE_RICH_TEXT_BLOCK_TYPE,
    ArticleRichTextBlockType,
    FOOD_RECO_SPICE_TYPE,
    FoodRecoSpiceType,
} from '@/constants/article.const';
import { DIVISION, Division, District } from '@/constants/tour.const';
import { fileToBase64 } from '@/utils/helpers/file-conversion';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { DestinationBlock } from '@/types/article/article.types';
import { MapPickerDialog } from '@/components/setting/footer/MapPickerDialog';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
import { getDistrictsByDivision } from '@/utils/helpers/conversions.tour';

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

const getDistrictOptionsForDivision = (division: Division) => {
  const districts = getDistrictsByDivision(division);
  return districts.map(district => ({
    value: district,
    label: district
  }));
};

type Values = Pick<CreateArticleFormValues, 'destinations'>;

export function ContentSection() {
    const { values, setFieldValue } = useFormikContext<Values>();
    const [highlightInputs, setHighlightInputs] = useState<{ [key: number]: string }>({});
    const [localTipInputs, setLocalTipInputs] = useState<{ [key: number]: string }>({});
    const [transportInputs, setTransportInputs] = useState<{ [key: number]: string }>({});
    const [accommodationInputs, setAccommodationInputs] = useState<{ [key: number]: string }>({});
    const [mapPickerOpenFor, setMapPickerOpenFor] = useState<number | null>(null);

    // Convert enums to ComboBox options
    const divisionOptions = Object.values(DIVISION).map(value => ({
        label: value,
        value: value as Division
    }));

    const spiceLevelOptions = Object.values(FOOD_RECO_SPICE_TYPE).map(value => ({
        label: value,
        value: value as FoodRecoSpiceType
    }));

    const richTextBlockOptions = Object.values(ARTICLE_RICH_TEXT_BLOCK_TYPE).map(value => ({
        label: value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1),
        value: value as ArticleRichTextBlockType
    }));

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

    const addLocalTip = (idx: number) => {
        const val = localTipInputs[idx]?.trim();
        if (val) {
            const current = values.destinations[idx].localTips ?? [];
            if (!current.includes(val)) {
                setFieldValue(`destinations.${idx}.localTips`, [...current, val]);
            }
            setLocalTipInputs({ ...localTipInputs, [idx]: '' });
        }
    };

    const addTransportOption = (idx: number) => {
        const val = transportInputs[idx]?.trim();
        if (val) {
            const current = values.destinations[idx].transportOptions ?? [];
            if (!current.includes(val)) {
                setFieldValue(`destinations.${idx}.transportOptions`, [...current, val]);
            }
            setTransportInputs({ ...transportInputs, [idx]: '' });
        }
    };

    const addAccommodationTip = (idx: number) => {
        const val = accommodationInputs[idx]?.trim();
        if (val) {
            const current = values.destinations[idx].accommodationTips ?? [];
            if (!current.includes(val)) {
                setFieldValue(`destinations.${idx}.accommodationTips`, [...current, val]);
            }
            setAccommodationInputs({ ...accommodationInputs, [idx]: '' });
        }
    };

    const removeHighlight = (destIdx: number, highlightIdx: number) => {
        const current = values.destinations[destIdx].highlights ?? [];
        setFieldValue(`destinations.${destIdx}.highlights`, current.filter((_, i) => i !== highlightIdx));
    };

    const removeLocalTip = (destIdx: number, tipIdx: number) => {
        const current = values.destinations[destIdx].localTips ?? [];
        setFieldValue(`destinations.${destIdx}.localTips`, current.filter((_, i) => i !== tipIdx));
    };

    const removeTransportOption = (destIdx: number, transportIdx: number) => {
        const current = values.destinations[destIdx].transportOptions ?? [];
        setFieldValue(`destinations.${destIdx}.transportOptions`, current.filter((_, i) => i !== transportIdx));
    };

    const removeAccommodationTip = (destIdx: number, tipIdx: number) => {
        const current = values.destinations[destIdx].accommodationTips ?? [];
        setFieldValue(`destinations.${destIdx}.accommodationTips`, current.filter((_, i) => i !== tipIdx));
    };

    const handleImageUpload = async (destIdx: number, file: File) => {
        try {
            const base64 = await fileToBase64(file, {
                compressImages: true,
                maxWidth: 1200,
                quality: 0.8
            });

            setFieldValue(`destinations.${destIdx}.imageAsset`, {
                title: file.name,
                assetId: `temp-${Date.now()}`,
                url: base64
            });
        } catch (error: unknown) {
            console.log(error);
            showToast.warning('Image upload failed', extractErrorMessage(error))
        }
    };

    const removeImage = (destIdx: number) => {
        setFieldValue(`destinations.${destIdx}.imageAsset`, undefined);
    };

    const addFoodRecommendation = (idx: number) => {
        const current = values.destinations[idx].foodRecommendations ?? [];
        setFieldValue(`destinations.${idx}.foodRecommendations`, [
            ...current,
            {
                dishName: '',
                description: '',
                bestPlaceToTry: '',
                approximatePrice: '',
                spiceLevel: undefined,
            }
        ]);
    };

    const removeFoodRecommendation = (destIdx: number, foodIdx: number) => {
        const current = values.destinations[destIdx].foodRecommendations ?? [];
        setFieldValue(`destinations.${destIdx}.foodRecommendations`, current.filter((_, i) => i !== foodIdx));
    };

    const addLocalFestival = (idx: number) => {
        const current = values.destinations[idx].localFestivals ?? [];
        setFieldValue(`destinations.${idx}.localFestivals`, [
            ...current,
            {
                name: '',
                description: '',
                timeOfYear: '',
                location: '',
                significance: '',
            }
        ]);
    };

    const removeLocalFestival = (destIdx: number, festivalIdx: number) => {
        const current = values.destinations[destIdx].localFestivals ?? [];
        setFieldValue(`destinations.${destIdx}.localFestivals`, current.filter((_, i) => i !== festivalIdx));
    };

    const addRichTextBlock = (destIdx: number) => {
        const current = values.destinations[destIdx].content ?? [];
        setFieldValue(`destinations.${destIdx}.content`, [
            ...current,
            {
                type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
                text: '',
            }
        ]);
    };

    const removeRichTextBlock = (destIdx: number, blockIdx: number) => {
        const current = values.destinations[destIdx].content ?? [];
        setFieldValue(`destinations.${destIdx}.content`, current.filter((_, i) => i !== blockIdx));
    };

    // Add handler functions for the map picker
    const openMapPicker = (index: number) => {
        setMapPickerOpenFor(index);
    };

    const closeMapPicker = () => {
        setMapPickerOpenFor(null);
    };

    const handleMapSelect = (lat: number, lng: number, index: number) => {
        setFieldValue(`destinations.${index}.coordinates.lat`, lat);
        setFieldValue(`destinations.${index}.coordinates.lng`, lng);
    };

    const handleDivisionChange = (destIndex: number, newDivision: Division) => {

        setFieldValue(`destinations.${destIndex}.division`, newDivision)

        // Get districts for the new division
        const districtsForDivision = getDistrictsByDivision(newDivision);

        // Check if current district belongs to the new division
        const isCurrentDistrictValid = districtsForDivision.includes(values.destinations[destIndex].district as District);

        // Update with new division and possibly reset district
        setFieldValue(`destinations.${destIndex}.district`, isCurrentDistrictValid ? values.destinations[destIndex].district : (districtsForDivision[0] || ''))
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
                                        division: '' as Division,
                                        district: '' as District,
                                        area: '',
                                        description: '',
                                        content: [],
                                        highlights: [],
                                        foodRecommendations: [],
                                        localFestivals: [],
                                        localTips: [],
                                        transportOptions: [],
                                        accommodationTips: [],
                                        coordinates: { lat: 0, lng: 0 },
                                    } as DestinationBlock)
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
                                                                {dest.area || dest.district || `Destination ${idx + 1}`}
                                                            </h3>
                                                            {dest.division && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {dest.division}, {dest.district}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {dest.highlights?.length || 0} highlights
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {dest.foodRecommendations?.length || 0} foods
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {dest.localFestivals?.length || 0} festivals
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
                                                                        <FiGlobe className="h-3 w-3 text-gray-500" />
                                                                        Division
                                                                    </label>
                                                                    <ComboBox
                                                                        options={divisionOptions}
                                                                        value={dest.division}
                                                                        // onChange={(value) => setFieldValue(`destinations.${idx}.division`, value)}
                                                                        onChange={(value) => handleDivisionChange(idx, value as Division)}
                                                                        placeholder="Select division"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium flex items-center gap-1.5">
                                                                        <FiMap className="h-3 w-3 text-gray-500" />
                                                                        District
                                                                    </label>
                                                                    <ComboBox
                                                                        options={getDistrictOptionsForDivision(dest.division as Division)}
                                                                        value={dest.district}
                                                                        onChange={(value) => setFieldValue(`destinations.${idx}.district`, value)}
                                                                        placeholder="Select district"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium flex items-center gap-1.5">
                                                                        <FiMapPin className="h-3 w-3 text-gray-500" />
                                                                        Area
                                                                    </label>
                                                                    <Input
                                                                        value={dest.area ?? ''}
                                                                        onChange={(e) => setFieldValue(`destinations.${idx}.area`, e.target.value)}
                                                                        placeholder="e.g., Cox's Bazar Beach"
                                                                        className="h-10"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium">Latitude</label>
                                                                    <Input
                                                                        type="number"
                                                                        step="any"
                                                                        value={dest.coordinates?.lat || ''}
                                                                        onChange={(e) => setFieldValue(`destinations.${idx}.coordinates.lat`, parseFloat(e.target.value))}
                                                                        placeholder="23.8103"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium">Longitude</label>
                                                                    <Input
                                                                        type="number"
                                                                        step="any"
                                                                        value={dest.coordinates?.lng || ''}
                                                                        onChange={(e) => setFieldValue(`destinations.${idx}.coordinates.lng`, parseFloat(e.target.value))}
                                                                        placeholder="90.4125"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-xs font-medium">Map Picker</label>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        onClick={() => openMapPicker(idx)}
                                                                        className="w-full h-10 gap-2"
                                                                    >
                                                                        <FiMapPin className="h-4 w-4" />
                                                                        Pick on Map
                                                                    </Button>
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

                                                        {/* Rich Text Content */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                                        <FiAlignLeft className="h-4 w-4 text-indigo-600" />
                                                                    </div>
                                                                    <h4 className="font-semibold text-sm">Content</h4>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => addRichTextBlock(idx)}
                                                                    className="gap-2"
                                                                >
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add Content Block
                                                                </Button>
                                                            </div>

                                                            {(dest.content?.length ?? 0) === 0 ? (
                                                                <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                                                                    No content blocks added yet
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {dest.content?.map((block, blockIdx) => (
                                                                        <div
                                                                            key={blockIdx}
                                                                            className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-3"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-semibold text-indigo-700">
                                                                                    Content Block {blockIdx + 1}
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => removeRichTextBlock(idx, blockIdx)}
                                                                                    className="h-7 w-7 p-0 text-destructive hover:bg-red-100"
                                                                                >
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <ComboBox
                                                                                options={richTextBlockOptions}
                                                                                value={block.type}
                                                                                onChange={(value) => setFieldValue(`destinations.${idx}.content.${blockIdx}.type`, value)}
                                                                                placeholder="Select block type"
                                                                            />
                                                                            {block.type === 'link' ? (
                                                                                <Input
                                                                                    value={block.href || ''}
                                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.content.${blockIdx}.href`, e.target.value)}
                                                                                    placeholder="URL"
                                                                                    className="h-9 bg-white"
                                                                                />
                                                                            ) : (
                                                                                <Textarea
                                                                                    value={block.text || ''}
                                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.content.${blockIdx}.text`, e.target.value)}
                                                                                    placeholder="Content text"
                                                                                    rows={2}
                                                                                    className="resize-none bg-white"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
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

                                                        {/* Image */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                                                                    <FiImage className="h-4 w-4 text-green-600" />
                                                                </div>
                                                                <h4 className="font-semibold text-sm">Destination Image</h4>
                                                            </div>

                                                            {dest.imageAsset?.url ? (
                                                                <div className="relative group aspect-video rounded-lg overflow-hidden border-2 border-gray-200">
                                                                    <Image
                                                                        src={dest.imageAsset.url}
                                                                        alt={dest.imageAsset.title}
                                                                        fill
                                                                        className="object-cover"
                                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                                        unoptimized
                                                                        onError={(e) => {
                                                                            const target = e.currentTarget as HTMLImageElement;
                                                                            target.src = '/fallback-image.jpg';
                                                                        }}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => removeImage(idx)}
                                                                            className="gap-2"
                                                                        >
                                                                            <FiTrash2 className="h-3 w-3" />
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                handleImageUpload(idx, file);
                                                                            }
                                                                        }}
                                                                        className="hidden"
                                                                        id={`image-upload-${idx}`}
                                                                    />
                                                                    <label
                                                                        htmlFor={`image-upload-${idx}`}
                                                                        className="cursor-pointer flex flex-col items-center gap-2"
                                                                    >
                                                                        <FiImage className="h-8 w-8 text-gray-400" />
                                                                        <span className="text-sm text-gray-600">
                                                                            Click to upload destination image
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            PNG, JPG, GIF up to 5MB
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator />

                                                        {/* Food Recommendations */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                                                                        <FiCoffee className="h-4 w-4 text-red-600" />
                                                                    </div>
                                                                    <h4 className="font-semibold text-sm">Food Recommendations</h4>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => addFoodRecommendation(idx)}
                                                                    className="gap-2"
                                                                >
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add
                                                                </Button>
                                                            </div>

                                                            {(dest.foodRecommendations?.length ?? 0) === 0 ? (
                                                                <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                                                                    No food recommendations added yet
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {dest.foodRecommendations?.map((food, foodIdx) => (
                                                                        <div
                                                                            key={foodIdx}
                                                                            className="p-4 bg-red-50/50 rounded-lg border border-red-200 space-y-3"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-semibold text-red-700">
                                                                                    Food {foodIdx + 1}
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => removeFoodRecommendation(idx, foodIdx)}
                                                                                    className="h-7 w-7 p-0 text-destructive hover:bg-red-100"
                                                                                >
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                <Input
                                                                                    value={food.dishName}
                                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${foodIdx}.dishName`, e.target.value)}
                                                                                    placeholder="Dish name"
                                                                                    className="h-9 bg-white"
                                                                                />
                                                                                <ComboBox
                                                                                    options={spiceLevelOptions}
                                                                                    value={food.spiceLevel ?? FOOD_RECO_SPICE_TYPE.MEDIUM}
                                                                                    onChange={(value) => setFieldValue(`destinations.${idx}.foodRecommendations.${foodIdx}.spiceLevel`, value)}
                                                                                    placeholder="Spice level"
                                                                                />
                                                                            </div>
                                                                            <Textarea
                                                                                value={food.description}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${foodIdx}.description`, e.target.value)}
                                                                                placeholder="Description"
                                                                                rows={2}
                                                                                className="resize-none bg-white"
                                                                            />
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                <Input
                                                                                    value={food.bestPlaceToTry || ''}
                                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${foodIdx}.bestPlaceToTry`, e.target.value)}
                                                                                    placeholder="Best place to try"
                                                                                    className="h-9 bg-white"
                                                                                />
                                                                                <Input
                                                                                    value={food.approximatePrice || ''}
                                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${foodIdx}.approximatePrice`, e.target.value)}
                                                                                    placeholder="Approximate price"
                                                                                    className="h-9 bg-white"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator />

                                                        {/* Local Festivals */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                                                        <FiCalendar className="h-4 w-4 text-orange-600" />
                                                                    </div>
                                                                    <h4 className="font-semibold text-sm">Local Festivals</h4>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => addLocalFestival(idx)}
                                                                    className="gap-2"
                                                                >
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add
                                                                </Button>
                                                            </div>

                                                            {(dest.localFestivals?.length ?? 0) === 0 ? (
                                                                <div className="text-center py-8 text-sm text-muted-foreground bg-gray-50 rounded-lg border-2 border-dashed">
                                                                    No festivals added yet
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {dest.localFestivals?.map((festival, festivalIdx) => (
                                                                        <div
                                                                            key={festivalIdx}
                                                                            className="p-4 bg-orange-50/50 rounded-lg border border-orange-200 space-y-3"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-semibold text-orange-700">
                                                                                    Festival {festivalIdx + 1}
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() => removeLocalFestival(idx, festivalIdx)}
                                                                                    className="h-7 w-7 p-0 text-destructive hover:bg-red-100"
                                                                                >
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <Input
                                                                                value={festival.name}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${festivalIdx}.name`, e.target.value)}
                                                                                placeholder="Festival name"
                                                                                className="h-9 bg-white"
                                                                            />
                                                                            <Textarea
                                                                                value={festival.description}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${festivalIdx}.description`, e.target.value)}
                                                                                placeholder="Description"
                                                                                rows={2}
                                                                                className="resize-none bg-white"
                                                                            />
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                                <Input
                                                                                    value={festival.timeOfYear}
                                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${festivalIdx}.timeOfYear`, e.target.value)}
                                                                                    placeholder="Time of year"
                                                                                    className="h-9 bg-white"
                                                                                />
                                                                                <Input
                                                                                    value={festival.location}
                                                                                    onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${festivalIdx}.location`, e.target.value)}
                                                                                    placeholder="Location"
                                                                                    className="h-9 bg-white"
                                                                                />
                                                                            </div>
                                                                            <Input
                                                                                value={festival.significance || ''}
                                                                                onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${festivalIdx}.significance`, e.target.value)}
                                                                                placeholder="Significance (optional)"
                                                                                className="h-9 bg-white"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator />

                                                        {/* Local Tips */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center">
                                                                    <FiPackage className="h-4 w-4 text-teal-600" />
                                                                </div>
                                                                <h4 className="font-semibold text-sm">Local Tips</h4>
                                                            </div>

                                                            {(dest.localTips?.length ?? 0) > 0 && (
                                                                <div className="flex flex-wrap gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                                                                    <AnimatePresence>
                                                                        {dest.localTips?.map((tip, tipIdx) => (
                                                                            <motion.div
                                                                                key={tipIdx}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                            >
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="gap-2 bg-white hover:bg-red-50 cursor-pointer group"
                                                                                    onClick={() => removeLocalTip(idx, tipIdx)}
                                                                                >
                                                                                    {tip}
                                                                                    <FiX className="h-3 w-3 text-gray-400 group-hover:text-red-600" />
                                                                                </Badge>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={localTipInputs[idx] ?? ''}
                                                                    onChange={(e) => setLocalTipInputs({ ...localTipInputs, [idx]: e.target.value })}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addLocalTip(idx);
                                                                        }
                                                                    }}
                                                                    placeholder="Add a local tip..."
                                                                    className="h-10"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => addLocalTip(idx)}
                                                                    disabled={!localTipInputs[idx]?.trim()}
                                                                    className="gap-2 bg-teal-600 hover:bg-teal-700"
                                                                >
                                                                    <FiPlus className="h-4 w-4" />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* Transport Options */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                    <FiNavigation className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <h4 className="font-semibold text-sm">Transport Options</h4>
                                                            </div>

                                                            {(dest.transportOptions?.length ?? 0) > 0 && (
                                                                <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                                    <AnimatePresence>
                                                                        {dest.transportOptions?.map((transport, transportIdx) => (
                                                                            <motion.div
                                                                                key={transportIdx}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                            >
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="gap-2 bg-white hover:bg-red-50 cursor-pointer group"
                                                                                    onClick={() => removeTransportOption(idx, transportIdx)}
                                                                                >
                                                                                    {transport}
                                                                                    <FiX className="h-3 w-3 text-gray-400 group-hover:text-red-600" />
                                                                                </Badge>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={transportInputs[idx] ?? ''}
                                                                    onChange={(e) => setTransportInputs({ ...transportInputs, [idx]: e.target.value })}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addTransportOption(idx);
                                                                        }
                                                                    }}
                                                                    placeholder="Add a transport option..."
                                                                    className="h-10"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => addTransportOption(idx)}
                                                                    disabled={!transportInputs[idx]?.trim()}
                                                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <FiPlus className="h-4 w-4" />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        {/* Accommodation Tips */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                                                    <FiHome className="h-4 w-4 text-purple-600" />
                                                                </div>
                                                                <h4 className="font-semibold text-sm">Accommodation Tips</h4>
                                                            </div>

                                                            {(dest.accommodationTips?.length ?? 0) > 0 && (
                                                                <div className="flex flex-wrap gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                                    <AnimatePresence>
                                                                        {dest.accommodationTips?.map((tip, tipIdx) => (
                                                                            <motion.div
                                                                                key={tipIdx}
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                            >
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="gap-2 bg-white hover:bg-red-50 cursor-pointer group"
                                                                                    onClick={() => removeAccommodationTip(idx, tipIdx)}
                                                                                >
                                                                                    {tip}
                                                                                    <FiX className="h-3 w-3 text-gray-400 group-hover:text-red-600" />
                                                                                </Badge>
                                                                            </motion.div>
                                                                        ))}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}

                                                            <div className="flex gap-2">
                                                                <Input
                                                                    value={accommodationInputs[idx] ?? ''}
                                                                    onChange={(e) => setAccommodationInputs({ ...accommodationInputs, [idx]: e.target.value })}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            addAccommodationTip(idx);
                                                                        }
                                                                    }}
                                                                    placeholder="Add an accommodation tip..."
                                                                    className="h-10"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => addAccommodationTip(idx)}
                                                                    disabled={!accommodationInputs[idx]?.trim()}
                                                                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                                                                >
                                                                    <FiPlus className="h-4 w-4" />
                                                                    Add
                                                                </Button>
                                                            </div>
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
            {/* Map Picker Dialog */}
            {mapPickerOpenFor !== null && (
                <MapPickerDialog
                    open={true}
                    onClose={closeMapPicker}
                    onSelect={(lat, lng) => handleMapSelect(lat, lng, mapPickerOpenFor)}
                    initialPosition={
                        values.destinations[mapPickerOpenFor]?.coordinates?.lat &&
                            values.destinations[mapPickerOpenFor]?.coordinates?.lng
                            ? [
                                values.destinations[mapPickerOpenFor].coordinates.lat,
                                values.destinations[mapPickerOpenFor].coordinates.lng
                            ]
                            : undefined
                    }
                />
            )}
        </motion.div>
    );
}