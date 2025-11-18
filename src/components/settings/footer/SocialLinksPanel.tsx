// src/components/settings/settings/footer/SocialLinksPanel.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Share2, Sparkles } from "lucide-react";
import type { FooterEntities } from "@/types/footer-settings.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFooterStore } from "@/store/footerSettings.store";
import { SocialLinkRow } from "./SocialLinkRow";
import { SocialLinkFormDialog } from "./SocialLinkFormDialog";

type Props = { entities: FooterEntities | null };

export function SocialLinksPanel({ entities }: Props) {
    const [open, setOpen] = useState(false);
    const { setEditingSocialLinkId } = useFooterStore();

    const order = entities?.socialLinkOrder ?? [];
    const byId = entities?.socialLinksById ?? {};

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl dark:border-slate-800/60 dark:bg-slate-900/80">
                <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 pb-6 dark:border-slate-800/60 dark:from-slate-800/50 dark:via-indigo-950/30 dark:to-purple-950/50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-md">
                                    <Share2 className="h-5 w-5 text-white" />
                                </div>
                                Social Links
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Connect your social media profiles
                            </CardDescription>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => {
                                    setEditingSocialLinkId(null);
                                    setOpen(true);
                                }}
                                size="sm"
                                className="gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                <Plus className="h-4 w-4" />
                                Add Link
                            </Button>
                        </motion.div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                        {order.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 py-16 text-center dark:from-slate-900/50 dark:to-indigo-950/20"
                            >
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-lg dark:from-blue-950/50 dark:to-indigo-950/50"
                                >
                                    <Sparkles className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                </motion.div>
                                <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    No social links yet
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Add your first social media link to get started
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-3"
                            >
                                {order.map((id, index) => (
                                    <motion.div
                                        key={id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <SocialLinkRow 
                                            link={byId[id]} 
                                            onEdit={() => setOpen(true)} 
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
            <SocialLinkFormDialog open={open} onOpenChange={setOpen} />
        </motion.div>
    );
}
