import { useState, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompanyRowDTO } from "@/types/company/company.types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TableBody, TableCell, TableRow } from "../../ui/table";
import { Building2, Star } from "lucide-react";
import {
  formatDate,
  formatRating,
  formatRelativeTime,
} from "@/utils/helpers/companies.company-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_ROW_HOVER =
  "hover:bg-[#E7E5E4] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]";

const NEU_BADGE =
  "inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const NEU_EMPTY =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] rounded-2xl";
// ─────────────────────────────────────────────────────────────

function RowWithTooltip({
  row,
  index,
  onClick,
}: {
  row: CompanyRowDTO;
  index: number;
  onClick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = window.setTimeout(() => setOpen(true), 2000);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  };

  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <motion.tr
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => onClick(row.id)}
          className={cn(
            "group relative border-b border-white/60 last:border-b-0 cursor-pointer",
            "transition-all duration-200",
            NEU_ROW_HOVER,
          )}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: index * 0.04 }}
          whileHover={{ x: 3 }}
        >
          {/* Company */}
          <TableCell className="py-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-xl shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]">
                <AvatarImage
                  src={row.host.logoUrl ?? undefined}
                  alt={row.name}
                />
                <AvatarFallback className="rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold">
                  {row.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] group-hover:text-[#006666] transition-colors text-sm">
                  {row.name}
                </span>
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/50">
                  {row.host.companyName}
                </span>
              </div>
            </div>
          </TableCell>

          {/* Email */}
          <TableCell className="py-4">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70">
              {row.host.email}
            </span>
          </TableCell>

          {/* Employees */}
          <TableCell className="py-4 text-right">
            <span className={`${NEU_BADGE} text-[#006666]`}>
              {row.metrics.employeesCount.toLocaleString()}
            </span>
          </TableCell>

          {/* Tours */}
          <TableCell className="py-4 text-right">
            <span className={`${NEU_BADGE} text-[#FE9900]`}>
              {row.metrics.toursCount.toLocaleString()}
            </span>
          </TableCell>

          {/* Reviews */}
          <TableCell className="py-4 text-right">
            <span className={`${NEU_BADGE} text-[#00A63D]`}>
              {row.metrics.reviewsCount.toLocaleString()}
            </span>
          </TableCell>

          {/* Rating */}
          <TableCell className="py-4 text-right">
            <div className="flex items-center justify-end gap-1">
              <Star className="w-4 h-4 fill-[#FE9900] text-[#FE9900]" />
              <span className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-sm">
                {formatRating(row.metrics.averageRating)}
              </span>
            </div>
          </TableCell>

          {/* Last Login */}
          <TableCell className="py-4">
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/80">
                {formatDate(row.timestamps.lastLogin)}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                {formatRelativeTime(row.timestamps.lastLogin)}
              </span>
            </div>
          </TableCell>

          {/* Created */}
          <TableCell className="py-4">
            <div className="flex flex-col">
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/80">
                {formatDate(row.timestamps.createdAt)}
              </span>
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                {formatRelativeTime(row.timestamps.createdAt)}
              </span>
            </div>
          </TableCell>
        </motion.tr>
      </TooltipTrigger>

      <TooltipContent
        side="top"
        className="rounded-xl bg-[#1E2938] text-white px-3 py-1.5 text-xs font-[family-name:var(--font-space-mono)] shadow-lg"
      >
        Click to see details
      </TooltipContent>
    </Tooltip>
  );
}

export default function TableBodyWithTooltips({
  rows,
  handleViewCompany,
}: {
  rows: CompanyRowDTO[];
  handleViewCompany: (id: string) => void;
}) {
  return (
    <TableBody>
      {rows.length === 0 ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={8} className="h-48 text-center">
            <div
              className={`mx-auto w-fit px-10 py-8 ${NEU_EMPTY} flex flex-col items-center gap-3`}
            >
              <Building2 className="w-12 h-12 text-[#1E2938]/20" />
              <p className="font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/40 text-sm">
                No companies found
              </p>
              <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/30">
                Try adjusting your search or filters
              </p>
            </div>
          </TableCell>
        </TableRow>
      ) : (
        rows.map((row, index) => (
          <RowWithTooltip
            key={row.id}
            row={row}
            index={index}
            onClick={handleViewCompany}
          />
        ))
      )}
    </TableBody>
  );
}
