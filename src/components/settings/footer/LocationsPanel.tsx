// src/components/settings/settings/footer/LocationsPanel.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Globe } from "lucide-react";
import type { FooterEntities } from "@/types/footer-settings.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFooterStore } from "@/store/footerSettings.store";
import { LocationRow } from "./LocationRow";
import { LocationFormDialog } from "./LocationFormDialog";

type Props = { entities: FooterEntities | null };

export function LocationsPanel({ entities }: Props) {
    const [open, setOpen] = useState(false);
    const { setEditingLocationId } = useFooterStore();

    const order = entities?.locationOrder ?? [];
    const byId = entities?.locationsById ?? {};

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
        >
            <Card className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl dark:border-slate-800/60 dark:bg-slate-900/80">
                <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-cyan-50/50 pb-6 dark:border-slate-800/60 dark:from-slate-800/50 dark:via-teal-950/30 dark:to-cyan-950/50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2 shadow-md">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                                Locations
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Manage your business locations
                            </CardDescription>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => {
                                    setEditingLocationId(null);
                                    setOpen(true);
                                }}
                                size="sm"
                                className="gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/40"
                            >
                                <Plus className="h-4 w-4" />
                                Add Location
                            </Button>
                        </motion.div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                        {order.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 py-16 text-center dark:from-slate-900/50 dark:to-emerald-950/20"
                            >
                                <motion.div
                                    animate={{ 
                                        y: [0, -10, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ 
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 shadow-lg dark:from-emerald-950/50 dark:to-teal-950/50"
                                >
                                    <Globe className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                </motion.div>
                                <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    No locations added
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Start by adding your first business location
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {order.map((id, index) => (
                                    <motion.div
                                        key={id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <LocationRow
                                            location={byId[id]}
                                            onEdit={() => setOpen(true)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
            <LocationFormDialog open={open} onOpenChange={setOpen} />
        </motion.div>
    );
}