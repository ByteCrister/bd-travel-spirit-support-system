// components/GuideSubscriptions/TierList.tsx
"use client";

import React, { useState } from "react";
import type { SubscriptionTierDTO, ID } from "@/types/site-settings/guide-subscription-settings.types";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TierRow } from "./TierRow";
import { Search, Filter, ArrowUpDown, Package } from "lucide-react";
import useGuideSubscriptionsStore from "@/store/guide/guide-subscription-setting.store";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

// ── Neumorphism style tokens ──────────────────────────────────
const FILTER_BAR =
  "rounded-2xl p-4 bg-[#E7E5E4] border border-white/60 " +
  "shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]";

const SEARCH_WRAPPER = "flex-1 relative";

const SEARCH_INPUT =
  "pl-10 rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/35 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const ACTIVE_FILTER_PILL =
  "flex items-center gap-3 px-4 py-2 rounded-xl bg-[#E7E5E4] " +
  "shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] border border-white/40";

const ACTIVE_FILTER_LABEL =
  "text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938]/60 whitespace-nowrap";

const SELECT_TRIGGER =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] border-none " +
  "font-[family-name:var(--font-space-mono)] text-sm " +
  "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] " +
  "focus:ring-2 focus:ring-[#006666]/50";

const RESULTS_BADGE =
  "inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs " +
  "font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const EMPTY_CARD =
  "flex flex-col items-center justify-center py-16 px-6 rounded-2xl " +
  "bg-[#E7E5E4] border-2 border-dashed border-[#1E2938]/15 " +
  "shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";

const EMPTY_ICON_WELL =
  "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 " +
  "bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]";

const EMPTY_TITLE =
  "text-lg font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] mb-2";

const EMPTY_BODY =
  "text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50 text-center max-w-xs";

const SPINNER_WRAP =
  "flex flex-col items-center gap-3 py-16";

const SPINNER_RING =
  "w-10 h-10 rounded-full border-4 border-[#E7E5E4] border-t-[#006666] animate-spin " +
  "shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]";
// ─────────────────────────────────────────────────────────────

export interface TierListProps {
  tiers: SubscriptionTierDTO[];
  loading?: boolean;
  onEdit: (tier: SubscriptionTierDTO) => void;
  onDelete: (id: ID) => void;
  onToggleActive?: (id: ID, active: boolean) => void;
}

export const TierList: React.FC<TierListProps> = ({
  loading,
  tiers,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const { query, setQuery } = useGuideSubscriptionsStore();
  const [searchInput, setSearchInput] = useState(query.search ?? "");

  const debouncedSetSearch = useDebouncedCallback(
    (value: string) => setQuery({ search: value }),
    400
  );

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className={FILTER_BAR}>
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className={SEARCH_WRAPPER}>
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2938]/35 pointer-events-none"
              size={16}
            />
            <input
              id="search"
              placeholder="Search by key or title..."
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                debouncedSetSearch(value);
              }}
              className={`w-full h-10 ${SEARCH_INPUT}`}
            />
          </div>

          {/* Active Filter */}
          <div className={ACTIVE_FILTER_PILL}>
            <Filter size={14} className="text-[#1E2938]/40" />
            <label className={ACTIVE_FILTER_LABEL}>Active only</label>
            <Switch
              checked={query.onlyActive ?? false}
              onCheckedChange={(v) => setQuery({ onlyActive: v })}
              className="data-[state=checked]:bg-[#006666]"
            />
          </div>

          {/* Sort By */}
          <Select
            value={query.sortBy ?? "title"}
            onValueChange={(v) =>
              setQuery({ sortBy: v as "title" | "price" | "createdAt" })
            }
          >
            <SelectTrigger className={`w-full lg:w-40 h-10 ${SELECT_TRIGGER}`}>
              <ArrowUpDown size={14} className="mr-1.5 text-[#1E2938]/40" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#E7E5E4] border-white/60 rounded-xl shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]">
              <SelectItem value="title" className="font-[family-name:var(--font-space-mono)] text-sm">Title</SelectItem>
              <SelectItem value="price" className="font-[family-name:var(--font-space-mono)] text-sm">Price</SelectItem>
              <SelectItem value="createdAt" className="font-[family-name:var(--font-space-mono)] text-sm">Created At</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Direction */}
          <Select
            value={query.sortDir ?? "asc"}
            onValueChange={(v) => setQuery({ sortDir: v as "asc" | "desc" })}
          >
            <SelectTrigger className={`w-full lg:w-32 h-10 ${SELECT_TRIGGER}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#E7E5E4] border-white/60 rounded-xl shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff]">
              <SelectItem value="asc" className="font-[family-name:var(--font-space-mono)] text-sm">↑ Asc</SelectItem>
              <SelectItem value="desc" className="font-[family-name:var(--font-space-mono)] text-sm">↓ Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results summary */}
        {query.search && (
          <div className="mt-3">
            <span className={RESULTS_BADGE}>
              {tiers.length} {tiers.length === 1 ? "result" : "results"} found
            </span>
          </div>
        )}
      </div>

      {/* Tier Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={SPINNER_WRAP}
            >
              <div className={SPINNER_RING} />
              <p className="text-sm font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50">
                Loading tiers...
              </p>
            </motion.div>
          ) : tiers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className={EMPTY_CARD}
            >
              <div className={EMPTY_ICON_WELL}>
                <Package size={28} className="text-[#1E2938]/30" />
              </div>
              <h3 className={EMPTY_TITLE}>No subscription tiers found</h3>
              <p className={EMPTY_BODY}>
                {query.search
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Get started by creating your first subscription tier."}
              </p>
            </motion.div>
          ) : (
            <motion.ul layout className="space-y-3">
              {tiers.map((tier, i) => (
                <motion.li
                  key={tier.key}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
                  <TierRow
                    tier={tier}
                    index={i}
                    onEdit={() => onEdit(tier)}
                    onDuplicate={() =>
                      onEdit({ ...tier, key: `${tier.key}-copy` } as SubscriptionTierDTO)
                    }
                    onDelete={() => onDelete(tier._id as unknown as ID)}
                    onToggleActive={(id, active) => onToggleActive?.(id, active)}
                  />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};