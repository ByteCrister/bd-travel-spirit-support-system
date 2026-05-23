'use client';

import { useState } from 'react';
import { RichTextBlock } from '@/types/article/article.types';
import { Heading2, AlignLeft, Link2, Trash2, Plus, AlertCircle } from 'lucide-react';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_INPUT =
    'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 border-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_TEXTAREA =
    'w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
    'font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-3 border-none resize-none ' +
    'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] ' +
    'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200';

const NEU_BTN_GHOST =
    'rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] text-xs font-bold ' +
    'px-3 py-2 flex items-center gap-1.5 uppercase tracking-wide ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
    'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40';

const NEU_BTN_DANGER_ICON =
    'rounded-lg w-7 h-7 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/40 ' +
    'shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff] ' +
    'hover:text-[#FF2157] hover:bg-[#FF2157]/10 ' +
    'transition-all duration-200';

const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-4';

const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';

const NEU_EMPTY =
    'rounded-2xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] ' +
    'p-8 text-center';

const BLOCK_ICONS: Record<RichTextBlock['type'], React.ReactNode> = {
    heading: <Heading2 className="h-3.5 w-3.5" />,
    paragraph: <AlignLeft className="h-3.5 w-3.5" />,
    link: <Link2 className="h-3.5 w-3.5" />,
    important: <AlertCircle className="h-3.5 w-3.5" />,
};

const BLOCK_LABEL: Record<RichTextBlock['type'], string> = {
    heading: 'Heading',
    paragraph: 'Paragraph',
    link: 'Link',
    important: 'Important',
};

export function RichTextEditor({
    value,
    onChange,
}: {
    value?: RichTextBlock[];
    onChange: (v: RichTextBlock[]) => void;
}) {
    const [blocks, setBlocks] = useState<RichTextBlock[]>(value ?? []);

    const addBlock = (type: RichTextBlock['type']) => {
        const base: RichTextBlock = { type, text: '' };
        const next = [...blocks, base];
        setBlocks(next);
        onChange(next);
    };

    const updateBlock = (i: number, patch: Partial<RichTextBlock>) => {
        const next = blocks.slice();
        next[i] = { ...next[i], ...patch };
        setBlocks(next);
        onChange(next);
    };

    const removeBlock = (i: number) => {
        const next = blocks.filter((_, idx) => idx !== i);
        setBlocks(next);
        onChange(next);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2">
                {(['heading', 'paragraph', 'link', 'important'] as RichTextBlock['type'][]).map((type) => (
                    <button
                        key={type}
                        type="button"
                        className={NEU_BTN_GHOST}
                        onClick={() => addBlock(type)}
                    >
                        {BLOCK_ICONS[type]}
                        <Plus className="h-3 w-3 opacity-60" />
                        {BLOCK_LABEL[type]}
                    </button>
                ))}
            </div>

            {/* Empty state */}
            {blocks.length === 0 && (
                <div className={NEU_EMPTY}>
                    <AlignLeft className="h-8 w-8 mx-auto text-[#1E2938]/20 mb-2" />
                    <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/30 uppercase tracking-widest">
                        No content blocks yet
                    </p>
                    <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/30 mt-1">
                        Use the buttons above to add headings, paragraphs, links, or important notes
                    </p>
                </div>
            )}

            {/* Blocks */}
            <div className="space-y-3">
                {blocks.map((b, i) => (
                    <div key={i} className={NEU_CARD}>
                        {/* Block header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]">
                                    {BLOCK_ICONS[b.type]}
                                </span>
                                <span className={`${NEU_LABEL}`}>{BLOCK_LABEL[b.type]}</span>
                            </div>
                            <button
                                type="button"
                                aria-label={`Remove ${b.type} block`}
                                className={NEU_BTN_DANGER_ICON}
                                onClick={() => removeBlock(i)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        {/* Heading */}
                        {b.type === 'heading' && (
                            <input
                                className={NEU_INPUT}
                                value={b.text ?? ''}
                                onChange={(e) => updateBlock(i, { text: e.target.value })}
                                placeholder="Heading text..."
                            />
                        )}

                        {/* Paragraph */}
                        {b.type === 'paragraph' && (
                            <textarea
                                className={NEU_TEXTAREA}
                                rows={3}
                                value={b.text ?? ''}
                                onChange={(e) => updateBlock(i, { text: e.target.value })}
                                placeholder="Write your paragraph..."
                            />
                        )}

                        {/* Link */}
                        {b.type === 'link' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    className={NEU_INPUT}
                                    value={b.text ?? ''}
                                    onChange={(e) => updateBlock(i, { text: e.target.value })}
                                    placeholder="Link text"
                                />
                                <input
                                    className={NEU_INPUT}
                                    value={b.href ?? ''}
                                    onChange={(e) => updateBlock(i, { href: e.target.value })}
                                    placeholder="https://example.com"
                                    type="url"
                                />
                            </div>
                        )}

                        {/* Important */}
                        {b.type === 'important' && (
                            <textarea
                                className={NEU_TEXTAREA}
                                rows={3}
                                value={b.text ?? ''}
                                onChange={(e) => updateBlock(i, { text: e.target.value })}
                                placeholder="Important information..."
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}