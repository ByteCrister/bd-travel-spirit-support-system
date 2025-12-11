// src/components/settings/settings/footer/LocationFormDialog.tsx
"use client";

import { motion } from "framer-motion";
import { X, Save, MapPin, Globe, Map, Navigation, Link as LinkIcon, ToggleLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { LocationForm, locationSchema } from "@/utils/validators/footer-settings.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFooterStore } from "@/store/footerSettings.store";
import { MapPickerDialog } from "./MapPickerDialog";

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function LocationFormDialog({ open, onOpenChange }: Props) {
    const {
        entities,
        setEditingLocationKey,
        addOrUpdateLocation,
        saveStatus,
        editingLocationKey: editingKey,
    } = useFooterStore();
    const saving = saveStatus === "loading";

    const [mapOpen, setMapOpen] = useState<boolean>(false);

    const initial = useMemo(() => {
        if (!editingKey || !entities) return undefined;
        return entities.locationsByKey[editingKey];
    }, [editingKey, entities]);

    const form = useForm<LocationForm>({
        resolver: zodResolver(locationSchema) as unknown as Resolver<LocationForm>,
        defaultValues: {
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
            setEditingLocationKey(null);
            form.reset();
        } else if (initial) {
            // Edit mode: populate with existing values
            form.reset({
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
            // Add mode: reset to empty
            form.reset({
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
                typeof lat === "number" &&
                !Number.isNaN(lat) &&
                lat >= -90 &&
                lat <= 90;

            const lngValid =
                typeof lng === "number" &&
                !Number.isNaN(lng) &&
                lng >= -180 &&
                lng <= 180;

            const nextLocation =
                latValid && lngValid
                    ? ({
                        type: "Point",
                        coordinates: [lng, lat] as [number, number],
                    } as const)
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-200/60 
             bg-white/95 p-0 shadow-2xl backdrop-blur-md 
             dark:border-slate-800/60 dark:bg-slate-900/95"
            >                {/* Header with gradient */}
                <DialogHeader className="border-b border-slate-200/60 
                          bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-cyan-50/80 
                          px-8 py-6 dark:border-slate-800/60 
                          dark:from-slate-800/80 dark:via-teal-950/50 dark:to-cyan-950/80">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg"
                            >
                                <MapPin className="h-6 w-6 text-white" />
                            </motion.div>
                            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {editingKey ? "Edit Location" : "Add Location"}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                {/* Form Content */}
                <form className="space-y-6 px-8 py-6" onSubmit={form.handleSubmit(onSubmit)}>
                    {/* Key Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="key" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            Key
                        </Label>
                        <Input
                            id="key"
                            {...form.register("key")}
                            className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="e.g., new-york-us"
                        />
                        {form.formState.errors.key && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                {form.formState.errors.key.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Country Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="country" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Globe className="h-4 w-4 text-teal-500" />
                            Country
                        </Label>
                        <Input
                            id="country"
                            {...form.register("country")}
                            className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="e.g., United States"
                        />
                        {form.formState.errors.country && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-medium text-red-600 dark:text-red-400"
                            >
                                {form.formState.errors.country.message}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Region and City Fields */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 gap-6 md:grid-cols-2"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="region" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <Map className="h-4 w-4 text-cyan-500" />
                                Region
                            </Label>
                            <Input
                                id="region"
                                {...form.register("region")}
                                className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="e.g., New York"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                City
                            </Label>
                            <Input
                                id="city"
                                {...form.register("city")}
                                className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="e.g., Manhattan"
                            />
                        </div>
                    </motion.div>

                    {/* Slug Field */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                    >
                        <Label htmlFor="slug" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <LinkIcon className="h-4 w-4 text-purple-500" />
                            Slug
                        </Label>
                        <Input
                            id="slug"
                            {...form.register("slug")}
                            className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800"
                            placeholder="URL-friendly identifier"
                        />
                    </motion.div>

                    {/* Latitude and Longitude Fields */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 gap-6 md:grid-cols-2"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="lat" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <Navigation className="h-4 w-4 text-orange-500" />
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
                                className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="e.g., 40.7128"
                            />

                            {form.formState.errors.lat && (
                                <motion.p
                                    id="lat-error"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs font-medium text-red-600 dark:text-red-400"
                                >
                                    {String(form.formState.errors.lat.message)}
                                </motion.p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lng" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                <Navigation className="h-4 w-4 text-pink-500" />
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
                                className="h-11 rounded-lg border-slate-300 bg-white shadow-sm transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800"
                                placeholder="e.g., -74.0060"
                            />

                            {form.formState.errors.lng && (
                                <motion.p
                                    id="lng-error"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs font-medium text-red-600 dark:text-red-400"
                                >
                                    {String(form.formState.errors.lng.message)}
                                </motion.p>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center gap-2"
                            onClick={() => setMapOpen(true)}
                        >
                            <MapPin className="h-4 w-4" />
                            Choose From Map
                        </Button>
                    </motion.div>

                    {/* Active Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                    >
                        <div className="flex items-center gap-3">
                            <ToggleLeft className="h-5 w-5 text-green-500" />
                            <div>
                                <Label htmlFor="active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Active Status
                                </Label>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Enable or disable this location
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="active"
                            checked={!!form.watch("active")}
                            onCheckedChange={(v) => form.setValue("active", v)}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                        />
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex justify-end gap-3 pt-4"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={saving}
                            className="gap-2 rounded-lg border-2 border-slate-300 px-6 font-semibold hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 font-semibold shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/40"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Location"}
                        </Button>
                    </motion.div>
                </form>
                <MapPickerDialog
                    open={mapOpen}
                    onClose={() => setMapOpen(false)}
                    onSelect={(lat: number, lng: number) => {
                        form.setValue("lat", lat, { shouldDirty: true });
                        form.setValue("lng", lng, { shouldDirty: true });
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
