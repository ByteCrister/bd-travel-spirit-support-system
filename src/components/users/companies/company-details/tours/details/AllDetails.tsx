"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdStar,
    MdStarHalf,
    MdQuestionAnswer,
    MdLocalOffer,
    MdLocationOn,
    MdLanguage,
    MdOutlineMonetizationOn,
    MdVerified,
    MdTrendingUp,
    MdGroups,
    MdFavorite,
    MdShare,
    MdVisibility,
    MdPlayCircle,
    MdAccessTime,
    MdOutlineHelp,
    MdOutlineInfo,
    MdCheckCircle,
    MdWarning,
    MdCalendarToday,
    MdLocationCity,
    MdTimer,
} from "react-icons/md";
import {
    FaUserFriends,
    FaClipboardList,
    FaWheelchair,
    FaSnowflake,
} from "react-icons/fa";
import { useCompanyDetailStore } from "@/store/company-detail.store";
import AllDetailsSkeleton from "./skeletons/AllDetailsSkeleton";
import { TourDetailDTO, TourPriceOptionDTO } from "@/types/tour.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Props = { companyId: string; tourId: string, setBredCrumbs: (items: { label: string; href: string; }[]) => void };

const tourDetailLoadingKey = (id: string) => `tourDetail:${id}`;
const tourDetailErrorKey = (id: string) => `tourDetailError:${id}`;

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};


