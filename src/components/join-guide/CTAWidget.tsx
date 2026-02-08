// components/join-guide/CTAWidget.tsx
import React from "react";
import { FiUsers, FiGlobe, FiTrendingUp } from "react-icons/fi";
import type { LandingPageData } from "@/types/guide/join-as-guide.types";
import { MotionDiv } from "@/components/global/motion-elements";
import CountUpStat from "@/components/global/CountUpStat";

export default function CTAWidget({ data }: { data: LandingPageData }) {
    const cardVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MotionDiv
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-4">
                    <FiUsers className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                    <CountUpStat end={data.whyPartner.activeGuides ?? 0} duration={2} separator="," suffix="+" />
                </div>
                <div className="text-sm text-slate-300">Active Guides</div>
            </MotionDiv>

            <MotionDiv
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.6 }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-4">
                    <FiGlobe className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                    <CountUpStat end={data.hero.totalDestinations ?? 0} duration={2} separator="," suffix="+" />
                </div>
                <div className="text-sm text-slate-300">Destinations</div>
            </MotionDiv>

            <MotionDiv
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.7 }}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 sm:col-span-3 lg:col-span-1"
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4">
                    <FiTrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                    <CountUpStat end={data.whyPartner.monthlyVisitors ?? 0} duration={2} separator="," suffix="+" />
                </div>
                <div className="text-sm text-slate-300">Monthly Visitors</div>
            </MotionDiv>
        </div>
    );
}
