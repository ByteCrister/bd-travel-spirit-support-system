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
    MdPerson,
    MdBusiness,
} from "react-icons/md";
import {
    FaClipboardList,
    FaWheelchair,
    FaSnowflake,
} from "react-icons/fa";
import {
    FileText,
    Send,
    CheckCircle,
    PlayCircle,
    CircleCheck,
    XCircle,
    Archive,
    Clock,
    PauseCircle,
    CheckCircle2,
    Hotel,
    Bus,
    Lightbulb,
    X,
} from "lucide-react";
import AllDetailsSkeleton from "./skeletons/TourDetailPageSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    TOUR_STATUS,
    MODERATION_STATUS,
    TOUR_DISCOUNT_TYPE,
    CURRENCY,
    Currency,
} from "@/constants/tour.const";
import { Breadcrumbs } from "@/components/global/Breadcrumbs";
import { useTourApproval } from "@/store/tour-approval.store";
import { ConfirmApproveDialog } from "./ConfirmApproveDialog";
import { RejectDialog } from "./RejectDialog";
import { SuspendDialog } from "./SuspendDialog";
import { UnsuspendDialog } from "./UnsuspendDialog";
import { DiscountDTO, PriceDTO } from "@/types/tour/tour.types";
import { formatCurrency } from "@/utils/helpers/format";

// ── Neumorphism Design Tokens ─────────────────────────────────

// Surface
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_SURFACE = "bg-[#E7E5E4]";

const NEU_SURFACE_INSET =
    "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

// Cards
const NEU_CARD =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
    "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
    "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";

// Buttons
const NEU_BTN_PRIMARY =
    "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_GHOST =
    "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
    "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

const NEU_BTN_DANGER =
    "rounded-xl bg-[#E7E5E4] text-[#FF2157] font-[family-name:var(--font-space-mono)] " +
    "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
    "hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
    "transition-all duration-200";

// Badges
const NEU_BADGE =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#E7E5E4] text-[#1E2938] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_PRIMARY =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_SUCCESS =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#00A63D]/10 text-[#00A63D] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_WARNING =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FE9900]/10 text-[#FE9900] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_BADGE_DANGER =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
    "bg-[#FF2157]/10 text-[#FF2157] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

// Typography
const NEU_HEADING =
    "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

// Icon well
const NEU_ICON_WELL =
    "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
const NEU_ICON_WELL_PRIMARY =
    "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";

// Divider
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Types ─────────────────────────────────────────────────────
type Props = {
    tourId: string;
};

// ── Helpers ───────────────────────────────────────────────────
const getBreadCrumbs = (tourId: string, title: string) => [
    { label: "Home", href: `/` },
    { label: "Tour Approval", href: `/support/tours` },
    { label: title, href: `/support/tours/${tourId}` },
];

// ── Animation Variants ────────────────────────────────────────
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

