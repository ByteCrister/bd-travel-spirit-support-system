'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextBlock } from '@/types/article/article.types';

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
        <div className="space-y-2">
            <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => addBlock('heading')}>
                    Add Heading
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock('paragraph')}>
                    Add Paragraph
                </Button>
                <Button type="button" variant="outline" onClick={() => addBlock('link')}>
                    Add Link
                </Button>
            </div>

            <div className="space-y-3">
                {blocks.map((b, i) => (
                    <div key={i} className="rounded-md border p-3 space-y-2">
                        <div className="text-xs text-muted-foreground">Type: {b.type}</div>
                        {b.type === 'heading' && (
                            <Input
                                value={b.text ?? ''}
                                onChange={(e) => updateBlock(i, { text: e.target.value })}
                                placeholder="Heading text"
                            />
                        )}
                        {b.type === 'paragraph' && (
                            <Textarea
                                value={b.text ?? ''}
                                onChange={(e) => updateBlock(i, { text: e.target.value })}
                                placeholder="Paragraph text"
                            />
                        )}
                        {b.type === 'link' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                    value={b.text ?? ''}
                                    onChange={(e) => updateBlock(i, { text: e.target.value })}
                                    placeholder="Link text"
                                />
                                <Input
                                    value={b.href ?? ''}
                                    onChange={(e) => updateBlock(i, { href: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button type="button" variant="ghost" onClick={() => removeBlock(i)}>
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
