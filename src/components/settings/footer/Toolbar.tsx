// src/components/settings/settings/footer/Toolbar.tsx
"use client";

import { motion } from "framer-motion";
import { RotateCcw, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFooterStore } from "@/store/footerSettings.store";

type Props = { saving: boolean };

export function Toolbar({ saving }: Props) {
    const { resetStore, upsertFooterSettings, canonical } = useFooterStore();

    const handleSave = () => {
        upsertFooterSettings({
            socialLinks: canonical?.socialLinks?.map(l => ({
                id: l.id,
                key: l.key,
                label: l.label ?? null,
                url: l.url,
                active: l.active,
                order: l.order ?? null
            })) ?? [],
            locations: canonical?.locations?.map(loc => ({
                key: loc.key,
                country: loc.country,
                region: loc.region ?? null,
                city: loc.city ?? null,
                slug: loc.slug ?? null,
                lat: loc.lat,
                lng: loc.lng,
                active: loc.active,
            })) ?? [],
            version: canonical?.version
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white/80 p-5 shadow-lg backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/80"
        >
            <div className="flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Make changes and save to update your footer settings
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="default"
                    onClick={() => resetStore()}
                    disabled={saving}
                    className="gap-2.5 rounded-lg border-2 border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
                <Button
                    size="default"
                    onClick={handleSave}
                    disabled={saving}
                    className="gap-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save All
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}