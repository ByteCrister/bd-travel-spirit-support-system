// components/GuideSubscriptions/TierList.tsx
"use client";

import React, { useState } from "react";
import type {
  SubscriptionTierDTO,
  ID,
} from "@/types/site-settings/guide-subscription-settings.types";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TierRow } from "./TierRow";
import { Search, Filter, ArrowUpDown, Package } from "lucide-react";
import useGuideSubscriptionsStore from "@/store/guide/guide-subscription-setting.store";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

/**
 * TierList props for index/table component
 */
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
  const { query, setQuery } = useGuideSubscriptionsStore()

  const [searchInput, setSearchInput] = useState(query.search ?? "");

  const debouncedSetSearch = useDebouncedCallback(
    (value: string) => {
      setQuery({
        search: value,
      });
    },
    400
  );

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              id="search"
              placeholder="Search by key or title..."
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);    
                debouncedSetSearch(value);
              }}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Active Filter */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
            <Filter size={16} className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Active only
            </label>
            <Switch
              checked={query.onlyActive ?? false}
              onCheckedChange={(v) => setQuery({ onlyActive: v })}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Sort By */}
          <Select
            value={query.sortBy ?? "title"}
            onValueChange={(v) => setQuery({ sortBy: v as "title" | "price" | "createdAt" })}
          >
            <SelectTrigger className="w-full lg:w-40 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <ArrowUpDown size={16} className="mr-2 text-gray-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="createdAt">Created At</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Direction */}
          <Select
            value={query.sortDir ?? "asc"}
            onValueChange={(v) => setQuery({ sortDir: v as "asc" | "desc" })}
          >
            <SelectTrigger className="w-full lg:w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">↑ Asc</SelectItem>
              <SelectItem value="desc">↓ Desc</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Summary */}
        {query.search && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {tiers.length} {tiers.length === 1 ? 'result' : 'results'} found
            </Badge>
            {tiers.length !== tiers.length && (
              <span className="text-xs text-gray-500">
                (filtered from {tiers.length} total)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tier Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading tiers...</p>
              </div>
            </motion.div>
          ) : tiers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 px-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No subscription tiers found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <TierRow
                    tier={tier}
                    index={i}
                    onEdit={() => onEdit(tier)}
                    onDuplicate={() => onEdit({ ...tier, key: `${tier.key}-copy` } as SubscriptionTierDTO)}
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