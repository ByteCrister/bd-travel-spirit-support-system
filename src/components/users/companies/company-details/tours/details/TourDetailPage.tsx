"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  FaInfoCircle,
  FaStar,
  FaFlag,
  FaQuestionCircle,
  FaCalendar,
} from "react-icons/fa";

import AllDetails from "./AllDetails";
import ReviewsPanel from "./ReviewsPanel";
import ReportsPanel from "./ReportsPanel";
import TourFaqsPanel from "./TourFaqsPanel";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import TourBookingsPanel from "./TourBookingsPanel";

// ─── Neumorphism Design Tokens ────────────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";

const NEU_SURFACE_RAISED =
  "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";

const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";

const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_TAB_ACTIVE =
  "bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "rounded-xl transition-all duration-200";

const NEU_TAB_INACTIVE =
  "bg-[#E7E5E4] text-[#1E2938]/60 font-[family-name:var(--font-space-mono)] " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "rounded-xl transition-all duration-200";

const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

// ─────────────────────────────────────────────────────────────────────────────

type Props = { companyId: string; tourId: string };

export default function TourDetailPage({ companyId, tourId }: Props) {
  const [tab, setTab] = useState<string>("details");
  const [breadcrumbItems, setBreadcrumbItems] = useState<
    { label: string; href: string }[]
  >([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash?.replace("#", "");
    if (hash) setTab(hash);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setTab(value);
  }, []);

  const handleBreadcrumbItems = (items: { label: string; href: string }[]) => {
    setBreadcrumbItems(items);
  };

  const tabs = [
    {
      value: "details",
      label: "All Details",
      icon: <FaInfoCircle className="w-3.5 h-3.5" />,
    },
    {
      value: "bookings",
      label: "Bookings",
      icon: <FaCalendar className="w-3.5 h-3.5" />,
    },
    {
      value: "reviews",
      label: "Reviews",
      icon: <FaStar className="w-3.5 h-3.5" />,
    },
    {
      value: "reports",
      label: "Reports",
      icon: <FaFlag className="w-3.5 h-3.5" />,
    },
    {
      value: "faqs",
      label: "FAQs",
      icon: <FaQuestionCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className={`${NEU_PAGE_BG} px-4 py-6 lg:px-8 lg:py-10`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} className="pb-2" />

        {/* Hero Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`${NEU_CARD} p-6 sm:p-8`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={NEU_ICON_WELL_PRIMARY}>
                <FaInfoCircle className="w-6 h-6 text-[#006666]" />
              </div>
              <div>
                <h1 className={`${NEU_HEADING} text-2xl sm:text-3xl`}>
                  Tour Overview
                </h1>
                <p className={`${NEU_MUTED} mt-1`}>
                  Manage details, reviews, reports, and FAQs for this tour.
                </p>
              </div>
            </div>

            {/* Decorative teal accent bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-10 rounded-full bg-[#006666] opacity-20" />
              <div className="w-2 h-14 rounded-full bg-[#006666] opacity-40" />
              <div className="w-2 h-10 rounded-full bg-[#006666] opacity-20" />
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            {/* Tab List */}
            <div className={`${NEU_SURFACE_RAISED} rounded-2xl p-2`}>
              <TabsList className="flex flex-wrap sm:grid sm:grid-cols-5 gap-2 bg-transparent p-0 h-auto w-full">
                {tabs.map(({ value, label, icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={`
                                            relative flex items-center justify-center gap-2
                                            px-3 py-2.5 text-xs sm:text-sm
                                            ${tab === value ? NEU_TAB_ACTIVE : NEU_TAB_INACTIVE}
                                        `}
                  >
                    {icon}
                    <span className="hidden xs:inline sm:inline">{label}</span>
                    <span className="inline xs:hidden sm:hidden">
                      {label.split(" ")[0]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              <TabsContent value="details">
                <AllDetails
                  companyId={companyId}
                  tourId={tourId}
                  handleBreadcrumbItems={handleBreadcrumbItems}
                />
              </TabsContent>
              <TabsContent value="bookings">
                <TourBookingsPanel companyId={companyId} tourId={tourId} />
              </TabsContent>
              <TabsContent value="reviews">
                <ReviewsPanel companyId={companyId} tourId={tourId} />
              </TabsContent>
              <TabsContent value="reports">
                <ReportsPanel companyId={companyId} tourId={tourId} />
              </TabsContent>
              <TabsContent value="faqs">
                <TourFaqsPanel companyId={companyId} tourId={tourId} active />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