// ── Status Configurations ─────────────────────────────────────
const STATUS_CONFIG = {
    [TOUR_STATUS.DRAFT]: {
        badge: NEU_BADGE,
        text: "Draft",
        icon: <FileText className="w-3.5 h-3.5" />,
    },
    [TOUR_STATUS.SUBMITTED]: {
        badge: NEU_BADGE_WARNING,
        text: "Submitted",
        icon: <Send className="w-3.5 h-3.5" />,
    },
    [TOUR_STATUS.ACTIVE]: {
        badge: NEU_BADGE_SUCCESS,
        text: "Active",
        icon: <PlayCircle className="w-3.5 h-3.5" />,
    },
    [TOUR_STATUS.COMPLETED]: {
        badge: NEU_BADGE_PRIMARY,
        text: "Completed",
        icon: <CircleCheck className="w-3.5 h-3.5" />,
    },
    [TOUR_STATUS.TERMINATED]: {
        badge: NEU_BADGE_DANGER,
        text: "Terminated",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
    [TOUR_STATUS.ARCHIVED]: {
        badge: NEU_BADGE,
        text: "Archived",
        icon: <Archive className="w-3.5 h-3.5" />,
    },
};

const MODERATION_CONFIG = {
    [MODERATION_STATUS.PENDING]: {
        badge: NEU_BADGE_WARNING,
        text: "Pending",
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    [MODERATION_STATUS.APPROVED]: {
        badge: NEU_BADGE_SUCCESS,
        text: "Approved",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    [MODERATION_STATUS.DENIED]: {
        badge: NEU_BADGE_DANGER,
        text: "Denied",
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
    [MODERATION_STATUS.SUSPENDED]: {
        badge: NEU_BADGE_WARNING,
        text: "Suspended",
        icon: <PauseCircle className="w-3.5 h-3.5" />,
    },
};

// ── Price / Discount Helpers ──────────────────────────────────
const calculateFinalPrice = (basePrice: PriceDTO, discounts?: DiscountDTO[]): PriceDTO => {
    if (!discounts || discounts.length === 0) return basePrice;
    let finalAmount = basePrice.amount;
    discounts.forEach((discount) => {
        if (discount.type === TOUR_DISCOUNT_TYPE.PERCENTAGE) {
            finalAmount = finalAmount * (1 - discount.value / 100);
        } else if (discount.type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT) {
            finalAmount = finalAmount - discount.value;
        }
    });
    return { amount: Math.max(0, finalAmount), currency: basePrice.currency };
};

const hasActiveDiscount = (discounts?: DiscountDTO[]): boolean =>
    !!(discounts && discounts.length > 0);

const formatDiscountValue = (discount: DiscountDTO): string =>
    discount.type === TOUR_DISCOUNT_TYPE.PERCENTAGE
        ? `${discount.value}% OFF`
        : `${formatCurrency(discount.value)} OFF`;

const formatDiscountBadgeText = (discount: DiscountDTO): string => {
    const valueText = formatDiscountValue(discount);
    return discount.code ? `${discount.code} · ${valueText}` : valueText;
};

const getDiscountDisplayInfo = (basePrice: PriceDTO, discounts?: DiscountDTO[]) => {
    const hasDiscount = hasActiveDiscount(discounts);
    const finalPrice = calculateFinalPrice(basePrice, discounts);
    const totalDiscountPercent = hasDiscount
        ? Math.round(((basePrice.amount - finalPrice.amount) / basePrice.amount) * 100)
        : 0;
    return {
        hasDiscount,
        finalPrice,
        originalPrice: basePrice,
        totalDiscountPercent,
        isDiscounted: finalPrice.amount < basePrice.amount,
    };
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
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
        error,
    } = useTourApproval();

    const cachedTour = getFromTourCache(tourId);
    const tour = cachedTour || (selectedTour?.id === tourId ? selectedTour : null);

    const [approveOpenFor, setApproveOpenFor] = useState<string | null>(null);
    const [rejectOpenFor, setRejectOpenFor] = useState<string | null>(null);
    const [suspendOpenFor, setSuspendOpenFor] = useState<string | null>(null);
    const [unsuspendOpenFor, setUnsuspendOpenFor] = useState<string | null>(null);

    useEffect(() => {
        const loadTour = async () => {
            if (isInitialLoad) {
                setIsInitialLoad(false);
                if (cachedTour) setSelectedTour(cachedTour);
                await fetchTourById(tourId, false);
                return;
            }
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
            return dt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "—";
        }
    };

    const formatCurrency = (amount?: number, currency: Currency = CURRENCY.BDT) => {
        if (amount === undefined || amount === null) return "—";
        try {
            return new Intl.NumberFormat(undefined, {
                style: "currency",
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `${amount} ${currency}`;
        }
    };

    const getAvailableActions = useMemo(() => {
        if (!tour)
            return {
                showApprove: false,
                showReject: false,
                showSuspend: false,
                showUnsuspend: false,
            };
        const isTourActive = tour.status === TOUR_STATUS.ACTIVE;
        const isModerationPending = tour.moderationStatus === MODERATION_STATUS.PENDING;
        const isModerationApproved = tour.moderationStatus === MODERATION_STATUS.APPROVED;
        const isModerationSuspended = tour.moderationStatus === MODERATION_STATUS.SUSPENDED;
        const isModerationDenied = tour.moderationStatus === MODERATION_STATUS.DENIED;
        return {
            showApprove: isModerationPending,
            showReject: isModerationPending,
            showSuspend: isTourActive && isModerationApproved,
            showUnsuspend: isTourActive && isModerationSuspended,
            isDisabled: isModerationDenied,
        };
    }, [tour]);

    const priceInfo = useMemo(() => {
        if (!tour) return null;
        return getDiscountDisplayInfo(tour.basePrice, tour.discounts);
    }, [tour]);

    const durationDisplay = useMemo(() => {
        if (!tour?.duration) return "—";
        const { days, nights } = tour.duration;
        if (nights) return `${days}D / ${nights}N`;
        return `${days} days`;
    }, [tour]);

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 0; i < fullStars; i++)
            stars.push(<MdStar key={`full-${i}`} className="text-[#FE9900]" />);
        if (hasHalfStar)
            stars.push(<MdStarHalf key="half" className="text-[#FE9900]" />);
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++)
            stars.push(<MdStar key={`empty-${i}`} className="text-[#1E2938]/20" />);
        return stars;
    };

    const handleRetry = useCallback(async () => {
        await fetchTourById(tourId, true);
    }, [fetchTourById, tourId]);

    const renderSuspensionDetails = () => {
        if (!tour?.suspension || tour.moderationStatus !== MODERATION_STATUS.SUSPENDED)
            return null;
        const suspension = tour.suspension;
        const isAllTime = suspension.isAllTime;
        const endAt = isAllTime ? "Indefinite" : formatDate(suspension.endAt);

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-5 rounded-2xl ${NEU_SURFACE_INSET_SM} border border-[#FE9900]/30`}
            >
                <div className="flex items-start gap-3">
                    <div className={`${NEU_ICON_WELL} text-[#FE9900]`}>
                        <PauseCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className={`${NEU_HEADING} text-base text-[#FE9900] mb-2`}>
                            Tour Suspended
                        </h3>
                        <div className="space-y-1.5 text-sm">
                            <p className={NEU_MUTED}>
                                <span className="font-semibold text-[#1E2938]/70">Reason:</span>{" "}
                                {suspension.reason}
                            </p>
                            <p className={NEU_MUTED}>
                                <span className="font-semibold text-[#1E2938]/70">Duration:</span>{" "}
                                {isAllTime
                                    ? "Indefinite suspension"
                                    : `${formatDate(suspension.startAt)} → ${endAt}`}
                            </p>
                            <p className={NEU_MUTED}>
                                <span className="font-semibold text-[#1E2938]/70">Suspended by:</span>{" "}
                                {suspension.suspendedBy.name}
                            </p>
                            {suspension.notes && (
                                <p className={NEU_MUTED}>
                                    <span className="font-semibold text-[#1E2938]/70">Notes:</span>{" "}
                                    {suspension.notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // ── Loading / Error / Empty States ──────────────────────────
    if (isLoading && !tour) {
        return (
            <div className={`${NEU_PAGE_BG} rounded-2xl overflow-hidden p-4`}>
                <AllDetailsSkeleton />
            </div>
        );
    }

    if (error && !tour) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`max-w-lg mx-auto p-8 ${NEU_CARD} text-center`}
            >
                <div className={`mx-auto mb-5 w-14 h-14 ${NEU_SURFACE_INSET} rounded-full flex items-center justify-center`}>
                    <MdWarning className="text-[#FF2157] text-2xl" />
                </div>
                <h3 className={`${NEU_HEADING} text-xl mb-2`}>Unable to load tour</h3>
                <p className={`${NEU_MUTED} mb-6`}>{String(error)}</p>
                <button
                    onClick={handleRetry}
                    className={`${NEU_BTN_PRIMARY} px-6 py-2.5 text-sm`}
                >
                    Try Again
                </button>
            </motion.div>
        );
    }

    if (!tour) {
        return (
            <div className={`${NEU_CARD} p-12 text-center`}>
                <p className={NEU_MUTED}>Tour not found.</p>
            </div>
        );
    }

    return (
        <motion.article
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className={`${NEU_PAGE_BG} rounded-3xl overflow-hidden`}
        >
            {/* Breadcrumbs */}
            <div className={`px-5 pt-5 pb-2 ${NEU_SURFACE}`}>
                <Breadcrumbs items={getBreadCrumbs(tourId, tour.title ?? "-")} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

                {/* Suspension Banner */}
                {renderSuspensionDetails()}

                {/* ── Hero Section ──────────────────────────── */}
                <motion.section variants={fadeInUp}>
                    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[500px] rounded-2xl overflow-hidden shadow-[12px_12px_24px_#c8c6c5,-4px_-4px_12px_#ffffff]">
                        <Image
                            src={tour.heroImage ?? "https://placehold.co/1200x800.png"}
                            alt={tour.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E2938]/70 via-transparent to-[#1E2938]/20" />

                        {/* Status Badges — top left */}
                        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2 z-20">
                            <StatusPill status={tour.status} />
                            <ModerationPill status={tour.moderationStatus} />
                            {tour.featured && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className={`${NEU_BADGE_WARNING} gap-1`}
                                >
                                    <MdVerified className="text-sm" /> Featured
                                </motion.span>
                            )}
                            {priceInfo?.hasDiscount && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className={NEU_BADGE_DANGER}
                                >
                                    <MdLocalOffer /> Discount
                                </motion.span>
                            )}
                        </div>

                        {/* Price + Duration — top right */}
                        <div className="absolute right-4 top-4 flex flex-col items-end gap-2 z-20">
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="px-4 py-2.5 rounded-xl bg-[#E7E5E4]/90 backdrop-blur-md shadow-[4px_4px_10px_#c8c6c5,-2px_-2px_6px_#ffffff]"
                            >
                                <p className={`${NEU_LABEL} mb-0.5`}>Starting from</p>
                                <p className={`${NEU_HEADING} text-xl text-[#006666]`}>
                                    {priceInfo
                                        ? formatCurrency(priceInfo.finalPrice.amount, priceInfo.finalPrice.currency)
                                        : "—"}
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="px-3 py-1.5 rounded-xl bg-[#E7E5E4]/90 backdrop-blur-md shadow-[3px_3px_7px_#c8c6c5,-2px_-2px_5px_#ffffff] flex items-center gap-1.5"
                            >
                                <MdTimer className="text-[#006666]" />
                                <span className={`${NEU_MONO} text-sm font-semibold`}>{durationDisplay}</span>
                            </motion.div>
                        </div>

                        {/* Title overlay — bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-[family-name:var(--font-space-mono)] leading-tight drop-shadow-lg line-clamp-2">
                                {tour.title}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1.5 text-white/80 text-sm">
                                <MdLocationOn />
                                <span>{tour.district}, {tour.division}</span>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Strip */}
                    {tour.gallery && tour.gallery.length > 0 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                            {tour.gallery.slice(0, 6).map((url, idx) => (
                                <motion.button
                                    key={url}
                                    whileHover={{ scale: 1.04, y: -3 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelectedImage(url)}
                                    className="relative w-28 h-20 sm:w-32 sm:h-24 shrink-0 rounded-xl overflow-hidden shadow-[4px_4px_8px_#c8c6c5,-2px_-2px_6px_#ffffff] hover:shadow-[6px_6px_12px_#c8c6c5,-3px_-3px_8px_#ffffff] transition-all border-2 border-transparent hover:border-[#006666]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50"
                                    aria-label={`View gallery image ${idx + 1}`}
                                >
                                    <Image
                                        src={url}
                                        alt={`${tour.title} ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.section>

                {/* ── Title / Stats Row ─────────────────────── */}
                <motion.header variants={fadeInUp}>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={NEU_BADGE_PRIMARY}>{tour.tourType}</span>
                        {tour.categories?.[0] && (
                            <span className={NEU_BADGE}>{tour.categories[0]}</span>
                        )}
                    </div>

                    {/* Stats */}
                    <div className={`flex flex-wrap items-center gap-4 sm:gap-6 mt-2 ${NEU_MUTED}`}>
                        {tour.ratings && (
                            <div className="flex items-center gap-1.5 text-sm">
                                <div className="flex">{renderStars(tour.ratings.average)}</div>
                                <span className={`${NEU_MONO} font-bold text-[#1E2938]`}>
                                    {tour.ratings.average?.toFixed(1) ?? "—"}
                                </span>
                                <span>({tour.ratings.count ?? 0})</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-sm">
                            <MdVisibility className="text-[#006666]" />
                            <span className="font-semibold text-[#1E2938]">{tour.viewCount}</span>
                            <span>views</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <MdFavorite className="text-[#FF2157]" />
                            <span className="font-semibold text-[#1E2938]">{tour.wishlistCount}</span>
                            <span>wishlist</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <MdShare className="text-[#006666]" />
                            <span className="font-semibold text-[#1E2938]">{tour.shareCount}</span>
                            <span>shares</span>
                        </div>
                    </div>
                </motion.header>

                {/* ── Main Grid ─────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Left Column ───────────────────────── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Overview Card */}
                        <motion.div variants={fadeInUp}>
                            <div className={`p-6 sm:p-8 ${NEU_CARD}`}>
                                <h2 className={`${NEU_HEADING} text-xl flex items-center gap-3 mb-6`}>
                                    <span className={`${NEU_ICON_WELL_PRIMARY} text-[#006666]`}>
                                        <MdOutlineInfo className="text-xl" />
                                    </span>
                                    Overview
                                </h2>

                                <p className={`${NEU_MONO} leading-relaxed mb-8 text-[#1E2938]/80`}>
                                    {tour.summary || "No summary provided."}
                                </p>

                                {/* Key Details Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { label: "Difficulty", value: tour.difficulty },
                                        { label: "Duration", value: durationDisplay },
                                        { label: "Age", value: tour.ageSuitability },
                                    ].map((item) => (
                                        <div key={item.label} className={`p-4 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                            <p className={`${NEU_LABEL} mb-1.5`}>{item.label}</p>
                                            <p className={`${NEU_HEADING} text-sm`}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Best Season */}
                                {tour.bestSeason && tour.bestSeason.length > 0 && (
                                    <div className="mb-8">
                                        <p className={`${NEU_LABEL} mb-3`}>Best Season</p>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.bestSeason.map((season, i) => (
                                                <motion.span
                                                    key={season}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.05 * i }}
                                                    className={`${NEU_BADGE_PRIMARY} gap-1.5 px-3 py-1`}
                                                >
                                                    <FaSnowflake className="text-xs" />
                                                    {season}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {tour.tags && tour.tags.length > 0 && (
                                    <div className="mb-8">
                                        <p className={`${NEU_LABEL} mb-3`}>Tags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {tour.tags.map((t) => (
                                                <span key={t} className={`${NEU_BADGE} cursor-pointer hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] transition-all`}>
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Includes & Excludes */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    {tour.inclusions && tour.inclusions.length > 0 && (
                                        <div>
                                            <p className={`${NEU_LABEL} text-[#00A63D] mb-3`}>What&apos;s Included</p>
                                            <div className="space-y-2">
                                                {tour.inclusions.slice(0, 5).map((inc, idx) => (
                                                    <div key={idx} className="flex items-center gap-2.5 text-sm">
                                                        <MdCheckCircle className="text-[#00A63D] flex-shrink-0" />
                                                        <span className={NEU_MONO}>{inc.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {tour.exclusions && tour.exclusions.length > 0 && (
                                        <div>
                                            <p className={`${NEU_LABEL} text-[#FF2157] mb-3`}>What&apos;s Excluded</p>
                                            <div className="space-y-2">
                                                {tour.exclusions.slice(0, 5).map((exc, idx) => (
                                                    <div key={idx} className="flex items-center gap-2.5 text-sm">
                                                        <MdWarning className="text-[#FF2157] flex-shrink-0" />
                                                        <span className={NEU_MONO}>{exc.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* ── Tabs Section ──────────────────── */}
                        <motion.div variants={fadeInUp}>
                            <Tabs defaultValue="itinerary" className="w-full">
                                {/* Tab List */}
                                <div className={`p-1.5 rounded-2xl ${NEU_SURFACE_INSET} mb-4`}>
                                    <TabsList className="grid grid-cols-5 bg-transparent gap-1 h-auto p-0">
                                        {["itinerary", "destinations", "packing", "policies", "details"].map(
                                            (tab) => (
                                                <TabsTrigger
                                                    key={tab}
                                                    value={tab}
                                                    className={`capitalize text-xs sm:text-sm py-2 rounded-xl font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60 transition-all duration-200
                                                    data-[state=active]:bg-[#E7E5E4] data-[state=active]:text-[#006666] data-[state=active]:shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]
                                                    hover:text-[#1E2938] bg-transparent border-none shadow-none`}
                                                >
                                                    {tab}
                                                </TabsTrigger>
                                            )
                                        )}
                                    </TabsList>
                                </div>

                                {/* Itinerary Tab */}
                                <TabsContent value="itinerary">
                                    <div className={`p-6 sm:p-8 ${NEU_CARD}`}>
                                        {tour.itinerary && tour.itinerary.length > 0 ? (
                                            <div className="space-y-5">
                                                {tour.itinerary.map((it, idx) => {
                                                    const mealsProvided = it.mealsProvided || [];
                                                    return (<motion.div
                                                        key={it.day}
                                                        initial={{ opacity: 0, y: 15 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.08 * idx }}
                                                        className={`p-5 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-10 h-10 rounded-xl bg-[#006666] flex items-center justify-center shadow-[3px_3px_6px_#004d4d,-1px_-1px_4px_#008080] flex-shrink-0">
                                                                <span className="text-white text-xs font-bold font-[family-name:var(--font-space-mono)]">
                                                                    D{it.day}
                                                                </span>
                                                            </div>
                                                            <h4 className={`${NEU_HEADING} text-base`}>
                                                                {it.title || `Day ${it.day}`}
                                                            </h4>
                                                        </div>

                                                        {it.description && (
                                                            <p className={`${NEU_MUTED} mb-4 leading-relaxed`}>
                                                                {it.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {it.accommodation && (
                                                                <span className={`${NEU_BADGE} gap-1.5`}>
                                                                    <Hotel className="w-3 h-3" />{it.accommodation}
                                                                </span>
                                                            )}
                                                            {mealsProvided.length > 0 && (
                                                                <span className={`${NEU_BADGE} gap-1.5`}>
                                                                    <MdRestaurant className="text-sm" />
                                                                    {mealsProvided.join(", ")}
                                                                </span>
                                                            )}
                                                            {it.travelMode && (
                                                                <span className={`${NEU_BADGE} gap-1.5`}>
                                                                    <Bus className="w-3 h-3" />{it.travelMode}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {it.activities && it.activities.length > 0 && (
                                                            <div className="mb-3">
                                                                <p className={`${NEU_LABEL} mb-2`}>Activities</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {it.activities.map((act, i) => (
                                                                        <span key={i} className={NEU_BADGE_PRIMARY}>{act}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {it.importantNotes && it.importantNotes.length > 0 && (
                                                            <div className={`mt-3 p-3 rounded-lg ${NEU_SURFACE_INSET_SM} border border-[#FE9900]/20`}>
                                                                <p className={`${NEU_LABEL} text-[#FE9900] mb-1.5`}>Important Notes</p>
                                                                <ul className="space-y-1">
                                                                    {it.importantNotes.map((note, i) => (
                                                                        <li key={i} className={`${NEU_MUTED} flex items-start gap-1.5`}>
                                                                            <span className="text-[#FE9900] mt-0.5">•</span>
                                                                            {note}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </motion.div>)
                                                })}
                                            </div>
                                        ) : (
                                            <p className={`${NEU_MUTED} text-center py-10`}>No itinerary available.</p>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Destinations Tab */}
                                <TabsContent value="destinations">
                                    <div className={`p-6 sm:p-8 ${NEU_CARD}`}>
                                        {tour.destinations && tour.destinations.length > 0 ? (
                                            <div className="space-y-8">
                                                {tour.destinations.map((dest, idx) => {
                                                    const destinationImages = dest.imageIds || [];
                                                    return (
                                                        <motion.div
                                                            key={dest.id || idx}
                                                            initial={{ opacity: 0, y: 15 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.08 * idx }}
                                                            className={`p-5 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                                                        >
                                                            <div className="flex flex-col lg:flex-row gap-6 mb-5">
                                                                {destinationImages.length > 0 && (
                                                                    <div className="lg:w-1/3">
                                                                        <p className={`${NEU_LABEL} mb-2`}>Destination Photos</p>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {destinationImages.slice(0, 4).map((img, imgIdx) => (
                                                                                <motion.button
                                                                                    key={img.id || imgIdx}
                                                                                    whileHover={{ scale: 1.04 }}
                                                                                    onClick={() => setSelectedImage(img.url)}
                                                                                    className="relative aspect-square rounded-lg overflow-hidden shadow-[3px_3px_6px_#c8c6c5,-1px_-1px_4px_#ffffff] hover:shadow-[4px_4px_8px_#c8c6c5,-2px_-2px_6px_#ffffff] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40"
                                                                                >
                                                                                    <Image
                                                                                        src={img.url}
                                                                                        alt={`Destination ${idx + 1} - ${imgIdx + 1}`}
                                                                                        fill
                                                                                        className="object-cover"
                                                                                    />
                                                                                    {imgIdx === 3 && destinationImages.length > 4 && (
                                                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                                            <span className="text-white font-bold text-xs font-[family-name:var(--font-space-mono)]">
                                                                                                +{destinationImages.length - 4}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </motion.button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className={destinationImages.length > 0 ? "lg:w-2/3" : "w-full"}>
                                                                    {dest.description && (
                                                                        <p className={`${NEU_MONO} text-sm leading-relaxed mb-4`}>
                                                                            {dest.description}
                                                                        </p>
                                                                    )}
                                                                    {dest.highlights && dest.highlights.length > 0 && (
                                                                        <div className="mb-3">
                                                                            <p className={`${NEU_LABEL} mb-2`}>Highlights</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {dest.highlights.map((h, i) => (
                                                                                    <span key={i} className={NEU_BADGE_PRIMARY}>{h}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {dest.coordinates && (
                                                                        <div className={`mt-3 pt-3 border-t ${NEU_DIVIDER}`}>
                                                                            <p className={`${NEU_LABEL} mb-1`}>Coordinates</p>
                                                                            <p className={`${NEU_MONO} text-sm text-[#006666]`}>
                                                                                {dest.coordinates.lat.toFixed(6)}, {dest.coordinates.lng.toFixed(6)}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Activities */}
                                                            {dest.activities && dest.activities.length > 0 && (
                                                                <div className="mb-6">
                                                                    <p className={`${NEU_HEADING} text-base mb-4`}>Activities</p>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                        {dest.activities.map((activity, actIdx) => (
                                                                            <motion.div
                                                                                key={activity.title + actIdx}
                                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                transition={{ delay: 0.05 * actIdx }}
                                                                                className={`p-4 rounded-xl ${NEU_CARD_SM}`}
                                                                            >
                                                                                <p className={`${NEU_HEADING} text-sm mb-1.5`}>{activity.title}</p>
                                                                                {activity.provider && (
                                                                                    <p className={`${NEU_MUTED} text-xs mb-1.5`}>by {activity.provider}</p>
                                                                                )}
                                                                                {activity.duration && (
                                                                                    <div className="flex items-center gap-1.5 text-xs mb-1.5">
                                                                                        <MdTimer className="text-[#006666]" />
                                                                                        <span className={NEU_MUTED}>{activity.duration}</span>
                                                                                    </div>
                                                                                )}
                                                                                {activity.price && (
                                                                                    <p className={`${NEU_MONO} text-sm font-semibold text-[#00A63D]`}>
                                                                                        {formatCurrency(activity.price.amount, activity.price.currency)}
                                                                                    </p>
                                                                                )}
                                                                                {activity.rating && (
                                                                                    <div className="flex items-center gap-1.5 mt-2">
                                                                                        <div className="flex text-xs">{renderStars(activity.rating)}</div>
                                                                                        <span className={`${NEU_MUTED} text-xs`}>{activity.rating.toFixed(1)}</span>
                                                                                    </div>
                                                                                )}
                                                                                {activity.url && (
                                                                                    <a
                                                                                        href={activity.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="inline-block mt-2 text-xs text-[#006666] hover:underline font-[family-name:var(--font-space-mono)]"
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
                                                                    <p className={`${NEU_HEADING} text-base mb-4`}>Attractions</p>
                                                                    <div className="space-y-4">
                                                                        {dest.attractions.map((attr, attrIdx) => {
                                                                            const attractionImages = attr.imageIds || [];
                                                                            return (
                                                                                <motion.div
                                                                                    key={attr.id || attrIdx}
                                                                                    initial={{ opacity: 0, x: -15 }}
                                                                                    animate={{ opacity: 1, x: 0 }}
                                                                                    transition={{ delay: 0.05 * attrIdx }}
                                                                                    className={`p-4 rounded-xl ${NEU_CARD_SM} ${NEU_CARD_HOVER}`}
                                                                                >
                                                                                    <div className="flex flex-col lg:flex-row gap-4">
                                                                                        {attractionImages.length > 0 && (
                                                                                            <div className="lg:w-1/4 flex flex-row lg:flex-col gap-2">
                                                                                                {attractionImages.slice(0, 3).map((img, imgIdx) => (
                                                                                                    <motion.button
                                                                                                        key={img.id || imgIdx}
                                                                                                        whileHover={{ scale: 1.04 }}
                                                                                                        onClick={() => setSelectedImage(img.url)}
                                                                                                        className="relative aspect-square w-20 lg:w-full rounded-lg overflow-hidden shadow-[2px_2px_5px_#c8c6c5,-1px_-1px_3px_#ffffff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40"
                                                                                                    >
                                                                                                        <Image src={img.url} alt={`${attr.title} ${imgIdx + 1}`} fill className="object-cover" />
                                                                                                    </motion.button>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                        <div className={attractionImages.length > 0 ? "lg:w-3/4" : "w-full"}>
                                                                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                                                <h6 className={`${NEU_HEADING} text-base`}>{attr.title}</h6>
                                                                                                {attr.bestFor && (
                                                                                                    <span className={NEU_BADGE_WARNING}>Best for: {attr.bestFor}</span>
                                                                                                )}
                                                                                            </div>
                                                                                            {attr.description && (
                                                                                                <p className={`${NEU_MUTED} text-sm mb-3`}>{attr.description}</p>
                                                                                            )}
                                                                                            {attr.insiderTip && (
                                                                                                <div className={`mb-3 p-3 rounded-lg ${NEU_SURFACE_INSET_SM} border border-[#FE9900]/20`}>
                                                                                                    <div className="flex items-start gap-2">
                                                                                                        <Lightbulb className="w-4 h-4 text-[#FE9900] mt-0.5 flex-shrink-0" />
                                                                                                        <div>
                                                                                                            <p className={`${NEU_LABEL} text-[#FE9900] mb-1`}>Insider Tip</p>
                                                                                                            <p className={`${NEU_MUTED} text-xs`}>{attr.insiderTip}</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                                                                                {attr.address && (
                                                                                                    <div>
                                                                                                        <p className={`${NEU_LABEL} mb-1`}>Address</p>
                                                                                                        <p className={`${NEU_MONO} text-xs`}>{attr.address}</p>
                                                                                                    </div>
                                                                                                )}
                                                                                                {attr.openingHours && (
                                                                                                    <div>
                                                                                                        <p className={`${NEU_LABEL} mb-1`}>Opening Hours</p>
                                                                                                        <p className={`${NEU_MONO} text-xs`}>{attr.openingHours}</p>
                                                                                                    </div>
                                                                                                )}
                                                                                                {attr.coordinates && (
                                                                                                    <div>
                                                                                                        <p className={`${NEU_LABEL} mb-1`}>Coordinates</p>
                                                                                                        <p className={`${NEU_MONO} text-xs text-[#006666]`}>
                                                                                                            {attr.coordinates.lat.toFixed(6)}, {attr.coordinates.lng.toFixed(6)}
                                                                                                        </p>
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
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className={`${NEU_MUTED} text-center py-10`}>No destinations information available.</p>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Packing Tab */}
                                <TabsContent value="packing">
                                    <div className={`p-6 sm:p-8 ${NEU_CARD}`}>
                                        {tour.packingList && tour.packingList.length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className={`${NEU_LABEL} text-[#00A63D] mb-3`}>Required Items</p>
                                                    <ul className="space-y-2.5">
                                                        {tour.packingList.filter((p) => p.required).map((p, idx) => (
                                                            <motion.li
                                                                key={idx}
                                                                initial={{ x: -15, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.05 * idx }}
                                                                className={`flex items-start gap-3 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                                                            >
                                                                <MdCheckCircle className="text-[#00A63D] mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className={`${NEU_MONO} text-sm font-semibold`}>{p.item}</p>
                                                                    {p.notes && <p className={`${NEU_MUTED} text-xs mt-0.5`}>{p.notes}</p>}
                                                                </div>
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className={`${NEU_LABEL} text-[#006666] mb-3`}>Recommended Items</p>
                                                    <ul className="space-y-2.5">
                                                        {tour.packingList.filter((p) => !p.required).map((p, idx) => (
                                                            <motion.li
                                                                key={idx}
                                                                initial={{ x: -15, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.05 * idx }}
                                                                className={`flex items-start gap-3 p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}
                                                            >
                                                                <FaClipboardList className="text-[#006666] mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className={`${NEU_MONO} text-sm font-semibold`}>{p.item}</p>
                                                                    {p.notes && <p className={`${NEU_MUTED} text-xs mt-0.5`}>{p.notes}</p>}
                                                                </div>
                                                            </motion.li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={`${NEU_MUTED} text-center py-10`}>No packing list provided.</p>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Policies Tab */}
                                <TabsContent value="policies">
                                    <div className={`p-6 sm:p-8 ${NEU_CARD} space-y-6`}>
                                        {/* Cancellation Policy */}
                                        {tour.cancellationPolicy && (
                                            <div className={`p-5 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                                <h4 className={`${NEU_HEADING} text-base flex items-center gap-2 mb-4 text-[#00A63D]`}>
                                                    <MdWarning /> Cancellation Policy
                                                </h4>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className={NEU_MUTED}>Refundable</span>
                                                    <span className={tour.cancellationPolicy.refundable ? NEU_BADGE_SUCCESS : NEU_BADGE_DANGER}>
                                                        {tour.cancellationPolicy.refundable ? "Yes" : "No"}
                                                    </span>
                                                </div>
                                                {tour.cancellationPolicy.rules && tour.cancellationPolicy.rules.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className={`${NEU_LABEL} mb-2`}>Cancellation Rules</p>
                                                        {tour.cancellationPolicy.rules.map((rule, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#E7E5E4] shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff]">
                                                                <div>
                                                                    <p className={`${NEU_MONO} text-sm font-semibold`}>{rule.daysBefore} days before</p>
                                                                    <p className={NEU_MUTED}>Get {rule.refundPercent}% refund</p>
                                                                </div>
                                                                <span className={`${NEU_HEADING} text-xl text-[#00A63D]`}>{rule.refundPercent}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Refund Policy */}
                                        {tour.refundPolicy && (
                                            <div className={`p-5 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                                <h4 className={`${NEU_HEADING} text-base mb-4 text-[#006666]`}>Refund Policy</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className={NEU_MUTED}>Processing Time</span>
                                                        <span className={`${NEU_MONO} font-semibold`}>{tour.refundPolicy.processingDays} days</span>
                                                    </div>
                                                    <div>
                                                        <p className={`${NEU_MUTED} mb-2`}>Payment Methods</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {tour.refundPolicy.method.map((method, idx) => (
                                                                <span key={idx} className={NEU_BADGE_PRIMARY}>{method}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Terms */}
                                        {tour.terms && (
                                            <div className={`p-5 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                                <h4 className={`${NEU_HEADING} text-base mb-3`}>Terms & Conditions</h4>
                                                <p className={`${NEU_MONO} text-sm leading-relaxed`}>{tour.terms}</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Details Tab */}
                                <TabsContent value="details">
                                    <div className={`p-6 sm:p-8 ${NEU_CARD} space-y-8`}>
                                        {/* SEO */}
                                        {tour.seo && (
                                            <div>
                                                <h4 className={`${NEU_HEADING} text-base mb-4`}>SEO Information</h4>
                                                <div className="space-y-3">
                                                    {tour.seo.metaTitle && (
                                                        <div>
                                                            <p className={`${NEU_LABEL} mb-1.5`}>Meta Title</p>
                                                            <div className={`p-3 rounded-lg ${NEU_SURFACE_INSET_SM} ${NEU_MONO} text-sm`}>
                                                                {tour.seo.metaTitle}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {tour.seo.metaDescription && (
                                                        <div>
                                                            <p className={`${NEU_LABEL} mb-1.5`}>Meta Description</p>
                                                            <div className={`p-3 rounded-lg ${NEU_SURFACE_INSET_SM} ${NEU_MUTED}`}>
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
                                                <h4 className={`${NEU_HEADING} text-base flex items-center gap-2 mb-4`}>
                                                    <MdLanguage className="text-[#006666]" /> Translations
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {tour.translations.bn && (
                                                        <div className={`p-4 rounded-xl ${NEU_SURFACE_INSET_SM} border border-[#00A63D]/20`}>
                                                            <span className={`${NEU_BADGE_SUCCESS} mb-3 inline-flex`}>বাংলা</span>
                                                            {tour.translations.bn.title && (
                                                                <p className={`${NEU_HEADING} text-sm mb-1.5`}>{tour.translations.bn.title}</p>
                                                            )}
                                                            {tour.translations.bn.summary && (
                                                                <p className={`${NEU_MUTED} text-xs`}>{tour.translations.bn.summary}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {tour.translations.en && (
                                                        <div className={`p-4 rounded-xl ${NEU_SURFACE_INSET_SM} border border-[#006666]/20`}>
                                                            <span className={`${NEU_BADGE_PRIMARY} mb-3 inline-flex`}>English</span>
                                                            {tour.translations.en.title && (
                                                                <p className={`${NEU_HEADING} text-sm mb-1.5`}>{tour.translations.en.title}</p>
                                                            )}
                                                            {tour.translations.en.summary && (
                                                                <p className={`${NEU_MUTED} text-xs`}>{tour.translations.en.summary}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* System Information */}
                                        <div className={`pt-6 border-t ${NEU_DIVIDER}`}>
                                            <h4 className={`${NEU_HEADING} text-base mb-4`}>System Information</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                                {[
                                                    { label: "Created", value: formatDate(tour.createdAt) },
                                                    { label: "Updated", value: formatDate(tour.updatedAt) },
                                                    { label: "Published", value: tour.publishedAt ? formatDate(tour.publishedAt) : "—" },
                                                ].map((item) => (
                                                    <div key={item.label} className={`p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                                        <p className={`${NEU_LABEL} mb-1`}>{item.label}</p>
                                                        <p className={`${NEU_MONO} text-sm font-semibold`}>{item.value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className={`p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                                    <p className={`${NEU_LABEL} mb-1`}>Company</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <MdBusiness className="text-[#006666]" />
                                                        <p className={`${NEU_MONO} text-sm font-semibold truncate`}>{tour.companyInfo.name}</p>
                                                    </div>
                                                    <p className={`${NEU_MUTED} text-xs mt-0.5`}>ID: {tour.companyInfo.id}</p>
                                                </div>
                                                <div className={`p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                                    <p className={`${NEU_LABEL} mb-1`}>Author</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <MdPerson className="text-[#006666]" />
                                                        <p className={`${NEU_MONO} text-sm font-semibold truncate`}>{tour.authorInfo.name}</p>
                                                    </div>
                                                    <p className={`${NEU_MUTED} text-xs mt-0.5 truncate`}>{tour.authorInfo.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>

                    {/* ── Right Sidebar ──────────────────────── */}
                    <aside className="lg:col-span-1 space-y-5">

                        {/* Booking / Action Card */}
                        <motion.div variants={fadeInUp}>
                            <div className={`p-6 ${NEU_CARD}`}>
                                {/* Price Header */}
                                <div className="flex items-start justify-between mb-5">
                                    <div>
                                        <p className={`${NEU_LABEL} mb-1.5`}>Starting from</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className={`${NEU_HEADING} text-3xl text-[#006666]`}>
                                                {priceInfo ? formatCurrency(priceInfo.finalPrice.amount, priceInfo.finalPrice.currency) : "—"}
                                            </p>
                                            {priceInfo?.isDiscounted && (
                                                <p className={`${NEU_MUTED} line-through`}>
                                                    {formatCurrency(priceInfo.originalPrice.amount, priceInfo.originalPrice.currency)}
                                                </p>
                                            )}
                                        </div>
                                        <p className={`${NEU_MUTED} text-xs mt-0.5`}>per person</p>
                                    </div>

                                    {tour.bookingSummary && (
                                        <div className={`text-right p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                            <div className="flex items-center justify-end gap-1.5 mb-1">
                                                <MdGroups className="text-[#006666] text-sm" />
                                                <p className={`${NEU_LABEL} text-[10px]`}>Seats</p>
                                            </div>
                                            <p className={`${NEU_HEADING} text-xl`}>{tour.bookingSummary.availableSeats}</p>
                                            <p className={`${NEU_MUTED} text-xs`}>of {tour.bookingSummary.totalSeats}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Occupancy Progress */}
                                {tour.bookingSummary && (
                                    <div className="mb-5">
                                        <div className={`h-2 rounded-full ${NEU_SURFACE_INSET_SM} overflow-hidden`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${tour.bookingSummary.occupancyPercentage}%` }}
                                                transition={{ duration: 1, delay: 0.4 }}
                                                className="h-full bg-[#006666] rounded-full shadow-[inset_1px_1px_3px_#004d4d]"
                                            />
                                        </div>
                                        <p className={`${NEU_MUTED} text-xs mt-1.5`}>
                                            {tour.bookingSummary.bookedSeats} bookings made
                                        </p>
                                    </div>
                                )}

                                {/* Discounts */}
                                {tour.discounts && tour.discounts.length > 0 && (
                                    <div className="mb-5">
                                        <div className={`border-t ${NEU_DIVIDER} pt-4`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <MdLocalOffer className="text-[#FE9900]" />
                                                <p className={`${NEU_LABEL}`}>Active Offers</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tour.discounts.map((d, idx) => (
                                                    <motion.span
                                                        key={d.code || idx}
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.1 * idx }}
                                                        className={NEU_BADGE_WARNING}
                                                    >
                                                        {formatDiscountBadgeText(d)}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                    {getAvailableActions.showApprove && (
                                        <button
                                            onClick={() => setApproveOpenFor(tourId)}
                                            disabled={isProcessing || getAvailableActions.isDisabled}
                                            className={`${NEU_BTN_PRIMARY} flex items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Approve
                                        </button>
                                    )}
                                    {getAvailableActions.showReject && (
                                        <button
                                            onClick={() => setRejectOpenFor(tourId)}
                                            disabled={isProcessing || getAvailableActions.isDisabled}
                                            className={`${NEU_BTN_DANGER} flex items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    )}
                                    {getAvailableActions.showSuspend && (
                                        <button
                                            onClick={() => setSuspendOpenFor(tourId)}
                                            disabled={isProcessing || getAvailableActions.isDisabled}
                                            className={`${NEU_BTN_GHOST} flex items-center justify-center gap-2 px-4 py-3 text-sm text-[#FE9900] disabled:opacity-50 disabled:cursor-not-allowed col-span-full`}
                                        >
                                            <PauseCircle className="w-4 h-4" />
                                            Suspend
                                        </button>
                                    )}
                                    {getAvailableActions.showUnsuspend && (
                                        <button
                                            onClick={() => setUnsuspendOpenFor(tourId)}
                                            disabled={isProcessing || getAvailableActions.isDisabled}
                                            className={`${NEU_BTN_PRIMARY} flex items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed col-span-full`}
                                        >
                                            <PlayCircle className="w-4 h-4" />
                                            Unsuspend
                                        </button>
                                    )}
                                    {!getAvailableActions.showApprove &&
                                        !getAvailableActions.showReject &&
                                        !getAvailableActions.showSuspend &&
                                        !getAvailableActions.showUnsuspend && (
                                            <div className={`col-span-full p-3 rounded-xl text-center ${NEU_SURFACE_INSET_SM}`}>
                                                <p className={NEU_MUTED}>No actions available for this tour status</p>
                                            </div>
                                        )}
                                </div>

                                {/* Status Info */}
                                <div className={`mt-4 pt-4 border-t ${NEU_DIVIDER}`}>
                                    <p className={`${NEU_MUTED} text-xs`}>
                                        Status: <span className={`${NEU_MONO} text-[#1E2938] font-semibold`}>{tour.status}</span>
                                        {" · "}
                                        Moderation: <span className={`${NEU_MONO} text-[#1E2938] font-semibold`}>{tour.moderationStatus}</span>
                                    </p>
                                    {getAvailableActions.isDisabled && (
                                        <p className={`${NEU_MUTED} text-xs text-[#FE9900] mt-1`}>
                                            This tour has been denied and cannot be modified.
                                        </p>
                                    )}
                                </div>

                                {/* Next Departure */}
                                {tour.nextDeparture && (
                                    <div className={`mt-4 p-3 rounded-xl ${NEU_SURFACE_INSET_SM} border border-[#FE9900]/20 flex items-center gap-2`}>
                                        <MdAccessTime className="text-[#FE9900] flex-shrink-0" />
                                        <p className={NEU_MUTED}>
                                            Next departure:{" "}
                                            <span className="font-bold text-[#FE9900]">{formatDate(tour.nextDeparture)}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Pickup Locations */}
                                {tour.pickupOptions && tour.pickupOptions.length > 0 && (
                                    <div className={`mt-4 pt-4 border-t ${NEU_DIVIDER}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <MdLocationOn className="text-[#006666]" />
                                            <p className={NEU_LABEL}>Pickup Locations</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            {tour.pickupOptions.map((p, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between text-sm p-2 rounded-lg ${NEU_SURFACE_INSET_SM}`}
                                                >
                                                    <span className={NEU_MONO}>{p.city}</span>
                                                    <span className={`${NEU_MONO} font-semibold text-[#006666]`}>
                                                        {formatCurrency(p.price, p.currency)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Location Card */}
                        <motion.div variants={fadeInUp}>
                            <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`${NEU_ICON_WELL_PRIMARY} text-[#006666]`}>
                                        <MdLocationOn className="text-xl" />
                                    </span>
                                    <h4 className={`${NEU_HEADING} text-sm`}>Location</h4>
                                </div>
                                <p className={`${NEU_HEADING} text-base mb-1`}>{tour.district}, {tour.division}</p>
                                {tour.mainLocation?.address && (
                                    <div className="space-y-0.5">
                                        {tour.mainLocation.address.line1 && (
                                            <p className={`${NEU_MUTED} text-xs`}>{tour.mainLocation.address.line1}</p>
                                        )}
                                        {tour.mainLocation.address.line2 && (
                                            <p className={`${NEU_MUTED} text-xs`}>{tour.mainLocation.address.line2}</p>
                                        )}
                                        <p className={`${NEU_MUTED} text-xs`}>
                                            {tour.mainLocation.address.city && `${tour.mainLocation.address.city}, `}
                                            {tour.mainLocation.address.postalCode}
                                        </p>
                                    </div>
                                )}
                                {tour.mainLocation?.coordinates && (
                                    <div className={`mt-3 pt-3 border-t ${NEU_DIVIDER}`}>
                                        <p className={`${NEU_LABEL} mb-1`}>Coordinates</p>
                                        <p className={`${NEU_MONO} text-xs text-[#006666]`}>
                                            {tour.mainLocation.coordinates.lat.toFixed(6)}, {tour.mainLocation.coordinates.lng.toFixed(6)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Tour Features Card */}
                        <motion.div variants={fadeInUp}>
                            <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`${NEU_ICON_WELL_PRIMARY} text-[#006666]`}>
                                        <MdCheckCircle className="text-xl" />
                                    </span>
                                    <h4 className={`${NEU_HEADING} text-sm`}>Tour Features</h4>
                                </div>
                                <div className="space-y-2.5">
                                    {[
                                        { label: "Guide Included", value: tour.guideIncluded },
                                        { label: "Transport Included", value: tour.transportIncluded },
                                        { label: "License Required", value: tour.licenseRequired },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center justify-between">
                                            <span className={NEU_MUTED}>{item.label}</span>
                                            <span className={item.value ? NEU_BADGE_SUCCESS : NEU_BADGE_DANGER}>
                                                {item.value ? "Yes" : "No"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Accessibility Card */}
                        <motion.div variants={fadeInUp}>
                            <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`${NEU_ICON_WELL_PRIMARY} text-[#006666]`}>
                                        <FaWheelchair className="text-xl" />
                                    </span>
                                    <h4 className={`${NEU_HEADING} text-sm`}>Accessibility</h4>
                                </div>
                                <div className="space-y-2.5">
                                    {tour.accessibility?.wheelchair && (
                                        <div className="flex items-center gap-2 text-[#00A63D]">
                                            <MdCheckCircle />
                                            <span className={`${NEU_MONO} text-sm font-semibold`}>Wheelchair Accessible</span>
                                        </div>
                                    )}
                                    {tour.accessibility?.familyFriendly && (
                                        <div className="flex items-center gap-2 text-[#006666]">
                                            <MdCheckCircle />
                                            <span className={`${NEU_MONO} text-sm font-semibold`}>Family Friendly</span>
                                        </div>
                                    )}
                                    {tour.accessibility?.petFriendly && (
                                        <div className="flex items-center gap-2 text-[#FE9900]">
                                            <MdCheckCircle />
                                            <span className={`${NEU_MONO} text-sm font-semibold`}>Pet Friendly</span>
                                        </div>
                                    )}
                                    {tour.accessibility?.notes && (
                                        <div className={`mt-2 p-3 rounded-lg ${NEU_SURFACE_INSET_SM}`}>
                                            <p className={`${NEU_LABEL} mb-1`}>Notes</p>
                                            <p className={`${NEU_MUTED} text-xs`}>{tour.accessibility.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Accommodation Types */}
                        {tour.accommodationType && tour.accommodationType.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={NEU_ICON_WELL}>
                                            <MdLocationCity className="text-xl text-[#1E2938]/60" />
                                        </span>
                                        <h4 className={`${NEU_HEADING} text-sm`}>Accommodation</h4>
                                    </div>
                                    <div className="space-y-1.5">
                                        {tour.accommodationType.map((type, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#006666]" />
                                                <span className={NEU_MONO}>{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Transport Modes */}
                        {tour.transportModes && tour.transportModes.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={NEU_ICON_WELL}>
                                            <MdLocationOn className="text-xl text-[#1E2938]/60" />
                                        </span>
                                        <h4 className={`${NEU_HEADING} text-sm`}>Transport Modes</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tour.transportModes.map((mode, idx) => (
                                            <span key={idx} className={NEU_BADGE}>{mode}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Emergency Contacts */}
                        {tour.emergencyContacts && (
                            <motion.div variants={fadeInUp}>
                                <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER} border border-[#FF2157]/20`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                                            <MdOutlineHelp className="text-xl text-[#FF2157]" />
                                        </span>
                                        <h4 className={`${NEU_HEADING} text-sm`}>Emergency Contacts</h4>
                                    </div>
                                    <div className="space-y-2.5">
                                        {[
                                            { label: "Police", number: tour.emergencyContacts.policeNumber },
                                            { label: "Ambulance", number: tour.emergencyContacts.ambulanceNumber },
                                            { label: "Fire Service", number: tour.emergencyContacts.fireServiceNumber },
                                            { label: "Local Emergency", number: tour.emergencyContacts.localEmergency },
                                        ].filter((c) => c.number).map((contact) => (
                                            <div key={contact.label} className={`p-3 rounded-xl ${NEU_SURFACE_INSET_SM}`}>
                                                <p className={`${NEU_LABEL} mb-0.5`}>{contact.label}</p>
                                                <a
                                                    href={`tel:${contact.number}`}
                                                    className={`${NEU_HEADING} text-sm hover:text-[#FF2157] transition-colors`}
                                                >
                                                    {contact.number}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Payment Methods */}
                        {tour.paymentMethods && tour.paymentMethods.length > 0 && (
                            <motion.div variants={fadeInUp}>
                                <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`${NEU_ICON_WELL_PRIMARY} text-[#006666]`}>
                                            <MdOutlineMonetizationOn className="text-xl" />
                                        </span>
                                        <h4 className={`${NEU_HEADING} text-sm`}>Payment Methods</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tour.paymentMethods.map((method, idx) => (
                                            <span key={idx} className={NEU_BADGE_SUCCESS}>{method}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Audience & Categories */}
                        <motion.div variants={fadeInUp}>
                            <div className={`p-5 ${NEU_CARD} ${NEU_CARD_HOVER}`}>
                                <h4 className={`${NEU_HEADING} text-sm mb-4`}>Audience & Categories</h4>
                                <div className="space-y-4">
                                    {tour.audience && tour.audience.length > 0 && (
                                        <div>
                                            <p className={`${NEU_LABEL} mb-2`}>Audience</p>
                                            <div className="flex flex-wrap gap-2">
                                                {tour.audience.map((aud, idx) => (
                                                    <span key={idx} className={NEU_BADGE_DANGER}>{aud}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {tour.categories && tour.categories.length > 0 && (
                                        <div>
                                            <p className={`${NEU_LABEL} mb-2`}>Categories</p>
                                            <div className="flex flex-wrap gap-2">
                                                {tour.categories.map((cat, idx) => (
                                                    <span key={idx} className={NEU_BADGE_PRIMARY}>{cat}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </aside>
                </div>
            </div>

            {/* ── Image Modal ────────────────────────────── */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2938]/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="relative max-w-5xl w-full h-[80vh] rounded-2xl overflow-hidden shadow-[20px_20px_40px_rgba(0,0,0,0.5)]"
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
                                className={`absolute top-4 right-4 w-11 h-11 rounded-xl ${NEU_SURFACE} flex items-center justify-center shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40`}
                                aria-label="Close image"
                            >
                                <X className="w-5 h-5 text-[#1E2938]" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Dialogs ───────────────────────────────── */}
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
            <SuspendDialog
                open={suspendOpenFor === tourId}
                onOpenChange={(open: boolean) => !open && setSuspendOpenFor(null)}
                tourId={tourId}
                tourTitle={tour.title}
            />
            <UnsuspendDialog
                open={unsuspendOpenFor === tourId}
                onOpenChange={(open: boolean) => !open && setUnsuspendOpenFor(null)}
                tourId={tourId}
                tourTitle={tour.title}
            />
        </motion.article>
    );
}

// ═══════════════════════════════════════════════════════════════
// STATUS PILLS
// ═══════════════════════════════════════════════════════════════
function StatusPill({ status }: { status: string }) {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG[TOUR_STATUS.DRAFT];
    return (
        <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${config.badge} gap-1.5`}
        >
            {config.icon}
            {config.text}
        </motion.span>
    );
}

function ModerationPill({ status }: { status: string }) {
    const config = MODERATION_CONFIG[status as keyof typeof MODERATION_CONFIG];
    if (!config) return null;
    return (
        <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${config.badge} gap-1.5`}
        >
            {config.icon}
            {config.text}
        </motion.span>
    );
}