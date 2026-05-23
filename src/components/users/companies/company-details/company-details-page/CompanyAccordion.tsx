"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { CompanyOverviewDTO } from "@/types/company/company.overview.types";
import {
    MdBusiness,
    MdAccessTime,
    MdTour,
    MdPeople,
    MdReport,
    MdPublic,
    MdBookmark,
    MdStar,
    MdFingerprint,
    MdContentCopy,
    MdCheck,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import Kpi from "./Kpi";

// ── Neumorphic style tokens ───────────────────────────────────
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_INFO_ROW =
    "flex items-center justify-between px-4 py-3 rounded-xl bg-[#E7E5E4] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] border border-white/50 " +
    "hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] transition-all duration-200 group";

const NEU_ICON_WELL =
    "flex h-8 w-8 items-center justify-center rounded-xl bg-[#E7E5E4] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "group-hover:scale-110 transition-transform duration-200";

const NEU_LABEL =
    "text-xs font-bold font-[family-name:var(--font-space-mono)] uppercase tracking-widest text-[#1E2938]/55";

const NEU_PILL =
    "inline-flex items-center px-3 py-1 rounded-lg text-xs font-[family-name:var(--font-jetbrains-mono)] " +
    "bg-[#E7E5E4] text-[#1E2938] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_COPY_BTN =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-[family-name:var(--font-space-mono)] " +
    "bg-[#E7E5E4] text-[#006666] " +
    "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
    "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "active:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_SECTION_HEADING =
    "text-xs font-bold font-[family-name:var(--font-space-mono)] uppercase tracking-widest text-[#1E2938]/50 flex items-center gap-2";

const NEU_ACCORDION_TRIGGER =
    "px-6 py-4 hover:no-underline rounded-t-2xl";

const NEU_ACCORDION_ITEM =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_20px_#c8c6c5,-8px_-8px_20px_#ffffff] border border-white/70 overflow-hidden";

// ─────────────────────────────────────────────────────────────

interface Props {
    overview: CompanyOverviewDTO;
}

export function CompanyAccordion({ overview }: Props) {
    const { companyId, companyName, kpis, serverNow } = overview;

    const [copiedAt, setCopiedAt] = useState<Record<string, number | undefined>>({});

    const handleCopy = useCallback((key: string, text: string) => {
        navigator.clipboard?.writeText(text).then(
            () => {
                const now = Date.now();
                setCopiedAt((s) => ({ ...s, [key]: now }));
                setTimeout(() => setCopiedAt((s) => ({ ...s, [key]: undefined })), 1500);
            },
            () => {
                const now = Date.now();
                setCopiedAt((s) => ({ ...s, [key]: now }));
                setTimeout(() => setCopiedAt((s) => ({ ...s, [key]: undefined })), 1500);
            }
        );
    }, []);

    const infoItems = [
        {
            icon: MdFingerprint,
            label: "Company ID",
            value: companyId,
            accent: "text-[#006666]",
            canCopy: true,
        },
        {
            icon: MdBusiness,
            label: "Company Name",
            value: companyName ?? "—",
            accent: "text-[#1E2938]",
            canCopy: false,
        },
        {
            icon: MdAccessTime,
            label: "Server Time",
            value: serverNow,
            accent: "text-[#1E2938]",
            canCopy: false,
        },
    ];

    const kpiItems = [
        {
            icon: MdTour,
            label: "Total Tours",
            value: kpis.totalTours,
            color: "from-blue-600 to-cyan-600",
            bgColor: "from-blue-500/10 to-cyan-500/10",
            iconBg: "bg-gradient-to-br from-blue-600 to-cyan-600",
        },
        {
            icon: MdPeople,
            label: "Employees",
            value: kpis.totalEmployees,
            color: "from-purple-600 to-pink-600",
            bgColor: "from-purple-500/10 to-pink-500/10",
            iconBg: "bg-gradient-to-br from-purple-600 to-pink-600",
        },
        {
            icon: MdReport,
            label: "Open Reports",
            value: kpis.openReports,
            color: "from-orange-600 to-red-600",
            bgColor: "from-orange-500/10 to-red-500/10",
            iconBg: "bg-gradient-to-br from-orange-600 to-red-600",
        },
        {
            icon: MdPublic,
            label: "Published",
            value: kpis.publishedTours,
            color: "from-emerald-600 to-teal-600",
            bgColor: "from-emerald-500/10 to-teal-500/10",
            iconBg: "bg-gradient-to-br from-emerald-600 to-teal-600",
        },
        {
            icon: MdBookmark,
            label: "Bookings",
            value: kpis.totalBookings,
            color: "from-indigo-600 to-blue-600",
            bgColor: "from-indigo-500/10 to-blue-500/10",
            iconBg: "bg-gradient-to-br from-indigo-600 to-blue-600",
        },
        {
            icon: MdStar,
            label: "Avg Rating",
            value: kpis.avgTourRating,
            decimals: 1,
            color: "from-amber-600 to-yellow-600",
            bgColor: "from-amber-500/10 to-yellow-500/10",
            iconBg: "bg-gradient-to-br from-amber-600 to-yellow-600",
        },
    ];

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="overview" className={NEU_ACCORDION_ITEM}>
                <AccordionTrigger className={NEU_ACCORDION_TRIGGER}>
                    <div className="flex items-center gap-3">
                        <div
                            className={`${NEU_ICON_WELL} !h-10 !w-10 !rounded-xl !shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]`}
                        >
                            <MdBusiness className="h-5 w-5 text-[#006666]" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight">
                                Company Information
                            </h3>
                            <p className="text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 mt-0.5">
                                Metrics &amp; overview
                            </p>
                        </div>
                    </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Details Card */}
                        <div className={`${NEU_CARD} p-6 space-y-4`}>
                            <p className={NEU_SECTION_HEADING}>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#006666] animate-pulse" />
                                Details
                            </p>

                            <div className="space-y-3">
                                {infoItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isCopied = Boolean(copiedAt[item.label]);

                                    return (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.07, duration: 0.26 }}
                                            className={NEU_INFO_ROW}
                                        >
                                            {/* Left: icon + label */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={NEU_ICON_WELL}>
                                                    <Icon className={`h-4 w-4 ${item.accent}`} />
                                                </div>
                                                <span className={NEU_LABEL}>{item.label}</span>
                                            </div>

                                            {/* Right: value / copy */}
                                            <div className="relative flex items-center ml-2 flex-shrink-0">
                                                {item.canCopy ? (
                                                    <>
                                                        <AnimatePresence>
                                                            {isCopied && (
                                                                <motion.div
                                                                    key="pop"
                                                                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                                                    transition={{ duration: 0.18 }}
                                                                    className="absolute -top-9 right-0 z-10 pointer-events-none"
                                                                    aria-hidden
                                                                >
                                                                    <div className="rounded-lg bg-[#1E2938] text-white text-xs px-2.5 py-1 shadow-lg font-[family-name:var(--font-space-mono)]">
                                                                        Copied!
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                        <button
                                                            onClick={() => handleCopy(item.label, item.value)}
                                                            className={NEU_COPY_BTN}
                                                            title={`Copy ${item.label}`}
                                                            aria-label={`Copy ${item.label}`}
                                                        >
                                                            {isCopied ? (
                                                                <MdCheck className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <MdContentCopy className="h-3.5 w-3.5" />
                                                            )}
                                                            {isCopied ? "Copied" : "Copy"}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={NEU_PILL}>{item.value}</span>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* KPIs Card */}
                        <div className={`${NEU_CARD} p-6`}>
                            <p className={`${NEU_SECTION_HEADING} mb-4`}>
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#006666] animate-pulse" />
                                Key Metrics
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {kpiItems.map((item, index) => (
                                    <Kpi
                                        key={item.label}
                                        icon={item.icon}
                                        label={item.label}
                                        value={item.value}
                                        decimals={item.decimals}
                                        color={item.color}
                                        bgColor={item.bgColor}
                                        iconBg={item.iconBg}
                                        delay={index * 0.05}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}