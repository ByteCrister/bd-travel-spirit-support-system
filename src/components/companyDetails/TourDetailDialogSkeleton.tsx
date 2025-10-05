// components/company/TourDetailDialogSkeleton.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    MdCalendarToday,
    MdLocationOn,
    MdPeople,
    MdStar,
    MdAttachMoney,
    MdDescription,
    MdLocalOffer,
    MdMap,
    MdDirectionsRun,
    MdQuestionAnswer,
    MdSecurity,
    MdPhone,
    MdWbSunny,
    MdCardTravel,
    MdVideoLibrary,
    MdImage,
    MdPerson,
} from "react-icons/md";

export function TourDetailDialogSkeleton() {
    return (
        <div className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-white">
            <h2 className="sr-only">Tour Details</h2>

            {/* Header skeleton */}
            <motion.div initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-6 pt-6 pb-4 border-b border-slate-300 bg-white">
                <div className="space-y-3">
                    <div className="h-6 w-72 bg-slate-200 rounded-md animate-pulse" />
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse" />
                        <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse" />
                        <div className="h-6 w-20 rounded-md bg-slate-200 animate-pulse" />
                        <MdVideoLibrary className="h-4 w-4 text-slate-500" />
                        <MdImage className="h-4 w-4 text-slate-500" />
                        <MdWbSunny className="h-4 w-4 text-slate-500" />
                        <MdCardTravel className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="h-4 w-40 bg-slate-100 rounded-md animate-pulse" />
                </div>
            </motion.div>

            {/* Scroll area skeleton */}
            <div className="flex-1 h-[calc(90vh-180px)] overflow-auto bg-white">
                <div className="p-6 space-y-6">
                    {/* Stat grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatSkeleton icon={MdCalendarToday} />
                        <StatSkeleton icon={MdPeople} />
                        <StatSkeleton icon={MdStar} />
                        <StatSkeleton icon={MdAttachMoney} />
                    </div>

                    {/* Description */}
                    <SectionSkeleton icon={MdDescription}>
                        <div className="h-20 w-full bg-slate-200 rounded-md animate-pulse" />
                    </SectionSkeleton>

                    {/* Highlights */}
                    <SectionSkeleton icon={MdStar}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <LargeItemSkeleton />
                            <LargeItemSkeleton />
                        </div>
                    </SectionSkeleton>

                    {/* Schedule */}
                    <SectionSkeleton icon={MdCalendarToday}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                            <CellSkeleton />
                        </div>
                    </SectionSkeleton>

                    {/* Pricing options */}
                    <SectionSkeleton icon={MdAttachMoney}>
                        <div className="space-y-2">
                            <RowSkeleton />
                            <RowSkeleton />
                        </div>
                    </SectionSkeleton>

                    {/* Discounts */}
                    <SectionSkeleton icon={MdLocalOffer}>
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                                <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse mb-2" />
                                <div className="h-3 w-48 bg-slate-100 rounded-md animate-pulse" />
                            </div>
                        </div>
                    </SectionSkeleton>

                    {/* Meeting points */}
                    <SectionSkeleton icon={MdLocationOn}>
                        <div className="space-y-3">
                            <LargeItemSkeleton />
                            <LargeItemSkeleton />
                        </div>
                    </SectionSkeleton>

                    {/* Itinerary */}
                    <SectionSkeleton icon={MdMap}>
                        <div className="space-y-4">
                            <ItinerarySkeleton />
                            <ItinerarySkeleton />
                        </div>
                    </SectionSkeleton>

                    {/* Activities & tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SectionSkeleton icon={MdDirectionsRun} titleWidth="w-36">
                            <div className="flex flex-wrap gap-2">
                                <PillSkeleton />
                                <PillSkeleton />
                                <PillSkeleton />
                            </div>
                        </SectionSkeleton>

                        <SectionSkeleton icon={MdLocalOffer} titleWidth="w-36">
                            <div className="flex flex-wrap gap-2">
                                <PillSkeleton />
                                <PillSkeleton />
                                <PillSkeleton />
                            </div>
                        </SectionSkeleton>
                    </div>

                    {/* Host */}
                    <SectionSkeleton icon={MdPerson}>
                        <div className="p-4 rounded-lg border border-slate-300 bg-slate-50">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 w-40 bg-slate-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-28 bg-slate-100 rounded-md animate-pulse" />
                                    <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </SectionSkeleton>

                    {/* FAQs */}
                    <SectionSkeleton icon={MdQuestionAnswer}>
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg border border-slate-300 bg-slate-50">
                                <div className="h-4 w-72 bg-slate-200 rounded-md animate-pulse mb-2" />
                                <div className="h-4 w-56 bg-slate-100 rounded-md animate-pulse" />
                            </div>
                        </div>
                    </SectionSkeleton>

                    {/* Emergency / Cancellation / Audit */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SectionSkeleton icon={MdPhone} titleWidth="w-36">
                            <CellSkeleton />
                        </SectionSkeleton>
                        <SectionSkeleton icon={MdSecurity} titleWidth="w-36">
                            <CellSkeleton />
                        </SectionSkeleton>
                        <div className="pt-4 border-t md:border-t-0 md:pt-0 md:border-l md:pl-4 border-slate-200">
                            <div className="h-3 w-48 bg-slate-200 rounded-md animate-pulse mb-2" />
                            <div className="h-3 w-48 bg-slate-200 rounded-md animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* small skeleton helpers (high-contrast slate tones) */

function SectionSkeleton({ icon: Icon, titleWidth = "w-40", children }: { icon?: React.ComponentType<{ className?: string }>; titleWidth?: string; children?: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                {Icon ? <Icon className="h-5 w-5 text-slate-600" /> : <div className="h-5 w-5 rounded bg-slate-200" />}
                <div className={`h-4 ${titleWidth} rounded-md bg-slate-200 animate-pulse`} />
            </div>
            <div className="h-px w-full bg-slate-200" />
            <div>{children}</div>
        </div>
    );
}

function StatSkeleton({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="p-4 rounded-lg border border-slate-300 bg-slate-50">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-slate-600" />
                </div>
            </div>
            <div className="h-3 w-24 bg-slate-200 rounded-md animate-pulse mb-2" />
            <div className="h-5 w-28 bg-slate-200 rounded-md animate-pulse" />
        </div>
    );
}

function CellSkeleton() {
    return (
        <div className="space-y-2">
            <div className="h-3 w-32 rounded-md bg-slate-200 animate-pulse" />
            <div className="h-5 w-full rounded-md bg-slate-300 animate-pulse" />
        </div>
    );
}

function LargeItemSkeleton() {
    return (
        <div className="p-3 rounded-lg border border-slate-300 bg-slate-50">
            <div className="h-4 w-56 bg-slate-200 rounded-md animate-pulse mb-2" />
            <div className="h-4 w-full bg-slate-100 rounded-md animate-pulse" />
        </div>
    );
}

function RowSkeleton() {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-300 bg-slate-50">
            <div className="h-4 w-36 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-5 w-28 bg-slate-200 rounded-md animate-pulse" />
        </div>
    );
}

function ItinerarySkeleton() {
    return (
        <div className="p-4 rounded-lg border border-slate-300 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-5 w-16 bg-slate-200 rounded-md animate-pulse" />
                <div className="h-4 w-40 bg-slate-200 rounded-md animate-pulse" />
            </div>
            <div className="h-12 w-full bg-slate-100 rounded-md animate-pulse" />
        </div>
    );
}

function PillSkeleton() {
    return <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />;
}
