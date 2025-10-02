// components/company/CompanyAccordion.tsx
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CountUp from "react-countup";
import { CompanyOverviewDTO } from "@/types/company.overview.types";
import {
    MdBusiness,
    MdAccessTime,
    MdTour,
    MdPeople,
    MdReport,
    MdPublic,
    MdBookmark,
    MdStar,
    MdFingerprint
} from "react-icons/md";
import { motion } from "framer-motion";

interface Props {
    overview: CompanyOverviewDTO;
}

export function CompanyAccordion({ overview }: Props) {
    const { companyId, companyName, kpis, serverNow } = overview;

    const infoItems = [
        { icon: MdFingerprint, label: "Company ID", value: companyId, color: "text-blue-600 dark:text-blue-400" },
        { icon: MdBusiness, label: "Company name", value: companyName ?? "—", color: "text-purple-600 dark:text-purple-400" },
        { icon: MdAccessTime, label: "Server time", value: serverNow, color: "text-emerald-600 dark:text-emerald-400" },
    ];

    const kpiItems = [
        {
            icon: MdTour,
            label: "Total tours",
            value: kpis.totalTours,
            color: "from-blue-600 to-cyan-600",
            bgColor: "from-blue-500/10 to-cyan-500/10",
            iconBg: "bg-gradient-to-br from-blue-600 to-cyan-600"
        },
        {
            icon: MdPeople,
            label: "Total employees",
            value: kpis.totalEmployees,
            color: "from-purple-600 to-pink-600",
            bgColor: "from-purple-500/10 to-pink-500/10",
            iconBg: "bg-gradient-to-br from-purple-600 to-pink-600"
        },
        {
            icon: MdReport,
            label: "Open reports",
            value: kpis.openReports,
            color: "from-orange-600 to-red-600",
            bgColor: "from-orange-500/10 to-red-500/10",
            iconBg: "bg-gradient-to-br from-orange-600 to-red-600"
        },
        {
            icon: MdPublic,
            label: "Published tours",
            value: kpis.publishedTours,
            color: "from-emerald-600 to-teal-600",
            bgColor: "from-emerald-500/10 to-teal-500/10",
            iconBg: "bg-gradient-to-br from-emerald-600 to-teal-600"
        },
        {
            icon: MdBookmark,
            label: "Total bookings",
            value: kpis.totalBookings,
            color: "from-indigo-600 to-blue-600",
            bgColor: "from-indigo-500/10 to-blue-500/10",
            iconBg: "bg-gradient-to-br from-indigo-600 to-blue-600"
        },
        {
            icon: MdStar,
            label: "Average rating",
            value: kpis.avgTourRating,
            decimals: 1,
            color: "from-amber-600 to-yellow-600",
            bgColor: "from-amber-500/10 to-yellow-500/10",
            iconBg: "bg-gradient-to-br from-amber-600 to-yellow-600"
        },
    ];

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem
                value="overview"
                className="rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden"
            >
                <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 group-hover:scale-110 transition-transform duration-200">
                            <MdBusiness className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Company Information</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">View detailed metrics and overview</p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Company Details Card */}
                        <Card className="border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 shadow-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-1 w-1 rounded-full bg-blue-600 animate-pulse" />
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Details</h4>
                                </div>
                                <div className="space-y-3">
                                    {infoItems.map((item, index) => {
                                        const Icon = item.icon;
                                        return (
                                            <motion.div
                                                key={item.label}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 group-hover:scale-110 transition-transform`}>
                                                        <Icon className={`h-4 w-4 ${item.color}`} />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                                                </div>
                                                <Badge variant="secondary" className="font-mono text-xs px-3 py-1 bg-slate-100 dark:bg-slate-700/50 border-0">
                                                    {item.value}
                                                </Badge>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* KPIs Card */}
                        <Card className="border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-1 w-1 rounded-full bg-purple-600 animate-pulse" />
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Key Metrics</h4>
                                </div>
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
                            </CardContent>
                        </Card>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

interface KpiProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    decimals?: number;
    color: string;
    bgColor: string;
    iconBg: string;
    delay?: number;
}

function Kpi({ icon: Icon, label, value, decimals = 0, color, bgColor, iconBg, delay = 0 }: KpiProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.3 }}
            className={`relative overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-br ${bgColor} p-4 hover:shadow-md transition-all duration-200 group hover:scale-105`}
        >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 blur-2xl" />
            <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                        <CountUp end={value} decimals={decimals} duration={1.5} separator="," />
                    </div>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight">
                    {label}
                </div>
            </div>
        </motion.div>
    );
}