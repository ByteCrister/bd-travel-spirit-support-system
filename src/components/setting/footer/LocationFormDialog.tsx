// src/components/settings/settings/footer/LocationFormDialog.tsx
"use client";

import { motion } from "framer-motion";
import {
    X,
    Save,
    MapPin,
    Globe,
    Map,
    Navigation,
    Link as LinkIcon,
    ToggleLeft,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import {
    LocationForm,
    locationSchema,
} from "@/utils/validators/site-settings/footer-settings.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFooterStore } from "@/store/site-settings/footerSettings.store";
import { MapPickerDialog } from "./MapPickerDialog";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_DIALOG_CONTENT =
    "max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0 border border-white/60 " +
    "bg-[#E7E5E4] shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff]";

const NEU_DIALOG_HEADER =
    "relative overflow-hidden border-b border-white/40 bg-[#E7E5E4] px-6 py-5 sm:px-8";

const NEU_ICON_WELL =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006666] " +
    "shadow-[3px_3px_6px_#004d4d,-2px_-2px_5px_#008080]";

const NEU_TITLE =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-xl";

const NEU_LABEL =
    "flex items-center gap-2 font-[family-name:var(--font-space-mono)] text-xs font-bold " +
    "text-[#1E2938]/60 uppercase tracking-widest";

const NEU_INPUT =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/30 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 h-11 transition-all duration-200";

const NEU_ERROR =
    "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]";

const NEU_TOGGLE_ROW =
    "flex items-center justify-between rounded-xl bg-[#E7E5E4] p-4 " +
    "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_MAP_BTN =
    "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#006666] bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_COORDS_HINT =
    "mt-2 font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50";

const NEU_BTN_CANCEL =
    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/70 bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "disabled:opacity-40 disabled:cursor-not-allowed " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_SUBMIT =
    "flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm text-white " +
    "font-[family-name:var(--font-space-mono)] font-bold bg-[#006666] " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "disabled:opacity-50 disabled:cursor-not-allowed " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
