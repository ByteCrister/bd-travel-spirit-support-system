'use client';

import { useState, useRef, useEffect } from 'react';
import { showToast } from '../../global/showToast';
import { HiPaperAirplane, HiXMark } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

// ── Style constants ────────────────────────────────────────────
const S = {
    root:
        'space-y-3 p-4 rounded-2xl bg-[#E7E5E4] ' +
        'shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] ' +
        'border border-white/40',

    // textarea (double inset = deeper well)
    textarea:
        'w-full min-h-24 resize-none px-4 py-3 rounded-xl ' +
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] ' +
        'placeholder:text-[#1E2938]/40 bg-[#E7E5E4] border-none ' +
        'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
        'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 ' +
        'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',

    // char counter row
    charRow: 'flex items-center justify-between gap-2',
    progressWrap: 'flex-1 h-1.5 rounded-full overflow-hidden bg-[#E7E5E4] shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]',
    progressBar: (pct: number, over: boolean, warn: boolean) =>
        `h-full rounded-full transition-all duration-200 ` +
        (over ? 'bg-[#FF2157]' : warn ? 'bg-[#FE9900]' : 'bg-[#006666]'),

    charCount: (over: boolean, warn: boolean) =>
        'text-xs font-[family-name:var(--font-space-mono)] font-bold whitespace-nowrap ' +
        (over ? 'text-[#FF2157]' : warn ? 'text-[#FE9900]' : 'text-[#1E2938]/40'),

    // overflow error
    overflowMsg:
        'text-xs font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157]',

    // action row
    actions: 'flex items-center gap-2',

    btnSubmit:
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-white ' +
        'bg-[#006666] ' +
        'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
        'hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] hover:bg-[#007777] ' +
        'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
        'transition-all duration-200',

    btnCancel:
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] text-[#1E2938] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200',

    // keyboard hint
    hint: 'flex items-center justify-between text-xs text-[#1E2938]/40',
    hintKbdRow: 'hidden sm:flex items-center gap-1 font-[family-name:var(--font-jetbrains-mono)]',
    kbd:
        'px-1.5 py-0.5 text-xs font-bold rounded-lg ' +
        'bg-[#E7E5E4] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] ' +
        'text-[#1E2938]/60',
    mdNote: 'font-[family-name:var(--font-jetbrains-mono)]',
};

const MAX_CHARS = 5000;

export function ReplyEditor({
    onSubmit,
    onCancel,
}: {
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
}) {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const charCount = value.length;
    const pct = (charCount / MAX_CHARS) * 100;
    const isOver = charCount > MAX_CHARS;
    const isWarn = !isOver && pct > 90;
    const isDisabled = loading || !value.trim() || isOver;

    const submit = async () => {
        if (!value.trim()) { showToast.error('Comment cannot be empty'); return; }
        if (isOver) { showToast.error(`Comment exceeds max length of ${MAX_CHARS}`); return; }
        setLoading(true);
        try {
            await onSubmit(value.trim());
            setValue('');
            showToast.success('Reply posted successfully');
        } catch (e) {
            showToast.error('Failed to submit reply', e instanceof Error ? e.message : undefined);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') onCancel();
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') submit();
    };

    useEffect(() => { textareaRef.current?.focus(); }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={S.root}
        >
            {/* Textarea */}
            <div className="space-y-2">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts… (Ctrl+Enter to submit, Esc to cancel)"
                    aria-label="Reply editor"
                    disabled={loading}
                    className={S.textarea}
                />

                {/* Progress bar + count */}
                <div className={S.charRow}>
                    <div className={S.progressWrap}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(pct, 100)}%` }}
                            transition={{ duration: 0.2 }}
                            className={S.progressBar(pct, isOver, isWarn)}
                        />
                    </div>
                    <span className={S.charCount(isOver, isWarn)}>
                        {charCount}/{MAX_CHARS}
                    </span>
                </div>

                <AnimatePresence>
                    {isOver && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={S.overflowMsg}
                        >
                            Comment exceeds max length by {charCount - MAX_CHARS} characters
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className={S.actions}>
                <button onClick={submit} disabled={isDisabled} className={S.btnSubmit}>
                    <HiPaperAirplane className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                    {loading ? 'Posting…' : 'Post reply'}
                </button>
                <button onClick={onCancel} disabled={loading} className={S.btnCancel}>
                    <HiXMark className="h-4 w-4" />
                    Cancel
                </button>
            </div>

            {/* Keyboard hint */}
            <div className={S.hint}>
                <div className={S.hintKbdRow}>
                    <kbd className={S.kbd}>Ctrl</kbd>
                    <span>+</span>
                    <kbd className={S.kbd}>Enter</kbd>
                    <span className="ml-1">to submit</span>
                </div>
                <span className={S.mdNote}>Markdown supported</span>
            </div>
        </motion.div>
    );
}