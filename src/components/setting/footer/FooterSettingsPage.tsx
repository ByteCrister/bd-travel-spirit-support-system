// src/components/settings/settings/FooterSettingsPage.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, MapPin, Users } from "lucide-react";
import { useFooterStore } from "@/store/site-settings/footerSettings.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FooterSettingsHeader } from "./FooterSettingsHeader";
import { SocialLinksPanel } from "./SocialLinksPanel";
import { LocationsPanel } from "./LocationsPanel";
import { SocialLinksSkeleton } from "./skeletons/SocialLinksSkeleton";
import { LocationsSkeleton } from "./skeletons/LocationsSkeleton";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";

// ── Neumorphism style tokens ──────────────────────────────────
const PAGE_BG = "min-h-screen bg-[#E7E5E4] p-4 lg:p-6 xl:p-8";

const ERROR_ALERT =
    "flex items-start gap-3 rounded-xl border border-[#FF2157]/30 bg-[#FF2157]/10 px-4 py-3 " +
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#FF2157] " +
    "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const TAB_LIST =
    "inline-flex h-auto w-full justify-start rounded-xl p-1 bg-[#E7E5E4] " +
    "shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const TAB_TRIGGER_BASE =
    "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm transition-all duration-200 " +
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60 " +
    "data-[state=inactive]:hover:text-[#006666]";

const TAB_TRIGGER_ACTIVE =
    "data-[state=active]:bg-[#006666] data-[state=active]:text-white " +
    "data-[state=active]:shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080]";

// ─────────────────────────────────────────────────────────────

const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Footer", href: "/setting/footer" },
];

export default function FooterSettingsPage() {
    const { fetchStatus, entities, lastError, fetchFooterSettings } =
        useFooterStore();

    useEffect(() => {
        fetchFooterSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loading = fetchStatus === "loading";
    const error = fetchStatus === "error";

    return (
        <div className={PAGE_BG}>
            <Breadcrumbs items={breadcrumbItems} />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="mx-auto max-w-7xl space-y-6"
            >
                {/* Header */}
                <FooterSettingsHeader />

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={ERROR_ALERT} role="alert">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{lastError ?? "Failed to load footer settings."}</span>
                        </div>
                    </motion.div>
                )}

                {/* Main Content — Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.45 }}
                >
                    <Tabs defaultValue="social" className="w-full">
                        <TabsList className={TAB_LIST}>
                            <TabsTrigger
                                value="social"
                                className={`${TAB_TRIGGER_BASE} ${TAB_TRIGGER_ACTIVE}`}
                            >
                                <Users className="h-4 w-4" />
                                Social Links
                            </TabsTrigger>
                            <TabsTrigger
                                value="locations"
                                className={`${TAB_TRIGGER_BASE} ${TAB_TRIGGER_ACTIVE}`}
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