// ─────────────────────────────────────────────────────────────

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function LocationFormDialog({ open, onOpenChange }: Props) {
    const {
        entities,
        setEditingLocationId,
        addOrUpdateLocation,
        saveStatus,
        editingLocationId: editingId,
    } = useFooterStore();
    const saving = saveStatus === "loading";

    const [mapOpen, setMapOpen] = useState<boolean>(false);

    const initial = useMemo(() => {
        if (!editingId || !entities) return undefined;
        return entities.locationsById[editingId];
    }, [editingId, entities]);

    const form = useForm<LocationForm>({
        resolver: zodResolver(locationSchema) as unknown as Resolver<LocationForm>,
        defaultValues: {
            id: initial?.id ?? "",
            key: initial?.key ?? "",
            country: initial?.country ?? "",
            region: initial?.region ?? "",
            city: initial?.city ?? "",
            slug: initial?.slug ?? "",
            lat: initial?.lat ?? 0,
            lng: initial?.lng ?? 0,
            active: initial?.active ?? true,
            location: initial?.location ?? null,
        },
        mode: "onBlur",
    });

    useEffect(() => {
        if (!open) {
            setEditingLocationId(null);
            form.reset();
        } else if (initial) {
            form.reset({
                id: initial.id,
                key: initial.key,
                country: initial.country,
                region: initial.region ?? "",
                city: initial.city ?? "",
                slug: initial.slug ?? "",
                lat: initial.lat,
                lng: initial.lng,
                active: initial.active,
                location: initial.location ?? null,
            });
        } else {
            form.reset({
                id: "new",
                key: "",
                country: "",
                region: "",
                city: "",
                slug: "",
                lat: 0,
                lng: 0,
                active: true,
                location: null,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initial]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            const lat = value.lat;
            const lng = value.lng;
            const latValid =
                typeof lat === "number" && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
            const lngValid =
                typeof lng === "number" &&
                !Number.isNaN(lng) &&
                lng >= -180 &&
                lng <= 180;
            const nextLocation =
                latValid && lngValid
                    ? ({ type: "Point", coordinates: [lng, lat] as [number, number] } as const)
                    : null;
            const currentLocation = form.getValues("location");
            if (JSON.stringify(currentLocation) !== JSON.stringify(nextLocation)) {
                form.setValue("location", nextLocation, {
                    shouldDirty: true,
                    shouldTouch: true,
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    async function onSubmit(values: LocationForm) {
        const payload = {
            id: values.id,
            key: values.key!,
            country: values.country!,
            region: values.region ?? null,
            city: values.city ?? null,
            slug: values.slug ?? null,
            lat: Number(values.lat),
            lng: Number(values.lng),
            active: values.active ?? true,
            location: values.location ?? null,
        };
        const saved = await addOrUpdateLocation(payload);
        if (saved) onOpenChange(false);
    }

    const currentLat = form.watch("lat");
    const currentLng = form.watch("lng");
    const hasCoords = currentLat !== 0 && currentLng !== 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={NEU_DIALOG_CONTENT}>
                {/* Header */}
                <DialogHeader className={NEU_DIALOG_HEADER}>
                    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#006666]/10 blur-3xl" />
                    <div className="relative flex items-center gap-3">
                        <motion.div
                            initial={{ scale: 0, rotate: -160 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 16 }}
                            className={NEU_ICON_WELL}
                        >
                            <MapPin className="h-5 w-5 text-white" />
                        </motion.div>
                        <DialogTitle className={NEU_TITLE}>
                            {editingId ? "Edit Location" : "Add Location"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Form */}
                <form
                    className="space-y-5 px-6 py-6 sm:px-8"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    {/* Key */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="key" className={NEU_LABEL}>
                            <MapPin className="h-3.5 w-3.5 text-[#006666]" />
                            Key
                        </Label>
                        <Input
                            id="key"
                            {...form.register("key")}
                            className={NEU_INPUT}
                            placeholder="e.g., new-york-us"
                        />
                        {form.formState.errors.key && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU_ERROR}>
                                {form.formState.errors.key.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Country */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="country" className={NEU_LABEL}>
                            <Globe className="h-3.5 w-3.5 text-[#006666]" />
                            Country
                        </Label>
                        <Input
                            id="country"
                            {...form.register("country")}
                            className={NEU_INPUT}
                            placeholder="e.g., United States"
                        />
                        {form.formState.errors.country && (
                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU_ERROR}>
                                {form.formState.errors.country.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Region + City */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="region" className={NEU_LABEL}>
                                <Map className="h-3.5 w-3.5 text-[#006666]" />
                                Region
                            </Label>
                            <Input
                                id="region"
                                {...form.register("region")}
                                className={NEU_INPUT}
                                placeholder="e.g., New York"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className={NEU_LABEL}>
                                <MapPin className="h-3.5 w-3.5 text-[#006666]" />
                                City
                            </Label>
                            <Input
                                id="city"
                                {...form.register("city")}
                                className={NEU_INPUT}
                                placeholder="e.g., Manhattan"
                            />
                        </div>
                    </motion.div>

                    {/* Slug */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="slug" className={NEU_LABEL}>
                            <LinkIcon className="h-3.5 w-3.5 text-[#006666]" />
                            Slug
                        </Label>
                        <Input
                            id="slug"
                            {...form.register("slug")}
                            className={NEU_INPUT}
                            placeholder="URL-friendly identifier"
                        />
                    </motion.div>

                    {/* Lat + Lng + Map Picker */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24 }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="lat" className={NEU_LABEL}>
                                    <Navigation className="h-3.5 w-3.5 text-[#006666]" />
                                    Latitude
                                </Label>
                                <Input
                                    id="lat"
                                    type="number"
                                    step="any"
                                    min={-90}
                                    max={90}
                                    {...form.register("lat", { valueAsNumber: true })}
                                    aria-invalid={!!form.formState.errors.lat}
                                    aria-describedby={form.formState.errors.lat ? "lat-error" : undefined}
                                    className={NEU_INPUT}
                                    placeholder="e.g., 40.7128"
                                />
                                {form.formState.errors.lat && (
                                    <motion.p id="lat-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU_ERROR}>
                                        {String(form.formState.errors.lat.message)}
                                    </motion.p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lng" className={NEU_LABEL}>
                                    <Navigation className="h-3.5 w-3.5 text-[#006666]" />
                                    Longitude
                                </Label>
                                <Input
                                    id="lng"
                                    type="number"
                                    step="any"
                                    min={-180}
                                    max={180}
                                    {...form.register("lng", { valueAsNumber: true })}
                                    aria-invalid={!!form.formState.errors.lng}
                                    aria-describedby={form.formState.errors.lng ? "lng-error" : undefined}
                                    className={NEU_INPUT}
                                    placeholder="e.g., -74.0060"
                                />
                                {form.formState.errors.lng && (
                                    <motion.p id="lng-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className={NEU_ERROR}>
                                        {String(form.formState.errors.lng.message)}
                                    </motion.p>
                                )}
                            </div>
                        </div>

                        {/* Map Picker Button */}
                        <div>
                            <button
                                type="button"
                                className={NEU_MAP_BTN}
                                onClick={() => setMapOpen(true)}
                            >
                                <MapPin className="h-4 w-4" />
                                {hasCoords ? "Update Location on Map" : "Choose From Map"}
                            </button>
                            {hasCoords && (
                                <p className={NEU_COORDS_HINT}>
                                    Current: {currentLat?.toFixed(6)}, {currentLng?.toFixed(6)}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Active Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28 }}
                        className={NEU_TOGGLE_ROW}
                    >
                        <div className="flex items-center gap-3">
                            <ToggleLeft className="h-5 w-5 text-[#00A63D]" />
                            <div>
                                <Label
                                    htmlFor="active"
                                    className="font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938]"
                                >
                                    Active Status
                                </Label>
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                                    Enable or disable this location
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="active"
                            checked={!!form.watch("active")}
                            onCheckedChange={(v) => form.setValue("active", v)}
                            className="data-[state=checked]:bg-[#00A63D]"
                        />
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.32 }}
                        className="flex justify-end gap-3 pt-2"
                    >
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                            className={NEU_BTN_CANCEL}
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className={NEU_BTN_SUBMIT}>
                            <Save className="h-4 w-4" />
                            {saving ? "Saving…" : "Save Location"}
                        </button>
                    </motion.div>
                </form>

                {/* Map Picker */}
                <MapPickerDialog
                    open={mapOpen}
                    onClose={() => setMapOpen(false)}
                    onSelect={(lat: number, lng: number) => {
                        form.setValue("lat", lat, { shouldDirty: true });
                        form.setValue("lng", lng, { shouldDirty: true });
                    }}
                    initialPosition={hasCoords ? [currentLat, currentLng] as [number, number] : undefined}
                />
            </DialogContent>
        </Dialog>
    );
}