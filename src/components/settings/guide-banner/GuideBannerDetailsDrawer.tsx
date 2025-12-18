"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Image as ImageIcon,
    Hash,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Code2,
    Loader2,
    FileText,
    Tag,
    BarChart3
} from "lucide-react";
import type { RequestError, ID } from "@/types/guide-banner-settings.types";
import { useGuideBannersStore } from "@/store/guide-bannerSetting.store";
import { buildAssetSrc, formatISODate } from "@/utils/helpers/guide-banner-settings";
import Image from "next/image";

interface GuideBannerDetailsDrawerProps {
    id: ID;
    open: boolean;
    onClose: () => void;
}

export default function GuideBannerDetailsDrawer({ id, open, onClose }: GuideBannerDetailsDrawerProps) {

    const { normalized, fetchById, operations } = useGuideBannersStore();
    const entity = normalized.byId[String(id)];

    useEffect(() => {
        if (open && !entity) {
            void fetchById(id);
        }
    }, [open, entity, fetchById, id]);

    const devError: RequestError | null | undefined =
        operations["fetchById"]?.byId?.[String(id)]?.error ?? operations["update"]?.byId?.[String(id)]?.error;

    const assetSrc = buildAssetSrc(entity?.asset);

    return (
        <Drawer open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
            <DrawerContent aria-label="Banner details" className="max-h-[90vh]">
                <DrawerHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <DrawerTitle className="flex items-center gap-2 text-2xl">
                        <FileText className="h-6 w-6 text-primary" />
                        Banner Details
                    </DrawerTitle>
                    <DrawerDescription>
                        Complete information about this guide banner
                    </DrawerDescription>
                </DrawerHeader>

                {entity ? (
                    <div className="p-6 space-y-6 overflow-y-auto">
                        {/* Image Preview Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-4 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                                <div className="flex items-center gap-3 mb-3">
                                    <ImageIcon className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold text-lg">Image Preview</h3>
                                </div>

                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border-2 border-border shadow-lg bg-gray-100 flex items-center justify-center">
                                    {assetSrc ? (
                                        <Image
                                            src={assetSrc}
                                            alt={entity.alt ?? ""}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                            sizes="(max-width: 768px) 100vw, 400px"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center px-4">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                No renderable image
                                            </p>
                                            <p className="text-xs mt-2 text-muted-foreground/80 break-all max-w-[20rem]">
                                                {String(entity.asset ?? "—")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>

                        </motion.div>

                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <Badge
                                className={`${entity.active
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : "bg-gray-400 hover:bg-gray-500"
                                    } text-base px-4 py-2 shadow-md`}
                            >
                                {entity.active ? (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-2" />
                                )}
                                {entity.active ? "Active Banner" : "Inactive Banner"}
                            </Badge>
                        </motion.div>

                        <Separator />

                        {/* Details Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            {/* Left Column */}
                            <Card className="p-4 space-y-4 bg-gradient-to-br from-blue-50/50 to-white">
                                <div className="flex items-start gap-3">
                                    <Hash className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Banner ID</p>
                                        <p className="text-sm font-mono font-semibold mt-1 break-all">{String(entity._id)}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Display Order</p>
                                        <p className="text-lg font-bold mt-1">#{entity.order}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Created</p>
                                        <p className="text-sm font-semibold mt-1">{formatISODate(entity.createdAt)}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                        <p className="text-sm font-semibold mt-1">{formatISODate(entity.updatedAt)}</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Right Column */}
                            <Card className="p-4 space-y-4 bg-gradient-to-br from-purple-50/50 to-white">
                                <div className="flex items-start gap-3">
                                    <Tag className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Alt Text</p>
                                        <p className="text-sm mt-1 break-words">
                                            {entity.alt ? (
                                                <span className="font-semibold">{entity.alt}</span>
                                            ) : (
                                                <span className="italic text-muted-foreground">No alt text provided</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Caption</p>
                                        <p className="text-sm mt-1 break-words">
                                            {entity.caption ? (
                                                <span className="font-semibold">{entity.caption}</span>
                                            ) : (
                                                <span className="italic text-muted-foreground">No caption provided</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <ImageIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-muted-foreground">Asset ID</p>
                                        <p className="text-xs font-mono mt-1 break-all bg-gray-100 p-2 rounded">{assetSrc}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Developer Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <Card className="overflow-hidden">
                                <details className="group">
                                    <summary className="cursor-pointer p-4 hover:bg-muted/50 transition-colors flex items-center gap-2 font-semibold">
                                        <Code2 className="h-5 w-5 text-primary" />
                                        Developer Information
                                        <AlertCircle className="h-4 w-4 ml-auto text-muted-foreground group-open:rotate-180 transition-transform" />
                                    </summary>
                                    <div className="p-4 bg-muted/30 border-t">
                                        {devError ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-red-600 font-semibold">
                                                    <AlertCircle className="h-5 w-5" />
                                                    Error Details
                                                </div>

                                                {devError.status !== undefined && (
                                                    <div className="flex items-start gap-3">
                                                        <Badge variant="destructive">HTTP {devError.status}</Badge>
                                                    </div>
                                                )}

                                                {devError.code && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Error Code</p>
                                                        <p className="text-sm font-mono font-semibold bg-red-50 p-2 rounded border border-red-200">
                                                            {devError.code}
                                                        </p>
                                                    </div>
                                                )}

                                                {devError.message && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Message</p>
                                                        <p className="text-sm bg-red-50 p-2 rounded border border-red-200">
                                                            {devError.message}
                                                        </p>
                                                    </div>
                                                )}

                                                {devError.traceId && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Trace ID</p>
                                                        <p className="text-xs font-mono bg-gray-100 p-2 rounded border break-all">
                                                            {devError.traceId}
                                                        </p>
                                                    </div>
                                                )}

                                                {devError.details && (
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground mb-1">Additional Details</p>
                                                        <pre className="text-xs overflow-auto bg-gray-900 text-green-400 p-3 rounded border max-h-48">
                                                            {JSON.stringify(devError.details, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <CheckCircle2 className="h-5 w-5" />
                                                <p className="text-sm font-medium">No errors detected. All systems operational.</p>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            </Card>
                        </motion.div>
                    </div>
                ) : (
                    <div className="p-8 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground font-medium">Loading banner details...</p>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}