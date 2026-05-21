"use client";

import { motion } from "framer-motion";
import {
  FiCalendar, FiMapPin, FiEye, FiClock,
  FiCheckCircle, FiXCircle, FiAlertCircle,
} from "react-icons/fi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { Booking } from "@/types/dashboard/dashboard.types";
import { BOOKING_STATUS } from "@/constants/tour-booking.const";

// ── Neumorphic design tokens ──────────────────────────────────────────────────
const NEU_CARD = "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET_SM = "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  "shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] " +
  "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] " +
  "transition-all duration-200";
const NEU_SKELETON = "rounded-lg bg-[#d0cecd] animate-pulse";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_MONO = "font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]";
const NEU_DIVIDER = "border-[#1E2938]/10";

// ── Status configs ────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  [BOOKING_STATUS.CONFIRMED]: { label: "Confirmed", color: "bg-[#00A63D]/10 text-[#00A63D]", icon: <FiCheckCircle className="h-3 w-3" /> },
  [BOOKING_STATUS.PENDING]: { label: "Pending", color: "bg-[#FE9900]/10 text-[#FE9900]", icon: <FiClock className="h-3 w-3" /> },
  [BOOKING_STATUS.CANCELLED]: { label: "Cancelled", color: "bg-[#FF2157]/10 text-[#FF2157]", icon: <FiXCircle className="h-3 w-3" /> },
  [BOOKING_STATUS.COMPLETED]: { label: "Completed", color: "bg-[#006666]/10 text-[#006666]", icon: <FiCheckCircle className="h-3 w-3" /> },
  [BOOKING_STATUS.NO_SHOW]: { label: "No Show", color: "bg-[#FE9900]/10 text-[#FE9900]", icon: <FiAlertCircle className="h-3 w-3" /> },
  [BOOKING_STATUS.REFUNDED]: { label: "Refunded", color: "bg-[#8B5CF6]/10 text-[#8B5CF6]", icon: <FiCheckCircle className="h-3 w-3" /> },
};

const avatarColors = [
  "from-[#006666] to-[#008080]",
  "from-[#3B82F6] to-[#6366F1]",
  "from-[#8B5CF6] to-[#A78BFA]",
  "from-[#00A63D] to-[#34D399]",
  "from-[#FE9900] to-[#FBBF24]",
];

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

interface RecentBookingsProps {
  bookings: Booking[];
  loading?: boolean;
  onView?: (bookingId: string) => void;
  className?: string;
}

export function RecentBookings({ bookings, loading = false, onView, className }: RecentBookingsProps) {
  if (loading) {
    return (
      <div className={cn(NEU_CARD, "p-5", className)}>
        <div className="flex items-center gap-2 mb-5">
          <div className={cn(NEU_SKELETON, "h-5 w-5 rounded-lg")} />
          <div className={cn(NEU_SKELETON, "h-4 w-36")} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn(NEU_CARD_SM, "p-4")}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(NEU_SKELETON, "h-10 w-10 rounded-xl")} />
                  <div className="space-y-2 flex-1">
                    <div className={cn(NEU_SKELETON, "h-3.5 w-32")} />
                    <div className={cn(NEU_SKELETON, "h-3 w-24")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={cn(NEU_SKELETON, "h-3.5 w-16")} />
                  <div className={cn(NEU_SKELETON, "h-3 w-12")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(NEU_CARD, "p-5", className)}>
      {/* Header */}
      <div className={cn("flex items-center gap-2.5 pb-4 mb-4 border-b", NEU_DIVIDER)}>
        <div className="p-2 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
          <FiCalendar className="h-4 w-4 text-[#006666]" />
        </div>
        <h3 className={cn(NEU_HEADING, "text-base")}>Recent Bookings</h3>
      </div>

      {/* List */}
      <div className="max-h-[400px] overflow-y-auto pr-1 space-y-2.5">
        {bookings.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center">
              <FiCalendar className="h-6 w-6 text-[#1E2938]/30" />
            </div>
            <p className={cn(NEU_HEADING, "text-sm")}>No recent bookings</p>
          </div>
        ) : (
          bookings.map((booking, index) => {
            const sCfg = statusConfig[booking.status] ?? { label: booking.status, color: "bg-[#1E2938]/10 text-[#1E2938]", icon: <FiAlertCircle className="h-3 w-3" /> };
            const avatarGradient = avatarColors[index % avatarColors.length];

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  NEU_CARD_SM,
                  "p-3.5 transition-shadow duration-200",
                  "hover:shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Avatar + user info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                      `bg-gradient-to-br ${avatarGradient}`,
                      "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]"
                    )}>
                      {booking.user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={cn(NEU_HEADING, "text-sm truncate")}>{booking.user.name}</h4>
                        <span className={cn(
                          "flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold",
                          NEU_SURFACE_INSET_SM, sCfg.color
                        )}>
                          {sCfg.icon}
                          {sCfg.label}
                        </span>
                      </div>
                      <p className={cn(NEU_MUTED, "text-xs truncate")}>{booking.tour.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <FiMapPin className="h-3 w-3 text-[#1E2938]/30" />
                        <span className={cn(NEU_MUTED, "text-xs truncate")}>{booking.tour.destination}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount + date + view */}
                  <div className="flex-shrink-0 text-right space-y-1">
                    <div className="flex items-center justify-end gap-1">
                      <FaBangladeshiTakaSign className="h-3 w-3 text-[#00A63D]" />
                      <span className={cn(NEU_MONO, "text-sm font-bold tabular-nums")}>{formatCurrency(booking.amount)}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <FiClock className="h-3 w-3 text-[#1E2938]/30" />
                      <span className={cn(NEU_MUTED, "text-xs")}>{formatDate(booking.bookingDate)}</span>
                    </div>
                    {onView && (
                      <button
                        onClick={() => onView(booking.id)}
                        className={cn(NEU_BTN_GHOST, "px-2.5 py-1 text-xs flex items-center gap-1 mt-1 ml-auto")}
                      >
                        <FiEye className="h-3 w-3" /> View
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}