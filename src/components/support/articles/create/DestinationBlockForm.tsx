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
import { RichTextEditor } from './RichTextEditor';
import { CreateArticleFormValues } from '@/utils/validators/article.create.validator';
import { DestinationBlock, RichTextBlock, FoodRecommendation, LocalFestival } from '@/types/article/article.types';
import {
  Plus,
  Trash2,
  MapPin,
  Utensils,
  Calendar,
  Lightbulb,
  Bus,
  Home,
  ChevronDown,
  Upload
} from 'lucide-react';
import { useState } from 'react';

// Import constants for select options
import { DIVISION, DISTRICT, District, Division } from '@/constants/tour.const';
import { ARTICLE_RICH_TEXT_BLOCK_TYPE, FOOD_RECO_SPICE_TYPE, FoodRecoSpiceType } from '@/constants/article.const';

// Import file conversion utilities
import {
  fileToBase64,
  IMAGE_EXTENSIONS,
  FileToBase64Options
} from '@/utils/helpers/file-conversion';

// Import components
import { ComboBox } from '@/components/ui/combobox';
import { MapPickerDialog } from '@/components/setting/footer/MapPickerDialog';
import Image from 'next/image';
import { getDistrictsByDivision } from '@/utils/helpers/conversions.tour';

// Define enum options for combobox
const DIVISION_OPTIONS = Object.values(DIVISION).map(division => ({
  value: division,
  label: division
}));

const getDistrictOptionsForDivision = (division: Division) => {
  const districts = getDistrictsByDivision(division);
  return districts.map(district => ({
    value: district,
    label: district
  }));
};

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

