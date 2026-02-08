// components/ads/AdActions.tsx
'use client';

import React, { JSX, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import useAdsStore from '@/store/ads.store';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extract-error-message';
import { Spinner } from '@/components/ui/spinner';
import {
    CheckCircle,
    XCircle,
    Pause,
    Play,
    Trash2,
    RotateCcw,
    AlertTriangle,
    ShieldCheck,
    Settings,
    Database,
} from 'lucide-react';
import { AdsActionTypes } from '@/types/advertising/advertising.types';

interface AdActionsProps {
    id: string;
}

const SectionHeader = ({ 
    icon, 
    title 
}: { 
    icon: JSX.Element; 
    title: string;
}) => (
    <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            {icon}
        </div>
        <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
            {title}
        </p>
    </div>
);

export function AdActions({ id }: AdActionsProps): JSX.Element {
    const { adminAction, softDelete, restore, adminActionMeta, deletionMeta } = useAdsStore();
    const deletionMETA = deletionMeta[id];

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

    const actionKey = (action: AdsActionTypes) => `${action}:${id}`;

    const performAdmin = async (action: AdsActionTypes, reason?: string) => {
        try {
            const result = await adminAction({ id, action, reason });
            if (result.ok) {
                showToast.success(`Advertisement ${action}d successfully`);
            }
        } catch (err: unknown) {
            showToast.error(String(extractErrorMessage(err)));
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            showToast.error('Please provide a rejection reason');
            return;
        }
        await performAdmin('reject', rejectReason);
        setRejectDialogOpen(false);
        setRejectReason('');
    };

    const onDelete = async () => {
        try {
            const result = await softDelete(id);
            if (result.ok) {
                showToast.success('Advertisement deleted successfully');
                setDeleteDialogOpen(false);
            }
        } catch (err: unknown) {
            showToast.error(String(extractErrorMessage(err)));
        }
    };

    const onRestore = async () => {
        try {
            const result = await restore(id);
            if (result.ok) {
                showToast.success('Advertisement restored successfully');
                setRestoreDialogOpen(false);
            }
        } catch (err: unknown) {
            showToast.error(String(extractErrorMessage(err)));
        }
    };

    return (
        <>
            <Card className="border-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-background p-6 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold">Admin Actions</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Manage advertisement status and lifecycle
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Actions */}
                    <div>
                        <SectionHeader 
                            icon={<ShieldCheck className="w-4 h-4" />}
                            title="Status Management"
                        />
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => performAdmin('approve')}
                                disabled={adminActionMeta[actionKey('approve')]?.loading}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm"
                                size="default"
                            >
                                {adminActionMeta[actionKey('approve')]?.loading ? (
                                    <Spinner />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                Approve
                            </Button>

                            <Button
                                onClick={() => setRejectDialogOpen(true)}
                                disabled={adminActionMeta[actionKey('reject')]?.loading}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
                                size="default"
                            >
                                {adminActionMeta[actionKey('reject')]?.loading ? (
                                    <Spinner />
                                ) : (
                                    <XCircle className="w-4 h-4" />
                                )}
                                Reject
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Pause/Resume Actions */}
                    <div>
                        <SectionHeader 
                            icon={<Settings className="w-4 h-4" />}
                            title="Campaign Control"
                        />
                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="outline"
                                onClick={() => performAdmin('pause')}
                                disabled={adminActionMeta[actionKey('pause')]?.loading}
                                className="flex items-center gap-2 border-2 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:border-orange-700"
                                size="default"
                            >
                                {adminActionMeta[actionKey('pause')]?.loading ? (
                                    <Spinner />
                                ) : (
                                    <Pause className="w-4 h-4" />
                                )}
                                Pause Campaign
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => performAdmin('resume')}
                                disabled={adminActionMeta[actionKey('resume')]?.loading}
                                className="flex items-center gap-2 border-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:border-blue-700"
                                size="default"
                            >
                                {adminActionMeta[actionKey('resume')]?.loading ? (
                                    <Spinner />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                                Resume Campaign
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Delete/Restore Actions */}
                    <div>
                        <SectionHeader 
                            icon={<Database className="w-4 h-4" />}
                            title="Data Management"
                        />
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => setDeleteDialogOpen(true)}
                                disabled={deletionMETA?.loading}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm"
                                size="default"
                            >
                                {deletionMETA?.loading ? <Spinner /> : <Trash2 className="w-4 h-4" />}
                                Delete
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setRestoreDialogOpen(true)}
                                className="flex items-center gap-2 border-2 hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-700"
                                size="default"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Restore
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-950">
                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            Reject Advertisement
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Please provide a detailed reason for rejecting this advertisement. This information will be shared with the guide to help them understand the decision.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        <Label htmlFor="reject-reason" className="text-sm font-semibold">
                            Rejection Reason <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="reject-reason"
                            placeholder="e.g., Content does not meet community guidelines, inappropriate imagery, misleading claims..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={5}
                            className="resize-none border-2 focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                            {rejectReason.length} characters
                        </p>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectDialogOpen(false);
                                setRejectReason('');
                            }}
                            className="border-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || adminActionMeta[actionKey('reject')]?.loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {adminActionMeta[actionKey('reject')]?.loading ? (
                                <>
                                    <Spinner /> Processing...
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Advertisement
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-950">
                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            Delete Advertisement
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Are you sure you want to delete this advertisement? This action can be reversed later by restoring the ad.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-900 dark:text-amber-100">
                                <p className="font-semibold mb-1.5">This is a soft delete</p>
                                <p className="text-amber-800 dark:text-amber-200">
                                    The advertisement will be hidden from public view but all data will be preserved. You can restore it at any time using the Restore button.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setDeleteDialogOpen(false)}
                            className="border-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onDelete}
                            disabled={deletionMETA?.loading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deletionMETA?.loading ? (
                                <>
                                    <Spinner /> Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Advertisement
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Restore Confirmation Dialog */}
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-950">
                                <RotateCcw className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            Restore Advertisement
                        </DialogTitle>
                        <DialogDescription className="text-base pt-2">
                            Are you sure you want to restore this advertisement? It will become visible and return to its previous status.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-green-900 dark:text-green-100">
                                <p className="font-semibold mb-1.5">Restoration details</p>
                                <p className="text-green-800 dark:text-green-200">
                                    All advertisement data will be restored and it will be visible again. The campaign will resume from where it was paused.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setRestoreDialogOpen(false)}
                            className="border-2"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={onRestore}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Restore Advertisement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}