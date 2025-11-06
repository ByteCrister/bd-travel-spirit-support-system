'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    HiMagnifyingGlass,
    HiAdjustmentsHorizontal,
    HiArrowDownTray,
    HiXMark,
    HiChevronDown,
} from 'react-icons/hi2';
import { ArticleSortKey } from '@/types/article-comment.types';
import { useArticleCommentsStore } from '@/store/article-comment.store';
import { exportSliceToCsv, useDebouncedCallback } from '@/utils/helpers/article-comments.debounce';
import { COMMENT_STATUS } from '@/constants/articleComment.const';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULTS = {
    status: 'any' as 'any' | COMMENT_STATUS,
    searchQuery: null as string | null,
    authorId: null as string | null,
    taggedRegion: null as string | null,
    sort: { key: 'createdAt' as ArticleSortKey, direction: 'desc' as const },
    page: 1,
    pageSize: 20,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function Toolbar() {
    const store = useArticleCommentsStore();

    // Persist visible columns in localStorage
    const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(() => {
        if (typeof window === 'undefined') {
            return { article: true, metrics: true, actions: true };
        }
        try {
            const parsed = JSON.parse(localStorage.getItem('ac.table.cols') || '{}');
            return parsed && Object.keys(parsed).length > 0
                ? parsed
                : { article: true, metrics: true, actions: true };
        } catch {
            return { article: true, metrics: true, actions: true };
        }
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('ac.table.cols', JSON.stringify(visibleCols));
        }
    }, [visibleCols]);

    // -----------------------------------------------------------------------
    // Search + debounce
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------
    const onReset = () => {
        store.setTableQuery({
            filters: {
                status: DEFAULTS.status,
                searchQuery: DEFAULTS.searchQuery,
                authorId: DEFAULTS.authorId,
                taggedRegion: DEFAULTS.taggedRegion,
            },
            sort: DEFAULTS.sort,
            page: DEFAULTS.page,
            pageSize: DEFAULTS.pageSize,
        });
        store.fetchTable();
        setSearch('');
    };

    const onExportCsv = () => {
        exportSliceToCsv(store.tableVM);
    };

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

    // Check if filters are active
    const hasActiveFilters =
        search ||
        store.tableQuery.filters.status !== 'any' ||
        store.tableQuery.pageSize !== DEFAULTS.pageSize;

    // -----------------------------------------------------------------------
    // JSX
    // -----------------------------------------------------------------------
    return (
        <div className="w-full space-y-4">
            {/* Primary toolbar row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search input */}
                <div className="relative flex-1 max-w-sm">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <Label htmlFor="search" className="sr-only">
                        Search articles
                    </Label>
                    <Input
                        id="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search articles by title..."
                        className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-lg"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') setSearch('');
                            if (e.key === 'Enter') debouncedUpdate.flush?.();
                        }}
                        aria-label="Search articles"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            aria-label="Clear search"
                        >
                            <HiXMark className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onExportCsv}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        aria-label="Export to CSV"
                    >
                        <HiArrowDownTray className="h-4 w-4" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>

                    {/* Column visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                aria-label="Column visibility"
                            >
                                <HiAdjustmentsHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">Columns</span>
                                <HiChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Visible Columns
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(['article', 'metrics', 'actions'] as const).map((col) => (
                                <DropdownMenuCheckboxItem
                                    key={col}
                                    checked={visibleCols[col] ?? true}
                                    onCheckedChange={(checked) =>
                                        setVisibleCols((s) => ({ ...s, [col]: !!checked }))
                                    }
                                    aria-label={`Toggle ${col} column`}
                                    className="capitalize text-sm"
                                >
                                    {col}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Reset button */}
                    {hasActiveFilters && (
                        <Button
                            onClick={onReset}
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Reset all filters"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Secondary toolbar row - Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                {/* Sort controls */}
                <div className="flex items-center gap-3">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Sort
                    </Label>
                    <Select
                        value={store.tableQuery.sort.key}
                        onValueChange={(v) => onChangeSortKey(v as ArticleSortKey)}
                    >
                        <SelectTrigger className="w-40 h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" aria-label="Sort key">
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

                    <Select
                        value={store.tableQuery.sort.direction}
                        onValueChange={(v) => onChangeSortDir(v as 'asc' | 'desc')}
                    >
                        <SelectTrigger className="w-24 h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" aria-label="Sort direction">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-3">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Status
                    </Label>
                    <Select
                        value={String(store.tableQuery.filters.status ?? 'any')}
                        onValueChange={(v) => onChangeStatus(v as 'any' | COMMENT_STATUS)}
                    >
                        <SelectTrigger className="w-40 h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" aria-label="Status filter">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any status</SelectItem>
                            <SelectItem value="pending">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                    Pending
                                </span>
                            </SelectItem>
                            <SelectItem value="approved">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Approved
                                </span>
                            </SelectItem>
                            <SelectItem value="rejected">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    Rejected
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page size */}
                <div className="flex items-center gap-3 sm:ml-auto">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Per page
                    </Label>
                    <Select
                        value={String(store.tableQuery.pageSize)}
                        onValueChange={(v) => onChangePageSize(Number(v))}
                    >
                        <SelectTrigger className="w-24 h-9 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" aria-label="Items per page">
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