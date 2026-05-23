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
  MdHotel,
  MdPause,
} from "react-icons/md";
import { FaClipboardList, FaWheelchair, FaSnowflake } from "react-icons/fa";
import {
  Circle,
  ArrowUpRight,
  XCircle,
  Folder,
  Clock,
  Lightbulb,
  Bus,
  Check,
  X,
} from "lucide-react";
import { useCompanyDetailStore } from "@/store/company/company-detail.store";
import AllDetailsSkeleton from "./skeletons/AllDetailsSkeleton";
import { TourDetailDTO } from "@/types/tour/tour.types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  TOUR_STATUS,
  MODERATION_STATUS,
  TOUR_DISCOUNT_TYPE,
  CURRENCY,
  Currency,
} from "@/constants/tour.const";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";
import { TOUR_DISCOUNT_TYPE } from "@/constants/tour.const";

// ─── Neumorphism Design Tokens ──────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_SURFACE_INSET_SM =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

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
const NEU_BTN_ICON =
  "rounded-xl w-9 h-9 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";

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
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";

const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ─── Component ─────────────────────────────────────────────────────
type Props = {
  companyId: string;
  tourId: string;
  handleBreadcrumbItems: (items: { label: string; href: string }[]) => void;
};

const tourDetailLoadingKey = (id: string) => `tourDetail:${id}`;
const tourDetailErrorKey = (id: string) => `tourDetailError:${id}`;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ─── Status Configs ────────────────────────────────────────────────
const STATUS_CONFIG = {
  [TOUR_STATUS.DRAFT]: {
    badgeClass: NEU_BADGE,
    text: "Draft",
    icon: <Circle className="w-3 h-3" />,
  },
  [TOUR_STATUS.SUBMITTED]: {
    badgeClass: NEU_BADGE_WARNING,
    text: "Submitted",
    icon: <ArrowUpRight className="w-3 h-3" />,
  },
  [TOUR_STATUS.ACTIVE]: {
    badgeClass: NEU_BADGE_SUCCESS,
    text: "Active",
    icon: <Check className="w-3 h-3" />,
  },
  [TOUR_STATUS.COMPLETED]: {
    badgeClass: NEU_BADGE_PRIMARY,
    text: "Completed",
    icon: <Check className="w-3 h-3" />,
  },
  [TOUR_STATUS.TERMINATED]: {
    badgeClass: NEU_BADGE_DANGER,
    text: "Terminated",
    icon: <XCircle className="w-3 h-3" />,
  },
  [TOUR_STATUS.ARCHIVED]: {
    badgeClass: NEU_BADGE,
    text: "Archived",
    icon: <Folder className="w-3 h-3" />,
  },
};

const MODERATION_CONFIG = {
  [MODERATION_STATUS.PENDING]: {
    badgeClass: NEU_BADGE_WARNING,
    text: "Pending",
    icon: <Clock className="w-3 h-3" />,
  },
  [MODERATION_STATUS.APPROVED]: {
    badgeClass: NEU_BADGE_SUCCESS,
    text: "Approved",
    icon: <Check className="w-3 h-3" />,
  },
  [MODERATION_STATUS.DENIED]: {
    badgeClass: NEU_BADGE_DANGER,
    text: "Denied",
    icon: <X className="w-3 h-3" />,
  },
  [MODERATION_STATUS.SUSPENDED]: {
    badgeClass: NEU_BADGE_WARNING,
    text: "Suspended",
    icon: <MdPause className="w-3 h-3" />,
  },
};

// ─── Sub-components ────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const config =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`${config.badgeClass} flex items-center gap-1.5 px-3 py-1.5`}
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
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`${config.badgeClass} flex items-center gap-1.5 px-3 py-1.5`}
    >
      {config.icon}
      {config.text}
    </motion.span>
  );
}

// ─── Section Header ─────────────────────────────────────────────────
function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className={`${NEU_ICON_WELL_PRIMARY} text-[#006666]`}>{icon}</div>
      <h3 className={`${NEU_HEADING} text-lg`}>{title}</h3>
    </div>
  );
}

// ─── Info Row ───────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1E2938]/8 last:border-0">
      <span className={NEU_LABEL}>{label}</span>
      <span className={`${NEU_MONO} text-sm font-medium`}>{value}</span>
    </div>
  );
}

