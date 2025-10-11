// components/article-comments/ReplyEditor.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { showToast } from '../global/showToast';
import { HiPaperAirplane, HiXMark } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';

export function ReplyEditor({
    onSubmit,
    onCancel,
}: {
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
}) {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const MAX_CHARS = 5000;

    const submit = async () => {
        if (!value.trim()) {
            showToast.error('Comment cannot be empty');
            return;
        }

        if (value.length > MAX_CHARS) {
            showToast.error(`Comment exceeds maximum length of ${MAX_CHARS} characters`);
            return;
        }

        setLoading(true);
        try {
            await onSubmit(value.trim());
            setValue('');
            setCharacterCount(0);
            showToast.success('Reply posted successfully');
        } catch (e) {
            showToast.error('Failed to submit reply', e instanceof Error ? e.message : undefined);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        setCharacterCount(newValue.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            onCancel();
        }
        if (e.ctrlKey && e.key === 'Enter') {
            submit();
        }
        if (e.metaKey && e.key === 'Enter') {
            // For Mac
            submit();
        }
    };

    // Auto-focus on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const isDisabled = loading || !value.trim() || value.length > MAX_CHARS;
    const charCountPercentage = (characterCount / MAX_CHARS) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800"
        >
            {/* Textarea */}
            <div className="space-y-2">
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Share your thoughts... (Ctrl+Enter to submit, Esc to cancel)"
                    aria-label="Reply editor"
                    disabled={loading}
                    className="min-h-24 resize-none bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Character count with progress bar */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${charCountPercentage}%` }}
                                transition={{ duration: 0.2 }}
                                className={`h-full rounded-full transition-colors ${value.length > MAX_CHARS * 0.9
                                        ? 'bg-orange-500'
                                        : value.length > MAX_CHARS * 0.7
                                            ? 'bg-blue-500'
                                            : 'bg-slate-400'
                                    }`}
                            />
                        </div>
                    </div>
                    <span
                        className={`text-xs font-medium whitespace-nowrap ${value.length > MAX_CHARS
                                ? 'text-red-600 dark:text-red-400'
                                : value.length > MAX_CHARS * 0.9
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        {characterCount}/{MAX_CHARS}
                    </span>
                </div>

                {/* Validation error */}
                <AnimatePresence>
                    {value.length > MAX_CHARS && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-xs text-red-600 dark:text-red-400 font-medium"
                        >
                            Comment exceeds maximum length by {value.length - MAX_CHARS} characters
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button
                    onClick={submit}
                    disabled={isDisabled}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    size="sm"
                >
                    <HiPaperAirplane className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
                    <span>{loading ? 'Posting…' : 'Post reply'}</span>
                </Button>

                <Button
                    onClick={onCancel}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <HiXMark className="h-4 w-4" />
                    Cancel
                </Button>
            </div>

            {/* Keyboard hint */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="space-y-0.5">
                    <div className="hidden sm:flex items-center gap-1">
                        <kbd className="px-2 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                            Ctrl
                        </kbd>
                        <span>+</span>
                        <kbd className="px-2 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600">
                            Enter
                        </kbd>
                        <span>to submit</span>
                    </div>
                </div>
                <div>Markdown supported</div>
            </div>
        </motion.div>
    );
}