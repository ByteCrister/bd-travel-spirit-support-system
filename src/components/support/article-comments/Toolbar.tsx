'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    HiMagnifyingGlass,
    HiAdjustmentsHorizontal,
    HiArrowDownTray,
    HiXMark,
    HiChevronDown,
} from 'react-icons/hi2';
import { ArticleSortKey } from '@/types/article/article-comment.types';
import { useArticleCommentsStore } from '@/store/article/article-comment.store';
import { exportSliceToCsv, useDebouncedCallback } from '@/utils/helpers/article-comments.debounce';
import { COMMENT_STATUS } from '@/constants/articleComment.const';

// ── Defaults ───────────────────────────────────────────────────
const DEFAULTS = {
    status: 'any' as 'any' | COMMENT_STATUS,
    searchQuery: null as string | null,
    authorName: null as string | null,
    taggedRegion: null as string | null,
    sort: { key: 'createdAt' as ArticleSortKey, direction: 'desc' as const },
    page: 1,
    pageSize: 20,
};

// ── Style constants ────────────────────────────────────────────
const S = {
    root: 'w-full space-y-4',

    // primary row
    row1: 'flex flex-col sm:flex-row sm:items-center gap-3',

    // search wrapper (inset well)
    searchWrap: 'relative flex-1 max-w-sm',
    searchInput:
        'w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#E7E5E4] text-[#1E2938] ' +
        'placeholder:text-[#1E2938]/40 text-sm ' +
        'font-[family-name:var(--font-jetbrains-mono)] ' +
        'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none ' +
        'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200',
    searchIcon: 'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none',
    clearBtn:
        'absolute right-3 top-1/2 -translate-y-1/2 text-[#1E2938]/40 ' +
        'hover:text-[#1E2938]/70 transition-colors',

    // action buttons
    actions: 'flex items-center gap-2',
    btnGhost:
        'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] text-[#1E2938] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40',
    btnReset:
        'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm ' +
        'font-[family-name:var(--font-space-mono)] text-[#FF2157] ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'transition-all duration-200',

    // divider
    divider: 'border-b border-[#1E2938]/10 pb-2',

    // secondary row
    row2: 'flex flex-col sm:flex-row sm:items-center gap-3',

    // filter group label
    filterLabel:
        'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest whitespace-nowrap',

    filterGroup: 'flex items-center gap-3',

    // select trigger override (inset look)
    selectTrigger:
        'h-9 text-sm font-[family-name:var(--font-jetbrains-mono)] ' +
        'bg-[#E7E5E4] border-none rounded-xl ' +
        'shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'focus:ring-2 focus:ring-[#006666]/50 focus:outline-none ' +
        'text-[#1E2938] placeholder:text-[#1E2938]/40',

    mlAuto: 'sm:ml-auto',
};

// ── Component ──────────────────────────────────────────────────
export function Toolbar() {
    const store = useArticleCommentsStore();
    const [search, setSearch] = useState(store.tableQuery.filters.searchQuery ?? '');

    const debouncedUpdate = useDebouncedCallback(() => {
        store.setTableQuery({
            filters: { ...store.tableQuery.filters, searchQuery: search || null },
            page: 1,
        });
        store.fetchTable();
    }, 300);

    useEffect(() => {
        debouncedUpdate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const onReset = () => {
        store.setTableQuery({
            filters: {
                status: DEFAULTS.status,
                searchQuery: DEFAULTS.searchQuery,
                authorName: DEFAULTS.authorName,
                taggedRegion: DEFAULTS.taggedRegion,
            },
            sort: DEFAULTS.sort,
            page: DEFAULTS.page,
            pageSize: DEFAULTS.pageSize,
        });
        store.fetchTable();
        setSearch('');
    };

    const onExportCsv = () => exportSliceToCsv(store.tableVM);

    const onChangeSortKey = (key: ArticleSortKey) => {
        store.setTableQuery({ sort: { ...store.tableQuery.sort, key }, page: 1 });
        store.fetchTable();
    };

    const onChangeSortDir = (dir: 'asc' | 'desc') => {
        store.setTableQuery({ sort: { ...store.tableQuery.sort, direction: dir }, page: 1 });
        store.fetchTable();
    };

    const onChangeStatus = (s: 'any' | COMMENT_STATUS) => {
        store.setTableQuery({ filters: { ...store.tableQuery.filters, status: s }, page: 1 });
        store.fetchTable();
    };

    const onChangePageSize = (ps: number) => {
        store.setTableQuery({ pageSize: ps, page: 1 });
        store.fetchTable();
    };

    const hasActiveFilters =
        search ||
        store.tableQuery.filters.status !== 'any' ||
        store.tableQuery.pageSize !== DEFAULTS.pageSize;

    return (
        <div className={S.root}>
            {/* Row 1 — Search + actions */}
            <div className={S.row1}>
                <div className={S.searchWrap}>
                    <HiMagnifyingGlass className={S.searchIcon} />
                    <label htmlFor="toolbar-search" className="sr-only">Search articles</label>
                    <input
                        id="toolbar-search"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search articles by title…"
                        className={S.searchInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setSearch('');
                            if (e.key === 'Enter') debouncedUpdate.flush?.();
                        }}
                        aria-label="Search articles"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className={S.clearBtn} aria-label="Clear search">
                            <HiXMark className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className={S.actions}>
                    <button onClick={onExportCsv} className={S.btnGhost} aria-label="Export to CSV">
                        <HiArrowDownTray className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={S.btnGhost} aria-label="Column visibility">
                                <HiAdjustmentsHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">Columns</span>
                                <HiChevronDown className="h-3 w-3 opacity-50" />
                            </button>
                        </DropdownMenuTrigger>
                    </DropdownMenu>

                    {hasActiveFilters && (
                        <button onClick={onReset} className={S.btnReset} aria-label="Reset all filters">
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Row 2 — Sort + filter + page size */}
            <div className={`${S.row2} ${S.divider}`}>
                {/* Sort */}
                <div className={S.filterGroup}>
                    <span className={S.filterLabel}>Sort</span>
                    <Select value={store.tableQuery.sort.key} onValueChange={(v) => onChangeSortKey(v as ArticleSortKey)}>
                        <SelectTrigger className={`${S.selectTrigger} w-40`} aria-label="Sort key">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="createdAt">Created at</SelectItem>
                            <SelectItem value="updatedAt">Updated at</SelectItem>
                            <SelectItem value="title">Title</SelectItem>
                            <SelectItem value="totalComments">Total comments</SelectItem>
                            <SelectItem value="pendingComments">Pending comments</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={store.tableQuery.sort.direction} onValueChange={(v) => onChangeSortDir(v as 'asc' | 'desc')}>
                        <SelectTrigger className={`${S.selectTrigger} w-28`} aria-label="Sort direction">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status */}
                <div className={S.filterGroup}>
                    <span className={S.filterLabel}>Status</span>
                    <Select
                        value={String(store.tableQuery.filters.status ?? 'any')}
                        onValueChange={(v) => onChangeStatus(v as 'any' | COMMENT_STATUS)}
                    >
                        <SelectTrigger className={`${S.selectTrigger} w-40`} aria-label="Status filter">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any status</SelectItem>
                            <SelectItem value="pending">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#FE9900]" />Pending
                                </span>
                            </SelectItem>
                            <SelectItem value="approved">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#00A63D]" />Approved
                                </span>
                            </SelectItem>
                            <SelectItem value="rejected">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#FF2157]" />Rejected
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page size */}
                <div className={`${S.filterGroup} ${S.mlAuto}`}>
                    <span className={S.filterLabel}>Per page</span>
                    <Select
                        value={String(store.tableQuery.pageSize)}
                        onValueChange={(v) => onChangePageSize(Number(v))}
                    >
                        <SelectTrigger className={`${S.selectTrigger} w-24`} aria-label="Items per page">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}