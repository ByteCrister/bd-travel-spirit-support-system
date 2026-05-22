// components/guide-password-request/PasswordRequestsTable.tsx
"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Calendar,
  User,
} from "lucide-react";
import { PasswordRequestDto } from "@/types/guide/guide-forgot-password.types";
import { FORGOT_PASSWORD_STATUS } from "@/constants/guide-forgot-password.const";
import { formatDistanceToNow, format } from "date-fns";
import TableSkeleton from "./skeletons/TableSkeleton";
import { usePasswordRequestStore } from "@/store/guide/guide-password-request.store";
import { cn } from "@/lib/utils";
import {
  NEU_BTN_GHOST,
  NEU_HEADING,
  NEU_LABEL,
  NEU_MUTED,
  NEU_SURFACE_INSET,
  NEU_BADGE_SUCCESS,
  NEU_BADGE_WARNING,
  NEU_BADGE_DANGER,
  NEU_BADGE,
  NEU_ICON_WELL,
} from "@/styles/neu.styles";

// ── Local style constants ─────────────────────────────────────────────────
const TABLE_ROW =
  "group flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 p-4 rounded-xl cursor-pointer " +
  "bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c5,-4px_-4px_10px_#ffffff] border border-white/60 " +
  "hover:shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] " +
  "transition-all duration-250";
const CELL_NAME = "font-bold text-sm text-[#1E2938] font-[family-name:var(--font-space-mono)]";
const CELL_EMAIL = "text-xs text-[#1E2938]/50 flex items-center gap-1 font-[family-name:var(--font-jetbrains-mono)] mt-0.5";
const CELL_DATE_PRIMARY = "text-sm font-bold text-[#1E2938] font-[family-name:var(--font-space-mono)]";
const CELL_DATE_SUB = "text-xs text-[#1E2938]/45 font-[family-name:var(--font-jetbrains-mono)] mt-0.5";
const REASON_TEXT = "text-sm text-[#1E2938]/65 font-[family-name:var(--font-jetbrains-mono)] truncate max-w-[180px]";

const STATUS_CONFIG = {
  [FORGOT_PASSWORD_STATUS.PENDING]: {
    badge: NEU_BADGE_WARNING,
    label: "Pending",
    icon: Clock,
  },
  [FORGOT_PASSWORD_STATUS.APPROVED]: {
    badge: NEU_BADGE_SUCCESS,
    label: "Approved",
    icon: CheckCircle,
  },
  [FORGOT_PASSWORD_STATUS.REJECTED]: {
    badge: NEU_BADGE_DANGER,
    label: "Rejected",
    icon: XCircle,
  },
  [FORGOT_PASSWORD_STATUS.EXPIRED]: {
    badge: NEU_BADGE,
    label: "Expired",
    icon: AlertCircle,
  },
};

// ── Column header ─────────────────────────────────────────────────────────
const COLUMNS = ["Guide", "Reason", "Status", "Submitted", "Expires", ""];

// ── Animation variants ─────────────────────────────────────────────────────
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.045, duration: 0.3, ease: "easeOut" },
  }),
};

interface PasswordRequestsTableProps {
  onSelectRequest: (request: PasswordRequestDto) => void;
}

export function PasswordRequestsTable({
  onSelectRequest,
}: PasswordRequestsTableProps) {
  const { requests, isFetching } = usePasswordRequestStore();

  if (isFetching && requests.length === 0) return <TableSkeleton />;

  if (requests.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          NEU_SURFACE_INSET,
          "flex flex-col items-center justify-center py-16 px-4 rounded-2xl text-center"
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className={cn(NEU_ICON_WELL, "mb-4")}
        >
          <Mail className="h-7 w-7 text-[#1E2938]/30" />
        </motion.div>
        <h3 className={cn(NEU_HEADING, "text-base mb-2")}>No requests found</h3>
        <p className={NEU_MUTED}>Try adjusting your filters or check back later.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {/* Column Headers (desktop) */}
      <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr_auto] gap-4 px-4">
        {COLUMNS.map((col, i) => (
          <span key={i} className={NEU_LABEL}>
            {col}
          </span>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {requests.map((request, index) => (
          <StatusRow
            key={request.id}
            request={request}
            index={index}
            onSelect={onSelectRequest}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Row sub-component ──────────────────────────────────────────────────────
function StatusRow({
  request,
  index,
  onSelect,
}: {
  request: PasswordRequestDto;
  index: number;
  onSelect: (r: PasswordRequestDto) => void;
}) {
  const config =
    STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG[FORGOT_PASSWORD_STATUS.EXPIRED];
  const Icon = config.icon;
  const isExpired = new Date(request.expiresAt) < new Date();

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        TABLE_ROW,
        "md:grid md:grid-cols-[2fr_2fr_1fr_1.5fr_1.5fr_auto]"
      )}
      onClick={() => onSelect(request)}
    >
      {/* Guide */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 ring-2 ring-white/70 shadow-[2px_2px_5px_#c8c6c5]">
            <AvatarImage src={request.user.avatarUrl || undefined} />
            <AvatarFallback className="bg-[#006666] text-white text-sm font-bold font-[family-name:var(--font-space-mono)]">
              {request.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#E7E5E4] flex items-center justify-center shadow-[1px_1px_3px_#c8c6c5]">
            <User className="h-2.5 w-2.5 text-[#006666]" />
          </span>
        </div>
        <div className="min-w-0">
          <p className={CELL_NAME}>{request.user.name}</p>
          <p className={CELL_EMAIL}>
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{request.user.email}</span>
          </p>
        </div>
      </div>

      {/* Reason */}
      <p className={REASON_TEXT}>{request.reason}</p>

      {/* Status Badge */}
      <div>
        <motion.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(config.badge, "flex items-center gap-1.5 w-fit px-2.5 py-1")}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.label}
        </motion.span>
      </div>

      {/* Submitted */}
      <div>
        <p className={CELL_DATE_PRIMARY}>
          {format(new Date(request.createdAt), "MMM d, yyyy")}
        </p>
        <p className={CELL_DATE_SUB}>
          {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Expires */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "p-1.5 rounded-lg",
            isExpired
              ? "bg-[#FF2157]/10 shadow-[1px_1px_3px_#c8c6c5]"
              : "shadow-[1px_1px_3px_#c8c6c5,-1px_-1px_3px_#ffffff] bg-[#E7E5E4]"
          )}
        >
          <Calendar
            className={cn(
              "h-3.5 w-3.5",
              isExpired ? "text-[#FF2157]" : "text-[#1E2938]/50"
            )}
          />
        </div>
        <span
          className={cn(
            "text-sm font-[family-name:var(--font-jetbrains-mono)]",
            isExpired ? "text-[#FF2157] font-bold" : "text-[#1E2938]/70"
          )}
        >
          {format(new Date(request.expiresAt), "MMM d, yyyy")}
        </span>
      </div>

      {/* Action */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(request);
        }}
        className={cn(
          NEU_BTN_GHOST,
          "px-3 py-1.5 text-xs flex items-center gap-1.5 shrink-0"
        )}
      >
        <Eye className="h-3.5 w-3.5" />
        View
      </button>
    </motion.div>
  );
}