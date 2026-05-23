// src/components/enums/GroupsList.tsx
"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { Search, Plus, AlertCircle, RefreshCw, FolderOpen, X, Trash2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import GroupsListSkeleton from "./skeletons/GroupsListSkeleton";
import useEnumSettingsStore from "@/store/site-settings/enumSettings.store";
import { useDebouncedValueLodash } from "@/hooks/useDebouncedValueLodash";
import GroupCard from "./GroupCard";
import CreateGroupDialog from "./CreateGroupDialog";
import { showToast } from "@/components/global/showToast";
import { EnumGroup } from "@/types/site-settings/enum-settings.types";

// ── Neu style tokens ──────────────────────────────────────────
const S = {
  aside: "relative w-full p-5 bg-[#E7E5E4] h-full",
  headerRow: "flex items-center justify-between mb-5",
  titleWrap: "flex items-center gap-2",
  iconWell:
    "p-2 rounded-xl bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff]",
  title:
    "text-base font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] tracking-tight",
  addBtn:
    "rounded-xl w-9 h-9 flex items-center justify-center bg-[#006666] text-white " +
    "shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] " +
    "hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] " +
    "active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] " +
    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50",
  searchWrap: "relative mb-4",
  searchIcon:
    "absolute left-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 pointer-events-none w-4 h-4",
  searchInput:
    "w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm " +
    "placeholder:text-[#1E2938]/40 font-[family-name:var(--font-jetbrains-mono)] " +
    "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
    "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200",
  clearBtn:
    "absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg " +
    "text-[#1E2938]/40 hover:text-[#1E2938] transition-colors",
  list: "space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1",
  errorCard:
    "rounded-xl bg-[#FF2157]/5 border border-[#FF2157]/20 p-4 " +
    "shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff]",
  errorTitle:
    "font-bold text-sm text-[#FF2157] font-[family-name:var(--font-space-mono)] mb-1",
  errorMsg:
    "text-xs text-[#1E2938]/70 font-[family-name:var(--font-jetbrains-mono)] mb-3",
  retryBtn:
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold " +
    "font-[family-name:var(--font-space-mono)] text-white bg-[#FF2157] " +
    "shadow-[2px_2px_4px_rgba(255,33,87,0.4)] hover:bg-[#e01d4f] " +
    "transition-all duration-200",
  emptyWrap: "flex flex-col items-center justify-center py-12 text-center",
  emptyTitle:
    "text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] mb-1",
  emptyMsg:
    "text-xs font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938]/50",
  // Delete dialog
  deleteDialogContent:
    "bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 rounded-2xl p-0",
  cardDeleteBtn:
    "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity " +
    "w-7 h-7 flex items-center justify-center rounded-lg " +
    "bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] " +
    "hover:bg-[#FF2157]/10 hover:text-[#FF2157] text-[#1E2938]/50 " +
    "transition-all duration-200",
};

export default function GroupsList({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (_id: string) => void;
}): JSX.Element {
  const { groups, order, status, error, fetchAll, deleteGroup } =
    useEnumSettingsStore();

  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebouncedValueLodash(query, 250);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") void fetchAll();
  }, [fetchAll, status]);

  const all = useMemo(() => {
    const items = order.map((n) => groups[n]?.data);
    return items.filter((g): g is EnumGroup => Boolean(g));
  }, [groups, order]);

  const sorted = useMemo(() => {
    if (order && order.length > 0) {
      const orderMap = new Map(order.map((name, idx) => [name, idx]));
      return [...all].sort((a, b) => {
        const aOrder = orderMap.get(a.name) ?? 999;
        const bOrder = orderMap.get(b.name) ?? 999;
        return aOrder - bOrder;
      });
    }
    return [...all].sort((a, b) => a.name.localeCompare(b.name));
  }, [all, order]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((g) => {
      return (
        g.name.toLowerCase().includes(q) ||
        (!!g.description && g.description.toLowerCase().includes(q)) ||
        g.values.some(
          (v) =>
            (v.label ?? "").toString().toLowerCase().includes(q) ||
            v.key.toLowerCase().includes(q)
        )
      );
    });
  }, [sorted, debouncedQuery]);

  async function handleConfirmDelete(_id: string) {
    setDeleting(_id);
    await deleteGroup(_id);
    setDeleting(null);
  }

  return (
    <aside className={S.aside}>
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={S.headerRow}>
          <div className={S.titleWrap}>
            <div className={S.iconWell}>
              <Layers className="w-4 h-4 text-[#006666]" />
            </div>
            <h2 className={S.title}>Enum Groups</h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreateOpen(true)}
            className={S.addBtn}
            aria-label="Create group"
            title="Create group"
          >
            <Plus size={16} />
          </motion.button>
        </div>

        {/* Search */}
        <div className={S.searchWrap}>
          <Search className={S.searchIcon} />
          <input
            id="enum-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups…"
            aria-label="Search groups"
            className={S.searchInput}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setQuery("")}
                className={S.clearBtn}
                aria-label="Clear search"
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {status === "loading" && all.length === 0 ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GroupsListSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={S.errorCard}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#FF2157] flex-none mt-0.5" />
              <div>
                <p className={S.errorTitle}>Failed to load groups</p>
                <p className={S.errorMsg}>{error}</p>
                <button
                  onClick={() => void fetchAll({ force: true })}
                  className={S.retryBtn}
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={S.emptyWrap}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4 p-4 rounded-2xl bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff]"
            >
              <FolderOpen className="w-10 h-10 text-[#1E2938]/30" strokeWidth={1.5} />
            </motion.div>
            <p className={S.emptyTitle}>
              {query ? "No matching groups" : "No groups yet"}
            </p>
            <p className={S.emptyMsg}>
              {query ? "Try a different search term" : "Create your first group to get started"}
            </p>
          </motion.div>
        ) : (
          <motion.nav
            key="list"
            aria-label="Enum groups"
            className={S.list}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((g, idx) => (
                <motion.div
                  key={g.name}
                  className="relative group"
                  initial={{ opacity: 0, x: -16, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.97 }}
                  transition={{ delay: idx * 0.03, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <GroupCard
                    group={g}
                    selected={selected === g._id}
                    onSelect={() => onSelect(g._id)}
                    onOpen={() => onSelect(g._id)}
                  />

                  {/* Delete trigger */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className={S.cardDeleteBtn}
                        aria-label={`Delete group ${g.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[#E7E5E4] border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)] rounded-2xl p-6">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-[family-name:var(--font-space-mono)] text-[#1E2938] text-base">
                          Delete enum group
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/60">
                          Delete <strong className="text-[#1E2938]">{g.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="mt-5 flex justify-end gap-3">
                        <AlertDialogCancel asChild>
                          <button className="px-4 py-2 rounded-xl text-sm font-bold font-[family-name:var(--font-space-mono)] text-[#1E2938] bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] transition-all duration-200">
                            Cancel
                          </button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <button
                            className="px-4 py-2 rounded-xl text-sm font-bold font-[family-name:var(--font-space-mono)] text-white bg-[#FF2157] shadow-[3px_3px_6px_rgba(255,33,87,0.4)] hover:bg-[#e01d4f] transition-all duration-200 disabled:opacity-50"
                            onClick={() => void handleConfirmDelete(g._id)}
                            disabled={deleting === g._id}
                          >
                            {deleting === g._id ? "Deleting…" : "Delete"}
                          </button>
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(name) => {
          showToast.success("Created", `Group ${name} created`);
          setCreateOpen(false);
          if (selected) onSelect(selected);
        }}
      />
    </aside>
  );
}