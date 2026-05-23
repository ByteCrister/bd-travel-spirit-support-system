"use client";

// components/travelers/TravelerDetails.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TravelerBooking,
  TravelerCancellation,
  TravelerFAQ,
  TravelerLikedTour,
  TravelerReport,
  TravelerReview,
  TravelerSharedTour,
  TravelerTabName,
  TravelerViewedArticle,
  TravelerViewedTour,
} from "@/types/user/traveler.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useTravelerStore } from "@/store/traveler/travelers.store";
import { TravelerDetailsPagination } from "./TravelerDetailsPagination";
import { extractErrorMessage } from "@/utils/axios/extract-error-message";
import { showToast } from "@/components/global/showToast";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  ShieldOff,
  Lock,
  Unlock,
  UserX,
  UserCheck,
  Calendar,
  Mail,
  AlertTriangle,
  BookOpen,
  Star,
  Flag,
  HelpCircle,
  Heart,
  Share2,
  Eye,
  FileText,
  XCircle,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM =
  "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_CARD_HEADER =
  "px-5 py-3.5 border-b border-[#1E2938]/10 flex items-center justify-between bg-[#E7E5E4]/80";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#007777] " +
  "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-[#F1F2F5] " +
  "active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_DANGER =
  "rounded-xl bg-[#FF2157] text-white font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#e01a4b] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "active:shadow-[inset_3px_3px_6px_#cc0040] " +
  "transition-all duration-200";
const NEU_BTN_WARNING =
  "rounded-xl bg-[#FE9900] text-white font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#e68a00] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "active:shadow-[inset_3px_3px_6px_#cc7a00] " +
  "transition-all duration-200";
const NEU_BTN_SUCCESS =
  "rounded-xl bg-[#00A63D] text-white font-[family-name:var(--font-space-mono)] font-bold " +
  "shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "hover:bg-[#009635] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] " +
  "active:shadow-[inset_3px_3px_6px_#007a2e] " +
  "transition-all duration-200";
const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_BADGE_BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";

// ── Helpers ───────────────────────────────────────────────────
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

function getAvatarGradient(name: string) {
  const gradients = [
    "from-[#006666] to-[#004d4d]",
    "from-[#006666]/80 to-[#008080]",
    "from-[#00A63D] to-[#007a2e]",
    "from-[#FE9900] to-[#cc7a00]",
    "from-[#FF2157] to-[#cc0040]",
    "from-[#1E2938] to-[#2d3f52]",
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
}

// ── Tab config ────────────────────────────────────────────────
const tabConfig: {
  value: TravelerTabName;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "bookings", label: "Bookings", icon: BookOpen },
  { value: "reviews", label: "Reviews", icon: Star },
  { value: "reports", label: "Reports", icon: Flag },
  { value: "faqs", label: "FAQs", icon: HelpCircle },
  { value: "likedTours", label: "Liked", icon: Heart },
  { value: "sharedTours", label: "Shared", icon: Share2 },
  { value: "viewedTours", label: "Viewed Tours", icon: Eye },
  { value: "viewedArticles", label: "Articles", icon: FileText },
  { value: "cancellations", label: "Cancellations", icon: XCircle },
];

// ── Status config ─────────────────────────────────────────────
const statusConfig: Record<string, { badgeClass: string; dotColor: string }> = {
  active: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`,
    dotColor: "bg-[#00A63D]",
  },
  suspended: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157]`,
    dotColor: "bg-[#FF2157]",
  },
  locked: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#FE9900]/10 text-[#FE9900]`,
    dotColor: "bg-[#FE9900]",
  },
  inactive: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/60`,
    dotColor: "bg-[#1E2938]/40",
  },
  confirmed: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#006666]/10 text-[#006666]`,
    dotColor: "bg-[#006666]",
  },
  pending: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#FE9900]/10 text-[#FE9900]`,
    dotColor: "bg-[#FE9900]",
  },
  cancelled: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157]`,
    dotColor: "bg-[#FF2157]",
  },
  approved: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`,
    dotColor: "bg-[#00A63D]",
  },
  rejected: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157]`,
    dotColor: "bg-[#FF2157]",
  },
  open: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#006666]/10 text-[#006666]`,
    dotColor: "bg-[#006666]",
  },
  resolved: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`,
    dotColor: "bg-[#00A63D]",
  },
  high: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157]`,
    dotColor: "bg-[#FF2157]",
  },
  medium: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#FE9900]/10 text-[#FE9900]`,
    dotColor: "bg-[#FE9900]",
  },
  low: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/60`,
    dotColor: "bg-[#1E2938]/40",
  },
  answered: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`,
    dotColor: "bg-[#00A63D]",
  },
  unanswered: {
    badgeClass: `${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/50`,
    dotColor: "bg-[#1E2938]/30",
  },
};

