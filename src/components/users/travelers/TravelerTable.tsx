"use client";

// components/travelers/TravelerTable.tsx
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TravelerListItem } from "@/types/user/traveler.types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldOff, ChevronRight, SearchX } from "lucide-react";

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE_RAISED =
  "bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_BADGE_BASE =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

// ── Status config ─────────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; badgeClass: string; dotColor: string }
> = {
  active: {
    label: "Active",
    badgeClass: `${NEU_BADGE_BASE} bg-[#00A63D]/10 text-[#00A63D]`,
    dotColor: "bg-[#00A63D]",
  },
  suspended: {
    label: "Suspended",
    badgeClass: `${NEU_BADGE_BASE} bg-[#FF2157]/10 text-[#FF2157]`,
    dotColor: "bg-[#FF2157]",
  },
  locked: {
    label: "Locked",
    badgeClass: `${NEU_BADGE_BASE} bg-[#FE9900]/10 text-[#FE9900]`,
    dotColor: "bg-[#FE9900]",
  },
  inactive: {
    label: "Inactive",
    badgeClass: `${NEU_BADGE_BASE} bg-[#1E2938]/10 text-[#1E2938]/60`,
    dotColor: "bg-[#1E2938]/40",
  },
};

// ── Animations ────────────────────────────────────────────────
const tableVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
  exit: { opacity: 0, x: 8, transition: { duration: 0.2 } },
};

// ── Helpers ───────────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

// ── Props ─────────────────────────────────────────────────────
interface TravelerTableProps {
  travelers: TravelerListItem[];
  onRowClick: (id: string) => void;
  emptyMessage?: string;
}

export function TravelerTable({
  travelers,
  onRowClick,
  emptyMessage = "No travelers found",
}: TravelerTableProps) {
  // Empty state
  if (travelers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <div className={`p-4 rounded-2xl ${NEU_SURFACE_RAISED}`}>
          <SearchX className="h-8 w-8 text-[#1E2938]/30" />
        </div>
        <div className="text-center">
          <p className={`text-sm font-semibold ${NEU_HEADING}`}>
            {emptyMessage}
          </p>
          <p className={`mt-1 text-xs ${NEU_MUTED}`}>
            Try adjusting your filters or search terms
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow className="border-[#1E2938]/10 bg-[#E7E5E4]/60 hover:bg-[#E7E5E4]/60">
            {["Traveler", "Email", "Status", "Verified", "Joined", ""].map(
              (col, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    NEU_LABEL,
                    "py-3",
                    i === 0 && "pl-4",
                    i === 5 && "w-8",
                  )}
                >
                  {col}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>

        {/* Body */}
        <motion.tbody
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="[&_tr:last-child]:border-0"
        >
          <AnimatePresence mode="popLayout">
            {travelers.map((traveler, index) => {
              const status =
                statusConfig[traveler.accountStatus] ?? statusConfig.inactive;
              const avatarGradient = getAvatarGradient(traveler.name);

              return (
                <motion.tr
                  key={traveler._id}
                  variants={rowVariants}
                  layout
                  onClick={() => onRowClick(traveler._id)}
                  className={cn(
                    "group cursor-pointer border-[#1E2938]/6",
                    "transition-all duration-200",
                    "hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff]",
                    index % 2 === 0 ? "bg-[#E7E5E4]" : "bg-[#E7E5E4]/60",
                  )}
                >
                  {/* Traveler */}
                  <td className="pl-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]">
                          <AvatarImage
                            src={traveler.avatarUrl}
                            className="object-cover"
                          />
                          <AvatarFallback
                            className={cn(
                              "text-xs font-bold text-white bg-gradient-to-br",
                              avatarGradient,
                            )}
                          >
                            {getInitials(traveler.name)}
                          </AvatarFallback>
                        </Avatar>
                        {traveler.accountStatus === "active" && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#00A63D] border-2 border-[#E7E5E4]" />
                        )}
                      </div>
                      <div>
                        <p
                          className={cn(
                            "text-sm leading-none transition-colors",
                            NEU_HEADING,
                            "group-hover:text-[#006666]",
                          )}
                        >
                          {traveler.name}
                        </p>
                        <p
                          className={cn(
                            "text-[11px] mt-1 font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/40",
                          )}
                        >
                          #{traveler._id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5">
                    <p
                      className={cn(
                        "text-[13px] transition-colors font-[family-name:var(--font-jetbrains-mono)]",
                        "text-[#1E2938]/50 group-hover:text-[#1E2938]/70",
                      )}
                    >
                      {traveler.email}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3.5">
                    <span className={status.badgeClass}>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          status.dotColor,
                        )}
                      />
                      {status.label}
                    </span>
                  </td>

                  {/* Verified */}
                  <td className="py-3.5">
                    {traveler.isVerified ? (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-[#00A63D]" />
                        <span className="text-xs font-bold font-[family-name:var(--font-space-mono)] text-[#00A63D]">
                          Verified
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <ShieldOff className="h-4 w-4 text-[#1E2938]/30" />
                        <span className="text-xs font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938]/40">
                          Unverified
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="py-3.5">
                    <p className={cn("text-sm tabular-nums", NEU_MUTED)}>
                      {format(new Date(traveler.createdAt), "MMM d, yyyy")}
                    </p>
                  </td>

                  {/* Arrow */}
                  <td className="py-3.5 pr-4">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <ChevronRight className="h-4 w-4 text-[#006666]" />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </motion.tbody>
      </Table>
    </div>
  );
}