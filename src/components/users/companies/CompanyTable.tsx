"use client";

import { memo } from "react";
import {
  Building2,
  Mail,
  Users,
  MapPin,
  Star,
  Clock,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CompanyRowDTO } from "@/types/company/company.types";
import TableBodyWithTooltips from "./TableBodyWithTooltips";
import { encodeId } from "@/utils/helpers/mongodb-id-conversions";

// ── Neumorphic style tokens ────────────────────────────────────
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";

const NEU_TABLE_HEADER =
  "bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] border-b border-white/60";
// ─────────────────────────────────────────────────────────────

export interface CompanyTableProps {
  rows: CompanyRowDTO[];
}

const HEADERS = [
  { icon: Building2, label: "Company", align: "left" },
  { icon: Mail, label: "Host Email", align: "left" },
  { icon: Users, label: "Employees", align: "right" },
  { icon: MapPin, label: "Tours", align: "right" },
  { icon: TrendingUp, label: "Reviews", align: "right" },
  { icon: Star, label: "Rating", align: "right" },
  { icon: Clock, label: "Last Login", align: "left" },
  { icon: Calendar, label: "Created", align: "left" },
] as const;

export const CompanyTable = memo(function CompanyTable({
  rows,
}: CompanyTableProps) {
  const router = useRouter();

  const handleViewCompany = (companyId: string) => {
    router.push(`/users/companies/${encodeId(encodeURIComponent(companyId))}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow className={`${NEU_TABLE_HEADER} hover:bg-transparent`}>
            {HEADERS.map(({ icon: Icon, label, align }) => (
              <TableHead
                key={label}
                className={`py-4 ${align === "right" ? "text-right" : ""}`}
              >
                <div
                  className={`flex items-center gap-1.5 ${NEU_LABEL} ${align === "right" ? "justify-end" : ""}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBodyWithTooltips
          rows={rows}
          handleViewCompany={handleViewCompany}
        />
      </Table>
    </div>
  );
});
