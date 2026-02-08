// src/components/settings/settings/FooterSettingsPage.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, MapPin, Users } from "lucide-react";
import { useFooterStore } from "@/store/site-settings/footerSettings.store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FooterSettingsHeader } from "./FooterSettingsHeader";
import { SocialLinksPanel } from "./SocialLinksPanel";
import { LocationsPanel } from "./LocationsPanel";
import { SocialLinksSkeleton } from "./skeletons/SocialLinksSkeleton";
import { LocationsSkeleton } from "./skeletons/LocationsSkeleton";

export default function FooterSettingsPage() {
    const {
        fetchStatus,
        entities,
        lastError,
        fetchFooterSettings
    } = useFooterStore();

    useEffect(() => {
        fetchFooterSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loading = fetchStatus === "loading";
    const error = fetchStatus === "error";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mx-auto max-w-7xl space-y-6"
            >
                {/* Header */}
                <FooterSettingsHeader />

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Alert variant="destructive" className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
                            <AlertCircle className="h-5 w-5" />
                            <AlertDescription className="ml-2 font-medium">
                                {lastError ?? "Failed to load footer settings."}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Tabs defaultValue="social" className="w-full">
                        <TabsList className="inline-flex h-12 w-full justify-start rounded-xl border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
                            <TabsTrigger
                                value="social"
                                className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all
               data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600
               data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Users className="h-4 w-4" />
                                Social Links
                            </TabsTrigger>

                            <TabsTrigger
                                value="locations"
                                className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all
               data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600
               data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <MapPin className="h-4 w-4" />
                                Locations
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="social" className="mt-6">
                            {loading ? <SocialLinksSkeleton /> : <SocialLinksPanel entities={entities} />}
                        </TabsContent>

                        <TabsContent value="locations" className="mt-6">
                            {loading ? <LocationsSkeleton /> : <LocationsPanel entities={entities} />}
                        </TabsContent>
                    </Tabs>

                </motion.div>
            </motion.div>
        </div>
    );
}