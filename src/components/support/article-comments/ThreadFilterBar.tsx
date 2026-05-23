'use client';

import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CommentFiltersDTO } from '@/types/article/article-comment.types';
import { COMMENT_STATUS, CommentStatus } from '@/constants/articleComment.const';
import { HiAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';

// ── Style constants ────────────────────────────────────────────
const S = {
    root: 'space-y-3 mb-4',

    topRow: 'flex items-center justify-between',

    btnToggle:
        'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'transition-all duration-200',

    btnClear:
        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#FF2157] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    panelWrap:
        'grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl ' +
        'bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff] ' +
        'border border-white/40',

    fieldLabel:
        'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 ' +
        'uppercase tracking-widest mb-2 block',

    selectTrigger:
        'h-9 w-full text-sm font-[family-name:var(--font-jetbrains-mono)] ' +
        'bg-[#E7E5E4] border-none rounded-xl text-[#1E2938] ' +
        'shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'focus:ring-2 focus:ring-[#006666]/50 focus:outline-none',

    textInput:
        'w-full px-3 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-jetbrains-mono)] text-[#1E2938] ' +
        'placeholder:text-[#1E2938]/40 bg-[#E7E5E4] border-none ' +
        'shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200',
};

interface ThreadFilterBarProps {
    articleId: string;
    parentId?: string | null;
    onFilterChange: (filters: CommentFiltersDTO) => void;
    currentFilters: CommentFiltersDTO;
}

export function ThreadFilterBar({ onFilterChange, currentFilters }: ThreadFilterBarProps) {
    const [showFilters, setShowFilters] = useState(false);
    const hasActive = currentFilters.status || currentFilters.authorName;

    const handleStatusChange = (status: string) => {
        onFilterChange({
            ...currentFilters,
            status: status === 'any' ? undefined : (status as CommentStatus | 'any'),
        });
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...currentFilters, authorName: e.target.value || undefined });
    };

    const handleClear = () => { onFilterChange({}); setShowFilters(false); };

    return (
        <div className={S.root}>
            <div className={S.topRow}>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={S.btnToggle}
                    aria-expanded={showFilters}
                >
                    <HiAdjustmentsHorizontal className="h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {hasActive && (
                    <button onClick={handleClear} className={S.btnClear}>
                        <HiXMark className="h-4 w-4" />
                        Clear Filters
                    </button>
                )}
            </div>

            {showFilters && (
                <div className={S.panelWrap}>
                    {/* Status */}
                    <div>
                        <label className={S.fieldLabel}>Status</label>
                        <Select value={currentFilters.status || 'any'} onValueChange={handleStatusChange}>
                            <SelectTrigger className={S.selectTrigger}>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any Status</SelectItem>
                                <SelectItem value={COMMENT_STATUS.APPROVED}>
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#00A63D]" />Approved
                                    </span>
                                </SelectItem>
                                <SelectItem value={COMMENT_STATUS.PENDING}>
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#FE9900]" />Pending
                                    </span>
                                </SelectItem>
                                <SelectItem value={COMMENT_STATUS.REJECTED}>
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#FF2157]" />Rejected
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Author */}
                    <div>
                        <label className={S.fieldLabel}>Author Name</label>
                        <input
                            type="text"
                            placeholder="Search by author…"
                            value={currentFilters.authorName || ''}
                            onChange={handleAuthorChange}
                            className={S.textInput}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}