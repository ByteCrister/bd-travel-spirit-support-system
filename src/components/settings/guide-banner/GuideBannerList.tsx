"use client";

import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import {
    GripVertical,
    Image as IMGicon,
    Hash,
    ToggleLeft,
    Info,
    Zap,
} from "lucide-react";
import type { GuideBannerQueryParams } from "@/types/guide-banner-settings.types";
import { useGuideBannersStore } from "@/store/guide/guide-bannerSetting.store";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GuideBannerRow from "./GuideBannerRow";

interface GuideBannerListProps {
    query?: GuideBannerQueryParams;
}

export default function GuideBannerList({ query }: GuideBannerListProps) {
    const { normalized } = useGuideBannersStore();
    const ids = normalized.allIds;
    const byId = normalized.byId;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <GripVertical className="w-5 h-5 text-emerald-600" />
                                Guide Banners List
                            </h3>
                            <p className="text-sm text-gray-600">
                                Drag and drop to reorder • {ids.length} {ids.length === 1 ? 'banner' : 'banners'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <DndContext sensors={sensors} >
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200/50 border-b-2 border-emerald-100">
                                        <TableHead>
                                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                <IMGicon className="w-4 h-4 text-emerald-600" />
                                                Thumbnail
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                <Info className="w-4 h-4 text-blue-600" />
                                                Alt / Caption
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                <Hash className="w-4 h-4 text-purple-600" />
                                                Order
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                <ToggleLeft className="w-4 h-4 text-amber-600" />
                                                Status
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                <Zap className="w-4 h-4 text-cyan-600" />
                                                Meta
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">
                                            <div className="flex items-center justify-end gap-2 font-semibold text-gray-700">
                                                Actions
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody aria-live="polite">
                                    <AnimatePresence mode="popLayout">
                                        {ids.map((id, index) => (
                                            <GuideBannerRow
                                                key={id}
                                                id={id}
                                                index={index}
                                                entity={byId[id]}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Footer Info */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-200 p-4">
                    <div className="flex flex-wrap items-center gap-4 justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700">
                                <GripVertical className="w-3 h-3 mr-1" />
                                Drag to reorder
                            </Badge>
                            {query?.sortBy && (
                                <Badge variant="outline" className="bg-white border-blue-200 text-blue-700">
                                    Sorted by: {query.sortBy}
                                </Badge>
                            )}
                            {query?.active !== undefined && (
                                <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                                    Filter: {query.active ? 'Active' : 'Inactive'}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Real-time updates enabled
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}