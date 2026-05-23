'use client';

import React, { useState } from 'react';
import { useFormikContext, FieldArray } from 'formik';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
    FiMapPin, FiGlobe, FiMap, FiAlignLeft, FiImage, FiStar, FiPlus, FiTrash2,
    FiCoffee, FiCalendar, FiPackage, FiX, FiEdit3, FiNavigation, FiHome,
} from 'react-icons/fi';
import Image from 'next/image';
import { ComboBox } from '@/components/ui/combobox';
import { ARTICLE_RICH_TEXT_BLOCK_TYPE, ArticleRichTextBlockType, FOOD_RECO_SPICE_TYPE, FoodRecoSpiceType } from '@/constants/article.const';
import { DIVISION, Division, District } from '@/constants/tour.const';
import { fileToBase64 } from '@/utils/helpers/file-conversion';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { DestinationBlock } from '@/types/article/article.types';
import { MapPickerDialog } from '@/components/setting/footer/MapPickerDialog';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
import { getDistrictsByDivision } from '@/utils/helpers/conversions.tour';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';

const NEU_SURFACE_INSET =
    'bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-xl';

const NEU_INPUT =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_BTN_PRIMARY =
    'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide text-sm ' +
    'shadow-[0_4px_12px_rgba(0,0,0,0.06)] ' +
    'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] ' +
    'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
    'transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed';

const NEU_BTN_GHOST =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-sm ' +
    'shadow-[0_4px_12px_rgba(0,0,0,0.06)] ' +
    'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ' +
    'transition-all duration-200 flex items-center gap-2';

const NEU_BTN_DANGER =
    'rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] text-sm ' +
    'shadow-[0_4px_12px_rgba(0,0,0,0.06)] ' +
    'hover:bg-[#FF2157]/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ' +
    'transition-all duration-200 flex items-center gap-2';

const NEU_BADGE =
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-jetbrains-mono)] ' +
    'bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] cursor-pointer ' +
    'hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] transition-all duration-200 group';

const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';

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
const listItemVariants: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
    exit: { opacity: 0, x: 16, transition: { duration: 0.2 } },
};

// ── Helpers ───────────────────────────────────────────────────
const getDistrictOptionsForDivision = (division: Division) =>
    getDistrictsByDivision(division).map((d) => ({ value: d, label: d }));

// ── Sub-components ────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={NEU_ICON_WELL_PRIMARY}>
                <Icon className="h-4 w-4 text-[#006666]" />
            </div>
            <h4 className={`${NEU_HEADING} text-sm`}>{label}</h4>
        </div>
    );
}

function TagBadgeList({ items, onRemove }: { items: string[]; onRemove: (i: number) => void }) {
    if (!items.length) return null;
    return (
        <div className={`${NEU_SURFACE_INSET} flex flex-wrap gap-2 p-3`}>
            <AnimatePresence>
                {items.map((item, i) => (
                    <motion.button
                        key={i}
                        type="button"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className={NEU_BADGE}
                        onClick={() => onRemove(i)}
                    >
                        {item}
                        <FiX className="h-3 w-3 text-[#1E2938]/30 group-hover:text-[#FF2157]" />
                    </motion.button>
                ))}
            </AnimatePresence>
        </div>
    );
}

