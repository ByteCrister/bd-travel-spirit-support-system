"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    MdStar,
    MdStarHalf,
    MdLocalOffer,
    MdLocationOn,
    MdLanguage,
    MdOutlineMonetizationOn,
    MdVerified,
    MdGroups,
    MdFavorite,
    MdShare,
    MdVisibility,
    MdAccessTime,
    MdOutlineHelp,
    MdOutlineInfo,
    MdCheckCircle,
    MdWarning,
    MdLocationCity,
    MdTimer,
    MdRestaurant,
} from "react-icons/md";
import {
    FaClipboardList,
    FaWheelchair,
    FaSnowflake,
} from "react-icons/fa";
import {
    FileText,        // Draft
    Send,            // Submitted
    CheckCircle,     // Active/Approved
    PlayCircle,      // Active (alternative)
    CircleCheck,     // Completed
    XCircle,         // Terminated/Denied
    Archive,         // Archived
    Clock,           // Pending
    PauseCircle,
    CheckCircle2,     // Suspended
} from "lucide-react";
import AllDetailsSkeleton from "./skeletons/TourDetailPageSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    TOUR_STATUS,
    MODERATION_STATUS,
} from "@/constants/tour.const";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { useTourApproval } from "@/store/tour-approval.store";
import { ConfirmApproveDialog } from "../ConfirmApproveDialog";
import { RejectDialog } from "../RejectDialog";

type Props = {
    tourId: string;
};

const getBreadCrumbs = (tourId: string, title: string) => {
    return [
        { label: "Home", href: `/` },
        { label: "Tour Approval", href: `/support/tours` },
        { label: title, href: `/support/tours/${tourId}` },
    ]
}

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

// Status configurations
const STATUS_CONFIG = {
    [TOUR_STATUS.DRAFT]: {
        gradient: "from-slate-400 to-slate-500",
        text: "Draft",
        icon: <FileText className="w-4 h-4" />
    },
    [TOUR_STATUS.SUBMITTED]: {
        gradient: "from-amber-500 to-orange-500",
        text: "Submitted",
        icon: <Send className="w-4 h-4" />
    },
    [TOUR_STATUS.ACTIVE]: {
        gradient: "from-emerald-500 to-teal-500",
        text: "Active",
        icon: <PlayCircle className="w-4 h-4" />
    },
    [TOUR_STATUS.COMPLETED]: {
        gradient: "from-blue-500 to-indigo-500",
        text: "Completed",
        icon: <CircleCheck className="w-4 h-4" />
    },
    [TOUR_STATUS.TERMINATED]: {
        gradient: "from-rose-500 to-pink-500",
        text: "Terminated",
        icon: <XCircle className="w-4 h-4" />
    },
    [TOUR_STATUS.ARCHIVED]: {
        gradient: "from-gray-500 to-gray-600",
        text: "Archived",
        icon: <Archive className="w-4 h-4" />
    },
};

const MODERATION_CONFIG = {
    [MODERATION_STATUS.PENDING]: {
        gradient: "from-amber-400 to-orange-500",
        text: "Pending",
        icon: <Clock className="w-4 h-4" />
    },
    [MODERATION_STATUS.APPROVED]: {
        gradient: "from-emerald-400 to-green-500",
        text: "Approved",
        icon: <CheckCircle className="w-4 h-4" />
    },
    [MODERATION_STATUS.DENIED]: {
        gradient: "from-red-400 to-rose-500",
        text: "Denied",
        icon: <XCircle className="w-4 h-4" />
    },
    [MODERATION_STATUS.SUSPENDED]: {
        gradient: "from-yellow-400 to-amber-500",
        text: "Suspended",
        icon: <PauseCircle className="w-4 h-4" />
    },
};

