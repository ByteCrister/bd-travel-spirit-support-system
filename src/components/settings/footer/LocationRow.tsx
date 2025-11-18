// src/components/settings/settings/footer/LocationRow.tsx
"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, MapPin, GripVertical, Navigation } from "lucide-react";
import type { LocationEntryDTO } from "@/types/footer-settings.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFooterStore } from "@/store/footerSettings.store";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Props = {
    location: LocationEntryDTO;
    onEdit: () => void;
};

export function LocationRow({ location, onEdit }: Props) {
    const {
        setEditingLocationKey,
        deleteLocation,
        saveStatus
    } = useFooterStore();
    const saving = saveStatus === "loading";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-300/60 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-emerald-700/60"
        >
            {/* Gradient Accent */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-600 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400">
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                {location.city ?? location.region ?? location.country}
                            </h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {location.country}
                            {location.region ? ` • ${location.region}` : ""}
                            {location.city ? ` • ${location.city}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant={location.active ? "default" : "secondary"}
                                className={location.active
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }
                            >
                                {location.active ? "Active" : "Inactive"}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                            >
                                <Navigation className="mr-1 h-3 w-3" />
                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </Badge>
                            {location.slug && (
                                <Badge
                                    variant="outline"
                                    className="border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300"
                                >
                                    {location.slug}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEditingLocationKey(location.key);
                                onEdit();
                            }}
                            className="gap-2 border-slate-300 bg-white hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                        </Button>
                    </motion.div>


                    {/* Delete with confirmation */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={saving}
                                    className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 shadow-sm hover:from-red-600 hover:to-rose-700 text-white"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </motion.div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Location</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">{location.city ?? location.region ?? location.country}</span>?
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteLocation(location.key)}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                                >
                                    Confirm Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </motion.div>
    );
}