// ─── Neu KPI Tile ───────────────────────────────────────────────────
function KpiTile({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className={`${NEU_SURFACE_INSET_SM} rounded-xl p-4 flex flex-col gap-1`}
    >
      <span className={NEU_LABEL}>{label}</span>
      <span className={`${NEU_HEADING} text-base`}>{value}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function AllDetails({
  companyId,
  tourId,
  handleBreadcrumbItems,
}: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isBookmarkHovered, setIsBookmarkHovered] = useState(false);

  const {
    fetchTourDetail,
    companies,
    tourDetails,
    loading: lod,
    error: er,
  } = useCompanyDetailStore();
  const tour = tourDetails?.[tourId] ?? (null as TourDetailDTO | null);
  const loading = lod[tourDetailLoadingKey(tourId)];
  const error = er[tourDetailErrorKey(tourId)];

  const load = useCallback(
    async (force = false) => {
      try {
        const fetchedTour = await fetchTourDetail(companyId, tourId, force);
        if (fetchedTour?.title) {
          handleBreadcrumbItems([
            { label: "Home", href: "/" },
            { label: "Companies", href: "/users/companies" },
            {
              label:
                companies?.[companyId]?.companyName?.toLocaleUpperCase() ??
                "Company",
              href: `/users/companies/${encodeURIComponent(encodeId(companyId))}`,
            },
            {
              label: fetchedTour.title,
              href: `/users/companies/${encodeURIComponent(encodeId(companyId))}/${encodeURIComponent(encodeId(tourId))}`,
            },
          ]);
        }
      } catch {
        // store manages errors
      }
    },
    [companies, companyId, fetchTourDetail, handleBreadcrumbItems, tourId],
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
      return dt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const formatCurrency = (
    amount?: number,
    currency: Currency = CURRENCY.BDT,
  ) => {
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

  const pricePrimary = useMemo(() => {
    if (!tour) return null;
    return tour.basePrice;
  }, [tour]);

  const getBestDiscountedPrice = useCallback((tour: TourDetailDTO) => {
    if (!tour.discounts || tour.discounts.length === 0)
      return tour.basePrice.amount;
    let bestPrice = tour.basePrice.amount;
    tour.discounts.forEach((discount) => {
      let discountedPrice = tour.basePrice.amount;
      if (discount.type === TOUR_DISCOUNT_TYPE.PERCENTAGE)
        discountedPrice = tour.basePrice.amount * (1 - discount.value / 100);
      else if (discount.type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT)
        discountedPrice = tour.basePrice.amount - discount.value;
      if (discountedPrice < bestPrice) bestPrice = discountedPrice;
    });
    return bestPrice;
  }, []);

  const calculateMaxDiscountPercentage = useCallback((tour: TourDetailDTO) => {
    if (!tour.discounts || tour.discounts.length === 0) return 0;
    let maxDiscount = 0;
    tour.discounts.forEach((discount) => {
      if (
        discount.type === TOUR_DISCOUNT_TYPE.PERCENTAGE &&
        discount.value > maxDiscount
      )
        maxDiscount = discount.value;
      else if (discount.type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT) {
        const percentage = (discount.value / tour.basePrice.amount) * 100;
        if (percentage > maxDiscount) maxDiscount = percentage;
      }
    });
    return Math.round(maxDiscount);
  }, []);

  const durationDisplay = useMemo(() => {
    if (!tour?.duration) return "—";
    const { days, nights } = tour.duration;
    if (nights) return `${days} days, ${nights} nights`;
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

  // ── Loading state ─────────────────────────────────────────────
  if (loading && !tour) {
    return (
      <div className={`${NEU_PAGE_BG} rounded-2xl overflow-hidden p-4`}>
        <AllDetailsSkeleton />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error && !tour) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${NEU_PAGE_BG} flex items-center justify-center min-h-[400px] p-6`}
      >
        <div className={`${NEU_CARD} p-8 max-w-md w-full text-center`}>
          <div
            className={`${NEU_SURFACE_INSET} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5`}
          >
            <MdWarning className="text-3xl text-[#FF2157]" />
          </div>
          <h3 className={`${NEU_HEADING} text-xl mb-2`}>Unable to load tour</h3>
          <p className={`${NEU_MUTED} mb-6`}>{String(error)}</p>
          <button
            onClick={() => void load(true)}
            className={`${NEU_BTN_DANGER} px-6 py-2.5 text-sm`}
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────
  if (!tour) {
    return (
      <div
        className={`${NEU_PAGE_BG} flex items-center justify-center min-h-[300px] p-6`}
      >
        <div className={`${NEU_CARD} p-12 text-center`}>
          <span className={NEU_MUTED}>Tour not found.</span>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <motion.article
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={`${NEU_PAGE_BG} rounded-3xl overflow-hidden`}
    >
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          <motion.div variants={fadeInUp}>
            {/* Hero Image */}
            <div className="relative group">
              <motion.div
                className="relative w-full h-[300px] sm:h-[420px] lg:h-[520px] rounded-2xl overflow-hidden shadow-[12px_12px_24px_#c8c6c5,-4px_-4px_12px_#ffffff]"
                whileHover={{ scale: 1.005 }}
                transition={{ duration: 0.4 }}
              >
                <Image
                  src={tour.heroImage ?? "https://placehold.co/1200x800.png"}
                  alt={tour.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E2938]/70 via-transparent to-[#1E2938]/10" />

                {/* Status Badges */}
                <div className="absolute left-4 sm:left-6 top-4 sm:top-6 flex flex-wrap items-center gap-2 z-20">
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
                    <motion.span
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className={`${NEU_BADGE_WARNING} flex items-center gap-1.5 px-3 py-1.5`}
                    >
                      <MdVerified className="w-3 h-3" /> Featured
                    </motion.span>
                  )}
                  {tour.hasActiveDiscount && (
                    <motion.span
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className={`${NEU_BADGE_DANGER} flex items-center gap-1.5 px-3 py-1.5`}
                    >
                      <MdLocalOffer className="w-3 h-3" /> Discount
                    </motion.span>
                  )}
                </div>

                {/* Price Tag */}
                {pricePrimary && (
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="absolute right-4 sm:right-6 top-4 sm:top-6 z-20"
                  >
                    <div
                      className={`${NEU_CARD_SM} px-5 py-4 bg-[#E7E5E4]/95 backdrop-blur-sm`}
                    >
                      <div className={`${NEU_LABEL} mb-1`}>Starting from</div>
                      <div className={`${NEU_HEADING} text-2xl text-[#006666]`}>
                        {formatCurrency(
                          tour.discounts?.length
                            ? getBestDiscountedPrice(tour)
                            : pricePrimary.amount,
                          pricePrimary.currency,
                        )}
                      </div>
                      {tour.discounts?.length ? (
                        <div className="text-xs text-[#00A63D] font-[family-name:var(--font-space-mono)] font-bold mt-1">
                          Save up to {calculateMaxDiscountPercentage(tour)}%
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}

                {/* Bottom Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <MdLocationOn className="text-[#E7E5E4]/80 text-sm" />
                    <span className="text-[#E7E5E4]/80 text-sm font-[family-name:var(--font-jetbrains-mono)]">
                      {tour.district}, {tour.division}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-[family-name:var(--font-space-mono)] font-bold text-white leading-tight line-clamp-2">
                    {tour.title}
                  </h1>
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
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative w-28 sm:w-32 h-20 sm:h-24 rounded-xl overflow-hidden shrink-0 cursor-pointer ${NEU_CARD_SM} hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] transition-all border-2 border-transparent hover:border-[#006666]/30`}
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

          {/* ── Booking Card (full-width under hero on mobile, floats in sidebar on lg) ── */}
          <motion.div variants={fadeInUp} className="block lg:hidden">
            <BookingCard
              tour={tour}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title & Actions (desktop) */}
        <motion.header variants={fadeInUp} className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={NEU_BADGE_PRIMARY}>{tour.tourType}</span>
                {tour.categories?.[0] && (
                  <span className={NEU_BADGE}>{tour.categories[0]}</span>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {tour.ratings && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="flex">
                      {renderStars(tour.ratings.average)}
                    </div>
                    <span className={`${NEU_HEADING} text-sm`}>
                      {tour.ratings.average?.toFixed(1) ?? "—"}
                    </span>
                    <span className={NEU_MUTED}>
                      ({tour.ratings.count ?? 0})
                    </span>
                  </motion.div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-[#1E2938]/60 font-[family-name:var(--font-jetbrains-mono)]">
                  <MdVisibility className="text-[#006666]" />
                  <span className="font-semibold text-[#1E2938]">
                    {tour.viewCount}
                  </span>{" "}
                  views
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#1E2938]/60 font-[family-name:var(--font-jetbrains-mono)]">
                  <MdFavorite className="text-[#FF2157]" />
                  <span className="font-semibold text-[#1E2938]">
                    {tour.wishlistCount}
                  </span>{" "}
                  wishlist
                </div>
                <div className="flex items-center gap-1.5 text-sm text-[#1E2938]/60 font-[family-name:var(--font-jetbrains-mono)]">
                  <MdShare className="text-[#006666]" />
                  <span className="font-semibold text-[#1E2938]">
                    {tour.shareCount}
                  </span>{" "}
                  shares
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${NEU_BTN_GHOST} p-2.5`}
                onMouseEnter={() => setIsBookmarkHovered(true)}
                onMouseLeave={() => setIsBookmarkHovered(false)}
                aria-label="Add to wishlist"
              >
                <motion.div
                  animate={{
                    scale: isBookmarkHovered ? [1, 1.2, 1] : 1,
                    rotate: isBookmarkHovered ? [0, -10, 10, 0] : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <MdFavorite className="text-[#FF2157] text-xl" />
                </motion.div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${NEU_BTN_GHOST} p-2.5`}
                aria-label="Share tour"
              >
                <MdShare className="text-[#006666] text-xl" />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* ── Main Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <motion.div variants={fadeInUp}>
              <div className={`${NEU_CARD} p-6 sm:p-8`}>
                <SectionHeader
                  icon={<MdOutlineInfo className="text-xl" />}
                  title="Overview"
                />

                <p className="font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/80 leading-relaxed mb-8">
                  {tour.summary || "No summary provided."}
                </p>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <KpiTile label="Difficulty" value={tour.difficulty} />
                  <KpiTile label="Duration" value={durationDisplay} />
                  <KpiTile
                    label="Age Suitability"
                    value={tour.ageSuitability}
                  />
                </div>

                {/* Best Season */}
                {tour.bestSeason && tour.bestSeason.length > 0 && (
                  <div className="mb-8">
                    <h3 className={`${NEU_HEADING} text-base mb-3`}>
                      Best Season
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tour.bestSeason.map((season, i) => (
                        <motion.span
                          key={season}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.05 * i }}
                          className={`${NEU_BADGE_PRIMARY} px-3 py-1.5 flex items-center gap-1.5`}
                        >
                          <FaSnowflake className="text-[10px]" /> {season}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {tour.tags && tour.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className={`${NEU_HEADING} text-base mb-3`}>Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {tour.tags.map((t) => (
                        <span
                          key={t}
                          className={`${NEU_BADGE} hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] cursor-pointer transition-all px-3 py-1.5`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inclusions / Exclusions */}
                <div className="grid md:grid-cols-2 gap-6">
                  {tour.inclusions && tour.inclusions.length > 0 && (
                    <div>
                      <h3 className={`${NEU_LABEL} text-[#00A63D] mb-3`}>
                        What&apos;s Included
                      </h3>
                      <ul className="space-y-2">
                        {tour.inclusions.slice(0, 5).map((inc, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm"
                          >
                            <MdCheckCircle className="text-[#00A63D] mt-0.5 flex-shrink-0" />
                            <span className={`${NEU_MONO} text-sm`}>
                              {inc.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {tour.exclusions && tour.exclusions.length > 0 && (
                    <div>
                      <h3 className={`${NEU_LABEL} text-[#FF2157] mb-3`}>
                        What&apos;s Excluded
                      </h3>
                      <ul className="space-y-2">
                        {tour.exclusions.slice(0, 5).map((exc, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm"
                          >
                            <MdWarning className="text-[#FF2157] mt-0.5 flex-shrink-0" />
                            <span className={`${NEU_MONO} text-sm`}>
                              {exc.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* ── Tabs ──────────────────────────────────────── */}
            <motion.div variants={fadeInUp}>
              <Tabs defaultValue="itinerary" className="w-full">
                {/* TabsList */}
                <TabsList
                  className={`${NEU_SURFACE_INSET} flex rounded-xl mb-6 p-1 h-auto gap-1 overflow-x-auto`}
                >
                  {[
                    "itinerary",
                    "destinations",
                    "packing",
                    "policies",
                    "details",
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className={`capitalize flex-1 min-w-[80px] rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60 py-2 transition-all duration-200
                                                data-[state=active]:bg-[#E7E5E4] data-[state=active]:text-[#006666]
                                                data-[state=active]:shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]`}
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ── Itinerary Tab ─────────────────────────── */}
                <TabsContent value="itinerary">
                  <div className={`${NEU_CARD} p-6 sm:p-8`}>
                    {tour.itinerary && tour.itinerary.length > 0 ? (
                      <div className="space-y-6">
                        {tour.itinerary.map((it, idx) => (
                          <motion.div
                            key={it.day}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className={`${NEU_CARD_SM} p-5 relative`}
                          >
                            {/* Day badge */}
                            <div className="absolute -left-3 top-5 w-10 h-10 rounded-full bg-[#006666] flex items-center justify-center shadow-[3px_3px_6px_#004d4d,-2px_-2px_4px_#008080]">
                              <span className="text-white text-xs font-[family-name:var(--font-space-mono)] font-bold leading-none">
                                {it.day}
                              </span>
                            </div>
                            <div className="ml-7">
                              <h4 className={`${NEU_HEADING} text-lg mb-2`}>
                                {it.title || `Day ${it.day}`}
                              </h4>
                              {it.description && (
                                <p className={`${NEU_MUTED} mb-4`}>
                                  {it.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {it.accommodation && (
                                  <span
                                    className={`${NEU_BADGE} flex items-center gap-1.5`}
                                  >
                                    <MdHotel className="text-[#006666]" />{" "}
                                    {it.accommodation}
                                  </span>
                                )}
                                {it.mealsProvided &&
                                  it.mealsProvided.length > 0 && (
                                    <span
                                      className={`${NEU_BADGE} flex items-center gap-1.5`}
                                    >
                                      <MdRestaurant className="text-[#FE9900]" />{" "}
                                      {it.mealsProvided.join(", ")}
                                    </span>
                                  )}
                                {it.travelMode && (
                                  <span
                                    className={`${NEU_BADGE} flex items-center gap-1.5`}
                                  >
                                    <Bus className="text-[#006666] w-3 h-3" />{" "}
                                    {it.travelMode}
                                  </span>
                                )}
                              </div>
                              {it.activities && it.activities.length > 0 && (
                                <div className="mb-3">
                                  <span className={`${NEU_LABEL} mb-2 block`}>
                                    Activities
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {it.activities.map((act, i) => (
                                      <span
                                        key={i}
                                        className={NEU_BADGE_PRIMARY}
                                      >
                                        {act}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {it.importantNotes &&
                                it.importantNotes.length > 0 && (
                                  <div
                                    className={`${NEU_SURFACE_INSET_SM} rounded-xl p-4 mt-3`}
                                  >
                                    <span
                                      className={`${NEU_LABEL} text-[#FE9900] mb-2 block`}
                                    >
                                      Important Notes
                                    </span>
                                    <ul className="space-y-1">
                                      {it.importantNotes.map((note, i) => (
                                        <li
                                          key={i}
                                          className={`${NEU_MUTED} text-xs flex gap-2`}
                                        >
                                          <span className="text-[#FE9900]">
                                            •
                                          </span>{" "}
                                          {note}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-12 ${NEU_MUTED}`}>
                        No itinerary available.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Destinations Tab ──────────────────────── */}
                <TabsContent value="destinations">
                  <div className={`${NEU_CARD} p-6 sm:p-8`}>
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
                              className={`${NEU_CARD_SM} p-5`}
                            >
                              <div className="flex flex-col lg:flex-row gap-6">
                                {destinationImages.length > 0 && (
                                  <div className="lg:w-1/3">
                                    <span className={`${NEU_LABEL} mb-2 block`}>
                                      Destination Photos
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
                                      {destinationImages
                                        .slice(0, 4)
                                        .map((img, imgIdx) => (
                                          <motion.div
                                            key={img.id || imgIdx}
                                            whileHover={{ scale: 1.04 }}
                                            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-[3px_3px_6px_#c8c6c5,-2px_-2px_5px_#ffffff]"
                                            onClick={() =>
                                              setSelectedImage(img.url)
                                            }
                                          >
                                            <Image
                                              src={img.url}
                                              alt={`Destination ${idx + 1}`}
                                              fill
                                              className="object-cover"
                                            />
                                            {imgIdx === 3 &&
                                              destinationImages.length > 4 && (
                                                <div className="absolute inset-0 bg-[#1E2938]/60 flex items-center justify-center">
                                                  <span className="text-white font-[family-name:var(--font-space-mono)] font-bold text-sm">
                                                    +
                                                    {destinationImages.length -
                                                      4}
                                                  </span>
                                                </div>
                                              )}
                                          </motion.div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                                <div
                                  className={
                                    destinationImages.length > 0
                                      ? "lg:w-2/3"
                                      : "w-full"
                                  }
                                >
                                  {dest.description && (
                                    <p
                                      className={`${NEU_MONO} text-sm leading-relaxed mb-4`}
                                    >
                                      {dest.description}
                                    </p>
                                  )}
                                  {dest.highlights &&
                                    dest.highlights.length > 0 && (
                                      <div className="mb-4">
                                        <span
                                          className={`${NEU_LABEL} mb-2 block`}
                                        >
                                          Highlights
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                          {dest.highlights.map((h, i) => (
                                            <span
                                              key={i}
                                              className={NEU_BADGE_PRIMARY}
                                            >
                                              {h}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  {dest.coordinates && (
                                    <div
                                      className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 mt-3`}
                                    >
                                      <span
                                        className={`${NEU_LABEL} mb-1 block`}
                                      >
                                        Coordinates
                                      </span>
                                      <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#006666]">
                                        {dest.coordinates.lat.toFixed(6)},{" "}
                                        {dest.coordinates.lng.toFixed(6)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Activities */}
                              {dest.activities &&
                                dest.activities.length > 0 && (
                                  <div className="mt-6">
                                    <h5
                                      className={`${NEU_HEADING} text-base mb-4`}
                                    >
                                      Activities
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {dest.activities.map(
                                        (activity, actIdx) => (
                                          <motion.div
                                            key={activity.title + actIdx}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                              delay: 0.05 * actIdx,
                                            }}
                                            className={`${NEU_CARD_SM} p-4`}
                                          >
                                            <div
                                              className={`${NEU_HEADING} text-sm mb-2`}
                                            >
                                              {activity.title}
                                            </div>
                                            {activity.provider && (
                                              <div
                                                className={`${NEU_MUTED} text-xs mb-1`}
                                              >
                                                Provider: {activity.provider}
                                              </div>
                                            )}
                                            {activity.duration && (
                                              <div className="flex items-center gap-2 text-sm mb-2">
                                                <MdTimer className="text-[#006666]" />
                                                <span className={NEU_MONO}>
                                                  {activity.duration}
                                                </span>
                                              </div>
                                            )}
                                            {activity.price && (
                                              <div className="font-[family-name:var(--font-space-mono)] font-bold text-[#00A63D] text-sm">
                                                {formatCurrency(
                                                  activity.price.amount,
                                                  activity.price.currency,
                                                )}
                                              </div>
                                            )}
                                            {activity.rating && (
                                              <div className="flex items-center gap-2 mt-2">
                                                <div className="flex">
                                                  {renderStars(activity.rating)}
                                                </div>
                                                <span
                                                  className={`${NEU_MUTED} text-xs`}
                                                >
                                                  {activity.rating.toFixed(1)}
                                                </span>
                                              </div>
                                            )}
                                            {activity.url && (
                                              <a
                                                href={activity.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block mt-2 text-xs text-[#006666] font-[family-name:var(--font-space-mono)] hover:underline"
                                              >
                                                View Details →
                                              </a>
                                            )}
                                          </motion.div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Attractions */}
                              {dest.attractions &&
                                dest.attractions.length > 0 && (
                                  <div className="mt-6">
                                    <h5
                                      className={`${NEU_HEADING} text-base mb-4`}
                                    >
                                      Attractions
                                    </h5>
                                    <div className="space-y-5">
                                      {dest.attractions.map((attr, attrIdx) => {
                                        const attractionImages =
                                          attr.imageIds || [];
                                        return (
                                          <motion.div
                                            key={attr.id || attrIdx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                              delay: 0.05 * attrIdx,
                                            }}
                                            className={`${NEU_CARD_SM} p-5`}
                                          >
                                            <div className="flex flex-col lg:flex-row gap-5">
                                              {attractionImages.length > 0 && (
                                                <div className="lg:w-1/4 space-y-2">
                                                  {attractionImages
                                                    .slice(0, 3)
                                                    .map((img, imgIdx) => (
                                                      <motion.div
                                                        key={img.id || imgIdx}
                                                        whileHover={{
                                                          scale: 1.04,
                                                        }}
                                                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_4px_#ffffff]"
                                                        onClick={() =>
                                                          setSelectedImage(
                                                            img.url,
                                                          )
                                                        }
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
                                              )}
                                              <div
                                                className={
                                                  attractionImages.length > 0
                                                    ? "lg:w-3/4"
                                                    : "w-full"
                                                }
                                              >
                                                <div className="flex flex-wrap items-start gap-2 mb-2">
                                                  <h6
                                                    className={`${NEU_HEADING} text-base`}
                                                  >
                                                    {attr.title}
                                                  </h6>
                                                  {attr.bestFor && (
                                                    <span
                                                      className={`${NEU_BADGE_WARNING} text-[10px]`}
                                                    >
                                                      Best for: {attr.bestFor}
                                                    </span>
                                                  )}
                                                </div>
                                                {attr.description && (
                                                  <p
                                                    className={`${NEU_MUTED} text-xs mb-3`}
                                                  >
                                                    {attr.description}
                                                  </p>
                                                )}
                                                {attr.insiderTip && (
                                                  <div
                                                    className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 mb-3`}
                                                  >
                                                    <div className="flex items-start gap-2">
                                                      <Lightbulb className="text-[#FE9900] w-4 h-4 mt-0.5 flex-shrink-0" />
                                                      <div>
                                                        <span
                                                          className={`${NEU_LABEL} text-[#FE9900] mb-1 block`}
                                                        >
                                                          Insider Tip
                                                        </span>
                                                        <span
                                                          className={`${NEU_MUTED} text-xs`}
                                                        >
                                                          {attr.insiderTip}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                )}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                  {attr.address && (
                                                    <div>
                                                      <span
                                                        className={`${NEU_LABEL} mb-1 block`}
                                                      >
                                                        Address
                                                      </span>
                                                      <span
                                                        className={`${NEU_MONO} text-xs`}
                                                      >
                                                        {attr.address}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {attr.openingHours && (
                                                    <div>
                                                      <span
                                                        className={`${NEU_LABEL} mb-1 block`}
                                                      >
                                                        Opening Hours
                                                      </span>
                                                      <span
                                                        className={`${NEU_MONO} text-xs`}
                                                      >
                                                        {attr.openingHours}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {attr.coordinates && (
                                                    <div>
                                                      <span
                                                        className={`${NEU_LABEL} mb-1 block`}
                                                      >
                                                        Coordinates
                                                      </span>
                                                      <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#006666]">
                                                        {attr.coordinates.lat.toFixed(
                                                          6,
                                                        )}
                                                        ,{" "}
                                                        {attr.coordinates.lng.toFixed(
                                                          6,
                                                        )}
                                                      </span>
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

                              {/* Destination image modal */}
                              <AnimatePresence>
                                {selectedImage && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1E2938]/90 backdrop-blur-sm"
                                    onClick={() => setSelectedImage(null)}
                                  >
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0.8, opacity: 0 }}
                                      className="relative max-w-5xl w-full h-[80vh] rounded-2xl overflow-hidden shadow-[12px_12px_32px_#000000]"
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
                                        className={`absolute top-4 right-4 ${NEU_BTN_ICON} w-10 h-10 bg-[#E7E5E4]/90`}
                                      >
                                        ✕
                                      </button>
                                      {(() => {
                                        const allImages = [
                                          ...destinationImages,
                                          ...(dest.attractions || []).flatMap(
                                            (attr) => attr.imageIds || [],
                                          ),
                                        ];
                                        const currentIndex =
                                          allImages.findIndex(
                                            (img) => img.url === selectedImage,
                                          );
                                        if (allImages.length > 1) {
                                          return (
                                            <>
                                              {currentIndex > 0 && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage(
                                                      allImages[
                                                        currentIndex - 1
                                                      ].url,
                                                    );
                                                  }}
                                                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${NEU_BTN_ICON} w-10 h-10 bg-[#E7E5E4]/90`}
                                                >
                                                  ←
                                                </button>
                                              )}
                                              {currentIndex <
                                                allImages.length - 1 && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage(
                                                      allImages[
                                                        currentIndex + 1
                                                      ].url,
                                                    );
                                                  }}
                                                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${NEU_BTN_ICON} w-10 h-10 bg-[#E7E5E4]/90`}
                                                >
                                                  →
                                                </button>
                                              )}
                                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-[#1E2938]/70 text-white text-xs font-[family-name:var(--font-space-mono)]">
                                                {currentIndex + 1} /{" "}
                                                {allImages.length}
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
                      <div className={`text-center py-12 ${NEU_MUTED}`}>
                        No destinations information available.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Packing Tab ───────────────────────────── */}
                <TabsContent value="packing">
                  <div className={`${NEU_CARD} p-6 sm:p-8`}>
                    {tour.packingList && tour.packingList.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4
                            className={`${NEU_HEADING} text-base text-[#00A63D] mb-4`}
                          >
                            Required Items
                          </h4>
                          <ul className="space-y-3">
                            {tour.packingList
                              .filter((p) => p.required)
                              .map((p, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.05 * idx }}
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-start gap-3`}
                                >
                                  <MdCheckCircle className="text-[#00A63D] mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div
                                      className={`${NEU_MONO} text-sm font-semibold`}
                                    >
                                      {p.item}
                                    </div>
                                    {p.notes && (
                                      <div
                                        className={`${NEU_MUTED} text-xs mt-0.5`}
                                      >
                                        {p.notes}
                                      </div>
                                    )}
                                  </div>
                                </motion.li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <h4
                            className={`${NEU_HEADING} text-base text-[#006666] mb-4`}
                          >
                            Recommended Items
                          </h4>
                          <ul className="space-y-3">
                            {tour.packingList
                              .filter((p) => !p.required)
                              .map((p, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.05 * idx }}
                                  className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 flex items-start gap-3`}
                                >
                                  <FaClipboardList className="text-[#006666] mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div
                                      className={`${NEU_MONO} text-sm font-semibold`}
                                    >
                                      {p.item}
                                    </div>
                                    {p.notes && (
                                      <div
                                        className={`${NEU_MUTED} text-xs mt-0.5`}
                                      >
                                        {p.notes}
                                      </div>
                                    )}
                                  </div>
                                </motion.li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className={`text-center py-12 ${NEU_MUTED}`}>
                        No packing list provided.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Policies Tab ──────────────────────────── */}
                <TabsContent value="policies">
                  <div className={`${NEU_CARD} p-6 sm:p-8 space-y-8`}>
                    {tour.cancellationPolicy && (
                      <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-5`}>
                        <SectionHeader
                          icon={<MdWarning className="text-lg" />}
                          title="Cancellation Policy"
                        />
                        <div className="flex items-center justify-between mb-4">
                          <span className={NEU_MUTED}>Refundable</span>
                          <span
                            className={
                              tour.cancellationPolicy.refundable
                                ? NEU_BADGE_SUCCESS
                                : NEU_BADGE_DANGER
                            }
                          >
                            {tour.cancellationPolicy.refundable ? "Yes" : "No"}
                          </span>
                        </div>
                        {tour.cancellationPolicy.rules &&
                          tour.cancellationPolicy.rules.length > 0 && (
                            <div className="space-y-3">
                              <span className={`${NEU_LABEL} mb-2 block`}>
                                Cancellation Rules
                              </span>
                              {tour.cancellationPolicy.rules.map(
                                (rule, idx) => (
                                  <div
                                    key={idx}
                                    className={`${NEU_CARD_SM} p-3 flex items-center justify-between`}
                                  >
                                    <div>
                                      <span
                                        className={`${NEU_MONO} text-sm font-semibold`}
                                      >
                                        {rule.daysBefore} days before
                                      </span>
                                      <div className={`${NEU_MUTED} text-xs`}>
                                        Get {rule.refundPercent}% refund
                                      </div>
                                    </div>
                                    <span
                                      className={`${NEU_HEADING} text-xl text-[#00A63D]`}
                                    >
                                      {rule.refundPercent}%
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                      </div>
                    )}

                    {tour.refundPolicy && (
                      <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-5`}>
                        <SectionHeader
                          icon={<MdOutlineMonetizationOn className="text-lg" />}
                          title="Refund Policy"
                        />
                        <InfoRow
                          label="Processing Time"
                          value={`${tour.refundPolicy.processingDays} days`}
                        />
                        {tour.refundPolicy.method?.length > 0 && (
                          <div className="mt-3">
                            <span className={`${NEU_LABEL} mb-2 block`}>
                              Payment Methods
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {tour.refundPolicy.method.map((method, idx) => (
                                <span key={idx} className={NEU_BADGE}>
                                  {method}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {tour.terms && (
                      <div className={`${NEU_SURFACE_INSET_SM} rounded-xl p-5`}>
                        <h4 className={`${NEU_HEADING} text-base mb-4`}>
                          Terms & Conditions
                        </h4>
                        <p className={`${NEU_MUTED} leading-relaxed`}>
                          {tour.terms}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Details Tab ───────────────────────────── */}
                <TabsContent value="details">
                  <div className={`${NEU_CARD} p-6 sm:p-8 space-y-8`}>
                    {tour.seo && (
                      <div>
                        <h4 className={`${NEU_HEADING} text-base mb-4`}>
                          SEO Information
                        </h4>
                        {tour.seo.metaTitle && (
                          <div className="mb-4">
                            <span className={`${NEU_LABEL} mb-1 block`}>
                              Meta Title
                            </span>
                            <div
                              className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 ${NEU_MONO} text-sm`}
                            >
                              {tour.seo.metaTitle}
                            </div>
                          </div>
                        )}
                        {tour.seo.metaDescription && (
                          <div>
                            <span className={`${NEU_LABEL} mb-1 block`}>
                              Meta Description
                            </span>
                            <div
                              className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 ${NEU_MUTED}`}
                            >
                              {tour.seo.metaDescription}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {tour.translations && (
                      <div>
                        <SectionHeader
                          icon={<MdLanguage className="text-lg" />}
                          title="Translations"
                        />
                        <div className="grid md:grid-cols-2 gap-6">
                          {tour.translations.bn && (
                            <div
                              className={`${NEU_SURFACE_INSET_SM} rounded-xl p-4`}
                            >
                              <span
                                className={`${NEU_BADGE_SUCCESS} mb-3 inline-flex`}
                              >
                                বাংলা
                              </span>
                              {tour.translations.bn.title && (
                                <h5 className={`${NEU_HEADING} text-sm mb-2`}>
                                  {tour.translations.bn.title}
                                </h5>
                              )}
                              {tour.translations.bn.summary && (
                                <p className={`${NEU_MUTED} text-xs`}>
                                  {tour.translations.bn.summary}
                                </p>
                              )}
                            </div>
                          )}
                          {tour.translations.en && (
                            <div
                              className={`${NEU_SURFACE_INSET_SM} rounded-xl p-4`}
                            >
                              <span
                                className={`${NEU_BADGE_PRIMARY} mb-3 inline-flex`}
                              >
                                English
                              </span>
                              {tour.translations.en.title && (
                                <h5 className={`${NEU_HEADING} text-sm mb-2`}>
                                  {tour.translations.en.title}
                                </h5>
                              )}
                              {tour.translations.en.summary && (
                                <p className={`${NEU_MUTED} text-xs`}>
                                  {tour.translations.en.summary}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* System Information */}
                    <div className={`pt-6 border-t ${NEU_DIVIDER}`}>
                      <h4 className={`${NEU_HEADING} text-base mb-4`}>
                        System Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                          {
                            label: "Created",
                            value: formatDate(tour.createdAt),
                          },
                          {
                            label: "Updated",
                            value: formatDate(tour.updatedAt),
                          },
                          {
                            label: "Published",
                            value: tour.publishedAt
                              ? formatDate(tour.publishedAt)
                              : "—",
                          },
                          {
                            label: "Company",
                            value: tour.companyInfo?.name || "—",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                          >
                            <span className={`${NEU_LABEL} mb-1 block`}>
                              {item.label}
                            </span>
                            <span
                              className={`${NEU_MONO} text-sm font-medium truncate block`}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                        <div
                          className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                        >
                          <span className={`${NEU_LABEL} mb-1 block`}>
                            Author
                          </span>
                          <div className="flex items-center gap-2">
                            {tour.authorInfo?.avatarUrl && (
                              <div className="relative w-6 h-6 rounded-full overflow-hidden shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                                <Image
                                  src={tour.authorInfo.avatarUrl}
                                  alt={tour.authorInfo.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <span
                              className={`${NEU_MONO} text-sm font-medium truncate`}
                            >
                              {tour.authorInfo?.name || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* ── Right Sidebar ────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Booking Card */}
            <motion.div variants={fadeInUp}>
              <BookingCard
                tour={tour}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            </motion.div>

            {/* Location Card */}
            <motion.div variants={fadeInUp}>
              <div className={`${NEU_CARD} ${NEU_CARD_HOVER} p-6`}>
                <SectionHeader
                  icon={<MdLocationOn className="text-lg" />}
                  title="Location"
                />
                <div className={`${NEU_HEADING} text-base mb-2`}>
                  {tour.district}, {tour.division}
                </div>
                {tour.mainLocation?.address && (
                  <div className={`${NEU_MUTED} space-y-1`}>
                    {tour.mainLocation.address.line1 && (
                      <div className="text-xs">
                        {tour.mainLocation.address.line1}
                      </div>
                    )}
                    {tour.mainLocation.address.line2 && (
                      <div className="text-xs">
                        {tour.mainLocation.address.line2}
                      </div>
                    )}
                    <div className="text-xs">
                      {tour.mainLocation.address.city &&
                        `${tour.mainLocation.address.city}, `}
                      {tour.mainLocation.address.postalCode}
                    </div>
                  </div>
                )}
                {tour.mainLocation?.coordinates && (
                  <div
                    className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 mt-4`}
                  >
                    <span className={`${NEU_LABEL} mb-1 block`}>
                      Coordinates
                    </span>
                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#006666]">
                      {tour.mainLocation.coordinates.lat.toFixed(6)},{" "}
                      {tour.mainLocation.coordinates.lng.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Tour Features */}
            <motion.div variants={fadeInUp}>
              <div className={`${NEU_CARD} p-6`}>
                <SectionHeader
                  icon={<MdCheckCircle className="text-lg" />}
                  title="Tour Features"
                />
                <div className="space-y-2">
                  <InfoRow
                    label="Guide Included"
                    value={
                      <span
                        className={
                          tour.guideIncluded
                            ? NEU_BADGE_SUCCESS
                            : NEU_BADGE_DANGER
                        }
                      >
                        {tour.guideIncluded ? "Yes" : "No"}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Transport Included"
                    value={
                      <span
                        className={
                          tour.transportIncluded
                            ? NEU_BADGE_SUCCESS
                            : NEU_BADGE_DANGER
                        }
                      >
                        {tour.transportIncluded ? "Yes" : "No"}
                      </span>
                    }
                  />
                  <InfoRow
                    label="License Required"
                    value={
                      <span
                        className={
                          tour.licenseRequired ? NEU_BADGE_WARNING : NEU_BADGE
                        }
                      >
                        {tour.licenseRequired ? "Yes" : "No"}
                      </span>
                    }
                  />
                </div>
              </div>
            </motion.div>

            {/* Accessibility */}
            <motion.div variants={fadeInUp}>
              <div className={`${NEU_CARD} p-6`}>
                <SectionHeader
                  icon={<FaWheelchair className="text-lg" />}
                  title="Accessibility"
                />
                <div className="space-y-3">
                  {tour.accessibility?.wheelchair && (
                    <div className="flex items-center gap-2 text-[#00A63D] font-[family-name:var(--font-space-mono)] text-sm font-bold">
                      <MdCheckCircle /> Wheelchair Accessible
                    </div>
                  )}
                  {tour.accessibility?.familyFriendly && (
                    <div className="flex items-center gap-2 text-[#006666] font-[family-name:var(--font-space-mono)] text-sm font-bold">
                      <MdCheckCircle /> Family Friendly
                    </div>
                  )}
                  {tour.accessibility?.petFriendly && (
                    <div className="flex items-center gap-2 text-[#FE9900] font-[family-name:var(--font-space-mono)] text-sm font-bold">
                      <MdCheckCircle /> Pet Friendly
                    </div>
                  )}
                  {tour.accessibility?.notes && (
                    <div
                      className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3 mt-2`}
                    >
                      <span className={`${NEU_LABEL} mb-1 block`}>Notes</span>
                      <span className={`${NEU_MUTED} text-xs`}>
                        {tour.accessibility.notes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Accommodation */}
            {tour.accommodationType && tour.accommodationType.length > 0 && (
              <motion.div variants={fadeInUp}>
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<MdLocationCity className="text-lg" />}
                    title="Accommodation"
                  />
                  <div className="space-y-2">
                    {tour.accommodationType.map((type, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#006666] shadow-[1px_1px_2px_#004d4d,-1px_-1px_2px_#008080]" />
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
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<MdLocationOn className="text-lg" />}
                    title="Transport Modes"
                  />
                  <div className="flex flex-wrap gap-2">
                    {tour.transportModes.map((mode, idx) => (
                      <span key={idx} className={NEU_BADGE}>
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Emergency Contacts */}
            {tour.emergencyContacts && (
              <motion.div variants={fadeInUp}>
                <div className={`${NEU_CARD} p-6 border border-[#FF2157]/20`}>
                  <SectionHeader
                    icon={<MdOutlineHelp className="text-lg text-[#FF2157]" />}
                    title="Emergency Contacts"
                  />
                  <div className="space-y-3">
                    {[
                      {
                        label: "Police",
                        number: tour.emergencyContacts.policeNumber,
                      },
                      {
                        label: "Ambulance",
                        number: tour.emergencyContacts.ambulanceNumber,
                      },
                      {
                        label: "Fire Service",
                        number: tour.emergencyContacts.fireServiceNumber,
                      },
                      {
                        label: "Local Emergency",
                        number: tour.emergencyContacts.localEmergency,
                      },
                    ]
                      .filter((c) => c.number)
                      .map((c) => (
                        <div
                          key={c.label}
                          className={`${NEU_SURFACE_INSET_SM} rounded-xl p-3`}
                        >
                          <span className={`${NEU_LABEL} mb-1 block`}>
                            {c.label}
                          </span>
                          <a
                            href={`tel:${c.number}`}
                            className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] hover:text-[#FF2157] transition-colors text-sm"
                          >
                            {c.number}
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
                <div className={`${NEU_CARD} p-6`}>
                  <SectionHeader
                    icon={<MdOutlineMonetizationOn className="text-lg" />}
                    title="Payment Methods"
                  />
                  <div className="flex flex-wrap gap-2">
                    {tour.paymentMethods.map((method, idx) => (
                      <span key={idx} className={NEU_BADGE_SUCCESS}>
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Audience & Categories */}
            <motion.div variants={fadeInUp}>
              <div className={`${NEU_CARD} p-6`}>
                <h4 className={`${NEU_HEADING} text-base mb-4`}>
                  Audience & Categories
                </h4>
                <div className="space-y-4">
                  {tour.audience && tour.audience.length > 0 && (
                    <div>
                      <span className={`${NEU_LABEL} mb-2 block`}>
                        Audience
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tour.audience.map((aud, idx) => (
                          <span key={idx} className={NEU_BADGE_DANGER}>
                            {aud}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {tour.categories && tour.categories.length > 0 && (
                    <div>
                      <span className={`${NEU_LABEL} mb-2 block`}>
                        Categories
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tour.categories.map((cat, idx) => (
                          <span key={idx} className={NEU_BADGE_PRIMARY}>
                            {cat}
                          </span>
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

      {/* ── Global Image Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2938]/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-5xl w-full h-[80vh] rounded-2xl overflow-hidden shadow-[16px_16px_40px_#000000]"
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
                className={`absolute top-4 right-4 ${NEU_BTN_ICON} bg-[#E7E5E4]/90 text-base`}
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

// ─── Booking Card (extracted for reuse) ────────────────────────────
function BookingCard({
  tour,
  formatCurrency,
  formatDate,
}: {
  tour: TourDetailDTO;
  formatCurrency: (amount?: number, currency?: Currency) => string;
  formatDate: (d?: string) => string;
}) {
  const NEU_CARD_LOCAL =
    "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
  const NEU_SURFACE_INSET_SM_LOCAL =
    "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
  const NEU_LABEL_LOCAL =
    "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
  const NEU_MUTED_LOCAL =
    "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
  const NEU_BTN_PRIMARY_LOCAL =
    "w-full rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide py-3 " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200";

  return (
    <div className={`${NEU_CARD_LOCAL} p-6`}>
      {/* Price */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className={`${NEU_LABEL_LOCAL} mb-1`}>Starting from</div>
          <div className="font-[family-name:var(--font-space-mono)] font-bold text-3xl text-[#006666]">
            {tour.basePrice
              ? formatCurrency(tour.basePrice.amount, tour.basePrice.currency)
              : "—"}
          </div>
          <div className={`${NEU_MUTED_LOCAL} text-xs mt-1`}>per person</div>
        </div>
        {tour.bookingSummary && (
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <MdGroups className="text-[#006666] text-sm" />
              <span className={`${NEU_LABEL_LOCAL} normal-case`}>Seats</span>
            </div>
            <div className="font-[family-name:var(--font-space-mono)] font-bold text-xl text-[#1E2938]">
              {tour.bookingSummary.availableSeats}
            </div>
            <div className={`${NEU_MUTED_LOCAL} text-xs`}>
              of {tour.bookingSummary.totalSeats}
            </div>
          </div>
        )}
      </div>

      {/* Occupancy Bar */}
      {tour.bookingSummary && (
        <div className="mb-5">
          <div
            className={`${NEU_SURFACE_INSET_SM_LOCAL} rounded-full h-2.5 overflow-hidden`}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tour.bookingSummary.occupancyPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full rounded-full bg-[#006666] shadow-[2px_0px_4px_#004d4d]"
            />
          </div>
          <div className={`${NEU_MUTED_LOCAL} text-xs mt-1`}>
            {tour.bookingSummary.bookedSeats} bookings made
          </div>
        </div>
      )}

      {/* Discounts */}
      {tour.discounts && tour.discounts.length > 0 && (
        <div className="mb-5">
          <div className={`border-t border-[#1E2938]/10 pt-4`} />
          <div className="flex items-center gap-2 mb-3">
            <MdLocalOffer className="text-[#FE9900]" />
            <span className={`${NEU_LABEL_LOCAL} normal-case text-[#FE9900]`}>
              Active Offers
            </span>
          </div>
          <div className="space-y-3">
            {tour.discounts.map((discount, idx) => {
              const baseAmount = tour.basePrice.amount;
              let discountedAmount = baseAmount;
              let discountText = "";
              if (discount.type === TOUR_DISCOUNT_TYPE.PERCENTAGE) {
                discountedAmount = baseAmount * (1 - discount.value / 100);
                discountText = `${discount.value}% OFF`;
              } else if (discount.type === TOUR_DISCOUNT_TYPE.FLAT_AMOUNT) {
                discountedAmount = baseAmount - discount.value;
                discountText = `${formatCurrency(discount.value, tour.basePrice.currency)} OFF`;
              }
              return (
                <motion.div
                  key={discount.code || idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`${NEU_SURFACE_INSET_SM_LOCAL} rounded-xl p-3`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                      {discount.code || discount.discount}
                    </span>
                    <span className="font-[family-name:var(--font-space-mono)] font-bold text-xs text-[#FE9900]">
                      {discount.discount}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span>
                      <span className="text-[#1E2938]/40 line-through mr-2">
                        {formatCurrency(baseAmount, tour.basePrice.currency)}
                      </span>
                      <span className="font-bold text-[#00A63D]">
                        {formatCurrency(
                          discountedAmount,
                          tour.basePrice.currency,
                        )}
                      </span>
                    </span>
                    <span className="font-bold text-[#FE9900]">
                      {discountText}
                    </span>
                  </div>
                  {discount.validFrom && discount.validUntil && (
                    <div className={`${NEU_MUTED_LOCAL} text-xs mt-1`}>
                      Valid: {formatDate(discount.validFrom)} –{" "}
                      {formatDate(discount.validUntil)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next Departure */}
      {tour.nextDeparture && (
        <div
          className={`${NEU_SURFACE_INSET_SM_LOCAL} rounded-xl p-3 mb-5 flex items-center gap-2`}
        >
          <MdAccessTime className="text-[#FE9900]" />
          <span className={`${NEU_MUTED_LOCAL} text-xs`}>
            Next departure:{" "}
            <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#FE9900]">
              {formatDate(tour.nextDeparture)}
            </span>
          </span>
        </div>
      )}

      {/* Pickup Options */}
      {tour.pickupOptions && tour.pickupOptions.length > 0 && (
        <div className="mb-5">
          <div className={`border-t border-[#1E2938]/10 pt-4`} />
          <div className="flex items-center gap-2 mb-3">
            <MdLocationOn className="text-[#006666]" />
            <span className={`${NEU_LABEL_LOCAL} normal-case`}>
              Pickup Locations
            </span>
          </div>
          <div className="space-y-1">
            {tour.pickupOptions.map((p, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-sm p-2 rounded-lg hover:${NEU_SURFACE_INSET_SM_LOCAL} transition-all cursor-default`}
              >
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/70 text-xs">
                  {p.city}
                </span>
                <span className="font-[family-name:var(--font-space-mono)] font-bold text-xs text-[#006666]">
                  {formatCurrency(p.price, p.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button className={NEU_BTN_PRIMARY_LOCAL}>Book Now</button>
    </div>
  );
}
