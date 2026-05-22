'use client';

import { FormikErrors, FormikTouched } from 'formik';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { RichTextEditor } from './RichTextEditor';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { DestinationBlock, RichTextBlock, FoodRecommendation, LocalFestival } from '@/types/article/article.types';
import {
  Plus, Trash2, MapPin, Utensils, Calendar, Lightbulb, Bus, Home, ChevronDown, Upload,
} from 'lucide-react';
import { useState } from 'react';

import { DIVISION, DISTRICT, District, Division } from '@/constants/tour.const';
import { ARTICLE_RICH_TEXT_BLOCK_TYPE, FOOD_RECO_SPICE_TYPE, FoodRecoSpiceType } from '@/constants/article.const';
import { fileToBase64, IMAGE_EXTENSIONS, FileToBase64Options } from '@/utils/helpers/file-conversion';
import { ComboBox } from '@/components/ui/combobox';
import { MapPickerDialog } from '@/components/setting/footer/MapPickerDialog';
import Image from 'next/image';
import { getDistrictsByDivision } from '@/utils/helpers/conversions.tour';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_CARD_SM =
  'rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60';
const NEU_SURFACE_INSET =
  'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_INPUT =
  'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
  'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 border-none ' +
  'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_TEXTAREA =
  'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
  'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-3 border-none resize-none ' +
  'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';
const NEU_TEXTAREA_ERROR =
  'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
  'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-3 border-none resize-none ' +
  'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ring-2 ring-[#FF2157]/50 ' +
  'focus:outline-none transition-all duration-200';
const NEU_BTN_PRIMARY =
  'rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold text-xs tracking-wide ' +
  'px-4 py-2.5 flex items-center gap-2 ' +
  'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
  'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
  'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
  'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';
const NEU_BTN_GHOST =
  'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wide ' +
  'px-3 py-2 flex items-center gap-1.5 ' +
  'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
  'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
  'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
  'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none';
const NEU_BTN_DANGER =
  'rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wide ' +
  'px-4 py-2.5 flex items-center gap-2 ' +
  'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
  'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
  'transition-all duration-200';
const NEU_BTN_ICON_SM =
  'rounded-lg w-7 h-7 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/50 ' +
  'shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] ' +
  'hover:text-[#FF2157] hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
  'transition-all duration-200';
const NEU_HEADING =
  'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL =
  'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MUTED =
  'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_ERROR =
  'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157] mt-1';
const NEU_TAG_TEAL =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ' +
  'font-[family-name:var(--font-jetbrains-mono)] text-[#006666] bg-[#006666]/10 ' +
  'shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';
const NEU_TAG_YELLOW =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ' +
  'font-[family-name:var(--font-jetbrains-mono)] text-[#FE9900] bg-[#FE9900]/10 ' +
  'shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';
const NEU_TAG_BLUE =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ' +
  'font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70 bg-[#1E2938]/10 ' +
  'shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';
const NEU_TAG_GREEN =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ' +
  'font-[family-name:var(--font-jetbrains-mono)] text-[#00A63D] bg-[#00A63D]/10 ' +
  'shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';
const NEU_TAG_REMOVE =
  'ml-0.5 text-current/60 hover:text-[#FF2157] transition-colors duration-150 text-sm leading-none';
const NEU_SECTION_DIVIDER = 'border-t border-[#1E2938]/10 pt-5 mt-1';
const NEU_DROP_ZONE =
  'rounded-2xl border-2 border-dashed border-[#006666]/30 ' +
  'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] ' +
  'p-6 text-center cursor-pointer transition-all duration-200 ' +
  'hover:border-[#006666]/60';
const NEU_ICON_WELL =
  'p-2 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]';

// ── Combobox label helper ─────────────────────────────────────
const DIVISION_OPTIONS = Object.values(DIVISION).map(division => ({ value: division, label: division }));
const getDistrictOptionsForDivision = (division: Division) =>
  getDistrictsByDivision(division).map(district => ({ value: district, label: district }));
const SPICE_LEVEL_OPTIONS = [
  { value: FOOD_RECO_SPICE_TYPE.MILD, label: 'Mild' },
  { value: FOOD_RECO_SPICE_TYPE.MEDIUM, label: 'Medium' },
  { value: FOOD_RECO_SPICE_TYPE.SPICY, label: 'Spicy' },
];