export function DestinationBlockForm({
  values,
  errors,
  touched,
  setFieldValue,
}: DestinationBlockFormProps) {
  const [highlightInputs, setHighlightInputs] = useState<{ [key: number]: string }>({});
  const [localTipInputs, setLocalTipInputs] = useState<{ [key: number]: string }>({});
  const [transportInputs, setTransportInputs] = useState<{ [key: number]: string }>({});
  const [accommodationInputs, setAccommodationInputs] = useState<{ [key: number]: string }>({});
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [currentDestIndex, setCurrentDestIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState<{ [key: number]: boolean }>({});

  // Helper function to safely get values
  const getDestinationsFromValues = (): DestinationBlock[] => {
    if (!values.destinations || !Array.isArray(values.destinations)) {
      return [];
    }

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
      coordinates: d.coordinates && typeof d.coordinates === 'object' &&
        'lat' in d.coordinates && 'lng' in d.coordinates
        ? { lat: Number(d.coordinates.lat) || 0, lng: Number(d.coordinates.lng) || 0 }
        : { lat: 0, lng: 0 },
      imageAsset: d.imageAsset && typeof d.imageAsset === 'object' &&
        'title' in d.imageAsset && 'assetId' in d.imageAsset && typeof d.imageAsset.url === 'string' && d.imageAsset.url
        ? {
          title: d.imageAsset.title || '',
          assetId: d.imageAsset.assetId || '',
          url: d.imageAsset.url,
        }
        : undefined,
    }));
  };

  const destinations = getDestinationsFromValues();

  const addDestination = () => {
    const next: DestinationBlock[] = [
      ...destinations,
      {
        division: DIVISION.DHAKA,
        district: DISTRICT.DHAKA,
        area: '',
        description: '',
        content: [] as RichTextBlock[],
        highlights: [],
        foodRecommendations: [],
        localFestivals: [],
        localTips: [],
        transportOptions: [],
        accommodationTips: [],
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
    const next = destinations.filter((_, i) => i !== index);
    setFieldValue('destinations', next);
  };

  // File upload handler using file-conversion.ts
  const handleImageUpload = async (file: File, destIndex: number) => {
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!IMAGE_EXTENSIONS.includes(fileExtension as any)) {
      alert(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(', ')}`);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setUploadingImage({ ...uploadingImage, [destIndex]: true });

    try {
      const opts: FileToBase64Options = {
        compressImages: true,
        maxWidth: 1200,
        quality: 0.8,
        maxFileBytes: 5 * 1024 * 1024,
      };

      const base64String = await fileToBase64(file, opts);

      updateAt(destIndex, {
        imageAsset: {
          title: file.name,
          assetId: `dest-img-${Date.now()}`,
          url: base64String
        }
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage({ ...uploadingImage, [destIndex]: false });
    }
  };

  // Map picker handlers
  const openMapPicker = (destIndex: number) => {
    setCurrentDestIndex(destIndex);
    setMapPickerOpen(true);
  };

  const handleMapSelect = (lat: number, lng: number) => {
    if (currentDestIndex !== null) {
      updateAt(currentDestIndex, {
        coordinates: { lat, lng }
      });
    }
    setMapPickerOpen(false);
    setCurrentDestIndex(null);
  };

  // Highlights
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

  // Food Recommendations
  const addFoodRecommendation = (destIndex: number) => {
    const newFoodReco: FoodRecommendation = {
      dishName: '',
      description: '',
      bestPlaceToTry: undefined,
      approximatePrice: undefined,
      spiceLevel: undefined,
    };
    updateAt(destIndex, {
      foodRecommendations: [...destinations[destIndex].foodRecommendations, newFoodReco]
    });
  };

  const updateFoodRecommendation = (
    destIndex: number,
    foodIndex: number,
    patch: Partial<FoodRecommendation>
  ) => {
    const next = [...destinations[destIndex].foodRecommendations];
    next[foodIndex] = { ...next[foodIndex], ...patch };
    updateAt(destIndex, { foodRecommendations: next });
  };

  const removeFoodRecommendation = (destIndex: number, foodIndex: number) => {
    const next = destinations[destIndex].foodRecommendations.filter((_, i) => i !== foodIndex);
    updateAt(destIndex, { foodRecommendations: next });
  };

  // Local Festivals
  const addLocalFestival = (destIndex: number) => {
    const newFestival: LocalFestival = {
      name: '',
      description: '',
      timeOfYear: '',
      location: '',
      significance: undefined,
    };
    updateAt(destIndex, {
      localFestivals: [...destinations[destIndex].localFestivals, newFestival]
    });
  };

  const updateLocalFestival = (
    destIndex: number,
    festivalIndex: number,
    patch: Partial<LocalFestival>
  ) => {
    const next = [...destinations[destIndex].localFestivals];
    next[festivalIndex] = { ...next[festivalIndex], ...patch };
    updateAt(destIndex, { localFestivals: next });
  };

  const removeLocalFestival = (destIndex: number, festivalIndex: number) => {
    const next = destinations[destIndex].localFestivals.filter((_, i) => i !== festivalIndex);
    updateAt(destIndex, { localFestivals: next });
  };

  // Local Tips
  const addLocalTip = (destIndex: number) => {
    const val = localTipInputs[destIndex]?.trim();
    if (val) {
      const currentTips = destinations[destIndex].localTips.filter(Boolean);
      if (!currentTips.includes(val)) {
        updateAt(destIndex, { localTips: [...currentTips, val] });
      }
      setLocalTipInputs({ ...localTipInputs, [destIndex]: '' });
    }
  };

  const removeLocalTip = (destIndex: number, tipIndex: number) => {
    const next = destinations[destIndex].localTips.filter((_, i) => i !== tipIndex);
    updateAt(destIndex, { localTips: next });
  };

  // Transport Options
  const addTransportOption = (destIndex: number) => {
    const val = transportInputs[destIndex]?.trim();
    if (val) {
      const currentTransports = destinations[destIndex].transportOptions.filter(Boolean);
      if (!currentTransports.includes(val)) {
        updateAt(destIndex, { transportOptions: [...currentTransports, val] });
      }
      setTransportInputs({ ...transportInputs, [destIndex]: '' });
    }
  };

  const removeTransportOption = (destIndex: number, transportIndex: number) => {
    const next = destinations[destIndex].transportOptions.filter((_, i) => i !== transportIndex);
    updateAt(destIndex, { transportOptions: next });
  };

  // Accommodation Tips
  const addAccommodationTip = (destIndex: number) => {
    const val = accommodationInputs[destIndex]?.trim();
    if (val) {
      const currentAccommodations = destinations[destIndex].accommodationTips.filter(Boolean);
      if (!currentAccommodations.includes(val)) {
        updateAt(destIndex, { accommodationTips: [...currentAccommodations, val] });
      }
      setAccommodationInputs({ ...accommodationInputs, [destIndex]: '' });
    }
  };

  const removeAccommodationTip = (destIndex: number, accommodationIndex: number) => {
    const next = destinations[destIndex].accommodationTips.filter((_, i) => i !== accommodationIndex);
    updateAt(destIndex, { accommodationTips: next });
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

  const handleDivisionChange = (destIndex: number, newDivision: Division) => {
    const currentDest = destinations[destIndex];

    // Get districts for the new division
    const districtsForDivision = getDistrictsByDivision(newDivision);

    // Check if current district belongs to the new division
    const isCurrentDistrictValid = districtsForDivision.includes(currentDest.district as District);

    // Update with new division and possibly reset district
    updateAt(destIndex, {
      division: newDivision,
      district: isCurrentDistrictValid ? currentDest.district : (districtsForDivision[0] || '')
    });
  };

  return (
    <div className="space-y-6">
      {/* Map Picker Dialog */}
      <MapPickerDialog
        open={mapPickerOpen}
        onClose={() => {
          setMapPickerOpen(false);
          setCurrentDestIndex(null);
        }}
        onSelect={handleMapSelect}
        initialPosition={currentDestIndex !== null ?
          [destinations[currentDestIndex]?.coordinates.lat, destinations[currentDestIndex]?.coordinates.lng] as [number, number] :
          undefined
        }
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Destinations</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add Bangladesh-specific destinations with local insights
          </p>
        </div>
        <Button
          type="button"
          onClick={addDestination}
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 bg-indigo-600 text-white font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {destinations.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No destinations added yet. Add a destination to include local food, festivals, and travel tips.
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
                    {d.division && d.district
                      ? `${d.division}, ${d.district}`
                      : d.division || d.district || `Destination ${idx + 1}`}
                  </div>
                  {d.area && (
                    <div className="text-xs text-muted-foreground">{d.area}</div>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="space-y-6 pb-4">
              {/* Location Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Location Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Division *</label>
                    <ComboBox
                      options={DIVISION_OPTIONS}
                      value={d.division}
                      placeholder="Select Division"
                      onChange={(value) => handleDivisionChange(idx, value as Division)}
                    />
                    {getFieldError(`destinations.${idx}.division`) && (
                      <p className="text-xs text-destructive">
                        {getFieldError(`destinations.${idx}.division`)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">District *</label>
                    <ComboBox
                      options={getDistrictOptionsForDivision(d.division as Division)}
                      value={d.district}
                      placeholder="Select District"
                      onChange={(value) => updateAt(idx, { district: value as District })}
                    />
                    {getFieldError(`destinations.${idx}.district`) && (
                      <p className="text-xs text-destructive">
                        {getFieldError(`destinations.${idx}.district`)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Area</label>
                    <Input
                      placeholder="e.g., Kolatoli Beach"
                      value={d.area || ''}
                      onChange={(e) => updateAt(idx, { area: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., 23.8103"
                      value={d.coordinates.lat}
                      onChange={(e) => updateAt(idx, {
                        coordinates: {
                          ...d.coordinates,
                          lat: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g., 90.4125"
                      value={d.coordinates.lng}
                      onChange={(e) => updateAt(idx, {
                        coordinates: {
                          ...d.coordinates,
                          lng: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openMapPicker(idx)}
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Pick on Map
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Description *</label>
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
                    placeholder="Add a highlight (e.g., World's longest natural sea beach)"
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

              {/* Detailed Content */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Detailed Content</h4>
                <RichTextEditor
                  value={d.content}
                  onChange={(next) => updateAt(idx, { content: next })}
                />
              </div>

              {/* Food Recommendations */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    <h4 className="font-medium text-sm">Food Recommendations</h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFoodRecommendation(idx)}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Food
                  </Button>
                </div>

                {d.foodRecommendations.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No food recommendations added yet
                  </p>
                )}

                <div className="space-y-3">
                  {d.foodRecommendations.map((food, fi) => (
                    <div key={fi} className="rounded-lg border bg-muted/50 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Food {fi + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFoodRecommendation(idx, fi)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <Input
                        placeholder="Dish name (e.g., Hilsa Curry)"
                        value={food.dishName}
                        onChange={(e) => updateFoodRecommendation(idx, fi, { dishName: e.target.value })}
                      />

                      <Textarea
                        placeholder="Description"
                        value={food.description}
                        onChange={(e) => updateFoodRecommendation(idx, fi, { description: e.target.value })}
                        rows={2}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Best place to try"
                          value={food.bestPlaceToTry ?? ''}
                          onChange={(e) => updateFoodRecommendation(idx, fi, { bestPlaceToTry: e.target.value || undefined })}
                        />
                        <Input
                          placeholder="Approximate price (e.g., ৳500-700)"
                          value={food.approximatePrice ?? ''}
                          onChange={(e) => updateFoodRecommendation(idx, fi, { approximatePrice: e.target.value || undefined })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium">Spice Level</label>
                        <ComboBox
                          options={SPICE_LEVEL_OPTIONS}
                          value={food.spiceLevel}
                          placeholder="Select spice level"
                          onChange={(value) => updateFoodRecommendation(idx, fi, {
                            spiceLevel: value as FoodRecoSpiceType
                          })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Festivals */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <h4 className="font-medium text-sm">Local Festivals</h4>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addLocalFestival(idx)}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Add Festival
                  </Button>
                </div>

                {d.localFestivals.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No festivals added yet
                  </p>
                )}

                <div className="space-y-3">
                  {d.localFestivals.map((festival, fi) => (
                    <div key={fi} className="rounded-lg border bg-muted/50 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Festival {fi + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLocalFestival(idx, fi)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <Input
                        placeholder="Festival name (e.g., Pohela Boishakh)"
                        value={festival.name}
                        onChange={(e) => updateLocalFestival(idx, fi, { name: e.target.value })}
                      />

                      <Textarea
                        placeholder="Description"
                        value={festival.description}
                        onChange={(e) => updateLocalFestival(idx, fi, { description: e.target.value })}
                        rows={2}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Time of year (e.g., April)"
                          value={festival.timeOfYear}
                          onChange={(e) => updateLocalFestival(idx, fi, { timeOfYear: e.target.value })}
                        />
                        <Input
                          placeholder="Location"
                          value={festival.location}
                          onChange={(e) => updateLocalFestival(idx, fi, { location: e.target.value })}
                        />
                      </div>

                      <Textarea
                        placeholder="Significance (optional)"
                        value={festival.significance ?? ''}
                        onChange={(e) => updateLocalFestival(idx, fi, { significance: e.target.value || undefined })}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Tips */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <h4 className="font-medium text-sm">Local Tips</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.localTips.filter(Boolean).map((tip, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium"
                    >
                      {tip}
                      <button
                        type="button"
                        onClick={() => removeLocalTip(idx, i)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a local tip (e.g., Bargain at markets)"
                    value={localTipInputs[idx] ?? ''}
                    onChange={(e) => setLocalTipInputs({
                      ...localTipInputs,
                      [idx]: e.target.value
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLocalTip(idx);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addLocalTip(idx)}
                    disabled={!localTipInputs[idx]?.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Transport Options */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  <h4 className="font-medium text-sm">Transport Options</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.transportOptions.filter(Boolean).map((transport, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium"
                    >
                      {transport}
                      <button
                        type="button"
                        onClick={() => removeTransportOption(idx, i)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add transport option (e.g., Bus from Dhaka)"
                    value={transportInputs[idx] ?? ''}
                    onChange={(e) => setTransportInputs({
                      ...transportInputs,
                      [idx]: e.target.value
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTransportOption(idx);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTransportOption(idx)}
                    disabled={!transportInputs[idx]?.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Accommodation Tips */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <h4 className="font-medium text-sm">Accommodation Tips</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.accommodationTips.filter(Boolean).map((accommodation, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium"
                    >
                      {accommodation}
                      <button
                        type="button"
                        onClick={() => removeAccommodationTip(idx, i)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add accommodation tip (e.g., Book in advance during peak season)"
                    value={accommodationInputs[idx] ?? ''}
                    onChange={(e) => setAccommodationInputs({
                      ...accommodationInputs,
                      [idx]: e.target.value
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAccommodationTip(idx);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addAccommodationTip(idx)}
                    disabled={!accommodationInputs[idx]?.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Image Asset */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-sm">Destination Image</h4>

                {d.imageAsset?.url ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Image
                        src={d.imageAsset.url}
                        alt={d.imageAsset.title}
                        fill
                        sizes="100vw"
                        className="object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // Remove imageAsset if no URL (makes it undefined)
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                          const { imageAsset, ...rest } = destinations[idx];
                          updateAt(idx, rest);
                        }}
                        className="absolute top-2 right-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Image title"
                      value={d.imageAsset.title}
                      onChange={(e) => updateAt(idx, {
                        imageAsset: {
                          ...d.imageAsset!,
                          title: e.target.value
                        }
                      })}
                      className="mt-2"
                    />
                    <Input
                      placeholder="Asset ID (auto-generated)"
                      value={d.imageAsset.assetId}
                      disabled
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id={`image-upload-${idx}`}
                      accept={IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, idx);
                        }
                      }}
                      disabled={uploadingImage[idx]}
                    />
                    <label
                      htmlFor={`image-upload-${idx}`}
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      {uploadingImage[idx] ? (
                        <>
                          <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin mb-3"></div>
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                          <p className="text-sm font-medium">Upload Destination Image</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Supported: {IMAGE_EXTENSIONS.join(', ')} (Max 5MB)
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => removeDestination(idx)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 bg-red-600 text-white text-sm font-medium shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Destination
                </Button>
                <Button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200"
                >
                  <ChevronDown className="h-4 w-4 rotate-180" />
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