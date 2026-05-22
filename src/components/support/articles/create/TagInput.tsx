'use client';

import { useState } from 'react';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_SURFACE_INSET =
    'bg-[#E7E5E4] shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff]';

const NEU_INPUT =
    'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 border-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_TAG =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs ' +
    'font-[family-name:var(--font-space-mono)] font-bold text-[#006666] ' +
    'bg-[#006666]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]';

const NEU_TAG_REMOVE =
    'ml-0.5 rounded-md w-4 h-4 flex items-center justify-center text-[#1E2938]/40 ' +
    'hover:text-[#FF2157] hover:bg-[#FF2157]/10 transition-all duration-150 text-xs leading-none';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

export function TagInput({
    value,
    onChange,
    placeholder = 'Add a tag and press Enter',
}: {
    value?: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
}) {
    const [draft, setDraft] = useState('');
    const tags = value ?? [];

    return (
        <div className="space-y-2.5">
            {tags.length > 0 && (
                <div
                    className={`flex flex-wrap gap-2 p-3 rounded-xl min-h-[44px] ${NEU_SURFACE_INSET}`}
                >
                    {tags.map((t) => (
                        <span key={t} className={NEU_TAG}>
                            {t}
                            <button
                                type="button"
                                aria-label={`Remove tag ${t}`}
                                className={NEU_TAG_REMOVE}
                                onClick={() => onChange(tags.filter((tag) => tag !== t))}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <input
                className={NEU_INPUT}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                aria-label="Tag input"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.trim()) {
                        const next = Array.from(new Set([...tags, draft.trim().toLowerCase()]));
                        onChange(next);
                        setDraft('');
                    }
                    if (e.key === 'Backspace' && !draft && tags.length) {
                        onChange(tags.slice(0, -1));
                    }
                }}
            />

            <p className={`${NEU_LABEL} text-[10px]`}>
                Press <kbd className="font-[family-name:var(--font-jetbrains-mono)] px-1 py-0.5 rounded bg-[#1E2938]/10 text-[#1E2938]/70">Enter</kbd> to add · <kbd className="font-[family-name:var(--font-jetbrains-mono)] px-1 py-0.5 rounded bg-[#1E2938]/10 text-[#1E2938]/70">Backspace</kbd> to remove last
            </p>
        </div>
    );
}