function TagInput({
    value, onChange, onKeyDown, onAdd, placeholder, disabled,
}: {
    value: string; onChange: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onAdd: () => void; placeholder: string; disabled?: boolean;
}) {
    return (
        <div className="flex gap-2">
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={`flex-1 ${NEU_INPUT} h-10`}
            />
            <button type="button" onClick={onAdd} disabled={disabled || !value.trim()} className={`${NEU_BTN_PRIMARY} px-3 py-2`}>
                <FiPlus className="h-4 w-4" />
                Add
            </button>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────
type Values = Pick<CreateArticleFormValues, 'destinations'>;

export function ContentSection() {
    const { values, setFieldValue } = useFormikContext<Values>();
    const [highlightInputs, setHighlightInputs] = useState<{ [k: number]: string }>({});
    const [localTipInputs, setLocalTipInputs] = useState<{ [k: number]: string }>({});
    const [transportInputs, setTransportInputs] = useState<{ [k: number]: string }>({});
    const [accommodationInputs, setAccommodationInputs] = useState<{ [k: number]: string }>({});
    const [mapPickerOpenFor, setMapPickerOpenFor] = useState<number | null>(null);

    const divisionOptions = Object.values(DIVISION).map((v) => ({ label: v, value: v as Division }));
    const spiceLevelOptions = Object.values(FOOD_RECO_SPICE_TYPE).map((v) => ({ label: v, value: v as FoodRecoSpiceType }));
    const richTextBlockOptions = Object.values(ARTICLE_RICH_TEXT_BLOCK_TYPE).map((v) => ({
        label: v.replace('_', ' ').charAt(0).toUpperCase() + v.replace('_', ' ').slice(1),
        value: v as ArticleRichTextBlockType,
    }));

    const addHighlight = (idx: number) => {
        const val = highlightInputs[idx]?.trim();
        if (!val) return;
        const current = values.destinations[idx].highlights ?? [];
        if (!current.includes(val)) setFieldValue(`destinations.${idx}.highlights`, [...current, val]);
        setHighlightInputs({ ...highlightInputs, [idx]: '' });
    };
    const addLocalTip = (idx: number) => {
        const val = localTipInputs[idx]?.trim();
        if (!val) return;
        const current = values.destinations[idx].localTips ?? [];
        if (!current.includes(val)) setFieldValue(`destinations.${idx}.localTips`, [...current, val]);
        setLocalTipInputs({ ...localTipInputs, [idx]: '' });
    };
    const addTransportOption = (idx: number) => {
        const val = transportInputs[idx]?.trim();
        if (!val) return;
        const current = values.destinations[idx].transportOptions ?? [];
        if (!current.includes(val)) setFieldValue(`destinations.${idx}.transportOptions`, [...current, val]);
        setTransportInputs({ ...transportInputs, [idx]: '' });
    };
    const addAccommodationTip = (idx: number) => {
        const val = accommodationInputs[idx]?.trim();
        if (!val) return;
        const current = values.destinations[idx].accommodationTips ?? [];
        if (!current.includes(val)) setFieldValue(`destinations.${idx}.accommodationTips`, [...current, val]);
        setAccommodationInputs({ ...accommodationInputs, [idx]: '' });
    };

    const removeHighlight = (di: number, hi: number) => setFieldValue(`destinations.${di}.highlights`, (values.destinations[di].highlights ?? []).filter((_, i) => i !== hi));
    const removeLocalTip = (di: number, ti: number) => setFieldValue(`destinations.${di}.localTips`, (values.destinations[di].localTips ?? []).filter((_, i) => i !== ti));
    const removeTransportOption = (di: number, ti: number) => setFieldValue(`destinations.${di}.transportOptions`, (values.destinations[di].transportOptions ?? []).filter((_, i) => i !== ti));
    const removeAccommodationTip = (di: number, ti: number) => setFieldValue(`destinations.${di}.accommodationTips`, (values.destinations[di].accommodationTips ?? []).filter((_, i) => i !== ti));
    const removeFoodRecommendation = (di: number, fi: number) => setFieldValue(`destinations.${di}.foodRecommendations`, (values.destinations[di].foodRecommendations ?? []).filter((_, i) => i !== fi));
    const removeLocalFestival = (di: number, fi: number) => setFieldValue(`destinations.${di}.localFestivals`, (values.destinations[di].localFestivals ?? []).filter((_, i) => i !== fi));
    const removeRichTextBlock = (di: number, bi: number) => setFieldValue(`destinations.${di}.content`, (values.destinations[di].content ?? []).filter((_, i) => i !== bi));

    const handleImageUpload = async (destIdx: number, file: File) => {
        try {
            const base64 = await fileToBase64(file, { compressImages: true, maxWidth: 1200, quality: 0.8 });
            setFieldValue(`destinations.${destIdx}.imageAsset`, { title: file.name, assetId: `temp-${Date.now()}`, url: base64 });
        } catch (error: unknown) {
            showToast.warning('Image upload failed', extractErrorMessage(error));
        }
    };
    const removeImage = (destIdx: number) => setFieldValue(`destinations.${destIdx}.imageAsset`, undefined);

    const addFoodRecommendation = (idx: number) => {
        const current = values.destinations[idx].foodRecommendations ?? [];
        setFieldValue(`destinations.${idx}.foodRecommendations`, [...current, { dishName: '', description: '', bestPlaceToTry: '', approximatePrice: '', spiceLevel: undefined }]);
    };
    const addLocalFestival = (idx: number) => {
        const current = values.destinations[idx].localFestivals ?? [];
        setFieldValue(`destinations.${idx}.localFestivals`, [...current, { name: '', description: '', timeOfYear: '', location: '', significance: '' }]);
    };
    const addRichTextBlock = (destIdx: number) => {
        const current = values.destinations[destIdx].content ?? [];
        setFieldValue(`destinations.${destIdx}.content`, [...current, { type: ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH, text: '' }]);
    };

    const openMapPicker = (index: number) => setMapPickerOpenFor(index);
    const closeMapPicker = () => setMapPickerOpenFor(null);
    const handleMapSelect = (lat: number, lng: number, index: number) => {
        setFieldValue(`destinations.${index}.coordinates.lat`, lat);
        setFieldValue(`destinations.${index}.coordinates.lng`, lng);
    };
    const handleDivisionChange = (destIndex: number, newDivision: Division) => {
        setFieldValue(`destinations.${destIndex}.division`, newDivision);
        const districts = getDistrictsByDivision(newDivision);
        const isValid = districts.includes(values.destinations[destIndex].district as District);
        setFieldValue(`destinations.${destIndex}.district`, isValid ? values.destinations[destIndex].district : (districts[0] || ''));
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
            {/* Header */}
            <motion.div variants={itemVariants}>
                <div className={`${NEU_CARD} p-6`}>
                    <div className="flex items-start gap-3">
                        <div className={NEU_ICON_WELL_PRIMARY}>
                            <FiMapPin className="h-5 w-5 text-[#006666]" />
                        </div>
                        <div>
                            <h2 className={`${NEU_HEADING} text-xl`}>Destinations & Content</h2>
                            <p className={NEU_MUTED}>Add destinations, attractions, and activities to enrich your article</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <FieldArray name="destinations">
                {(arrayHelpers) => (
                    <motion.div variants={itemVariants} className="space-y-4">
                        {/* Add button */}
                        <div className={`${NEU_CARD} p-4 border-2 border-dashed border-[#1E2938]/10 hover:border-[#006666]/30 transition-colors`}>
                            <button
                                type="button"
                                onClick={() =>
                                    arrayHelpers.push({
                                        division: '' as Division, district: '' as District, area: '', description: '',
                                        content: [], highlights: [], foodRecommendations: [], localFestivals: [],
                                        localTips: [], transportOptions: [], accommodationTips: [], coordinates: { lat: 0, lng: 0 },
                                    } as DestinationBlock)
                                }
                                className={`${NEU_BTN_GHOST} w-full justify-center h-14 text-base`}
                            >
                                <div className="h-9 w-9 rounded-full bg-[#006666]/10 flex items-center justify-center">
                                    <FiPlus className="h-5 w-5 text-[#006666]" />
                                </div>
                                <span className={`${NEU_HEADING} text-sm`}>Add New Destination</span>
                            </button>
                        </div>

                        {/* Empty state */}
                        {(!values.destinations || values.destinations.length === 0) && (
                            <div className={`${NEU_CARD} p-12 text-center`}>
                                <div className="max-w-sm mx-auto space-y-4">
                                    <div className="h-20 w-20 rounded-full bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mx-auto">
                                        <FiMapPin className="h-10 w-10 text-[#1E2938]/25" />
                                    </div>
                                    <h3 className={`${NEU_HEADING} text-base`}>No destinations added yet</h3>
                                    <p className={NEU_MUTED}>Start by adding your first destination to build your travel article</p>
                                </div>
                            </div>
                        )}

                        {/* Destinations list */}
                        <AnimatePresence>
                            {values.destinations?.map((dest, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <div className={`${NEU_CARD} overflow-hidden`}>
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value={`dest-${idx}`} className="border-none">
                                                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/20 transition-colors">
                                                    <div className="flex items-center gap-4 flex-1 text-left">
                                                        <div className="h-11 w-11 rounded-xl bg-[#006666]/10 flex items-center justify-center flex-shrink-0 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                                                            <FiMapPin className="h-5 w-5 text-[#006666]" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`${NEU_HEADING} text-base truncate`}>
                                                                {dest.area || dest.district || `Destination ${idx + 1}`}
                                                            </h3>
                                                            {dest.division && (
                                                                <p className={`${NEU_MUTED} text-xs`}>{dest.division}, {dest.district}</p>
                                                            )}
                                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                {[
                                                                    { label: `${dest.highlights?.length || 0} highlights` },
                                                                    { label: `${dest.foodRecommendations?.length || 0} foods` },
                                                                    { label: `${dest.localFestivals?.length || 0} festivals` },
                                                                ].map((b) => (
                                                                    <span key={b.label} className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40 bg-[#E7E5E4] px-2 py-0.5 rounded-md shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff]">
                                                                        {b.label}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>

                                                <AccordionContent className="px-6 pb-6">
                                                    <div className="space-y-6 pt-2">

                                                        {/* Basic Info */}
                                                        <div className="space-y-4">
                                                            <SectionHeader icon={FiEdit3} label="Basic Information" />

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <label className={`${NEU_LABEL} flex items-center gap-1`}><FiGlobe className="h-3 w-3" /> Division</label>
                                                                    <ComboBox options={divisionOptions} value={dest.division} onChange={(v) => handleDivisionChange(idx, v as Division)} placeholder="Select division" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className={`${NEU_LABEL} flex items-center gap-1`}><FiMap className="h-3 w-3" /> District</label>
                                                                    <ComboBox options={getDistrictOptionsForDivision(dest.division as Division)} value={dest.district} onChange={(v) => setFieldValue(`destinations.${idx}.district`, v)} placeholder="Select district" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className={`${NEU_LABEL} flex items-center gap-1`}><FiMapPin className="h-3 w-3" /> Area</label>
                                                                    <Input value={dest.area ?? ''} onChange={(e) => setFieldValue(`destinations.${idx}.area`, e.target.value)} placeholder="e.g., Cox's Bazar Beach" className={`${NEU_INPUT} h-10`} />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <label className={NEU_LABEL}>Latitude</label>
                                                                    <Input type="number" step="any" value={dest.coordinates?.lat || ''} onChange={(e) => setFieldValue(`destinations.${idx}.coordinates.lat`, parseFloat(e.target.value))} placeholder="23.8103" className={`${NEU_INPUT} h-10`} />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className={NEU_LABEL}>Longitude</label>
                                                                    <Input type="number" step="any" value={dest.coordinates?.lng || ''} onChange={(e) => setFieldValue(`destinations.${idx}.coordinates.lng`, parseFloat(e.target.value))} placeholder="90.4125" className={`${NEU_INPUT} h-10`} />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className={NEU_LABEL}>Map Picker</label>
                                                                    <button type="button" onClick={() => openMapPicker(idx)} className={`${NEU_BTN_GHOST} w-full h-10 px-3 justify-center`}>
                                                                        <FiMapPin className="h-4 w-4" />
                                                                        Pick on Map
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <label className={`${NEU_LABEL} flex items-center gap-1`}><FiAlignLeft className="h-3 w-3" /> Description</label>
                                                                <Textarea value={dest.description} onChange={(e) => setFieldValue(`destinations.${idx}.description`, e.target.value)} placeholder="Describe this destination..." rows={3} className={`${NEU_INPUT} resize-none`} />
                                                            </div>
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Rich Text Content */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <SectionHeader icon={FiAlignLeft} label="Content" />
                                                                <button type="button" onClick={() => addRichTextBlock(idx)} className={`${NEU_BTN_GHOST} px-3 py-1.5 text-xs`}>
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add Block
                                                                </button>
                                                            </div>
                                                            {(dest.content?.length ?? 0) === 0 ? (
                                                                <div className={`${NEU_SURFACE_INSET} text-center py-8`}>
                                                                    <p className={NEU_MUTED}>No content blocks added yet</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-3">
                                                                    {dest.content?.map((block, bi) => (
                                                                        <div key={bi} className={`${NEU_SURFACE_INSET} p-4 space-y-3`}>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className={`${NEU_LABEL}`}>Block {bi + 1}</span>
                                                                                <button type="button" onClick={() => removeRichTextBlock(idx, bi)} className={`${NEU_BTN_DANGER} px-2 py-1 text-xs`}>
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                            <ComboBox options={richTextBlockOptions} value={block.type} onChange={(v) => setFieldValue(`destinations.${idx}.content.${bi}.type`, v)} placeholder="Select block type" />
                                                                            {block.type === 'link' ? (
                                                                                <Input value={block.href || ''} onChange={(e) => setFieldValue(`destinations.${idx}.content.${bi}.href`, e.target.value)} placeholder="URL" className={`${NEU_INPUT} h-9`} />
                                                                            ) : (
                                                                                <Textarea value={block.text || ''} onChange={(e) => setFieldValue(`destinations.${idx}.content.${bi}.text`, e.target.value)} placeholder="Content text" rows={2} className={`${NEU_INPUT} resize-none`} />
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Highlights */}
                                                        <div className="space-y-3">
                                                            <SectionHeader icon={FiStar} label="Highlights" />
                                                            <TagBadgeList
                                                                items={(dest.highlights ?? []).filter((h): h is string => h !== undefined)}
                                                                onRemove={(i) => removeHighlight(idx, i)}
                                                            />
                                                            <TagInput value={highlightInputs[idx] ?? ''} onChange={(v) => setHighlightInputs({ ...highlightInputs, [idx]: v })}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(idx); } }}
                                                                onAdd={() => addHighlight(idx)} placeholder="Add a highlight..." />
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Destination Image */}
                                                        <div className="space-y-3">
                                                            <SectionHeader icon={FiImage} label="Destination Image" />
                                                            {dest.imageAsset?.url ? (
                                                                <div className="relative group aspect-video rounded-xl overflow-hidden shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff]">
                                                                    <Image src={dest.imageAsset.url} alt={dest.imageAsset.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" unoptimized
                                                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/fallback-image.jpg'; }} />
                                                                    <div className="absolute inset-0 bg-[#1E2938]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <button type="button" onClick={() => removeImage(idx)} className={`${NEU_BTN_DANGER} px-3 py-2`}>
                                                                            <FiTrash2 className="h-3.5 w-3.5" />
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className={`${NEU_SURFACE_INSET} p-8 text-center`}>
                                                                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(idx, f); }} className="hidden" id={`image-upload-${idx}`} />
                                                                    <label htmlFor={`image-upload-${idx}`} className="cursor-pointer flex flex-col items-center gap-2">
                                                                        <FiImage className="h-8 w-8 text-[#1E2938]/25" />
                                                                        <span className={NEU_MUTED}>Click to upload destination image</span>
                                                                        <span className={`${NEU_MUTED} text-xs`}>PNG, JPG, GIF up to 5MB</span>
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Food Recommendations */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <SectionHeader icon={FiCoffee} label="Food Recommendations" />
                                                                <button type="button" onClick={() => addFoodRecommendation(idx)} className={`${NEU_BTN_GHOST} px-3 py-1.5 text-xs`}>
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add
                                                                </button>
                                                            </div>
                                                            {(dest.foodRecommendations?.length ?? 0) > 0 && (
                                                                <div className="space-y-3">
                                                                    {dest.foodRecommendations?.map((food, fi) => (
                                                                        <div key={fi} className={`${NEU_SURFACE_INSET} p-4 space-y-3`}>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className={`${NEU_LABEL}`}>Food #{fi + 1}</span>
                                                                                <button type="button" onClick={() => removeFoodRecommendation(idx, fi)} className={`${NEU_BTN_DANGER} px-2 py-1 text-xs`}>
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Dish Name</label>
                                                                                    <Input value={food.dishName} onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${fi}.dishName`, e.target.value)} placeholder="e.g., Hilsa curry" className={`${NEU_INPUT} h-9`} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Spice Level</label>
                                                                                    <ComboBox options={spiceLevelOptions} value={food.spiceLevel ?? ''} onChange={(v) => setFieldValue(`destinations.${idx}.foodRecommendations.${fi}.spiceLevel`, v)} placeholder="Select spice" />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Best Place to Try</label>
                                                                                    <Input value={food.bestPlaceToTry ?? ''} onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${fi}.bestPlaceToTry`, e.target.value)} placeholder="Restaurant name" className={`${NEU_INPUT} h-9`} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Approx. Price</label>
                                                                                    <Input value={food.approximatePrice ?? ''} onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${fi}.approximatePrice`, e.target.value)} placeholder="e.g., ৳200-300" className={`${NEU_INPUT} h-9`} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className={NEU_LABEL}>Description</label>
                                                                                <Textarea value={food.description} onChange={(e) => setFieldValue(`destinations.${idx}.foodRecommendations.${fi}.description`, e.target.value)} placeholder="Describe the dish..." rows={2} className={`${NEU_INPUT} resize-none`} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Local Festivals */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <SectionHeader icon={FiCalendar} label="Local Festivals" />
                                                                <button type="button" onClick={() => addLocalFestival(idx)} className={`${NEU_BTN_GHOST} px-3 py-1.5 text-xs`}>
                                                                    <FiPlus className="h-3 w-3" />
                                                                    Add
                                                                </button>
                                                            </div>
                                                            {(dest.localFestivals?.length ?? 0) > 0 && (
                                                                <div className="space-y-3">
                                                                    {dest.localFestivals?.map((festival, fi) => (
                                                                        <div key={fi} className={`${NEU_SURFACE_INSET} p-4 space-y-3`}>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className={NEU_LABEL}>Festival #{fi + 1}</span>
                                                                                <button type="button" onClick={() => removeLocalFestival(idx, fi)} className={`${NEU_BTN_DANGER} px-2 py-1 text-xs`}>
                                                                                    <FiTrash2 className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Name</label>
                                                                                    <Input value={festival.name} onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${fi}.name`, e.target.value)} placeholder="Festival name" className={`${NEU_INPUT} h-9`} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Time of Year</label>
                                                                                    <Input value={festival.timeOfYear} onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${fi}.timeOfYear`, e.target.value)} placeholder="e.g., January" className={`${NEU_INPUT} h-9`} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Location</label>
                                                                                    <Input value={festival.location} onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${fi}.location`, e.target.value)} placeholder="Where it's held" className={`${NEU_INPUT} h-9`} />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className={NEU_LABEL}>Significance</label>
                                                                                    <Input value={festival.significance ?? ''} onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${fi}.significance`, e.target.value)} placeholder="Cultural significance" className={`${NEU_INPUT} h-9`} />
                                                                                </div>
                                                                            </div>
                                                                            <div className="space-y-1">
                                                                                <label className={NEU_LABEL}>Description</label>
                                                                                <Textarea value={festival.description} onChange={(e) => setFieldValue(`destinations.${idx}.localFestivals.${fi}.description`, e.target.value)} placeholder="Describe the festival..." rows={2} className={`${NEU_INPUT} resize-none`} />
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Local Tips */}
                                                        <div className="space-y-3">
                                                            <SectionHeader icon={FiPackage} label="Local Tips" />
                                                            <TagBadgeList
                                                                items={(dest.localTips ?? []).filter((h): h is string => h !== undefined)}
                                                                onRemove={(i) => removeLocalTip(idx, i)}
                                                            />
                                                            <TagInput value={localTipInputs[idx] ?? ''} onChange={(v) => setLocalTipInputs({ ...localTipInputs, [idx]: v })}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocalTip(idx); } }}
                                                                onAdd={() => addLocalTip(idx)} placeholder="Add a local tip..." />
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Transport Options */}
                                                        <div className="space-y-3">
                                                            <SectionHeader icon={FiNavigation} label="Transport Options" />
                                                            <TagBadgeList
                                                                items={(dest.transportOptions ?? []).filter((h): h is string => h !== undefined)}
                                                                onRemove={(i) => removeTransportOption(idx, i)}
                                                            />
                                                            <TagInput value={transportInputs[idx] ?? ''} onChange={(v) => setTransportInputs({ ...transportInputs, [idx]: v })}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTransportOption(idx); } }}
                                                                onAdd={() => addTransportOption(idx)} placeholder="Add a transport option..." />
                                                        </div>

                                                        <Separator className="bg-[#1E2938]/10" />

                                                        {/* Accommodation Tips */}
                                                        <div className="space-y-3">
                                                            <SectionHeader icon={FiHome} label="Accommodation Tips" />
                                                            <TagBadgeList
                                                                items={(dest.accommodationTips ?? []).filter((h): h is string => h !== undefined)}
                                                                onRemove={(i) => removeAccommodationTip(idx, i)}
                                                            />
                                                            <TagInput value={accommodationInputs[idx] ?? ''} onChange={(v) => setAccommodationInputs({ ...accommodationInputs, [idx]: v })}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAccommodationTip(idx); } }}
                                                                onAdd={() => addAccommodationTip(idx)} placeholder="Add an accommodation tip..." />
                                                        </div>

                                                        {/* Remove destination */}
                                                        <div className="flex justify-end pt-4 border-t border-[#1E2938]/10">
                                                            <button type="button" onClick={() => arrayHelpers.remove(idx)} className={`${NEU_BTN_DANGER} px-4 py-2`}>
                                                                <FiTrash2 className="h-4 w-4" />
                                                                Remove Destination
                                                            </button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
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
                            ? [values.destinations[mapPickerOpenFor].coordinates.lat, values.destinations[mapPickerOpenFor].coordinates.lng]
                            : undefined
                    }
                />
            )}
        </motion.div>
    );
}