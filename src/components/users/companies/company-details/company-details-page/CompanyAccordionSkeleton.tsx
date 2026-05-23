"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// ── Neumorphic skeleton tokens ────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6";

const NEU_SKELETON =
    "rounded-lg bg-[#d0cecd] animate-pulse";

const NEU_ROW =
    "flex items-center justify-between px-4 py-3 rounded-xl bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/50";

const NEU_KPI_CELL =
    "rounded-2xl bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] border border-white/60 p-4 space-y-3";

const NEU_ACCORDION_ITEM =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/70 overflow-hidden";

// ─────────────────────────────────────────────────────────────

export function CompanyAccordionSkeleton() {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="overview" className={NEU_ACCORDION_ITEM}>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] animate-pulse" />
                        <div className="space-y-1.5">
                            <div className={`${NEU_SKELETON} h-4 w-44`} />
                            <div className={`${NEU_SKELETON} h-3 w-28`} />
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Details skeleton */}
                        <div className={NEU_CARD}>
                            <div className={`${NEU_SKELETON} h-3 w-16 mb-4`} />
                            <div className="space-y-3">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className={NEU_ROW}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-[#d0cecd] animate-pulse" />
                                            <div className={`${NEU_SKELETON} h-3 w-24`} />
                                        </div>
                                        <div className={`${NEU_SKELETON} h-6 w-32`} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* KPIs skeleton */}
                        <div className={NEU_CARD}>
                            <div className={`${NEU_SKELETON} h-3 w-24 mb-4`} />
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className={NEU_KPI_CELL}>
                                        <div className="flex items-center justify-between">
                                            <div className="h-9 w-9 rounded-xl bg-[#d0cecd] animate-pulse" />
                                            <div className={`${NEU_SKELETON} h-7 w-14`} />
                                        </div>
                                        <div className={`${NEU_SKELETON} h-3 w-20`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}