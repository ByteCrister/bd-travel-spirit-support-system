'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { useArticleCommentsStore } from '@/store/article-comment.store';
import { COMMENT_STATUS } from '@/constants/articleComment.const';

export function ModerationReasonDialog({
    open,
    onOpenChange,
    commentId,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    commentId: string;
}) {
    const store = useArticleCommentsStore();
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        try {
            await store.updateStatus({ commentId, status: COMMENT_STATUS.REJECTED, reason });
            onOpenChange(false);
            setReason('');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setReason('');
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <HiExclamationTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Reject comment</DialogTitle>
                            <DialogDescription className="text-sm mt-1">
                                This action will reject the comment. Optionally provide a reason.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="reason" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Moderation reason (optional)
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g., Spam, offensive content, off-topic..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="min-h-24 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-red-500 dark:focus:ring-red-400 text-slate-900 dark:text-white"
                            aria-label="Moderation reason"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Be specific to help the user understand why their comment was rejected.
                        </p>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                        className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                    >
                        {loading ? 'Rejecting…' : 'Reject comment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}