'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="cursor-default">
                        {t}
                    </Badge>
                ))}
            </div>
            <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.trim()) {
                        const next = Array.from(new Set([...tags, draft.trim().toLowerCase()]));
                        onChange(next);
                        setDraft('');
                    }
                    if (e.key === 'Backspace' && !draft && tags.length) {
                        const next = tags.slice(0, -1);
                        onChange(next);
                    }
                }}
                aria-label="Tag input"
            />
        </div>
    );
}
