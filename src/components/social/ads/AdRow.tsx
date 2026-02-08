'use client';

import React, { JSX, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { MdRefresh, MdDelete, MdVisibility, MdTouchApp, MdPerson, MdError } from 'react-icons/md';
import { BiChevronDown } from 'react-icons/bi';
import type { AdvertisementResponse } from '@/types/advertising/advertising.types';
import { showToast } from '@/components/global/showToast';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { formatDateShort, formatNumber } from '@/utils/helpers/ads-ui';
import { AdDetails } from './AdDetails';
import { TableCell, TableRow } from '@/components/ui/table';
import useAdsStore from '@/store/ads.store';
import { ConfirmDialog } from './ConfirmDialog';
import AdDetailsSkeleton from './skeletons/AdDetailsSkeleton';

export interface AdRowProps {
    ad: AdvertisementResponse;
    index: number;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    draft: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-500' },
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
    active: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    paused: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    expired: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
    rejected: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
};

const detailsVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

export function AdRow({ ad }: AdRowProps): JSX.Element {
    const { selection, cache, fetchById } = useAdsStore();
    const cacheEntry = cache.byId[ad.id];
    const activeAdMeta = cache.byId[ad.id]?.meta ?? null;

    const [localLoading, setLocalLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const onToggleSelect = () => {
        selection.toggle(ad.id);
    };

    const onToggleExpand = async () => {
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        if (newExpanded) {
            const lastFetched = cacheEntry?.meta?.lastFetchedAt;
            const isStale = !lastFetched;
            if (isStale) {
                setLocalLoading(true);
                try {
                    await fetchById(ad.id);
                } catch (err) {
                    showToast.error(String((err as Error)?.message ?? 'Failed to load ad'));
                } finally {
                    setLocalLoading(false);
                }
            }
        }
    };

    const startDelete = () => {
        if (!selection.has(ad.id)) {
            showToast.warning('Select the ad before deleting', 'Please check the row selection first');
            return;
        }
        setConfirmOpen(true);
    };

    const onConfirmDelete = async () => {
        setDeleting(true);
        try {
            const res = await useAdsStore.getState().softDelete(ad.id);
            if (res.ok) {
                showToast.success('Ad moved to trash');
                setExpanded(false);
            } else {
                showToast.error(res.error?.message ?? 'Delete failed');
            }
        } catch (err) {
            showToast.error(String((err as Error)?.message ?? 'Delete failed'));
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
        }
    };

    const statusColors = STATUS_COLORS[ad.status] || STATUS_COLORS.draft;

    return (
        <>
            <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-200 dark:border-slate-700">
                {/* Checkbox */}
                <TableCell>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Checkbox checked={selection.has(ad.id)} onCheckedChange={onToggleSelect} aria-label={`Select ad ${ad.title ?? ad.id}`} />
                    </motion.div>
                </TableCell>

                {/* Title & Guide */}
                <TableCell>
                    <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 dark:text-white truncate">{ad.title || <span className="italic text-slate-400">Untitled</span>}</div>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                <MdPerson className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{ad.guideName ?? '—'}</span>
                            </div>
                        </div>
                    </div>
                </TableCell>

                {/* Placements */}
                <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {ad.placements.slice(0, 2).map((placement, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                {placement}
                            </span>
                        ))}
                        {ad.placements.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                +{ad.placements.length - 2}
                            </span>
                        )}
                    </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusColors.dot} animate-pulse`} />
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}>
                            {ad.status}
                        </span>
                    </div>
                </TableCell>

                {/* Impressions */}
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                        <MdVisibility className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{formatNumber(ad.impressions)}</span>
                    </div>
                </TableCell>

                {/* Clicks */}
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                        <MdTouchApp className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{formatNumber(ad.clicks)}</span>
                    </div>
                </TableCell>

                {/* Created Date */}
                <TableCell>
                    <span className="text-sm text-slate-600 dark:text-slate-400">{formatDateShort(ad.createdAt)}</span>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="sm" onClick={onToggleExpand} className="h-8 w-8 p-0" aria-label="Toggle details">
                                <BiChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    fetchById(ad.id)
                                        .then(() => showToast.success('Refreshed'))
                                        .catch((e) => showToast.error(String((e as Error)?.message ?? 'Refresh failed')));
                                }}
                                className="h-8 w-8 p-0"
                                aria-label="Refresh ad"
                            >
                                <MdRefresh className="w-4 h-4" />
                            </Button>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <ConfirmDialog
                                open={confirmOpen && selection.has(ad.id)}   // ⬅️ BLOCK opening if not selected
                                onOpenChange={(open) => {
                                    // prevents opening from outside (keyboard / programmatic)
                                    if (open && !selection.has(ad.id)) {
                                        setConfirmOpen(false);
                                        return;
                                    }
                                    setConfirmOpen(open);
                                }}
                                title="Delete ad"
                                description="This will soft-delete the ad and move it to trash. You can restore it later."
                                confirmText={deleting ? 'Deleting...' : 'Delete'}
                                cancelText="Cancel"
                                variant="danger"
                                onConfirm={onConfirmDelete}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startDelete();
                                    }}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    aria-label="Delete ad"
                                >
                                    <MdDelete className="w-4 h-4" />
                                </Button>
                            </ConfirmDialog>

                        </motion.div>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expanded Details Row */}
            <AnimatePresence>
                {expanded && (
                    <TableRow>
                        <TableCell colSpan={8} className="p-0 border-b border-slate-200 dark:border-slate-700">
                            <motion.div variants={detailsVariants} initial="hidden" animate="visible" exit="exit" className="bg-slate-50 dark:bg-slate-900/30">
                                <div className="px-6 py-4">
                                    {localLoading || activeAdMeta?.loading ? (
                                        <AdDetailsSkeleton />
                                    ) : activeAdMeta?.error ? (
                                        <div role="alert" className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                                            <MdError className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-red-900 dark:text-red-100">Error Loading Details</h4>
                                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{activeAdMeta.error}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <AdDetails id={ad.id} />
                                    )}
                                </div>
                            </motion.div>
                        </TableCell>
                    </TableRow>
                )}
            </AnimatePresence>
        </>
    );
}

export default AdRow;