export interface DestinationBlockFormProps {
  values: CreateArticleFormValues;
  errors: FormikErrors<CreateArticleFormValues>;
  touched: FormikTouched<CreateArticleFormValues>;
  setFieldValue: <K extends keyof CreateArticleFormValues>(
    field: K,
    value: CreateArticleFormValues[K]
  ) => void;
}

export function DestinationBlockForm({ values, errors, touched, setFieldValue }: DestinationBlockFormProps) {
  const [highlightInputs, setHighlightInputs] = useState<{ [key: number]: string }>({});
  const [localTipInputs, setLocalTipInputs] = useState<{ [key: number]: string }>({});
  const [transportInputs, setTransportInputs] = useState<{ [key: number]: string }>({});
  const [accommodationInputs, setAccommodationInputs] = useState<{ [key: number]: string }>({});
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [currentDestIndex, setCurrentDestIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState<{ [key: number]: boolean }>({});

  const getDestinationsFromValues = (): DestinationBlock[] => {
    if (!values.destinations || !Array.isArray(values.destinations)) return [];
    return values.destinations.map((d) => ({
      division: d.division ?? '',
      district: d.district ?? '',
      area: d.area ?? '',
      description: d.description ?? '',
      content: (d.content ?? []).map((c) => ({
        type: c.type ?? ARTICLE_RICH_TEXT_BLOCK_TYPE.PARAGRAPH,
        text: c.text ?? undefined,
        href: c.href ?? undefined,
      })),
      highlights: (d.highlights ?? []).filter((h) => h && typeof h === 'string') as string[],
      foodRecommendations: (d.foodRecommendations ?? []).map((f) => ({
        dishName: f.dishName ?? '',
        description: f.description ?? '',
        bestPlaceToTry: f.bestPlaceToTry ?? undefined,
        approximatePrice: f.approximatePrice ?? undefined,
        spiceLevel: f.spiceLevel ?? undefined,
      })),
      localFestivals: (d.localFestivals ?? []).map((f) => ({
        name: f.name ?? '',
        description: f.description ?? '',
        timeOfYear: f.timeOfYear ?? '',
        location: f.location ?? '',
        significance: f.significance ?? undefined,
      })),
      localTips: (d.localTips ?? []).filter((t) => t && typeof t === 'string') as string[],
      transportOptions: (d.transportOptions ?? []).filter((t) => t && typeof t === 'string') as string[],
      accommodationTips: (d.accommodationTips ?? []).filter((t) => t && typeof t === 'string') as string[],
      coordinates: d.coordinates && typeof d.coordinates === 'object' && 'lat' in d.coordinates && 'lng' in d.coordinates
        ? { lat: Number(d.coordinates.lat) || 0, lng: Number(d.coordinates.lng) || 0 }
        : { lat: 0, lng: 0 },
      imageAsset: d.imageAsset && typeof d.imageAsset === 'object' &&
        'title' in d.imageAsset && 'assetId' in d.imageAsset && typeof d.imageAsset.url === 'string' && d.imageAsset.url
        ? { title: d.imageAsset.title || '', assetId: d.imageAsset.assetId || '', url: d.imageAsset.url }
        : undefined,
    }));
  };

  const destinations = getDestinationsFromValues();

  const addDestination = () => {
    const next: DestinationBlock[] = [
      ...destinations,
      {
        division: DIVISION.DHAKA, district: DISTRICT.DHAKA, area: '', description: '',
        content: [] as RichTextBlock[], highlights: [], foodRecommendations: [],
        localFestivals: [], localTips: [], transportOptions: [], accommodationTips: [],
        coordinates: { lat: 0, lng: 0 },
      },
    ];
    setFieldValue('destinations', next);
  };

  const updateAt = (index: number, patch: Partial<DestinationBlock>) => {
    const next = [...destinations];
    next[index] = { ...next[index], ...patch };
    setFieldValue('destinations', next);
  };

  const removeDestination = (index: number) => {
    setFieldValue('destinations', destinations.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (file: File, destIndex: number) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!IMAGE_EXTENSIONS.includes(fileExtension as any)) {
      alert(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(', ')}`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Maximum size is 5MB.'); return; }
    setUploadingImage({ ...uploadingImage, [destIndex]: true });
    try {
      const opts: FileToBase64Options = { compressImages: true, maxWidth: 1200, quality: 0.8, maxFileBytes: 5 * 1024 * 1024 };
      const base64String = await fileToBase64(file, opts);
      updateAt(destIndex, { imageAsset: { title: file.name, assetId: `dest-img-${Date.now()}`, url: base64String } });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage({ ...uploadingImage, [destIndex]: false });
    }
  };

  const openMapPicker = (destIndex: number) => { setCurrentDestIndex(destIndex); setMapPickerOpen(true); };
  const handleMapSelect = (lat: number, lng: number) => {
    if (currentDestIndex !== null) updateAt(currentDestIndex, { coordinates: { lat, lng } });
    setMapPickerOpen(false); setCurrentDestIndex(null);
  };

  const addHighlight = (destIndex: number) => {
    const val = highlightInputs[destIndex]?.trim();
    if (val) {
      const current = destinations[destIndex].highlights.filter(Boolean);
      if (!current.includes(val)) updateAt(destIndex, { highlights: [...current, val] });
      setHighlightInputs({ ...highlightInputs, [destIndex]: '' });
    }
  };
  const removeHighlight = (destIndex: number, i: number) =>
    updateAt(destIndex, { highlights: destinations[destIndex].highlights.filter((_, idx) => idx !== i) });

  const addFoodRecommendation = (destIndex: number) =>
    updateAt(destIndex, {
      foodRecommendations: [...destinations[destIndex].foodRecommendations,
      { dishName: '', description: '', bestPlaceToTry: undefined, approximatePrice: undefined, spiceLevel: undefined }]
    });
  const updateFoodRecommendation = (destIndex: number, foodIndex: number, patch: Partial<FoodRecommendation>) => {
    const next = [...destinations[destIndex].foodRecommendations];
    next[foodIndex] = { ...next[foodIndex], ...patch };
    updateAt(destIndex, { foodRecommendations: next });
  };
  const removeFoodRecommendation = (destIndex: number, foodIndex: number) =>
    updateAt(destIndex, { foodRecommendations: destinations[destIndex].foodRecommendations.filter((_, i) => i !== foodIndex) });

  const addLocalFestival = (destIndex: number) =>
    updateAt(destIndex, {
      localFestivals: [...destinations[destIndex].localFestivals,
      { name: '', description: '', timeOfYear: '', location: '', significance: undefined }]
    });
  const updateLocalFestival = (destIndex: number, festivalIndex: number, patch: Partial<LocalFestival>) => {
    const next = [...destinations[destIndex].localFestivals];
    next[festivalIndex] = { ...next[festivalIndex], ...patch };
    updateAt(destIndex, { localFestivals: next });
  };
  const removeLocalFestival = (destIndex: number, festivalIndex: number) =>
    updateAt(destIndex, { localFestivals: destinations[destIndex].localFestivals.filter((_, i) => i !== festivalIndex) });

  const addLocalTip = (destIndex: number) => {
    const val = localTipInputs[destIndex]?.trim();
    if (val) {
      const current = destinations[destIndex].localTips.filter(Boolean);
      if (!current.includes(val)) updateAt(destIndex, { localTips: [...current, val] });
      setLocalTipInputs({ ...localTipInputs, [destIndex]: '' });
    }
  };
  const removeLocalTip = (destIndex: number, i: number) =>
    updateAt(destIndex, { localTips: destinations[destIndex].localTips.filter((_, idx) => idx !== i) });

  const addTransportOption = (destIndex: number) => {
    const val = transportInputs[destIndex]?.trim();
    if (val) {
      const current = destinations[destIndex].transportOptions.filter(Boolean);
      if (!current.includes(val)) updateAt(destIndex, { transportOptions: [...current, val] });
      setTransportInputs({ ...transportInputs, [destIndex]: '' });
    }
  };
  const removeTransportOption = (destIndex: number, i: number) =>
    updateAt(destIndex, { transportOptions: destinations[destIndex].transportOptions.filter((_, idx) => idx !== i) });

  const addAccommodationTip = (destIndex: number) => {
    const val = accommodationInputs[destIndex]?.trim();
    if (val) {
      const current = destinations[destIndex].accommodationTips.filter(Boolean);
      if (!current.includes(val)) updateAt(destIndex, { accommodationTips: [...current, val] });
      setAccommodationInputs({ ...accommodationInputs, [destIndex]: '' });
    }
  };
  const removeAccommodationTip = (destIndex: number, i: number) =>
    updateAt(destIndex, { accommodationTips: destinations[destIndex].accommodationTips.filter((_, idx) => idx !== i) });

  const getFieldError = (field: string) => {
    const keys = field.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error: any = errors;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let touch: any = touched;
    for (const key of keys) { error = error?.[key]; touch = touch?.[key]; }
    return touch && error ? String(error) : undefined;
  };

  const handleDivisionChange = (destIndex: number, newDivision: Division) => {
    const currentDest = destinations[destIndex];
    const districtsForDivision = getDistrictsByDivision(newDivision);
    const isCurrentDistrictValid = districtsForDivision.includes(currentDest.district as District);
    updateAt(destIndex, {
      division: newDivision,
      district: isCurrentDistrictValid ? currentDest.district : (districtsForDivision[0] || '')
    });
  };

  return (
    <div className="space-y-6">
      <MapPickerDialog
        open={mapPickerOpen}
        onClose={() => { setMapPickerOpen(false); setCurrentDestIndex(null); }}
        onSelect={handleMapSelect}
        initialPosition={currentDestIndex !== null
          ? [destinations[currentDestIndex]?.coordinates.lat, destinations[currentDestIndex]?.coordinates.lng] as [number, number]
          : undefined}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className={`${NEU_HEADING} text-base`}>Destinations</h3>
          <p className={`${NEU_MUTED} text-xs mt-1`}>
            Add Bangladesh-specific destinations with local insights
          </p>
        </div>
        <button type="button" onClick={addDestination} className={NEU_BTN_PRIMARY}>
          <Plus className="h-4 w-4" />
          Add Destination
        </button>
      </div>

      {/* Empty state */}
      {destinations.length === 0 && (
        <div className={`${NEU_SURFACE_INSET} rounded-2xl p-10 text-center`}>
          <div className="w-14 h-14 rounded-2xl bg-[#006666]/10 flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
            <MapPin className="h-7 w-7 text-[#006666]/50" />
          </div>
          <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/30 uppercase tracking-widest">
            No destinations yet
          </p>
          <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/30 mt-1">
            Add a destination to include local food, festivals, and travel tips.
          </p>
        </div>
      )}

      {/* Accordion */}
      <Accordion type="single" collapsible className="w-full space-y-4">
        {destinations.map((d, idx) => (
          <AccordionItem
            key={idx}
            value={`dest-${idx}`}
            className={`${NEU_CARD} overflow-hidden`}
          >
            {/* Trigger */}
            <AccordionTrigger className="hover:no-underline px-5 py-4 [&>svg]:hidden">
              <div className="flex items-center gap-3 w-full text-left">
                <div className="w-10 h-10 rounded-xl bg-[#006666]/10 flex items-center justify-center flex-shrink-0 shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                  <MapPin className="h-5 w-5 text-[#006666]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${NEU_HEADING} text-sm truncate`}>
                    {d.division && d.district
                      ? `${d.division}, ${d.district}`
                      : d.division || d.district || `Destination ${idx + 1}`}
                  </p>
                  {d.area && (
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50 mt-0.5 truncate">
                      {d.area}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                    #{idx + 1}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#1E2938]/40 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-5 pb-5 space-y-6">
              {/* ── Location ── */}
              <div className="space-y-4">
                <p className={`${NEU_LABEL}`}>Location Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className={NEU_LABEL}>Division *</label>
                    <ComboBox
                      options={DIVISION_OPTIONS}
                      value={d.division}
                      placeholder="Select Division"
                      onChange={(value) => handleDivisionChange(idx, value as Division)}
                    />
                    {getFieldError(`destinations.${idx}.division`) && (
                      <p className={NEU_ERROR}>{getFieldError(`destinations.${idx}.division`)}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className={NEU_LABEL}>District *</label>
                    <ComboBox
                      options={getDistrictOptionsForDivision(d.division as Division)}
                      value={d.district}
                      placeholder="Select District"
                      onChange={(value) => updateAt(idx, { district: value as District })}
                    />
                    {getFieldError(`destinations.${idx}.district`) && (
                      <p className={NEU_ERROR}>{getFieldError(`destinations.${idx}.district`)}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className={NEU_LABEL}>Area</label>
                    <input
                      className={NEU_INPUT}
                      placeholder="e.g., Kolatoli Beach"
                      value={d.area || ''}
                      onChange={(e) => updateAt(idx, { area: e.target.value })}
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className={NEU_LABEL}>Latitude</label>
                    <input
                      className={NEU_INPUT}
                      type="number"
                      step="any"
                      placeholder="23.8103"
                      value={d.coordinates.lat}
                      onChange={(e) => updateAt(idx, { coordinates: { ...d.coordinates, lat: parseFloat(e.target.value) || 0 } })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={NEU_LABEL}>Longitude</label>
                    <input
                      className={NEU_INPUT}
                      type="number"
                      step="any"
                      placeholder="90.4125"
                      value={d.coordinates.lng}
                      onChange={(e) => updateAt(idx, { coordinates: { ...d.coordinates, lng: parseFloat(e.target.value) || 0 } })}
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => openMapPicker(idx)}
                      className={`${NEU_BTN_GHOST} w-full justify-center`}
                    >
                      <MapPin className="h-4 w-4" />
                      Pick on Map
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className={NEU_LABEL}>Description *</label>
                  <textarea
                    className={getFieldError(`destinations.${idx}.description`) ? NEU_TEXTAREA_ERROR : NEU_TEXTAREA}
                    placeholder="Describe this destination…"
                    value={d.description}
                    onChange={(e) => updateAt(idx, { description: e.target.value })}
                    rows={3}
                  />
                  {getFieldError(`destinations.${idx}.description`) && (
                    <p className={NEU_ERROR}>{getFieldError(`destinations.${idx}.description`)}</p>
                  )}
                </div>
              </div>

              {/* ── Highlights ── */}
              <div className="space-y-3">
                <p className={NEU_LABEL}>Highlights</p>
                {d.highlights.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {d.highlights.filter(Boolean).map((h, i) => (
                      <span key={i} className={NEU_TAG_TEAL}>
                        {h}
                        <button type="button" onClick={() => removeHighlight(idx, i)} className={NEU_TAG_REMOVE}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className={NEU_INPUT}
                    placeholder="Add a highlight (e.g., World's longest natural sea beach)"
                    value={highlightInputs[idx] ?? ''}
                    onChange={(e) => setHighlightInputs({ ...highlightInputs, [idx]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHighlight(idx); } }}
                  />
                  <button
                    type="button"
                    className={NEU_BTN_GHOST}
                    onClick={() => addHighlight(idx)}
                    disabled={!highlightInputs[idx]?.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* ── Detailed Content ── */}
              <div className="space-y-3">
                <p className={NEU_LABEL}>Detailed Content</p>
                <RichTextEditor value={d.content} onChange={(next) => updateAt(idx, { content: next })} />
              </div>

              {/* ── Food Recommendations ── */}
              <div className={`space-y-4 ${NEU_SECTION_DIVIDER}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={NEU_ICON_WELL}><Utensils className="h-4 w-4 text-[#006666]" /></span>
                    <p className={`${NEU_LABEL}`}>Food Recommendations</p>
                  </div>
                  <button type="button" className={NEU_BTN_GHOST} onClick={() => addFoodRecommendation(idx)}>
                    <Plus className="h-3 w-3" />
                    Add Food
                  </button>
                </div>
                {d.foodRecommendations.length === 0 && (
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/30 text-center py-4">
                    No food recommendations yet
                  </p>
                )}
                <div className="space-y-3">
                  {d.foodRecommendations.map((food, fi) => (
                    <div key={fi} className={`${NEU_CARD_SM} p-4 space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`${NEU_LABEL} text-[10px]`}>Food #{fi + 1}</span>
                        <button type="button" className={NEU_BTN_ICON_SM} onClick={() => removeFoodRecommendation(idx, fi)} aria-label="Remove food">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input className={NEU_INPUT} placeholder="Dish name (e.g., Hilsa Curry)" value={food.dishName} onChange={(e) => updateFoodRecommendation(idx, fi, { dishName: e.target.value })} />
                      <textarea className={NEU_TEXTAREA} rows={2} placeholder="Description" value={food.description} onChange={(e) => updateFoodRecommendation(idx, fi, { description: e.target.value })} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className={NEU_INPUT} placeholder="Best place to try" value={food.bestPlaceToTry ?? ''} onChange={(e) => updateFoodRecommendation(idx, fi, { bestPlaceToTry: e.target.value || undefined })} />
                        <input className={NEU_INPUT} placeholder="Approximate price (e.g., ৳500-700)" value={food.approximatePrice ?? ''} onChange={(e) => updateFoodRecommendation(idx, fi, { approximatePrice: e.target.value || undefined })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={NEU_LABEL}>Spice Level</label>
                        <ComboBox
                          options={SPICE_LEVEL_OPTIONS}
                          value={food.spiceLevel}
                          placeholder="Select spice level"
                          onChange={(value) => updateFoodRecommendation(idx, fi, { spiceLevel: value as FoodRecoSpiceType })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Local Festivals ── */}
              <div className={`space-y-4 ${NEU_SECTION_DIVIDER}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={NEU_ICON_WELL}><Calendar className="h-4 w-4 text-[#006666]" /></span>
                    <p className={NEU_LABEL}>Local Festivals</p>
                  </div>
                  <button type="button" className={NEU_BTN_GHOST} onClick={() => addLocalFestival(idx)}>
                    <Plus className="h-3 w-3" />
                    Add Festival
                  </button>
                </div>
                {d.localFestivals.length === 0 && (
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/30 text-center py-4">
                    No festivals added yet
                  </p>
                )}
                <div className="space-y-3">
                  {d.localFestivals.map((festival, fi) => (
                    <div key={fi} className={`${NEU_CARD_SM} p-4 space-y-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`${NEU_LABEL} text-[10px]`}>Festival #{fi + 1}</span>
                        <button type="button" className={NEU_BTN_ICON_SM} onClick={() => removeLocalFestival(idx, fi)} aria-label="Remove festival">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input className={NEU_INPUT} placeholder="Festival name (e.g., Pohela Boishakh)" value={festival.name} onChange={(e) => updateLocalFestival(idx, fi, { name: e.target.value })} />
                      <textarea className={NEU_TEXTAREA} rows={2} placeholder="Description" value={festival.description} onChange={(e) => updateLocalFestival(idx, fi, { description: e.target.value })} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input className={NEU_INPUT} placeholder="Time of year (e.g., April)" value={festival.timeOfYear} onChange={(e) => updateLocalFestival(idx, fi, { timeOfYear: e.target.value })} />
                        <input className={NEU_INPUT} placeholder="Location" value={festival.location} onChange={(e) => updateLocalFestival(idx, fi, { location: e.target.value })} />
                      </div>
                      <textarea className={NEU_TEXTAREA} rows={2} placeholder="Significance (optional)" value={festival.significance ?? ''} onChange={(e) => updateLocalFestival(idx, fi, { significance: e.target.value || undefined })} />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Local Tips ── */}
              <div className={`space-y-3 ${NEU_SECTION_DIVIDER}`}>
                <div className="flex items-center gap-2">
                  <span className={NEU_ICON_WELL}><Lightbulb className="h-4 w-4 text-[#006666]" /></span>
                  <p className={NEU_LABEL}>Local Tips</p>
                </div>
                {d.localTips.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {d.localTips.filter(Boolean).map((tip, i) => (
                      <span key={i} className={NEU_TAG_YELLOW}>
                        {tip}
                        <button type="button" onClick={() => removeLocalTip(idx, i)} className={NEU_TAG_REMOVE}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className={NEU_INPUT}
                    placeholder="Add a local tip (e.g., Bargain at markets)"
                    value={localTipInputs[idx] ?? ''}
                    onChange={(e) => setLocalTipInputs({ ...localTipInputs, [idx]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocalTip(idx); } }}
                  />
                  <button type="button" className={NEU_BTN_GHOST} onClick={() => addLocalTip(idx)} disabled={!localTipInputs[idx]?.trim()}>
                    Add
                  </button>
                </div>
              </div>

              {/* ── Transport Options ── */}
              <div className={`space-y-3 ${NEU_SECTION_DIVIDER}`}>
                <div className="flex items-center gap-2">
                  <span className={NEU_ICON_WELL}><Bus className="h-4 w-4 text-[#006666]" /></span>
                  <p className={NEU_LABEL}>Transport Options</p>
                </div>
                {d.transportOptions.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {d.transportOptions.filter(Boolean).map((transport, i) => (
                      <span key={i} className={NEU_TAG_BLUE}>
                        {transport}
                        <button type="button" onClick={() => removeTransportOption(idx, i)} className={NEU_TAG_REMOVE}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className={NEU_INPUT}
                    placeholder="Add transport option (e.g., Bus from Dhaka)"
                    value={transportInputs[idx] ?? ''}
                    onChange={(e) => setTransportInputs({ ...transportInputs, [idx]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTransportOption(idx); } }}
                  />
                  <button type="button" className={NEU_BTN_GHOST} onClick={() => addTransportOption(idx)} disabled={!transportInputs[idx]?.trim()}>
                    Add
                  </button>
                </div>
              </div>

              {/* ── Accommodation Tips ── */}
              <div className={`space-y-3 ${NEU_SECTION_DIVIDER}`}>
                <div className="flex items-center gap-2">
                  <span className={NEU_ICON_WELL}><Home className="h-4 w-4 text-[#006666]" /></span>
                  <p className={NEU_LABEL}>Accommodation Tips</p>
                </div>
                {d.accommodationTips.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {d.accommodationTips.filter(Boolean).map((accommodation, i) => (
                      <span key={i} className={NEU_TAG_GREEN}>
                        {accommodation}
                        <button type="button" onClick={() => removeAccommodationTip(idx, i)} className={NEU_TAG_REMOVE}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className={NEU_INPUT}
                    placeholder="Add accommodation tip (e.g., Book in advance during peak season)"
                    value={accommodationInputs[idx] ?? ''}
                    onChange={(e) => setAccommodationInputs({ ...accommodationInputs, [idx]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAccommodationTip(idx); } }}
                  />
                  <button type="button" className={NEU_BTN_GHOST} onClick={() => addAccommodationTip(idx)} disabled={!accommodationInputs[idx]?.trim()}>
                    Add
                  </button>
                </div>
              </div>

              {/* ── Destination Image ── */}
              <div className={`space-y-3 ${NEU_SECTION_DIVIDER}`}>
                <p className={NEU_LABEL}>Destination Image</p>
                {d.imageAsset?.url ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff]">
                      <Image
                        src={d.imageAsset.url}
                        alt={d.imageAsset.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        onClick={() => { const { imageAsset, ...rest } = destinations[idx]; updateAt(idx, rest); }}
                        className="absolute top-2 right-2 rounded-xl bg-[#E7E5E4]/90 text-[#FF2157] w-9 h-9 flex items-center justify-center shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] hover:bg-[#FF2157] hover:text-white transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input className={NEU_INPUT} placeholder="Image title" value={d.imageAsset.title} onChange={(e) => updateAt(idx, { imageAsset: { ...d.imageAsset!, title: e.target.value } })} />
                    <input className={`${NEU_INPUT} opacity-50`} placeholder="Asset ID (auto-generated)" value={d.imageAsset.assetId} disabled />
                  </div>
                ) : (
                  <label className={NEU_DROP_ZONE}>
                    <input
                      type="file"
                      id={`image-upload-${idx}`}
                      accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                      className="hidden"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file, idx); }}
                      disabled={uploadingImage[idx]}
                    />
                    <div className="flex flex-col items-center gap-3">
                      {uploadingImage[idx] ? (
                        <>
                          <div className="w-11 h-11 rounded-xl bg-[#006666]/10 flex items-center justify-center shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                            <div className="w-5 h-5 rounded-full border-2 border-[#006666] border-t-transparent animate-spin" />
                          </div>
                          <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666]">Uploading…</p>
                        </>
                      ) : (
                        <>
                          <div className="w-11 h-11 rounded-xl bg-[#006666]/10 flex items-center justify-center shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                            <Upload className="h-5 w-5 text-[#006666]" />
                          </div>
                          <div>
                            <p className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]/70">
                              Upload Destination Image
                            </p>
                            <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 mt-1">
                              {IMAGE_EXTENSIONS.join(', ')} · Max 5MB
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                )}
              </div>

              {/* ── Actions ── */}
              <div className="flex items-center justify-between pt-2">
                <button type="button" className={NEU_BTN_DANGER} onClick={() => removeDestination(idx)}>
                  <Trash2 className="h-4 w-4" />
                  Remove Destination
                </button>
                <button type="button" className={NEU_BTN_GHOST} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <ChevronDown className="h-4 w-4 rotate-180" />
                  Back to Top
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}