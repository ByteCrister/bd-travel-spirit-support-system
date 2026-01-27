"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Clock,
    Calendar,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    Sparkles,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import type {
    GuideBannerEntity,
    ID,
} from "@/types/guide-banner-settings.types";
import { useGuideBannersStore } from "@/store/guide/guide-bannerSetting.store";
import {
    buildAssetSrc,
    formatISODate,
} from "@/utils/helpers/guide-banner-settings";
import GuideBannerForm from "./GuideBannerForm";
import ConfirmDialog from "./ConfirmDialog";
import GuideBannerDetailsDrawer from "./GuideBannerDetailsDrawer";
import Image from "next/image";
import { RowActions } from "./RowActions";

interface GuideBannerRowProps {
    id: ID;
    index: number;
    entity?: GuideBannerEntity;
}

export default function GuideBannerRow({ id, entity }: GuideBannerRowProps) {
    const { operations, toggleActive, removeBanner } = useGuideBannersStore();

    const [editOpen, setEditOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const activePending = useMemo<boolean>(() => {
        const op = operations["patch"]?.byId?.[String(id)];
        return op?.status === "pending";
    }, [operations, id]);

    const updatePending = useMemo<boolean>(() => {
        const op = operations["update"]?.byId?.[String(id)];
        return op?.status === "pending";
    }, [operations, id]);

    const deletePending = useMemo<boolean>(() => {
        const op = operations["delete"]?.byId?.[String(id)];
        return op?.status === "pending";
    }, [operations, id]);

    if (!entity) {
        return (
            <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <XCircle className="h-5 w-5" />
                        <span>Missing entity</span>
                    </div>
                </TableCell>
            </TableRow>
        );
    }

    const isTemp = String(entity._id).startsWith("temp:");
    const assetSrc = buildAssetSrc(entity.asset);

    return (
        <>
            <motion.tr
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                }}
                className="group hover:bg-muted/50 transition-colors"
            >
                {/* Image Cell */}
                <TableCell className="align-middle">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                    >
                        <div className="relative h-16 w-24 rounded-lg overflow-hidden border-2 border-border shadow-sm group-hover:border-primary/50 transition-colors">
                            {assetSrc ? (<Image
                                src={assetSrc ?? ""}
                                alt={entity.alt ?? ""}
                                fill
                                className="object-cover"
                                sizes="100vw"
                            />) :
                                (<div className="flex h-full w-full items-center justify-center bg-muted">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>)
                            }

                            {isTemp && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                                >
                                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </TableCell>

                {/* Content Cell */}
                <TableCell className="align-middle">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {isTemp && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                >
                                    <Badge
                                        variant="outline"
                                        className="border-emerald-500 text-emerald-700 bg-emerald-50"
                                    >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        Saving…
                                    </Badge>
                                </motion.div>
                            )}
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {entity.alt || (
                                    <span className="text-muted-foreground italic flex items-center gap-1">
                                        <ImageIcon className="h-3.5 w-3.5" />
                                        No alt text
                                    </span>
                                )}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {entity.caption || <span className="italic">No caption</span>}
                        </p>
                    </div>
                </TableCell>

                {/* Order Cell */}
                <TableCell className="align-middle">
                    <Badge variant="secondary" className="font-mono font-semibold">
                        #{entity.order}
                    </Badge>
                </TableCell>

                {/* Status Cell */}
                <TableCell className="align-middle">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={activePending ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: activePending ? Infinity : 0, duration: 1 }}
                        >
                            <Badge
                                className={`${entity.active
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "bg-gray-400 hover:bg-gray-500"
                                    } transition-colors shadow-sm`}
                            >
                                {entity.active ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                ) : (
                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                )}
                                {entity.active ? "Active" : "Inactive"}
                            </Badge>
                        </motion.div>
                        <div className="relative">
                            <Switch
                                checked={entity.active}
                                onCheckedChange={() => void toggleActive(id)}
                                disabled={activePending}
                                aria-label="Toggle active"
                            />
                            {activePending && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute -inset-1 flex items-center justify-center"
                                >
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </motion.div>
                            )}
                        </div>
                    </div>
                </TableCell>

                {/* Dates Cell */}
                <TableCell className="align-middle">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="font-medium">Updated:</span>
                            <span>{formatISODate(entity.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="font-medium">Created:</span>
                            <span>{formatISODate(entity.createdAt)}</span>
                        </div>
                    </div>
                </TableCell>

                {/* Actions Cell */}
                <TableCell className="align-middle">
                    <RowActions
                        updatePending={updatePending}
                        deletePending={deletePending}
                        setEditOpen={setEditOpen}
                        setDetailsOpen={setDetailsOpen}
                        setConfirmOpen={setConfirmOpen}
                    />
                </TableCell>
            </motion.tr >

            {editOpen && (
                <GuideBannerForm
                    mode="edit"
                    editId={id}
                    initial={{
                        asset: entity.asset,
                        alt: entity.alt ?? "",
                        caption: entity.caption ?? "",
                        order: entity.order,
                        active: entity.active,
                    }}
                    onClose={() => setEditOpen(false)}
                />
            )
            }

            <ConfirmDialog
                title="Remove banner?"
                description="This action cannot be undone."
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={async () => {
                    await removeBanner(id);
                    setConfirmOpen(false);
                }}
            />

            <GuideBannerDetailsDrawer
                id={id}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
            />
        </>
    );
}
