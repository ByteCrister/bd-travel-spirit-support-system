// src/components/settings/settings/footer/SocialLinkRow.tsx
"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, ExternalLink, GripVertical } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { SocialLinkDTO } from "@/types/footer-settings.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFooterStore } from "@/store/footerSettings.store";

type Props = {
    link: SocialLinkDTO;
    onEdit: () => void;
};

export function SocialLinkRow({ link, onEdit }: Props) {
    const {
        setEditingSocialLinkId,
        deleteSocialLink,
        saveStatus
    } = useFooterStore();
    const saving = saveStatus === "loading";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className="group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-blue-300/60 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/50 dark:hover:border-blue-700/60"
        >
            {/* Gradient Accent */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400">
                        <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                {link.label ?? link.key}
                            </h4>
                            <motion.a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.1 }}
                                className="text-slate-400 transition-colors hover:text-blue-500"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </motion.a>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {link.url}
                        </p>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={link.active ? "default" : "secondary"}
                                className={link.active
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                }
                            >
                                {link.active ? "Active" : "Inactive"}
                            </Badge>
                            {typeof link.order === "number" && (
                                <Badge
                                    variant="outline"
                                    className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300"
                                >
                                    Order: {link.order}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setEditingSocialLinkId(link.id);
                                onEdit();
                            }}
                            className="gap-2 border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                        </Button>
                    </motion.div>

                    {/* Delete with confirmation */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={saving}
                                    className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 shadow-sm hover:from-red-600 hover:to-rose-700 text-white"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </Button>
                            </motion.div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Social Link</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">{link.label ?? link.key}</span>?
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteSocialLink(link.id)}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                                >
                                    Confirm Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </motion.div>
    );
}