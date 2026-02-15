"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { Search, Plus, AlertCircle, RefreshCw, FolderOpen, X, Sparkles, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GroupCard from "./GroupCard";
import CreateGroupDialog from "./CreateGroupDialog";
import { showToast } from "@/components/global/showToast";
import { EnumGroup } from "@/types/site-settings/enum-settings.types";

export default function GroupsList({
    selected,
    onSelect
}: {
    selected: string | null;
    onSelect: (_id: string) => void;
}): JSX.Element {
    const {
        groups,
        order,
        status,
        error,
        fetchAll,
        deleteGroup
    } = useEnumSettingsStore();

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
                g.values.some((v) =>
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
        <aside className="relative w-full md:w-80 border-r border-slate-200/60 bg-gradient-to-b from-slate-50/80 via-white/50 to-slate-50/40 p-6 backdrop-blur-sm">
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header with title */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="relative mb-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Enum Groups</h2>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative group">
                        <label htmlFor="enum-search" className="sr-only">
                            Search groups
                        </label>
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" size={18} />
                        <Input
                            id="enum-search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search groups..."
                            className="pl-10 pr-10 h-11 bg-white/80 backdrop-blur-sm shadow-sm border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl"
                        />
                        <AnimatePresence>
                            {query && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={() => setQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X size={16} className="text-slate-500" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => setCreateOpen(true)}
                            className="h-11 w-11 shadow-md hover:shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all rounded-xl"
                        >
                            <Plus size={20} />
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {status === "loading" && all.length === 0 ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <GroupsListSkeleton />
                    </motion.div>
                ) : error ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="relative p-5 rounded-xl bg-gradient-to-br from-red-50 to-red-50/50 border border-red-200/60 shadow-sm overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-300/20 rounded-full blur-2xl" />
                        <div className="relative flex items-start gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1 pt-0.5">
                                <div className="font-semibold text-red-900 mb-1">Failed to load groups</div>
                                <div className="text-sm text-red-700/90 mb-3">{error}</div>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        size="sm"
                                        onClick={() => void fetchAll({ force: true })}
                                        className="bg-red-600 hover:bg-red-700 shadow-sm rounded-lg"
                                    >
                                        <RefreshCw size={14} className="mr-1.5" />
                                        Retry
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center p-12 text-center"
                    >
                        <motion.div
                            className="relative mb-4"
                            animate={{
                                rotate: [0, 8, -8, 0],
                                y: [0, -5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                repeatDelay: 2,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full" />
                            <FolderOpen className="relative w-16 h-16 text-slate-300" strokeWidth={1.5} />
                        </motion.div>
                        <p className="text-base font-semibold text-slate-700 mb-1">
                            {query ? "No matching groups" : "No groups yet"}
                        </p>
                        <p className="text-sm text-slate-500">
                            {query ? "Try a different search term" : "Create your first group to get started"}
                        </p>
                    </motion.div>
                ) : (
                    <motion.nav
                        key="list"
                        aria-label="Enum groups"
                        className="relative space-y-2 max-h-[calc(100vh-280px)] overflow-auto pr-2 custom-scrollbar"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <AnimatePresence mode="popLayout">
                            {filtered.map((g, idx) => (
                                <motion.div
                                    key={g.name}
                                    className="relative group"
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                    transition={{
                                        delay: idx * 0.03,
                                        duration: 0.3,
                                        ease: [0.23, 1, 0.32, 1]
                                    }}
                                >
                                    <GroupCard
                                        group={g}
                                        selected={selected === g._id}
                                        onSelect={() => { onSelect(g._id); }}
                                        onOpen={() => onSelect(g._id)}
                                    />
                                    {/* Delete button positioned top-right of the card */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 p-2 rounded-md bg-white/60 hover:bg-red-50 border border-transparent shadow-sm"
                                                    aria-label={`Delete group ${g.name}`}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete enum group</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the group <strong>{g.name}</strong>? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="mt-4 flex justify-end gap-2">
                                                    <AlertDialogCancel asChild>
                                                        <Button variant="outline" size="sm">Cancel</Button>
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction asChild>
                                                        <Button
                                                            size="sm"
                                                            className="bg-red-600 hover:bg-red-700"
                                                            onClick={() => void handleConfirmDelete(g._id)}
                                                            disabled={deleting === g._id}
                                                        >
                                                            {deleting === g._id ? "Deleting..." : "Delete"}
                                                        </Button>
                                                    </AlertDialogAction>
                                                </div>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
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
                    onSelect(selected!);
                }}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #94a3b8, #64748b);
                }
            `}</style>
        </aside>
    );
}