// ── Sub-components ────────────────────────────────────────────
function StatusBadge({ value }: { value: string }) {
  const cfg = statusConfig[value?.toLowerCase()] ?? statusConfig.inactive;
  return (
    <span className={cn(cfg.badgeClass, "capitalize")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dotColor)} />
      {value}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating
              ? "text-[#FE9900] fill-[#FE9900]"
              : "text-[#1E2938]/15 fill-[#1E2938]/15",
          )}
        />
      ))}
      <span className="text-xs font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]/60 ml-1">
        {rating}
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function TravelerDetails({ id }: { id: string }) {
  const router = useRouter();
  const {
    fetchTravelerById,
    fetchBookings,
    fetchReviews,
    fetchReports,
    fetchFAQs,
    fetchLikedTours,
    fetchSharedTours,
    fetchViewedTours,
    fetchViewedArticles,
    fetchCancellations,
    suspendTraveler,
    unsuspendTraveler,
    lockTraveler,
    unlockTraveler,
    travelerDetailCache,
    loading,
    errors,
    tabCache,
  } = useTravelerStore();

  const traveler = travelerDetailCache.get(id)?.data;
  const detailLoading = loading.detail;
  const detailError = errors.detail;

  const [activeTab, setActiveTab] = useState<TravelerTabName>("bookings");
  const [pageMap, setPageMap] = useState<Map<TravelerTabName, number>>(
    () => new Map(),
  );
  const limit = 10;
  const currentPage = pageMap.get(activeTab) || 1;
  const setPage = (page: number) =>
    setPageMap((prev) => new Map(prev).set(activeTab, page));

  useEffect(() => {
    fetchTravelerById(id);
  }, [fetchTravelerById, id]);

  useEffect(() => {
    const fetchTabData = async () => {
      try {
        switch (activeTab) {
          case "bookings":
            await fetchBookings(id, currentPage, limit);
            break;
          case "reviews":
            await fetchReviews(id, currentPage, limit);
            break;
          case "reports":
            await fetchReports(id, currentPage, limit);
            break;
          case "faqs":
            await fetchFAQs(id, currentPage, limit);
            break;
          case "likedTours":
            await fetchLikedTours(id, currentPage, limit);
            break;
          case "sharedTours":
            await fetchSharedTours(id, currentPage, limit);
            break;
          case "viewedTours":
            await fetchViewedTours(id, currentPage, limit);
            break;
          case "viewedArticles":
            await fetchViewedArticles(id, currentPage, limit);
            break;
          case "cancellations":
            await fetchCancellations(id, currentPage, limit);
            break;
        }
      } catch (error: unknown) {
        showToast.error("Failed to load data", extractErrorMessage(error));
      }
    };
    fetchTabData();
  }, [
    id,
    activeTab,
    currentPage,
    fetchBookings,
    fetchReviews,
    fetchReports,
    fetchFAQs,
    fetchLikedTours,
    fetchSharedTours,
    fetchViewedTours,
    fetchViewedArticles,
    fetchCancellations,
  ]);

  const getTabCacheKey = (tab: TravelerTabName, page: number) =>
    `${id}:${tab}:${page}:${limit}`;
  const tabData = tabCache.get(getTabCacheKey(activeTab, currentPage))?.data;
  const tabLoadingKey = `tab:${id}:${activeTab}`;
  const tabLoading = loading[tabLoadingKey];
  const tabError = errors[tabLoadingKey];

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays] = useState<number | undefined>();
  const [lockReason, setLockReason] = useState("");

  const handleSuspend = async () => {
    try {
      await suspendTraveler(id, suspendReason, suspendDays);
      showToast.success("Traveler suspended");
      setSuspendOpen(false);
      setSuspendReason("");
      setSuspendDays(undefined);
    } catch (error: unknown) {
      showToast.error("Failed to suspend", extractErrorMessage(error));
    }
  };
  const handleUnsuspend = async () => {
    try {
      await unsuspendTraveler(id);
      showToast.success("Traveler unsuspended");
    } catch (error: unknown) {
      showToast.error("Failed to unsuspend", extractErrorMessage(error));
    }
  };
  const handleLock = async () => {
    try {
      await lockTraveler(id, lockReason);
      showToast.success("Traveler locked");
      setLockOpen(false);
      setLockReason("");
    } catch (error: unknown) {
      showToast.error("Failed to lock", extractErrorMessage(error));
    }
  };
  const handleUnlock = async () => {
    try {
      await unlockTraveler(id);
      showToast.success("Traveler unlocked");
    } catch (error: unknown) {
      showToast.error("Failed to unlock", extractErrorMessage(error));
    }
  };

  // Error state
  if (detailError) {
    return (
      <div className={`${NEU_PAGE_BG} flex items-center justify-center`}>
        <div className={`flex flex-col items-center gap-3 p-8 ${NEU_CARD_SM}`}>
          <div className={`${NEU_ICON_WELL} text-[#FF2157]`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p
            className={`text-sm font-bold text-[#FF2157] font-[family-name:var(--font-space-mono)]`}
          >
            Error loading traveler: {detailError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={NEU_PAGE_BG}>
      <div className="container mx-auto py-8 px-4 space-y-6 max-w-[1400px]">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => router.back()}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs -ml-2",
              NEU_BTN_GHOST,
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Travelers
          </button>
        </motion.div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className={NEU_CARD}
        >
          {/* Teal accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#006666] via-[#008080] to-[#004d4d] rounded-t-2xl" />

          <div className="p-6">
            {detailLoading && !traveler ? (
              <div className="flex items-center gap-5">
                <div
                  className={`h-20 w-20 rounded-2xl flex-shrink-0 ${NEU_SKELETON}`}
                />
                <div className="space-y-2.5 flex-1">
                  <div className={`h-5 w-48 ${NEU_SKELETON}`} />
                  <div className={`h-4 w-64 ${NEU_SKELETON}`} />
                  <div className={`h-4 w-40 ${NEU_SKELETON}`} />
                </div>
              </div>
            ) : traveler ? (
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Avatar className="h-20 w-20 rounded-2xl shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff]">
                    <AvatarImage
                      src={traveler.avatarUrl}
                      className="object-cover rounded-2xl"
                    />
                    <AvatarFallback
                      className={cn(
                        "text-lg font-bold text-white bg-gradient-to-br rounded-2xl",
                        getAvatarGradient(traveler.name),
                      )}
                    >
                      {getInitials(traveler.name)}
                    </AvatarFallback>
                  </Avatar>
                  {traveler.accountStatus === "active" && (
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-[#00A63D] border-2 border-[#E7E5E4]" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className={`text-xl ${NEU_HEADING}`}>
                      {traveler.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Mail className="h-3.5 w-3.5 text-[#1E2938]/40" />
                      <p
                        className={`text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50`}
                      >
                        {traveler.email}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={traveler.accountStatus} />
                    {traveler.isVerified ? (
                      <span
                        className={`${NEU_BADGE_BASE} bg-[#006666]/10 text-[#006666] gap-1`}
                      >
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span
                        className={`${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/50 gap-1`}
                      >
                        <ShieldOff className="h-3 w-3" /> Unverified
                      </span>
                    )}
                    {traveler.isLocked && (
                      <span
                        className={`${NEU_BADGE_BASE} bg-[#FE9900]/10 text-[#FE9900] gap-1`}
                      >
                        <Lock className="h-3 w-3" /> Locked
                      </span>
                    )}
                    {traveler.isSuspended && (
                      <span
                        className={`${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157] gap-1`}
                      >
                        <UserX className="h-3 w-3" /> Suspended
                      </span>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs ${NEU_MUTED}`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {format(new Date(traveler.createdAt), "PPP")}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 sm:ml-auto sm:flex-shrink-0">
                  {/* Suspend / Unsuspend */}
                  {traveler.isSuspended ? (
                    <button
                      onClick={handleUnsuspend}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 text-xs",
                        NEU_BTN_SUCCESS,
                      )}
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Unsuspend
                    </button>
                  ) : (
                    <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                      <DialogTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs",
                            NEU_BTN_DANGER,
                          )}
                        >
                          <UserX className="h-3.5 w-3.5" /> Suspend
                        </button>
                      </DialogTrigger>
                      <DialogContent
                        className={cn(
                          "rounded-2xl border-none",
                          "bg-[#E7E5E4] shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff]",
                        )}
                      >
                        <DialogHeader>
                          <DialogTitle className={NEU_HEADING}>
                            Suspend Traveler
                          </DialogTitle>
                          <DialogDescription className={NEU_MUTED}>
                            Provide a reason and optional duration (in days).
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="reason" className={NEU_LABEL}>
                              Reason
                            </Label>
                            <Textarea
                              id="reason"
                              value={suspendReason}
                              onChange={(e) => setSuspendReason(e.target.value)}
                              placeholder="Suspension reason"
                              className={cn(NEU_INPUT, "resize-none")}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="days" className={NEU_LABEL}>
                              Duration (days, optional)
                            </Label>
                            <Input
                              id="days"
                              type="number"
                              min="1"
                              value={suspendDays || ""}
                              onChange={(e) =>
                                setSuspendDays(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                )
                              }
                              className={NEU_INPUT}
                              placeholder="Leave empty for indefinite"
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-2">
                          <button
                            onClick={() => setSuspendOpen(false)}
                            className={cn("px-4 py-2 text-xs", NEU_BTN_GHOST)}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSuspend}
                            className={cn("px-4 py-2 text-xs", NEU_BTN_DANGER)}
                          >
                            Confirm Suspend
                          </button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Lock / Unlock */}
                  {traveler.isLocked ? (
                    <button
                      onClick={handleUnlock}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 text-xs",
                        NEU_BTN_PRIMARY,
                      )}
                    >
                      <Unlock className="h-3.5 w-3.5" /> Unlock
                    </button>
                  ) : (
                    <Dialog open={lockOpen} onOpenChange={setLockOpen}>
                      <DialogTrigger asChild>
                        <button
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs",
                            NEU_BTN_WARNING,
                          )}
                        >
                          <Lock className="h-3.5 w-3.5" /> Lock
                        </button>
                      </DialogTrigger>
                      <DialogContent
                        className={cn(
                          "rounded-2xl border-none",
                          "bg-[#E7E5E4] shadow-[12px_12px_24px_#c8c6c5,-12px_-12px_24px_#ffffff]",
                        )}
                      >
                        <DialogHeader>
                          <DialogTitle className={NEU_HEADING}>
                            Lock Traveler
                          </DialogTitle>
                          <DialogDescription className={NEU_MUTED}>
                            Optionally provide a reason for locking this
                            account.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="lockReason" className={NEU_LABEL}>
                              Reason (optional)
                            </Label>
                            <Textarea
                              id="lockReason"
                              value={lockReason}
                              onChange={(e) => setLockReason(e.target.value)}
                              placeholder="Lock reason"
                              className={cn(NEU_INPUT, "resize-none")}
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-2">
                          <button
                            onClick={() => setLockOpen(false)}
                            className={cn("px-4 py-2 text-xs", NEU_BTN_GHOST)}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleLock}
                            className={cn("px-4 py-2 text-xs", NEU_BTN_WARNING)}
                          >
                            Confirm Lock
                          </button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TravelerTabName)}
            className="space-y-4"
          >
            {/* Tab list */}
            <TabsList className="flex flex-wrap h-auto gap-1.5 bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] rounded-2xl p-1.5 w-full border-none">
              {tabConfig.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold",
                    "font-[family-name:var(--font-space-mono)]",
                    "text-[#1E2938]/50 transition-all duration-200",
                    "hover:text-[#1E2938] hover:shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
                    "data-[state=active]:bg-[#006666] data-[state=active]:text-white",
                    "data-[state=active]:shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab content */}
            {(tabConfig.map((t) => t.value) as TravelerTabName[]).map((tab) => (
              <TabsContent key={tab} value={tab}>
                <AnimatePresence mode="wait">
                  {activeTab === tab && (
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className={NEU_CARD}
                    >
                      {/* Tab card header */}
                      <div className={NEU_CARD_HEADER}>
                        <div className="flex items-center gap-2.5">
                          {(() => {
                            const cfg = tabConfig.find((t) => t.value === tab);
                            const Icon = cfg?.icon;
                            return Icon ? (
                              <Icon className="h-4 w-4 text-[#006666]" />
                            ) : null;
                          })()}
                          <h3 className={`text-sm capitalize ${NEU_HEADING}`}>
                            {tab.replace(/([A-Z])/g, " $1").trim()}
                          </h3>
                        </div>
                        {tabData?.data &&
                          tabData?.data?.length > 0 &&
                          !tabLoading && (
                            <span
                              className={`text-xs tabular-nums ${NEU_MUTED}`}
                            >
                              {tabData?.data.length} of {tabData?.total} results
                            </span>
                          )}
                      </div>

                      <div className="p-2">
                        {tabLoading ? (
                          <div className="p-5 space-y-3">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-10 w-full ${NEU_SKELETON}`}
                              />
                            ))}
                          </div>
                        ) : tabError ? (
                          <div className="flex items-center gap-2.5 p-5">
                            <AlertTriangle className="h-4 w-4 text-[#FF2157]" />
                            <p
                              className={`text-sm text-[#FF2157] font-[family-name:var(--font-space-mono)]`}
                            >
                              {tabError}
                            </p>
                          </div>
                        ) : tabData?.data?.length ? (
                          <>
                            <div className="rounded-xl overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-[#1E2938]/10 bg-[#E7E5E4]/60 hover:bg-[#E7E5E4]/60">
                                    {tab === "bookings" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Ref
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Participants
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Paid
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Status
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Booked At
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "reviews" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Rating
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Comment
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Approved
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Date
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "reports" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Reason
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Status
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Priority
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Created
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "faqs" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Question
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Status
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Likes / Dislikes
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Created
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "likedTours" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Code
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Liked At
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "sharedTours" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Code
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Shared At
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Platform
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "viewedTours" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Code
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Viewed At
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Duration (s)
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "viewedArticles" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Article
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Slug
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Viewed At
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Duration (s)
                                        </TableHead>
                                      </>
                                    )}
                                    {tab === "cancellations" && (
                                      <>
                                        <TableHead
                                          className={cn(NEU_LABEL, "pl-4 py-3")}
                                        >
                                          Ref
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Tour
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Paid
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Cancelled At
                                        </TableHead>
                                        <TableHead
                                          className={cn(NEU_LABEL, "py-3")}
                                        >
                                          Reason
                                        </TableHead>
                                      </>
                                    )}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tabData.data.map(
                                    (item: unknown, idx: number) => {
                                      const rowCls = cn(
                                        "border-[#1E2938]/6 transition-all duration-150",
                                        "hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
                                        idx % 2 === 0
                                          ? "bg-[#E7E5E4]"
                                          : "bg-[#E7E5E4]/60",
                                      );
                                      const cellCls = `py-3 text-sm ${NEU_MONO} text-[#1E2938]/70`;
                                      const firstCellCls = `pl-4 py-3 text-sm ${NEU_MONO} text-[#1E2938]/70`;

                                      if (tab === "bookings") {
                                        const b = item as TravelerBooking;
                                        return (
                                          <TableRow
                                            key={b._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50",
                                              )}
                                            >
                                              {b.bookingReference}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {b.tour.title}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              {b.totalParticipants}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-bold text-[#00A63D]",
                                              )}
                                            >
                                              ${b.totalPaid}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              <StatusBadge value={b.status} />
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(b.bookedAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "reviews") {
                                        const r = item as TravelerReview;
                                        return (
                                          <TableRow
                                            key={r._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {r.tour.title}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              <StarRating rating={r.rating} />
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "max-w-[220px] truncate text-[#1E2938]/50",
                                              )}
                                            >
                                              {r.comment}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              {r.isApproved ? (
                                                <span
                                                  className={`${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`}
                                                >
                                                  Yes
                                                </span>
                                              ) : (
                                                <span
                                                  className={`${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/50`}
                                                >
                                                  No
                                                </span>
                                              )}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(r.createdAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "reports") {
                                        const r = item as TravelerReport;
                                        return (
                                          <TableRow
                                            key={r._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {r.tour.title}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "text-[#1E2938]/50",
                                              )}
                                            >
                                              {r.reason}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              <StatusBadge value={r.status} />
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              <StatusBadge value={r.priority} />
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(r.createdAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "faqs") {
                                        const f = item as TravelerFAQ;
                                        return (
                                          <TableRow
                                            key={f._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {f.tour.title}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "max-w-[200px] truncate text-[#1E2938]/50",
                                              )}
                                            >
                                              {f.question}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              <StatusBadge value={f.status} />
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              <span className="text-[#00A63D] font-bold">
                                                {f.likeCount}
                                              </span>
                                              <span className="text-[#1E2938]/20 mx-1">
                                                /
                                              </span>
                                              <span className="text-[#FF2157] font-bold">
                                                {f.dislikeCount}
                                              </span>
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(f.createdAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "likedTours") {
                                        const l = item as TravelerLikedTour;
                                        return (
                                          <TableRow
                                            key={l.tour._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {l.tour.title}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50",
                                              )}
                                            >
                                              {l.tour.uniqueTourCode}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(l.likedAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "sharedTours") {
                                        const s = item as TravelerSharedTour;
                                        return (
                                          <TableRow
                                            key={s.tour._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {s.tour.title}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50",
                                              )}
                                            >
                                              {s.tour.uniqueTourCode}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(s.sharedAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              {s.platform ? (
                                                <span
                                                  className={`${NEU_BADGE_BASE} bg-[#006666]/10 text-[#006666] capitalize`}
                                                >
                                                  {s.platform}
                                                </span>
                                              ) : (
                                                <span className="text-[#1E2938]/30">
                                                  —
                                                </span>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "viewedTours") {
                                        const v = item as TravelerViewedTour;
                                        return (
                                          <TableRow
                                            key={v.tour._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {v.tour.title}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50",
                                              )}
                                            >
                                              {v.tour.uniqueTourCode}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(v.viewedAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              {v.durationSeconds ?? (
                                                <span className="text-[#1E2938]/30">
                                                  —
                                                </span>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "viewedArticles") {
                                        const v = item as TravelerViewedArticle;
                                        return (
                                          <TableRow
                                            key={v.article._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {v.article.title}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50",
                                              )}
                                            >
                                              {v.article.slug}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {format(
                                                new Date(v.viewedAt),
                                                "PP",
                                              )}
                                            </TableCell>
                                            <TableCell className={cellCls}>
                                              {v.durationSeconds ?? (
                                                <span className="text-[#1E2938]/30">
                                                  —
                                                </span>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      if (tab === "cancellations") {
                                        const c = item as TravelerCancellation;
                                        return (
                                          <TableRow
                                            key={c._id}
                                            className={rowCls}
                                          >
                                            <TableCell
                                              className={cn(
                                                firstCellCls,
                                                "font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50",
                                              )}
                                            >
                                              {c.bookingReference}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-bold font-[family-name:var(--font-space-mono)]",
                                              )}
                                            >
                                              {c.tour.title}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "font-bold text-[#FF2157]",
                                              )}
                                            >
                                              ${c.totalPaid}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "tabular-nums",
                                              )}
                                            >
                                              {c.cancellation?.cancelledAt ? (
                                                format(
                                                  new Date(
                                                    c.cancellation.cancelledAt,
                                                  ),
                                                  "PP",
                                                )
                                              ) : (
                                                <span className="text-[#1E2938]/30">
                                                  —
                                                </span>
                                              )}
                                            </TableCell>
                                            <TableCell
                                              className={cn(
                                                cellCls,
                                                "max-w-[200px] truncate text-[#1E2938]/50",
                                              )}
                                            >
                                              {c.cancellation?.reason ?? (
                                                <span className="text-[#1E2938]/30">
                                                  —
                                                </span>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        );
                                      }
                                      return null;
                                    },
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            {tabData.totalPages > 1 && (
                              <div className="mt-4 flex justify-center pb-2">
                                <TravelerDetailsPagination
                                  currentPage={currentPage}
                                  totalPages={tabData.totalPages}
                                  onPageChange={setPage}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className={NEU_ICON_WELL}>
                              {(() => {
                                const cfg = tabConfig.find(
                                  (t) => t.value === tab,
                                );
                                const Icon = cfg?.icon;
                                return Icon ? (
                                  <Icon className="h-6 w-6 text-[#1E2938]/30" />
                                ) : null;
                              })()}
                            </div>
                            <p
                              className={`text-sm ${NEU_HEADING} text-[#1E2938]/50`}
                            >
                              No data available
                            </p>
                            <p className={`text-xs ${NEU_MUTED}`}>
                              This traveler has no{" "}
                              {tab
                                .replace(/([A-Z])/g, " $1")
                                .trim()
                                .toLowerCase()}{" "}
                              yet.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