export default function AllDetails({ companyId, tourId, setBredCrumbs }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isBookmarkHovered, setIsBookmarkHovered] = useState(false);

    const fetchTourDetail = useCompanyDetailStore((s) => s.fetchTourDetail);
    const tour = useCompanyDetailStore((s) => s.tourDetails?.[tourId] ?? null) as TourDetailDTO | null;
    const loading = useCompanyDetailStore((s) => Boolean(s.loading[tourDetailLoadingKey(tourId)]));
    const error = useCompanyDetailStore((s) => s.error[tourDetailErrorKey(tourId)]);

    const load = useCallback(
        async (force = false) => {
            try {
                const fetchedTour = await fetchTourDetail(companyId, tourId, force);
                if (fetchedTour?.owner && fetchedTour?.title) {
                    setBredCrumbs([
                        { label: fetchedTour.owner, href: `/users/companies/${companyId}` },
                        { label: fetchedTour.title, href: `/users/companies/${companyId}/${tourId}` },
                    ]);
                }
            } catch {
                // store manages errors
            }
        },
        [companyId, fetchTourDetail, setBredCrumbs, tourId]
    );


    useEffect(() => {
        void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (d?: string) => {
        if (!d) return "—";
        try {
            const dt = new Date(d);
            if (Number.isNaN(dt.getTime())) return "—";
            return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return "—";
        }
    };

    const formatDateTime = (d?: string) => {
        if (!d) return "—";
        try {
            const dt = new Date(d);
            if (Number.isNaN(dt.getTime())) return "—";
            return dt.toLocaleString();
        } catch {
            return "—";
        }
    };

    const formatCurrency = (amount?: number, currency = "USD") => {
        if (amount === undefined || amount === null) return "—";
        try {
            return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    };

    const pricePrimary = useMemo<TourPriceOptionDTO | null>(() => {
        if (!tour) return null;
        if (tour.priceOptions?.length) {
            return tour.priceOptions.reduce((a, b) => (a.amount <= b.amount ? a : b));
        }
        if (tour.priceSummary) {
            return { name: "From", amount: tour.priceSummary.minAmount, currency: tour.priceSummary.currency } as TourPriceOptionDTO;
        }
        return null;
    }, [tour]);

    // Render star rating
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<MdStar key={`full-${i}`} className="text-yellow-400" />);
        }
        if (hasHalfStar) {
            stars.push(<MdStarHalf key="half" className="text-yellow-400" />);
        }
        return stars;
    };

    if (loading && !tour) {
        return (
            <div className="rounded-2xl overflow-hidden">
                <AllDetailsSkeleton />
            </div>
        );
    }

    if (error && !tour) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto"
            >
                <Card className="p-8 rounded-2xl border-2 border-red-100 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-slate-900">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <MdWarning className="text-3xl text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                            Unable to load tour
                        </h3>
                        <p className="text-sm text-red-600 dark:text-red-300 mb-6">{String(error)}</p>
                        <Button
                            onClick={() => void load(true)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        >
                            Try Again
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    if (!tour) {
        return (
            <Card className="p-12 text-center rounded-2xl">
                <div className="text-slate-400 text-lg">Tour not found.</div>
            </Card>
        );
    }

    return (
        <motion.article
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl overflow-hidden shadow-sm"
        >
            {/* Hero Section with Glass Morphism */}
            <div className="relative">
                {/* Background Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10 pointer-events-none z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                    {/* Hero Section (full width, top) */}
                    <motion.div variants={fadeInUp}>
                        <div className="relative group">
                            {/* Main Hero Image */}
                            <motion.div
                                className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Image
                                    src={tour.heroImageUrl ?? "https://placehold.co/1200x800.png"}
                                    alt={tour.title}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                    priority
                                />

                                {/* Gradient Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                                {/* Status Badges */}
                                <div className="absolute left-6 top-6 flex items-center gap-3 z-20">
                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <StatusPill status={tour.status} />
                                    </motion.div>

                                    {tour.featured && (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-3 py-1.5 shadow-lg">
                                                <MdVerified className="mr-1" /> Featured
                                            </Badge>
                                        </motion.div>
                                    )}

                                    {tour.trendingUntil && (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 px-3 py-1.5 shadow-lg">
                                                <MdTrendingUp className="mr-1" /> Trending
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Price & Duration Cards */}
                                <div className="absolute right-6 top-6 flex flex-col items-end gap-3 z-20">
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 px-4 py-3 rounded-2xl shadow-xl border border-white/20"
                                    >
                                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                                            {pricePrimary?.name ?? "Price"}
                                        </div>
                                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                                            {pricePrimary ? formatCurrency(pricePrimary.amount, pricePrimary.currency ?? "USD") : "—"}
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 px-4 py-2 rounded-2xl shadow-xl border border-white/20"
                                    >
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <MdTimer className="text-violet-600" />
                                            <span>{tour.durationDays ?? "—"} days</span>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Video/Virtual Tour Button */}
                                {(tour.videoUrls?.[0] || tour.virtualTourUrl) && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="absolute left-6 bottom-6 z-20"
                                    >
                                        <Link
                                            href={tour.videoUrls?.[0] ?? tour.virtualTourUrl ?? "#"}
                                            target="_blank"
                                            className="group"
                                        >
                                            <Button className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-white/20 shadow-xl px-6 py-6 rounded-2xl transition-all duration-300 hover:scale-105">
                                                <MdPlayCircle className="text-2xl mr-2 text-violet-600 group-hover:text-cyan-600 transition-colors" />
                                                <span className="font-semibold">Watch Tour</span>
                                            </Button>
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>

                            {/* Gallery Strip */}
                            {tour.galleryImageUrls?.length && (
                                <motion.div
                                    variants={fadeInUp}
                                    className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                                >
                                    {tour.galleryImageUrls.slice(0, 6).map((url, idx) => (
                                        <motion.div
                                            key={url}
                                            whileHover={{ scale: 1.05, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative w-32 h-24 rounded-2xl overflow-hidden shrink-0 shadow-lg cursor-pointer border-2 border-transparent hover:border-violet-400 transition-all"
                                            onClick={() => setSelectedImage(url)}
                                        >
                                            <Image
                                                src={url}
                                                alt={`${tour.title} ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Booking Section (below hero, full width) */}
                    <motion.div variants={fadeInUp}>
                        <div className="space-y-4">

                            {/* Main Booking Card */}
                            <Card className="p-6 rounded-3xl shadow-2xl border-2 border-violet-100 dark:border-violet-900/50 bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-800 dark:to-violet-950/20">

                                {/* Price Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                            Starting from
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                                                {pricePrimary ? formatCurrency(pricePrimary.amount, pricePrimary.currency ?? "USD") : "—"}
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">per person</div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-2 mb-1">
                                            <MdGroups className="text-violet-600" />
                                            <span className="text-xs font-medium text-slate-500 uppercase">Availability</span>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {tour.booking?.remaining ?? "—"}
                                        </div>
                                        <div className="text-xs text-slate-500">of {tour.maxGroupSize} seats</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {tour.booking?.remaining !== undefined && tour.maxGroupSize && (
                                    <div className="mb-6">
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((tour.maxGroupSize - tour.booking.remaining) / tour.maxGroupSize) * 100}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                                            />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {tour.maxGroupSize - tour.booking.remaining} bookings made
                                        </div>
                                    </div>
                                )}

                                {/* Price Options */}
                                {tour.priceOptions?.length && (
                                    <div className="mb-6">
                                        <Separator className="my-4" />
                                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                                            Pricing Options
                                        </div>
                                        <div className="space-y-2">
                                            {tour.priceOptions.map((p, idx) => (
                                                <motion.div
                                                    key={p.name}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.1 * idx }}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors cursor-pointer border border-transparent hover:border-violet-300 dark:hover:border-violet-700"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                                            <MdOutlineMonetizationOn className="text-white" />
                                                        </div>
                                                        <span className="font-medium text-sm">{p.name}</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {formatCurrency(p.amount, p.currency ?? "USD")}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Discounts */}
                                {tour.discounts && tour.discounts.length > 0 && (
                                    <div className="mb-6">
                                        <Separator className="my-4" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <MdLocalOffer className="text-amber-600" />
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Active Offers
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.discounts.map((d, idx) => (
                                                <motion.div
                                                    key={d.code}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1 * idx }}
                                                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg"
                                                >
                                                    {d.code} · {d.percentage}% OFF
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CTA Buttons */}
                                {/* <div className="space-y-3">
                                    <Button
                                        disabled={tour.booking?.isFull}
                                        size="lg"
                                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl"
                                    >
                                        {tour.booking?.isFull ? "Fully Booked" : "Book Now"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full h-12 font-semibold border-2 hover:bg-violet-50 dark:hover:bg-violet-950/30 rounded-2xl"
                                    >
                                        Check Availability
                                    </Button>
                                </div> */}

                                {/* Booking Deadline */}
                                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                                    <div className="flex items-center gap-2 text-xs">
                                        <MdAccessTime className="text-amber-600" />
                                        <span className="text-slate-600 dark:text-slate-300">
                                            Book by: <span className="font-bold text-amber-700 dark:text-amber-400">
                                                {formatDate(tour.bookingDeadline ?? tour.endDate)}
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Pickup Options */}
                                {tour.pickupOptions?.length && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MdLocationOn className="text-violet-600" />
                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                    Pickup Locations
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {tour.pickupOptions.map((p, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                                                    >
                                                        <span className="text-slate-700 dark:text-slate-300">{p.city}</span>
                                                        <span className="font-semibold text-violet-600">{formatCurrency(p.price, p.currency ?? "USD")}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>

                            {/* Host Card */}
                            {tour.host && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Card className="p-5 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                                        <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
                                            Your Host
                                        </h4>
                                        <div className="flex items-start gap-4">
                                            <div className="relative">
                                                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                    {tour.host.name?.charAt(0)?.toUpperCase() ?? "H"}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-slate-800" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-lg text-slate-900 dark:text-white">
                                                    {tour.host.name}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                    {tour.host.bio}
                                                </div>
                                                <div className="mt-3 flex items-center gap-3 text-xs">
                                                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                        <MdLanguage className="text-violet-600" />
                                                        <span>{tour.host.languagesSpoken?.slice(0, 2).join(", ") ?? "—"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 font-semibold">
                                                        <div className="flex">
                                                            {renderStars(tour.host.rating ?? 0)}
                                                        </div>
                                                        <span className="text-slate-700 dark:text-slate-300">
                                                            {tour.host.rating?.toFixed(1) ?? "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Quick Meta */}
                            <Card className="p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800">
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Created</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(tour.createdAt)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Last Updated</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(tour.updatedAt)}</span>
                                    </div>
                                </div>
                            </Card>

                        </div>
                    </motion.div>
                </div>
            </div>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title & Actions */}
                <motion.header
                    variants={fadeInUp}
                    className="mb-12"
                >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-0 px-3 py-1">
                                    {tour.category ?? "Uncategorized"}
                                </Badge>
                                {tour.subCategory && (
                                    <Badge variant="outline" className="border-violet-300 text-violet-600">
                                        {tour.subCategory}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                                {tour.title}
                            </h1>

                            {/* Date Range */}
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-6">
                                <MdCalendarToday className="text-violet-600" />
                                <span className="font-medium">
                                    {formatDate(tour.startDate)} → {formatDate(tour.endDate)}
                                </span>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <div className="flex">
                                        {renderStars(tour.averageRating ?? 0)}
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {tour.averageRating?.toFixed(1) ?? "—"}
                                    </span>
                                    <span className="text-slate-500">({tour.reviewCount ?? 0})</span>
                                </motion.div>

                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <FaUserFriends className="text-violet-600" />
                                    <span className="font-semibold">{tour.booking?.count ?? 0}</span>
                                    <span>bookings</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <MdVisibility className="text-cyan-600" />
                                    <span className="font-semibold">{tour.viewCount ?? 0}</span>
                                    <span>views</span>
                                </div>

                                {tour.discounts && tour.discounts.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                        <MdLocalOffer />
                                        <span className="font-semibold">{tour.discounts.length}</span>
                                        <span>active offers</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl border-2 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                                    onMouseEnter={() => setIsBookmarkHovered(true)}
                                    onMouseLeave={() => setIsBookmarkHovered(false)}
                                >
                                    <motion.div
                                        animate={{
                                            scale: isBookmarkHovered ? [1, 1.2, 1] : 1,
                                            rotate: isBookmarkHovered ? [0, -10, 10, 0] : 0
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MdFavorite className="text-red-500" />
                                    </motion.div>
                                </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-xl border-2 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                                >
                                    <MdShare className="text-violet-600" />
                                </Button>
                            </motion.div>

                            <Button
                                variant="ghost"
                                size="lg"
                                asChild
                                className="rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30"
                            >
                                <Link href={`/companies/${companyId}/tours/${tour.id}/edit`}>
                                    Edit Tour
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Card */}
                        <motion.div variants={fadeInUp}>
                            <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                        <MdOutlineInfo className="text-white text-xl" />
                                    </div>
                                    Overview
                                </h2>

                                <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 mb-8">
                                    <p className="leading-relaxed">{tour.description || "No description provided."}</p>
                                </div>

                                {/* Key Details Grid */}
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    {tour.slug && (
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-950/20 dark:to-cyan-950/20">
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Slug</div>
                                            <div className="font-bold text-slate-900 dark:text-white">{tour.slug}</div>
                                        </div>
                                    )}

                                    {tour.difficulty && (
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Difficulty</div>
                                            <div className="font-bold text-slate-900 dark:text-white">{tour.difficulty}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Highlights */}
                                {tour.highlights && tour.highlights.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Highlights</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.highlights.map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.05 * i }}
                                                >
                                                    <Badge className="bg-gradient-to-r from-violet-100 to-cyan-100 dark:from-violet-900/30 dark:to-cyan-900/30 text-violet-700 dark:text-violet-300 border-0 px-4 py-2 text-sm">
                                                        <MdCheckCircle className="mr-2" />
                                                        {h}
                                                    </Badge>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {tour.tags && tour.tags.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.tags.map((t) => (
                                                <div key={t} className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                                    #{t}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Includes & Important Info */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {tour.includes && tour.includes.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">What&apos;s Included</h3>
                                            <div className="space-y-2">
                                                {tour.includes.slice(0, 5).map((inc) => (
                                                    <div key={inc.label} className="flex items-center gap-3 text-sm">
                                                        <MdCheckCircle className="text-emerald-600 flex-shrink-0" />
                                                        <span className="text-slate-700 dark:text-slate-300">{inc.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {tour.importantInfo && tour.importantInfo.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-wider">Important Info</h3>
                                            <div className="space-y-2">
                                                {tour.importantInfo.slice(0, 5).map((i, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                                        <MdWarning className="text-amber-600 flex-shrink-0" />
                                                        <span className="text-slate-700 dark:text-slate-300">{i}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-8" />

                                {/* Additional Details */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    {tour.travelTypes && tour.travelTypes.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Travel Types</div>
                                            <div className="font-medium text-slate-900 dark:text-white">{tour.travelTypes.join(", ")}</div>
                                        </div>
                                    )}

                                    {tour.audience && tour.audience.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audience</div>
                                            <div className="font-medium text-slate-900 dark:text-white">{tour.audience.join(", ")}</div>
                                        </div>
                                    )}

                                    {tour.bestSeason && tour.bestSeason.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Best Season</div>
                                            <div className="font-medium text-slate-900 dark:text-white">{tour.bestSeason.join(", ")}</div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Meeting Points */}
                        {tour.meetingPoints && tour.meetingPoints.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                                            <MdLocationOn className="text-white text-xl" />
                                        </div>
                                        Meeting Points
                                    </h3>
                                    <div className="space-y-4">
                                        {tour.meetingPoints.map((m, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 * i }}
                                                className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-slate-100 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{m.title}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">{m.description}</p>
                                                    </div>
                                                    <div className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                                                        {formatDateTime(m.time)}
                                                    </div>
                                                </div>
                                                {m.location?.address && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <MdLocationCity />
                                                        <span>{m.location.address}</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Tabs Section */}
                        <motion.div variants={fadeInUp}>
                            <Tabs defaultValue="itinerary" className="w-full">

                                <TabsList>
                                    <TabsTrigger value="itinerary" className="w-full flex items-center justify-center px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 ease-in-out box-border hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 data-[state=active]:shadow-md">
                                        Itinerary
                                    </TabsTrigger>

                                    <TabsTrigger value="roadmap" className="w-full flex items-center justify-center px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 ease-in-out box-border hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 data-[state=active]:shadow-md">
                                        Roadmap
                                    </TabsTrigger>

                                    <TabsTrigger value="packing" className="w-full flex items-center justify-center px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 ease-in-out box-border hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 data-[state=active]:shadow-md">
                                        Packing
                                    </TabsTrigger>

                                    <TabsTrigger value="policies" className="w-full flex items-center justify-center px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 ease-in-out box-border hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 data-[state=active]:shadow-md">
                                        Policies
                                    </TabsTrigger>

                                    <TabsTrigger value="seo" className="w-full flex items-center justify-center px-3 py-2 min-h-[44px] rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 ease-in-out box-border hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 data-[state=active]:shadow-md">
                                        SEO
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="itinerary">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        {tour.itinerary && tour.itinerary.length > 0 ? (
                                            <div className="space-y-6">
                                                {tour.itinerary.map((it, idx) => (
                                                    <motion.div
                                                        key={it.day}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 * idx }}
                                                        className="relative p-6 rounded-2xl bg-gradient-to-br from-violet-50/50 to-cyan-50/50 dark:from-violet-950/20 dark:to-cyan-950/20 border-2 border-violet-100 dark:border-violet-900/30"
                                                    >
                                                        <div className="absolute -left-4 top-6 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                                                            {it.day}
                                                        </div>

                                                        <div className="ml-6">
                                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                                                Day {it.day}: {it.title}
                                                            </h4>

                                                            {it.description && (
                                                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                                                    {it.description}
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap gap-4 text-sm mb-4">
                                                                {it.accommodation && (
                                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80">
                                                                        <span className="font-semibold text-violet-600">🏨</span>
                                                                        <span className="text-slate-700 dark:text-slate-300">{it.accommodation}</span>
                                                                    </div>
                                                                )}

                                                                {it.mealsProvided && it.mealsProvided.length > 0 && (
                                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80">
                                                                        <span className="font-semibold text-amber-600">🍽️</span>
                                                                        <span className="text-slate-700 dark:text-slate-300">{it.mealsProvided.join(", ")}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {it.activities && it.activities.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mb-4">
                                                                    {it.activities.map((act) => (
                                                                        <Badge key={act} variant="outline" className="border-violet-300 text-violet-700 dark:text-violet-300">
                                                                            {act}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {it.imageUrls && it.imageUrls.length > 0 && (
                                                                <div className="flex gap-3 mt-4">
                                                                    {it.imageUrls.slice(0, 3).map((u) => (
                                                                        <div key={u} className="relative w-32 h-24 rounded-xl overflow-hidden shadow-lg">
                                                                            <Image src={u} alt={it.title} fill className="object-cover" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-500">No itinerary available.</div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="roadmap">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        {tour.roadMap && tour.roadMap.length > 0 ? (
                                            <div className="space-y-4">
                                                {tour.roadMap.map((r, idx) => (
                                                    <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
                                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{r.title}</h4>
                                                        {r.description && <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">{r.description}</p>}
                                                        {r.imageUrl && (
                                                            <div className="relative w-full h-48 rounded-xl overflow-hidden">
                                                                <Image src={r.imageUrl} alt={r.title} fill className="object-cover" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-500">No roadmap provided.</div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="packing">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        {tour.packingList && tour.packingList.length > 0 ? (
                                            <ul className="space-y-3">
                                                {tour.packingList.map((p, idx) => (
                                                    <motion.li
                                                        key={idx}
                                                        initial={{ x: -20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.05 * idx }}
                                                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                    >
                                                        <div className={clsx("mt-1 text-xl", p.required ? "text-emerald-600" : "text-slate-400")}>
                                                            <FaClipboardList />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                                {p.item}
                                                                {p.required && <span className="ml-2 text-xs text-emerald-600 font-bold">(REQUIRED)</span>}
                                                            </div>
                                                            {p.notes && <div className="text-sm text-slate-500 mt-1">{p.notes}</div>}
                                                        </div>
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-center py-12 text-slate-500">No packing suggestions.</div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="policies">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Cancellation & Refund Policy</h4>

                                        <div className="space-y-6">
                                            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20">
                                                <h5 className="font-bold text-emerald-700 dark:text-emerald-400 mb-4">Cancellation Terms</h5>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-600 dark:text-slate-400">Free cancellation until</span>
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            {formatDate(tour.cancellationPolicy?.freeCancellationUntil)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-600 dark:text-slate-400">Refund percentage</span>
                                                        <span className="font-bold text-emerald-600">{tour.cancellationPolicy?.refundPercentage ?? "—"}%</span>
                                                    </div>
                                                </div>
                                                {tour.cancellationPolicy?.notes && (
                                                    <p className="text-xs text-slate-500 mt-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                                        {tour.cancellationPolicy.notes}
                                                    </p>
                                                )}
                                            </div>

                                            {tour.refundPolicy && (
                                                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                                                    <h5 className="font-bold text-violet-700 dark:text-violet-400 mb-4">Refund Information</h5>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-600 dark:text-slate-400">Methods</span>
                                                            <span className="font-bold text-slate-900 dark:text-white">
                                                                {(tour.refundPolicy.method ?? []).join(", ") || "—"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-600 dark:text-slate-400">Processing time</span>
                                                            <span className="font-bold text-violet-600">{tour.refundPolicy.processingDays ?? "—"} days</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {tour.ageRestriction && (
                                                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                                    <h5 className="font-bold text-amber-700 dark:text-amber-400 mb-4">Age Requirements</h5>
                                                    <div className="text-center">
                                                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                                            {tour.ageRestriction.minAge} - {tour.ageRestriction.maxAge} years
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="seo">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-6">SEO & Translations</h4>

                                        <div className="space-y-6">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">SEO Title</div>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 font-medium">
                                                    {tour.seoTitle ?? "—"}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">SEO Description</div>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                    {tour.seoDescription ?? "—"}
                                                </div>
                                            </div>

                                            {tour.translations && tour.translations.length > 0 && (
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Available Translations</div>
                                                    <div className="space-y-4">
                                                        {tour.translations.map((t) => (
                                                            <div key={t.language} className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="px-3 py-1 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-bold">
                                                                            {t.language.toUpperCase()}
                                                                        </div>
                                                                        <h5 className="font-bold text-slate-900 dark:text-white">{t.title ?? "—"}</h5>
                                                                    </div>
                                                                </div>
                                                                {t.summary && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{t.summary}</p>
                                                                )}
                                                                {t.content && (
                                                                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                                                                        {t.content.map((c, i) =>
                                                                            c.type === "paragraph" ? (
                                                                                <p key={i}>{c.text}</p>
                                                                            ) : c.type === "link" ? (
                                                                                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 underline">
                                                                                    {c.text}
                                                                                </a>
                                                                            ) : null
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </motion.div>

                        {/* FAQs */}
                        {tour.faqs && tour.faqs.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                            <MdQuestionAnswer className="text-white text-xl" />
                                        </div>
                                        Frequently Asked Questions
                                    </h3>
                                    <div className="space-y-4">
                                        {tour.faqs.map((f, idx) => (
                                            <motion.div
                                                key={f.question + String(f.order)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 * idx }}
                                                className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                                                        Q
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{f.question}</h4>
                                                </div>
                                                <div className="ml-9">
                                                    {f.isAnswered && f.answer ? (
                                                        <p className="text-slate-600 dark:text-slate-400">{f.answer}</p>
                                                    ) : (
                                                        <p className="text-sm text-amber-600 dark:text-amber-400 italic">Awaiting answer...</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <aside className="lg:col-span-1 space-y-6">
                        {/* Location Card */}
                        <motion.div variants={fadeInUp}>
                            <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                                        <MdLocationOn className="text-white text-xl" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Location</h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="font-bold text-lg text-slate-900 dark:text-white">
                                        {tour.mainLocation?.address?.city ?? "—"}
                                    </div>
                                    {tour.mainLocation?.address?.line1 && (
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {tour.mainLocation.address.line1}
                                        </div>
                                    )}
                                    <div className="text-sm text-slate-500">
                                        {tour.mainLocation?.address?.district ?? ""} {tour.mainLocation?.address?.region && `• ${tour.mainLocation.address.region}`}
                                    </div>
                                    {tour.mainLocation?.coordinates && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <div className="text-xs text-slate-500 mb-1">Coordinates</div>
                                            <div className="text-sm font-mono text-violet-600">
                                                {String(tour.mainLocation.coordinates.coordinates[1])}, {String(tour.mainLocation.coordinates.coordinates[0])}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Accessibility Card */}
                        <motion.div variants={fadeInUp}>
                            <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                        <FaWheelchair className="text-white text-xl" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Accessibility</h4>
                                </div>
                                <div className="space-y-3">
                                    {tour.accessibilityFeatures?.includes("Wheelchair accessible") ? (
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <MdCheckCircle />
                                            <span>Wheelchair Accessible</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-500">Limited accessibility</div>
                                    )}
                                    {tour.accessibilityRating && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                                            <div className="text-xs text-slate-500 mb-1">Rating</div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {tour.accessibilityRating}/5
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Safety Card */}
                        {tour.healthAndSafety && tour.healthAndSafety.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <MdOutlineHelp className="text-white text-xl" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Health & Safety</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {tour.healthAndSafety.slice(0, 3).map((h, i) => (
                                            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                                                    {h.title}
                                                </h5>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    {h.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Seasonal Highlights */}
                        {tour.seasonalHighlights && tour.seasonalHighlights.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                                            <FaSnowflake className="text-white text-xl" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Seasonal</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {tour.seasonalHighlights.map((s, i) => (
                                            <div key={i} className="flex gap-3">
                                                {s.imageUrl ? (
                                                    <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                                                        <Image src={s.imageUrl} alt={s.season ?? `Season ${i}`} fill className="object-cover" />
                                                    </div>
                                                ) : null}
                                                <div className="flex-1">
                                                    <div className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                                                        {s.season}
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                                        {s.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Engagement Stats */}
                        <motion.div variants={fadeInUp}>
                            <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800 bg-gradient-to-br from-violet-50/50 to-cyan-50/50 dark:from-violet-950/20 dark:to-cyan-950/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                        <MdTrendingUp className="text-white text-xl" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Engagement</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                        <div className="flex items-center gap-2 text-violet-600 mb-1">
                                            <MdVisibility />
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {tour.viewCount ?? 0}
                                        </div>
                                        <div className="text-xs text-slate-500">Views</div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                        <div className="flex items-center gap-2 text-red-500 mb-1">
                                            <MdFavorite />
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {tour.likeCount ?? 0}
                                        </div>
                                        <div className="text-xs text-slate-500">Likes</div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                                            <MdStar />
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {tour.wishlistCount ?? 0}
                                        </div>
                                        <div className="text-xs text-slate-500">Wishlist</div>
                                    </div>

                                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                        <div className="flex items-center gap-2 text-cyan-600 mb-1">
                                            <MdShare />
                                        </div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {tour.shareCount ?? 0}
                                        </div>
                                        <div className="text-xs text-slate-500">Shares</div>
                                    </div>
                                </div>

                                {tour.popularityScore !== undefined && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="text-xs text-slate-500 mb-2">Popularity Score</div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(tour.popularityScore * 10, 100)}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                                                />
                                            </div>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                {tour.popularityScore.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>

                        {/* Emergency Contact */}
                        <motion.div variants={fadeInUp}>
                            <Card className="p-6 rounded-3xl shadow-lg border-2 border-red-100 dark:border-red-900/30 bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/20 dark:to-slate-900">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                                        <MdOutlineHelp className="text-white text-xl" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Emergency</h4>
                                </div>
                                <div className="space-y-3 text-sm">
                                    {tour.emergencyContact?.phone && (
                                        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                            <div className="text-xs text-slate-500 mb-1">Phone</div>
                                            <a href={`tel:${tour.emergencyContact.phone}`} className="font-bold text-slate-900 dark:text-white hover:text-violet-600">
                                                {tour.emergencyContact.phone}
                                            </a>
                                        </div>
                                    )}
                                    {tour.emergencyContact?.email && (
                                        <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                            <div className="text-xs text-slate-500 mb-1">Email</div>
                                            <a href={`mailto:${tour.emergencyContact.email}`} className="font-bold text-slate-900 dark:text-white hover:text-violet-600 break-all">
                                                {tour.emergencyContact.email}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {tour.weatherTips && tour.weatherTips.length > 0 && (
                                    <>
                                        <Separator className="my-4" />
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Weather Tips</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                                {tour.weatherTips.map((tip, idx) => (
                                                    <div key={idx} className="flex items-start gap-2">
                                                        <span className="text-cyan-600 mt-0.5">•</span>
                                                        <span>{tip}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </motion.div>
                    </aside>
                </div>
            </div>

            {/* Image Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative max-w-5xl w-full h-[80vh] rounded-3xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={selectedImage}
                                alt="Gallery image"
                                fill
                                className="object-contain"
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg"
                            >
                                ✕
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    );
}

/* ----------------------
Small presentational components
---------------------- */

function StatusPill({ status }: { status: string }) {
    const configs = {
        published: {
            gradient: "from-emerald-500 to-teal-500",
            text: "Published",
            icon: "✓"
        },
        archived: {
            gradient: "from-rose-500 to-pink-500",
            text: "Archived",
            icon: "⊗"
        },
        draft: {
            gradient: "from-slate-400 to-slate-500",
            text: "Draft",
            icon: "○"
        }
    };

    const config = configs[status as keyof typeof configs] || configs.draft;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white font-bold text-sm shadow-lg flex items-center gap-2`}
        >
            <span>{config.icon}</span>
            <span>{config.text}</span>
        </motion.div>
    );
}