export default function TourDetailPage({ tourId }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {
        fetchTourById,
        getFromTourCache,
        setSelectedTour,
        isProcessing,
        selectedTour,
        isLoading,
        error
    } = useTourApproval();

    // Get tour from cache FIRST, then check selectedTour
    const cachedTour = getFromTourCache(tourId);
    const tour = cachedTour || (selectedTour?.id === tourId ? selectedTour : null);

    const [approveOpenFor, setApproveOpenFor] = useState<string | null>(null);
    const [rejectOpenFor, setRejectOpenFor] = useState<string | null>(null);

    useEffect(() => {
        const loadTour = async () => {
            // On initial load, always try cache first
            if (isInitialLoad) {
                setIsInitialLoad(false);

                // If we have cached data, use it immediately
                if (cachedTour) {
                    setSelectedTour(cachedTour);
                }

                // Then fetch fresh data in background
                await fetchTourById(tourId, false);
                return;
            }

            // Subsequent loads, use normal logic
            await fetchTourById(tourId, false);
        };

        loadTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourId]);

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

    const formatCurrency = (amount?: number, currency = "BDT") => {
        if (amount === undefined || amount === null) return "—";
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    };

    // Get primary price from basePrice or priceSummary
    const pricePrimary = useMemo(() => {
        if (!tour) return null;
        if (tour.priceSummary?.minAmount) {
            return {
                amount: tour.priceSummary.discountedAmount ?? tour.priceSummary.minAmount,
                currency: tour.priceSummary.currency
            };
        }
        return tour.basePrice;
    }, [tour]);

    // Get duration display
    const durationDisplay = useMemo(() => {
        if (!tour?.duration) return "—";
        const { days, nights } = tour.duration;
        if (nights) return `${days} days, ${nights} nights`;
        return `${days} days`;
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
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<MdStar key={`empty-${i}`} className="text-gray-300" />);
        }
        return stars;
    };

    const handleRetry = useCallback(async () => {
        await fetchTourById(tourId, true); // Force skip cache
    }, [fetchTourById, tourId]);

    if (isLoading && !tour) {
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
                            onClick={handleRetry}
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
            <Breadcrumbs className="p-5" items={getBreadCrumbs(tourId, tour.title ?? "-")} />
            {/* Hero Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10 pointer-events-none z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                    {/* Hero Section */}
                    <motion.div variants={fadeInUp}>
                        <div className="relative group">
                            {/* Main Hero Image */}
                            <motion.div
                                className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Image
                                    src={tour.heroImage ?? "https://placehold.co/1200x800.png"}
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

                                    <motion.div
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <ModerationPill status={tour.moderationStatus} />
                                    </motion.div>

                                    {tour.featured && (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 px-3 py-1.5 shadow-lg">
                                                <MdVerified className="mr-1" /> Featured
                                            </Badge>
                                        </motion.div>
                                    )}

                                    {tour.hasActiveDiscount && (
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 px-3 py-1.5 shadow-lg">
                                                <MdLocalOffer className="mr-1" /> Discount
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
                                            Starting from
                                        </div>
                                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                                            {pricePrimary ? formatCurrency(pricePrimary.amount, pricePrimary.currency) : "—"}
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
                                            <span>{durationDisplay}</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Gallery Strip */}
                            {tour.gallery && tour.gallery.length > 0 && (
                                <motion.div
                                    variants={fadeInUp}
                                    className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
                                >
                                    {tour.gallery.slice(0, 6).map((url, idx) => (
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

                    {/* Booking Section */}
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
                                                {tour.basePrice ? formatCurrency(tour.basePrice.amount, tour.basePrice.currency) : "—"}
                                            </div>
                                            {tour.priceSummary?.discountedAmount && (
                                                <div className="text-lg text-slate-400 line-through">
                                                    {formatCurrency(tour.priceSummary.minAmount, tour.basePrice.currency)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-500 mt-1">per person</div>
                                    </div>

                                    {/* Availability */}
                                    {tour.bookingSummary && (
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-2 mb-1">
                                                <MdGroups className="text-violet-600" />
                                                <span className="text-xs font-medium text-slate-500 uppercase">Availability</span>
                                            </div>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {tour.bookingSummary.availableSeats}
                                            </div>
                                            <div className="text-xs text-slate-500">of {tour.bookingSummary.totalSeats} seats</div>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {tour.bookingSummary && (
                                    <div className="mb-6">
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${tour.bookingSummary.occupancyPercentage}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                                            />
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {tour.bookingSummary.bookedSeats} bookings made
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
                                                    key={d.code || idx}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1 * idx }}
                                                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold shadow-lg"
                                                >
                                                    {d.code ? `${d.code} · ` : ""}{d.value}% OFF
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons - Side by side on desktop, stacked on mobile */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                                    <Button
                                        onClick={() => setApproveOpenFor(tourId)}
                                        disabled={isProcessing}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all py-3 text-sm sm:text-base"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => setRejectOpenFor(tourId)}
                                        disabled={isProcessing}
                                        className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-md hover:shadow-lg transition-all py-3 text-sm sm:text-base"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>

                                {/* Next Departure */}
                                {tour.nextDeparture && (
                                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                                        <div className="flex items-center gap-2 text-xs">
                                            <MdAccessTime className="text-amber-600" />
                                            <span className="text-slate-600 dark:text-slate-300">
                                                Next departure: <span className="font-bold text-amber-700 dark:text-amber-400">
                                                    {formatDate(tour.nextDeparture)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Pickup Options */}
                                {tour.pickupOptions && tour.pickupOptions.length > 0 && (
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
                                                        <span className="font-semibold text-violet-600">
                                                            {formatCurrency(p.price, p.currency)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Title & Actions */}
                <motion.header variants={fadeInUp} className="mb-12">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-0 px-3 py-1">
                                    {tour.tourType}
                                </Badge>
                                {tour.categories && tour.categories.length > 0 && (
                                    <Badge variant="outline" className="border-violet-300 text-violet-600">
                                        {tour.categories[0]}
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                                {tour.title}
                            </h1>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-6">
                                <MdLocationOn className="text-violet-600" />
                                <span className="font-medium">
                                    {tour.district}, {tour.division}
                                </span>
                            </div>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center gap-6">
                                {tour.ratings && (
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <div className="flex">
                                            {renderStars(tour.ratings.average)}
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {tour.ratings.average?.toFixed(1) ?? "—"}
                                        </span>
                                        <span className="text-slate-500">({tour.ratings.count ?? 0})</span>
                                    </motion.div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <MdVisibility className="text-cyan-600" />
                                    <span className="font-semibold">{tour.viewCount}</span>
                                    <span>views</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <MdFavorite className="text-red-500" />
                                    <span className="font-semibold">{tour.wishlistCount}</span>
                                    <span>wishlist</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <MdShare className="text-blue-500" />
                                    <span className="font-semibold">{tour.shareCount}</span>
                                    <span>shares</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">

                            {/* <Button
                                variant="ghost"

                                size="lg"
                                asChild
                                className="rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30"
                            >
                                <Link href={`/companies/${companyId}/tours/${tour.id}/edit`}>
                                    Edit Tour
                                </Link>
                            </Button> */}

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
                                    <p className="leading-relaxed">{tour.summary || "No summary provided."}</p>
                                </div>

                                {/* Key Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-950/20 dark:to-cyan-950/20">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Difficulty</div>
                                        <div className="font-bold text-slate-900 dark:text-white">{tour.difficulty}</div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Duration</div>
                                        <div className="font-bold text-slate-900 dark:text-white">{durationDisplay}</div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Age Suitability</div>
                                        <div className="font-bold text-slate-900 dark:text-white">{tour.ageSuitability}</div>
                                    </div>
                                </div>

                                {/* Best Season */}
                                {tour.bestSeason && tour.bestSeason.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Best Season</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.bestSeason.map((season, i) => (
                                                <motion.div
                                                    key={season}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.05 * i }}
                                                >
                                                    <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border-0 px-4 py-2 text-sm">
                                                        <FaSnowflake className="mr-2" />
                                                        {season}
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

                                {/* Includes & Excludes */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {tour.inclusions && tour.inclusions.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">
                                                What&apos;s Included
                                            </h3>
                                            <div className="space-y-2">
                                                {tour.inclusions.slice(0, 5).map((inc, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                                        <MdCheckCircle className="text-emerald-600 flex-shrink-0" />
                                                        <span className="text-slate-700 dark:text-slate-300">{inc.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {tour.exclusions && tour.exclusions.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-3 uppercase tracking-wider">
                                                What&apos;s Excluded
                                            </h3>
                                            <div className="space-y-2">
                                                {tour.exclusions.slice(0, 5).map((exc, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 text-sm">
                                                        <MdWarning className="text-rose-600 flex-shrink-0" />
                                                        <span className="text-slate-700 dark:text-slate-300">{exc.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Tabs Section */}
                        <motion.div variants={fadeInUp}>
                            <Tabs defaultValue="itinerary" className="w-full">
                                <TabsList className="grid grid-cols-5">
                                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                                    <TabsTrigger value="destinations">Destinations</TabsTrigger>
                                    <TabsTrigger value="packing">Packing</TabsTrigger>
                                    <TabsTrigger value="policies">Policies</TabsTrigger>
                                    <TabsTrigger value="details">Details</TabsTrigger>
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
                                                            Day {it.day}
                                                        </div>

                                                        <div className="ml-6">
                                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                                                {it.title || `Day ${it.day}`}
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
                                                                        <MdRestaurant className="text-amber-600" />
                                                                        <span className="text-slate-700 dark:text-slate-300">
                                                                            {it.mealsProvided.join(", ")}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                                {it.travelMode && (
                                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80">
                                                                        <span className="font-semibold text-blue-600">🚌</span>
                                                                        <span className="text-slate-700 dark:text-slate-300">{it.travelMode}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {it.activities && it.activities.length > 0 && (
                                                                <div className="mb-4">
                                                                    <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Activities:</h5>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {it.activities.map((act, i) => (
                                                                            <Badge key={i} variant="outline" className="border-violet-300 text-violet-700 dark:text-violet-300">
                                                                                {act}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {it.importantNotes && it.importantNotes.length > 0 && (
                                                                <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                                                                    <h5 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Important Notes:</h5>
                                                                    <ul className="text-xs text-amber-600 dark:text-amber-300 space-y-1">
                                                                        {it.importantNotes.map((note, i) => (
                                                                            <li key={i}>• {note}</li>
                                                                        ))}
                                                                    </ul>
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

                                <TabsContent value="destinations">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        {tour.destinations && tour.destinations.length > 0 ? (
                                            <div className="space-y-8">
                                                {tour.destinations.map((dest, idx) => {
                                                    const destinationImages = dest.imageIds || [];

                                                    return (
                                                        <motion.div
                                                            key={dest.id || idx}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 * idx }}
                                                            className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700"
                                                        >
                                                            {/* Destination Header with Images */}
                                                            <div className="mb-6">
                                                                <div className="flex flex-col lg:flex-row gap-6">
                                                                    {/* Destination Images */}
                                                                    {destinationImages.length > 0 && (
                                                                        <div className="lg:w-1/3">
                                                                            <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
                                                                                Destination Photos
                                                                            </h5>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                {destinationImages.slice(0, 4).map((img, imgIdx) => (
                                                                                    <motion.div
                                                                                        key={img.id || imgIdx}
                                                                                        whileHover={{ scale: 1.05 }}
                                                                                        whileTap={{ scale: 0.95 }}
                                                                                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                                                                                        onClick={() => setSelectedImage(img.url)}
                                                                                    >
                                                                                        <Image
                                                                                            src={img.url}
                                                                                            alt={`Destination ${idx + 1} - Image ${imgIdx + 1}`}
                                                                                            fill
                                                                                            className="object-cover"
                                                                                        />
                                                                                        {imgIdx === 3 && destinationImages.length > 4 && (
                                                                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                                                                <span className="text-white font-bold text-sm">
                                                                                                    +{destinationImages.length - 4} more
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </motion.div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Destination Details */}
                                                                    <div className={destinationImages.length > 0 ? "lg:w-2/3" : "w-full"}>
                                                                        {dest.description && (
                                                                            <p className="text-slate-700 dark:text-slate-300 mb-4">
                                                                                {dest.description}
                                                                            </p>
                                                                        )}

                                                                        {dest.highlights && dest.highlights.length > 0 && (
                                                                            <div className="mb-4">
                                                                                <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                                                                    Highlights
                                                                                </h5>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {dest.highlights.map((h, i) => (
                                                                                        <Badge
                                                                                            key={i}
                                                                                            className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border-0"
                                                                                        >
                                                                                            {h}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Coordinates */}
                                                                        {dest.coordinates && (
                                                                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                                                <div className="text-xs text-slate-500 mb-1">Coordinates</div>
                                                                                <div className="text-sm font-mono text-violet-600">
                                                                                    {dest.coordinates.lat.toFixed(6)}, {dest.coordinates.lng.toFixed(6)}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Activities */}
                                                            {dest.activities && dest.activities.length > 0 && (
                                                                <div className="mb-8">
                                                                    <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                                                        Activities
                                                                    </h5>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                        {dest.activities.map((activity, actIdx) => (
                                                                            <motion.div
                                                                                key={activity.title + actIdx}
                                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ delay: 0.05 * actIdx }}
                                                                                className="p-4 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                                                                            >
                                                                                <div className="font-bold text-slate-900 dark:text-white mb-2">
                                                                                    {activity.title}
                                                                                </div>

                                                                                {activity.provider && (
                                                                                    <div className="text-xs text-slate-500 mb-2">
                                                                                        Provider: {activity.provider}
                                                                                    </div>
                                                                                )}

                                                                                {activity.duration && (
                                                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                                                                        <MdTimer className="text-blue-600" />
                                                                                        <span>{activity.duration}</span>
                                                                                    </div>
                                                                                )}

                                                                                {activity.price && (
                                                                                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                                        {formatCurrency(activity.price.amount, activity.price.currency)}
                                                                                    </div>
                                                                                )}

                                                                                {activity.rating && (
                                                                                    <div className="flex items-center gap-2 mt-2">
                                                                                        <div className="flex">
                                                                                            {renderStars(activity.rating)}
                                                                                        </div>
                                                                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                                            {activity.rating.toFixed(1)}
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                {activity.url && (
                                                                                    <a
                                                                                        href={activity.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                                    >
                                                                                        View Details →
                                                                                    </a>
                                                                                )}
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Attractions */}
                                                            {dest.attractions && dest.attractions.length > 0 && (
                                                                <div>
                                                                    <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                                                        Attractions
                                                                    </h5>
                                                                    <div className="space-y-6">
                                                                        {dest.attractions.map((attr, attrIdx) => {
                                                                            const attractionImages = attr.imageIds || [];

                                                                            return (
                                                                                <motion.div
                                                                                    key={attr.id || attrIdx}
                                                                                    initial={{ opacity: 0, x: -20 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ delay: 0.05 * attrIdx }}
                                                                                    className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                                                                                >
                                                                                    <div className="flex flex-col lg:flex-row gap-6">
                                                                                        {/* Attraction Images */}
                                                                                        {attractionImages.length > 0 && (
                                                                                            <div className="lg:w-1/4">
                                                                                                <div className="space-y-3">
                                                                                                    {attractionImages.slice(0, 3).map((img, imgIdx) => (
                                                                                                        <motion.div
                                                                                                            key={img.id || imgIdx}
                                                                                                            whileHover={{ scale: 1.05 }}
                                                                                                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-sm"
                                                                                                            onClick={() => setSelectedImage(img.url)}
                                                                                                        >
                                                                                                            <Image
                                                                                                                src={img.url}
                                                                                                                alt={`${attr.title} - Image ${imgIdx + 1}`}
                                                                                                                fill
                                                                                                                className="object-cover"
                                                                                                            />
                                                                                                        </motion.div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}

                                                                                        {/* Attraction Details */}
                                                                                        <div className={attractionImages.length > 0 ? "lg:w-3/4" : "w-full"}>
                                                                                            <div className="mb-3">
                                                                                                <h6 className="font-bold text-lg text-slate-900 dark:text-white">
                                                                                                    {attr.title}
                                                                                                </h6>

                                                                                                {attr.bestFor && (
                                                                                                    <div className="inline-block ml-2 px-2 py-1 text-xs bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                                                                                                        Best for: {attr.bestFor}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>

                                                                                            {attr.description && (
                                                                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                                                                    {attr.description}
                                                                                                </p>
                                                                                            )}

                                                                                            {attr.insiderTip && (
                                                                                                <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-900">
                                                                                                    <div className="flex items-start gap-2">
                                                                                                        <div className="text-amber-600 dark:text-amber-400 mt-0.5">
                                                                                                            💡
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                                                                                                                Insider Tip
                                                                                                            </div>
                                                                                                            <div className="text-sm text-amber-600 dark:text-amber-400">
                                                                                                                {attr.insiderTip}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Attraction Details Grid */}
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                                                                {attr.address && (
                                                                                                    <div>
                                                                                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                                                                            Address
                                                                                                        </div>
                                                                                                        <div className="text-sm text-slate-700 dark:text-slate-300">
                                                                                                            {attr.address}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}

                                                                                                {attr.openingHours && (
                                                                                                    <div>
                                                                                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                                                                            Opening Hours
                                                                                                        </div>
                                                                                                        <div className="text-sm text-slate-700 dark:text-slate-300">
                                                                                                            {attr.openingHours}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}

                                                                                                {attr.coordinates && (
                                                                                                    <div>
                                                                                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                                                                            Coordinates
                                                                                                        </div>
                                                                                                        <div className="text-sm font-mono text-violet-600">
                                                                                                            {attr.coordinates.lat.toFixed(6)}, {attr.coordinates.lng.toFixed(6)}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </motion.div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Image Modal for this destination */}
                                                            <AnimatePresence>
                                                                {selectedImage && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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
                                                                                alt="Full size image"
                                                                                fill
                                                                                className="object-contain"
                                                                            />
                                                                            <button
                                                                                onClick={() => setSelectedImage(null)}
                                                                                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg"
                                                                            >
                                                                                ✕
                                                                            </button>

                                                                            {/* Navigation buttons if there are multiple images */}
                                                                            {(() => {
                                                                                const allImages = [
                                                                                    ...destinationImages,
                                                                                    ...(dest.attractions || []).flatMap(attr => attr.imageIds || [])
                                                                                ];
                                                                                const currentIndex = allImages.findIndex(img => img.url === selectedImage);

                                                                                if (allImages.length > 1) {
                                                                                    return (
                                                                                        <>
                                                                                            {currentIndex > 0 && (
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        setSelectedImage(allImages[currentIndex - 1].url);
                                                                                                    }}
                                                                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg"
                                                                                                >
                                                                                                    ←
                                                                                                </button>
                                                                                            )}
                                                                                            {currentIndex < allImages.length - 1 && (
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        setSelectedImage(allImages[currentIndex + 1].url);
                                                                                                    }}
                                                                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-lg"
                                                                                                >
                                                                                                    →
                                                                                                </button>
                                                                                            )}
                                                                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-sm">
                                                                                                {currentIndex + 1} / {allImages.length}
                                                                                            </div>
                                                                                        </>
                                                                                    );
                                                                                }
                                                                                return null;
                                                                            })()}
                                                                        </motion.div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-500">
                                                No destinations information available.
                                            </div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="packing">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        {tour.packingList && tour.packingList.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-3">Required Items</h4>
                                                        <ul className="space-y-3">
                                                            {tour.packingList.filter(p => p.required).map((p, idx) => (
                                                                <motion.li
                                                                    key={idx}
                                                                    initial={{ x: -20, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.05 * idx }}
                                                                    className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20"
                                                                >
                                                                    <MdCheckCircle className="text-emerald-600 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <div className="font-semibold text-slate-900 dark:text-white">
                                                                            {p.item}
                                                                        </div>
                                                                        {p.notes && (
                                                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                                                {p.notes}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-3">Recommended Items</h4>
                                                        <ul className="space-y-3">
                                                            {tour.packingList.filter(p => !p.required).map((p, idx) => (
                                                                <motion.li
                                                                    key={idx}
                                                                    initial={{ x: -20, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    transition={{ delay: 0.05 * idx }}
                                                                    className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20"
                                                                >
                                                                    <FaClipboardList className="text-blue-600 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <div className="font-semibold text-slate-900 dark:text-white">
                                                                            {p.item}
                                                                        </div>
                                                                        {p.notes && (
                                                                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                                                {p.notes}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </motion.li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-500">No packing list provided.</div>
                                        )}
                                    </Card>
                                </TabsContent>

                                <TabsContent value="policies">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        <div className="space-y-8">
                                            {/* Cancellation Policy */}
                                            {tour.cancellationPolicy && (
                                                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20">
                                                    <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                                        <MdWarning className="text-xl" />
                                                        Cancellation Policy
                                                    </h4>

                                                    <div className="mb-6">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-slate-600 dark:text-slate-400">Refundable:</span>
                                                            <Badge className={tour.cancellationPolicy.refundable ? "bg-emerald-500" : "bg-rose-500"}>
                                                                {tour.cancellationPolicy.refundable ? "Yes" : "No"}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {tour.cancellationPolicy.rules && tour.cancellationPolicy.rules.length > 0 && (
                                                        <div>
                                                            <h5 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Cancellation Rules:</h5>
                                                            <div className="space-y-3">
                                                                {tour.cancellationPolicy.rules.map((rule, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-slate-800/50">
                                                                        <div>
                                                                            <span className="font-medium text-slate-900 dark:text-white">
                                                                                {rule.daysBefore} days before
                                                                            </span>
                                                                            <div className="text-xs text-slate-500">
                                                                                Get {rule.refundPercent}% refund
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-2xl font-bold text-emerald-600">
                                                                            {rule.refundPercent}%
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Refund Policy */}
                                            {tour.refundPolicy && (
                                                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
                                                    <h4 className="text-xl font-bold text-violet-700 dark:text-violet-400 mb-4">
                                                        Refund Policy
                                                    </h4>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-600 dark:text-slate-400">Processing Time:</span>
                                                            <span className="font-bold text-slate-900 dark:text-white">
                                                                {tour.refundPolicy.processingDays} days
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-600 dark:text-slate-400">Payment Methods:</span>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {tour.refundPolicy.method.map((method, idx) => (
                                                                    <Badge key={idx} variant="outline" className="border-violet-300 text-violet-700 dark:text-violet-300">
                                                                        {method}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Terms */}
                                            {tour.terms && (
                                                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-900">
                                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                                        Terms & Conditions
                                                    </h4>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        {tour.terms}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="details">
                                    <Card className="p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800">
                                        <div className="space-y-8">
                                            {/* SEO Information */}
                                            {tour.seo && (
                                                <div>
                                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">SEO Information</h4>
                                                    <div className="space-y-4">
                                                        {tour.seo.metaTitle && (
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                                    Meta Title
                                                                </div>
                                                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 font-medium">
                                                                    {tour.seo.metaTitle}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {tour.seo.metaDescription && (
                                                            <div>
                                                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                                                    Meta Description
                                                                </div>
                                                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                                    {tour.seo.metaDescription}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Translations */}
                                            {tour.translations && (
                                                <div>
                                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                                        <MdLanguage className="text-xl" />
                                                        Translations
                                                    </h4>
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        {tour.translations.bn && (
                                                            <div className="p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-900/50">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                                                        বাংলা
                                                                    </Badge>
                                                                </div>
                                                                {tour.translations.bn.title && (
                                                                    <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                                                                        {tour.translations.bn.title}
                                                                    </h5>
                                                                )}
                                                                {tour.translations.bn.summary && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                        {tour.translations.bn.summary}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {tour.translations.en && (
                                                            <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/50">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                                        English
                                                                    </Badge>
                                                                </div>
                                                                {tour.translations.en.title && (
                                                                    <h5 className="font-bold text-slate-900 dark:text-white mb-2">
                                                                        {tour.translations.en.title}
                                                                    </h5>
                                                                )}
                                                                {tour.translations.en.summary && (
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                        {tour.translations.en.summary}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* System Information */}
                                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">System Information</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                        <div className="text-xs text-slate-500 mb-1">Created</div>
                                                        <div className="font-medium text-slate-900 dark:text-white">
                                                            {formatDate(tour.createdAt)}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                        <div className="text-xs text-slate-500 mb-1">Updated</div>
                                                        <div className="font-medium text-slate-900 dark:text-white">
                                                            {formatDate(tour.updatedAt)}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                        <div className="text-xs text-slate-500 mb-1">Published</div>
                                                        <div className="font-medium text-slate-900 dark:text-white">
                                                            {tour.publishedAt ? formatDate(tour.publishedAt) : "—"}
                                                        </div>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                        <div className="text-xs text-slate-500 mb-1">Author ID</div>
                                                        <div className="font-medium text-slate-900 dark:text-white truncate">
                                                            {tour.authorId}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
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
                                        {tour.district}, {tour.division}
                                    </div>
                                    {tour.mainLocation?.address && (
                                        <>
                                            {tour.mainLocation.address.line1 && (
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {tour.mainLocation.address.line1}
                                                </div>
                                            )}
                                            {tour.mainLocation.address.line2 && (
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {tour.mainLocation.address.line2}
                                                </div>
                                            )}
                                            <div className="text-sm text-slate-500">
                                                {tour.mainLocation.address.city && `${tour.mainLocation.address.city}, `}
                                                {tour.mainLocation.address.postalCode && `${tour.mainLocation.address.postalCode}`}
                                            </div>
                                        </>
                                    )}
                                    {tour.mainLocation?.coordinates && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <div className="text-xs text-slate-500 mb-1">Coordinates</div>
                                            <div className="text-sm font-mono text-violet-600">
                                                {tour.mainLocation.coordinates.lat.toFixed(6)}, {tour.mainLocation.coordinates.lng.toFixed(6)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Tour Features Card */}
                        <motion.div variants={fadeInUp}>
                            <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <MdCheckCircle className="text-white text-xl" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Tour Features</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Guide Included</span>
                                        <Badge className={tour.guideIncluded ? "bg-emerald-500" : "bg-rose-500"}>
                                            {tour.guideIncluded ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Transport Included</span>
                                        <Badge className={tour.transportIncluded ? "bg-emerald-500" : "bg-rose-500"}>
                                            {tour.transportIncluded ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">License Required</span>
                                        <Badge className={tour.licenseRequired ? "bg-amber-500" : "bg-slate-500"}>
                                            {tour.licenseRequired ? "Yes" : "No"}
                                        </Badge>
                                    </div>
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
                                    {tour.accessibility?.wheelchair && (
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                                            <MdCheckCircle />
                                            <span>Wheelchair Accessible</span>
                                        </div>
                                    )}
                                    {tour.accessibility?.familyFriendly && (
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                                            <MdCheckCircle />
                                            <span>Family Friendly</span>
                                        </div>
                                    )}
                                    {tour.accessibility?.petFriendly && (
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
                                            <MdCheckCircle />
                                            <span>Pet Friendly</span>
                                        </div>
                                    )}
                                    {tour.accessibility?.notes && (
                                        <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                            <div className="text-xs text-slate-500 mb-1">Notes</div>
                                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                                {tour.accessibility.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Accommodation Types */}
                        {tour.accommodationType && tour.accommodationType.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <MdLocationCity className="text-white text-xl" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Accommodation</h4>
                                    </div>
                                    <div className="space-y-2">
                                        {tour.accommodationType.map((type, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                <span className="text-slate-700 dark:text-slate-300">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Transport Modes */}
                        {tour.transportModes && tour.transportModes.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                            <MdLocationOn className="text-white text-xl" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Transport Modes</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tour.transportModes.map((mode, idx) => (
                                            <Badge key={idx} variant="outline" className="border-cyan-300 text-cyan-700 dark:text-cyan-300">
                                                {mode}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Emergency Contacts */}
                        {tour.emergencyContacts && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-6 rounded-3xl shadow-lg border-2 border-red-100 dark:border-red-900/30 bg-gradient-to-br from-red-50/50 to-white dark:from-red-950/20 dark:to-slate-900">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                                            <MdOutlineHelp className="text-white text-xl" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Emergency Contacts</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        {tour.emergencyContacts.policeNumber && (
                                            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                                <div className="text-xs text-slate-500 mb-1">Police</div>
                                                <a href={`tel:${tour.emergencyContacts.policeNumber}`} className="font-bold text-slate-900 dark:text-white hover:text-red-600">
                                                    {tour.emergencyContacts.policeNumber}
                                                </a>
                                            </div>
                                        )}
                                        {tour.emergencyContacts.ambulanceNumber && (
                                            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                                <div className="text-xs text-slate-500 mb-1">Ambulance</div>
                                                <a href={`tel:${tour.emergencyContacts.ambulanceNumber}`} className="font-bold text-slate-900 dark:text-white hover:text-red-600">
                                                    {tour.emergencyContacts.ambulanceNumber}
                                                </a>
                                            </div>
                                        )}
                                        {tour.emergencyContacts.fireServiceNumber && (
                                            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                                <div className="text-xs text-slate-500 mb-1">Fire Service</div>
                                                <a href={`tel:${tour.emergencyContacts.fireServiceNumber}`} className="font-bold text-slate-900 dark:text-white hover:text-red-600">
                                                    {tour.emergencyContacts.fireServiceNumber}
                                                </a>
                                            </div>
                                        )}
                                        {tour.emergencyContacts.localEmergency && (
                                            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80">
                                                <div className="text-xs text-slate-500 mb-1">Local Emergency</div>
                                                <a href={`tel:${tour.emergencyContacts.localEmergency}`} className="font-bold text-slate-900 dark:text-white hover:text-red-600">
                                                    {tour.emergencyContacts.localEmergency}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Payment Methods */}
                        {tour.paymentMethods && tour.paymentMethods.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <Card className="p-6 rounded-3xl shadow-lg border-2 border-emerald-100 dark:border-emerald-900/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                                            <MdOutlineMonetizationOn className="text-white text-xl" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">Payment Methods</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tour.paymentMethods.map((method, idx) => (
                                            <Badge key={idx} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                                {method}
                                            </Badge>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Audience & Categories */}
                        <motion.div variants={fadeInUp}>
                            <Card className="p-6 rounded-3xl shadow-lg border-2 border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Audience & Categories</h4>
                                <div className="space-y-4">
                                    {tour.audience && tour.audience.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audience</div>
                                            <div className="flex flex-wrap gap-2">
                                                {tour.audience.map((aud, idx) => (
                                                    <Badge key={idx} variant="outline" className="border-pink-300 text-pink-700 dark:text-pink-300">
                                                        {aud}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {tour.categories && tour.categories.length > 0 && (
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Categories</div>
                                            <div className="flex flex-wrap gap-2">
                                                {tour.categories.map((cat, idx) => (
                                                    <Badge key={idx} variant="outline" className="border-indigo-300 text-indigo-700 dark:text-indigo-300">
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
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

            <ConfirmApproveDialog
                open={approveOpenFor === tourId}
                onOpenChange={(open: boolean) => !open && setApproveOpenFor(null)}
                tourId={tourId}
                tourTitle={tour.title}
            />
            <RejectDialog
                open={rejectOpenFor === tourId}
                onOpenChange={(open: boolean) => !open && setRejectOpenFor(null)}
                tourId={tourId}
                tourTitle={tour.title}
            />
        </motion.article>
    );
}

/* ----------------------
Status and Moderation Pills
---------------------- */

function StatusPill({ status }: { status: string }) {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG[TOUR_STATUS.DRAFT];

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white font-semibold text-xs shadow-lg flex items-center gap-2`}
        >
            {config.icon}
            <span>{config.text}</span>
        </motion.div>
    );
}

function ModerationPill({ status }: { status: string }) {
    const config = MODERATION_CONFIG[status as keyof typeof MODERATION_CONFIG];

    if (!config) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white font-semibold text-xs shadow-lg flex items-center gap-2`}
        >
            {config.icon}
            <span>{config.text}</span>
        </motion.div>
    );
}