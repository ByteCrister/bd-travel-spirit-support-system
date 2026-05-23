'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { HiExclamationTriangle } from 'react-icons/hi2';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { COMMENT_STATUS } from '@/constants/articleComment.const';

// ── Style constants ────────────────────────────────────────────
const S = {
    // Dialog content override — Tailwind classes applied via className prop
    content: 'bg-[#E7E5E4] border border-white/60 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:max-w-md',

    // header
    headerRow: 'flex items-center gap-3',
    iconWell:
        'p-2.5 rounded-xl bg-[#FF2157]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] flex-shrink-0',
    title:
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-lg',
    description:
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50 mt-1',

    // form
    fieldWrap: 'space-y-4 mt-2',
    label:
        'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest mb-2 block',
    textarea:
        'w-full min-h-24 px-4 py-3 rounded-xl resize-none ' +
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] ' +
        'placeholder:text-[#1E2938]/40 bg-[#E7E5E4] border-none ' +
        'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
        'focus:outline-none focus:ring-2 focus:ring-[#FF2157]/40 transition-all duration-200',
    hint:
        'font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40 mt-1',

    // footer
    footer: 'flex justify-end gap-3 mt-6',
    btnCancel:
        'px-4 py-2.5 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200',
    btnReject:
        'px-4 py-2.5 rounded-xl text-sm font-[family-name:var(--font-space-mono)] font-bold text-white ' +
        'bg-[#FF2157] ' +
        'shadow-[4px_4px_8px_rgba(255,33,87,0.3),-2px_-2px_6px_rgba(255,100,120,0.2)] ' +
        'hover:bg-[#e01f4e] hover:shadow-[6px_6px_12px_rgba(255,33,87,0.4)] ' +
        'active:shadow-[inset_3px_3px_6px_rgba(200,0,40,0.4),inset_-2px_-2px_4px_rgba(255,80,100,0.3)] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200',
};

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
        if (!newOpen) setReason('');
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={S.content}>
                <DialogHeader>
                    <div className={S.headerRow}>
                        <div className={S.iconWell}>
                            <HiExclamationTriangle className="h-5 w-5 text-[#FF2157]" />
                        </div>
                        <div>
                            <DialogTitle className={S.title}>Reject comment</DialogTitle>
                            <DialogDescription className={S.description}>
                                This action will reject the comment. Optionally provide a reason.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className={S.fieldWrap}>
                    <label htmlFor="mod-reason" className={S.label}>
                        Moderation reason <span className="normal-case font-normal">(optional)</span>
                    </label>
                    <textarea
                        id="mod-reason"
                        placeholder="e.g., Spam, offensive content, off-topic…"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={S.textarea}
                        aria-label="Moderation reason"
                    />
                    <p className={S.hint}>
                        Be specific to help the user understand why their comment was rejected.
                    </p>
                </div>

                <DialogFooter className={S.footer}>
                    <button
                        onClick={() => handleOpenChange(false)}
                        disabled={loading}
                        className={S.btnCancel}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className={S.btnReject}
                    >
                        {loading ? 'Rejecting…' : 'Reject comment'}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}