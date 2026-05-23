// components/article/ArticleToolbar.tsx
'use client';

import * as React from 'react';
import {
    ArticleFilter,
    ArticleSort,
    ArticleSortField,
    SortOrder,
    ArticleSearch,
    OffsetPageRequest,
    ID,
} from '@/types/article/article.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    HiMagnifyingGlass,
    HiAdjustmentsHorizontal,
    HiBookmark,
    HiXMark,
    HiPlus,
    HiArrowsUpDown,
    HiCalendarDays,
    HiMapPin,
    HiChatBubbleLeftRight,
    HiSparkles,
    HiChevronDown,
    HiCheck,
} from 'react-icons/hi2';
import { FiRotateCcw } from 'react-icons/fi';
import { HiTrash } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { useArticleStore } from '@/store/article/article.store';
import { useRouter } from 'next/navigation';
import { ARTICLE_STATUS, ARTICLE_TYPE } from '@/constants/article.const';
import { TOUR_CATEGORIES, TourCategories } from '@/constants/tour.const';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

// ── Style tokens ──────────────────────────────────────────────
const S = {
    // Buttons
    btnPrimary:
        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ' +
        'font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-wide text-white ' +
        'bg-[#006666] shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
        'hover:bg-[#007777] hover:shadow-[6px_6px_12px_#004d4d,-3px_-3px_8px_#008080] ' +
        'active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed ' +
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50',
    btnGhost:
        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ' +
        'font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#1E2938] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
        'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'disabled:opacity-40 disabled:cursor-not-allowed ' +
        'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40',
    btnDanger:
        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ' +
        'font-[family-name:var(--font-space-mono)] text-sm font-bold text-[#FF2157] ' +
        'bg-[#E7E5E4] shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
        'hover:bg-[#FF2157]/10 hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] ' +
        'transition-all duration-200',

    // Inputs
    input:
        'w-full rounded-xl px-4 py-2.5 text-sm ' +
        'bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
        'font-[family-name:var(--font-jetbrains-mono)] ' +
        'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none ' +
        'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200',
    inputSm:
        'rounded-xl px-3 py-2 text-sm ' +
        'bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 ' +
        'font-[family-name:var(--font-jetbrains-mono)] ' +
        'shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none ' +
        'focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200',

    // Select
    selectTrigger:
        'rounded-xl border-none bg-[#E7E5E4] ' +
        'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938] ' +
        'shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
        'focus:ring-2 focus:ring-[#006666]/40 transition-all',

    // Sections
    row: 'flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#E7E5E4] shadow-[6px_6px_12px_#c8c6c5,-6px_-6px_12px_#ffffff] border border-white/60',
    advancedPanel:
        'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-6 space-y-5',
    divider: 'border-t border-[#1E2938]/10',

    // Labels
    label:
        'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest flex items-center gap-1.5',
    sectionLabel:
        'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/50 uppercase tracking-widest flex items-center gap-2',

    // Badges (chips)
    chip:
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#006666] ' +
        'bg-[#006666]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] cursor-pointer ' +
        'hover:bg-[#006666]/20 transition-all duration-200',
    chipWarning:
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-[#FE9900] ' +
        'bg-[#FE9900]/10 shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff] cursor-pointer ' +
        'hover:bg-[#FE9900]/20 transition-all duration-200',
    filterCount:
        'inline-flex items-center justify-center w-5 h-5 rounded-md text-xs ' +
        'font-[family-name:var(--font-space-mono)] font-bold text-white bg-[#006666]',

    // Icon btn (small)
    iconBtnSm:
        'w-9 h-9 flex items-center justify-center rounded-xl bg-[#006666] text-white ' +
        'shadow-[4px_4px_8px_#004d4d,-2px_-2px_6px_#008080] ' +
        'hover:bg-[#007777] active:shadow-[inset_3px_3px_6px_#004d4d,inset_-2px_-2px_4px_#008080] ' +
        'transition-all duration-200',

    // Dialog
    dialogIconWell: 'w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0',
    dialogTitle: 'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] text-lg flex items-center gap-2',
    presetRow:
        'flex items-center justify-between p-3 rounded-xl border border-white/60 ' +
        'bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
        'hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] transition-all duration-200',
    presetActionBtn:
        'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 focus-visible:outline-none',
} as const;

// ── Constants ──────────────────────────────────────────────────
type Preset = {
    id: string;
    name: string;
    filter: ArticleFilter;
    sort: ArticleSort;
    search: ArticleSearch;
};

const PRESET_STORAGE_KEY = 'article_filter_presets';
const STATUS_OPTIONS = Object.values(ARTICLE_STATUS);
const TYPE_OPTIONS = Object.values(ARTICLE_TYPE);
const CATEGORY_OPTIONS = Object.values(TOUR_CATEGORIES);

const SORT_FIELDS: ArticleSortField[] = [
    'updatedAt', 'publishedAt', 'createdAt', 'title',
    'viewCount', 'likeCount', 'shareCount', 'readingTime', 'wordCount',
];

const fieldLabels: Record<ArticleSortField, string> = {
    updatedAt: 'Last Updated',
    publishedAt: 'Published Date',
    createdAt: 'Created Date',
    title: 'Title',
    viewCount: 'Views',
    likeCount: 'Likes',
    shareCount: 'Shares',
    readingTime: 'Reading Time',
    wordCount: 'Word Count',
};

export default function ArticleToolbar() {
    const router = useRouter();

    const currentFilter = useArticleStore((s) => s.currentFilter);
    const currentSearch = useArticleStore((s) => s.currentSearch);
    const currentSort = useArticleStore((s) => s.currentSort);
    const currentPagination = useArticleStore((s) => s.currentPagination);

    const setFilter = useArticleStore((s) => s.setFilter);
    const setSearch = useArticleStore((s) => s.setSearch);
    const setSort = useArticleStore((s) => s.setSort);
    const setPagination = useArticleStore((s) => s.setPagination);
    const reset = useArticleStore((s) => s.reset);
    const fetchArticleList = useArticleStore((s) => s.fetchArticleList);

    const [localFilter, setLocalFilter] = React.useState<ArticleFilter>(currentFilter);
    const [localSearch, setLocalSearch] = React.useState<ArticleSearch>(currentSearch);
    const [localSort, setLocalSort] = React.useState<ArticleSort>(currentSort);
    const [isResetting, setIsResetting] = React.useState(false);
    const [managePresetsOpen, setManagePresetsOpen] = React.useState(false);
    const [tagsInput, setTagsInput] = React.useState('');
    const [authorsInput, setAuthorsInput] = React.useState('');
    const [searchInput, setSearchInput] = React.useState(currentSearch.query ?? '');
    const [presetName, setPresetName] = React.useState('');
    const [presets, setPresets] = React.useState<Preset[]>(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(PRESET_STORAGE_KEY) : null;
            return raw ? (JSON.parse(raw) as Preset[]) : [];
        } catch { return []; }
    });
    const [presetOpen, setPresetOpen] = React.useState(false);
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    const debouncedSetSearch = useDebouncedCallback((query: string) => {
        setLocalSearch({ query });
    }, 300);

    React.useEffect(() => {
        setLocalFilter(currentFilter);
        setLocalSearch(currentSearch);
        setLocalSort(currentSort);
    }, [currentFilter, currentSearch, currentSort]);

    React.useEffect(() => {
        setSearchInput(currentSearch.query ?? '');
    }, [currentSearch.query]);

    const commitChanges = async () => {
        setFilter(localFilter);
        setSearch({ query: searchInput });
        setSort(localSort);
        await fetchArticleList();
    };

    const handleReset = async () => {
        setIsResetting(true);
        reset();
        setSearchInput('');
        await fetchArticleList();
        setIsResetting(false);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSetSearch(value);
    };

    const addToken = (value: string, key: 'tags' | 'authorNames') => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setLocalFilter((f) => {
            const arr = Array.isArray(f[key]) ? [...(f[key] as string[])] : [];
            return { ...f, [key]: [...arr, trimmed] };
        });
    };

    const removeToken = (value: string, key: 'tags' | 'authorNames') => {
        setLocalFilter((f) => ({
            ...f,
            [key]: (f[key] || []).filter((v) => v !== value),
        }));
    };

    const savePreset = () => {
        const newPreset: Preset = {
            id: crypto.randomUUID(),
            name: presetName || 'Preset',
            filter: localFilter,
            sort: localSort,
            search: localSearch,
        };
        const next = [...presets, newPreset];
        setPresets(next);
        try { localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next)); } catch { }
        setPresetName('');
        setPresetOpen(false);
    };

    const applyPreset = async (p?: Preset) => {
        if (!p) return;
        setFilter(p.filter);
        setSort(p.sort);
        setSearch(p.search);
        const nextPg: OffsetPageRequest = { page: 1, pageSize: currentPagination.pageSize ?? 20 };
        setPagination(nextPg);
        await fetchArticleList();
    };

    const deletePreset = (id: string) => {
        const next = presets.filter((p) => p.id !== id);
        setPresets(next);
        try { localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next)); } catch { }
    };

    const clearAllPresets = () => {
        setPresets([]);
        try { localStorage.removeItem(PRESET_STORAGE_KEY); } catch { }
    };

    const activeFiltersCount = [
        localFilter.status?.length,
        localFilter.articleType?.length,
        localFilter.categories?.length,
        localFilter.tags?.length,
        localFilter.authorNames?.length,
        localFilter.publishedFrom,
        localFilter.publishedTo,
        localFilter.destinationCity,
    ].filter(Boolean).length;

    return (
        <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* ── Top action row ─────────────────────────────── */}
            <div className={S.row}>
                <motion.button
                    className={S.btnPrimary}
                    onClick={() => router.push('/support/articles/create')}
                    aria-label="Create new article"
                    whileTap={{ scale: 0.97 }}
                >
                    <HiPlus className="h-4 w-4" />
                    Create Article
                </motion.button>

                <motion.button
                    className={S.btnGhost}
                    onClick={handleReset}
                    disabled={isResetting}
                    aria-label="Reset all filters"
                    whileTap={{ scale: 0.97 }}
                >
                    <FiRotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                    Reset All
                </motion.button>

                <div className="flex-1" />
                <span className="hidden sm:block font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#1E2938]/40">
                    Quick actions to manage your articles
                </span>
            </div>

            {/* ── Search + Apply + Advanced ──────────────────── */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1E2938]/40 pointer-events-none" />
                    <input
                        value={searchInput}
                        onChange={handleSearchChange}
                        placeholder="Search articles by title, summary, or tags…"
                        className={`${S.input} pl-10`}
                        aria-label="Search articles"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <motion.button
                        className={S.btnPrimary}
                        onClick={commitChanges}
                        aria-label="Apply filters"
                        whileTap={{ scale: 0.97 }}
                    >
                        <HiCheck className="h-4 w-4" />
                        Apply
                    </motion.button>

                    <motion.button
                        className={`${S.btnGhost} relative`}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        aria-label="Toggle advanced filters"
                        aria-expanded={showAdvanced}
                        whileTap={{ scale: 0.97 }}
                    >
                        <HiAdjustmentsHorizontal className="h-4 w-4" />
                        Advanced
                        {activeFiltersCount > 0 && (
                            <span className={S.filterCount}>{activeFiltersCount}</span>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* ── Sort & page-size row ───────────────────────── */}
            <div className={`${S.row} gap-2`}>
                <div className="flex items-center gap-2 text-[#1E2938]/60">
                    <HiArrowsUpDown className="h-4 w-4" />
                    <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-widest">
                        Sort
                    </span>
                </div>

                <Select
                    value={localSort.field}
                    onValueChange={(val: ArticleSortField) => setLocalSort((s) => ({ ...s, field: val }))}
                >
                    <SelectTrigger className={`${S.selectTrigger} w-44 h-9`} aria-label="Sort field">
                        <SelectValue placeholder="Sort field" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_FIELDS.map((f) => (
                            <SelectItem key={f} value={f}>{fieldLabels[f]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={localSort.order}
                    onValueChange={(val: SortOrder) => setLocalSort((s) => ({ ...s, order: val }))}
                >
                    <SelectTrigger className={`${S.selectTrigger} w-32 h-9`} aria-label="Sort order">
                        <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">
                            <div className="flex items-center gap-2"><HiChevronDown className="rotate-180" />Ascending</div>
                        </SelectItem>
                        <SelectItem value="desc">
                            <div className="flex items-center gap-2"><HiChevronDown />Descending</div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/50 uppercase tracking-widest hidden sm:block">
                        Show:
                    </span>
                    <Select
                        value={String(currentPagination.pageSize ?? 20)}
                        onValueChange={(val) => {
                            const pageSize = Number(val);
                            const next: OffsetPageRequest = { page: 1, pageSize };
                            setPagination(next);
                            fetchArticleList({ pagination: next });
                        }}
                        aria-label="Page size"
                    >
                        <SelectTrigger className={`${S.selectTrigger} w-28 h-9`}>
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>{n} items</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* ── Advanced filters panel ─────────────────────── */}
            <AnimatePresence>
                {showAdvanced && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className={S.advancedPanel}>

                            {/* Status / Type / Category */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        label: 'Status', key: 'status' as const,
                                        options: STATUS_OPTIONS,
                                        value: (localFilter.status?.[0] as string) ?? '',
                                        onChange: (val: string) =>
                                            setLocalFilter((f) => ({ ...f, status: val ? [val as ARTICLE_STATUS] : [] })),
                                    },
                                    {
                                        label: 'Type', key: 'articleType' as const,
                                        options: TYPE_OPTIONS,
                                        value: (localFilter.articleType?.[0] as string) ?? '',
                                        onChange: (val: string) =>
                                            setLocalFilter((f) => ({ ...f, articleType: val ? [val as ARTICLE_TYPE] : [] })),
                                    },
                                    {
                                        label: 'Category', key: 'categories' as const,
                                        options: CATEGORY_OPTIONS,
                                        value: (localFilter.categories?.[0] as string) ?? '',
                                        onChange: (val: string) =>
                                            setLocalFilter((f) => ({ ...f, categories: val ? [val as TourCategories] : [] })),
                                    },
                                ].map(({ label, key, options, value, onChange }) => (
                                    <div key={key} className="space-y-2">
                                        <label className={S.label}>{label}</label>
                                        <Select value={value} onValueChange={onChange}>
                                            <SelectTrigger className={`${S.selectTrigger} h-10 w-full`} aria-label={label}>
                                                <SelectValue placeholder={`All ${label.toLowerCase()}s`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {options.map((o) => (
                                                    <SelectItem key={o} value={o}>{o}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>

                            {/* Tags & Authors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Tags */}
                                <div className="space-y-2">
                                    <label className={S.label}>
                                        <HiSparkles className="h-3.5 w-3.5 text-[#FE9900]" />
                                        Tags
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            value={tagsInput}
                                            onChange={(e) => setTagsInput(e.target.value)}
                                            placeholder="Add tag…"
                                            className={`${S.inputSm} flex-1`}
                                            aria-label="Tags input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addToken(tagsInput, 'tags');
                                                    setTagsInput('');
                                                }
                                            }}
                                        />
                                        <button
                                            className={S.iconBtnSm}
                                            onClick={() => { addToken(tagsInput, 'tags'); setTagsInput(''); }}
                                            aria-label="Add tag"
                                        >
                                            <HiPlus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(localFilter.tags ?? []).map((t) => (
                                            <motion.button
                                                key={t}
                                                className={S.chipWarning}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                onClick={() => removeToken(t, 'tags')}
                                            >
                                                {t} <HiXMark className="h-3 w-3" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Authors */}
                                <div className="space-y-2">
                                    <label className={S.label}>
                                        <HiSparkles className="h-3.5 w-3.5 text-[#006666]" />
                                        Author Names
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            value={authorsInput}
                                            onChange={(e) => setAuthorsInput(e.target.value)}
                                            placeholder="Add author name…"
                                            className={`${S.inputSm} flex-1`}
                                            aria-label="Authors input"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addToken(authorsInput, 'authorNames');
                                                    setAuthorsInput('');
                                                }
                                            }}
                                        />
                                        <button
                                            className={S.iconBtnSm}
                                            onClick={() => { addToken(authorsInput, 'authorNames'); setAuthorsInput(''); }}
                                            aria-label="Add author"
                                        >
                                            <HiPlus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(localFilter.authorNames ?? []).map((a) => (
                                            <motion.button
                                                key={a as ID}
                                                className={S.chip}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                onClick={() => removeToken(a as string, 'authorNames')}
                                            >
                                                {a} <HiXMark className="h-3 w-3" />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Date range & Destination */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className={S.label}>
                                        <HiCalendarDays className="h-3.5 w-3.5 text-[#006666]" />
                                        Published Date Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="date"
                                            value={localFilter.publishedFrom ?? ''}
                                            onChange={(e) => {
                                                const newFrom = e.target.value;
                                                setLocalFilter((f) => ({
                                                    ...f,
                                                    publishedFrom: newFrom,
                                                    publishedTo: newFrom && f.publishedTo && newFrom > f.publishedTo ? newFrom : f.publishedTo,
                                                }));
                                            }}
                                            className={S.inputSm}
                                            aria-label="Published from"
                                            max={localFilter.publishedTo || undefined}
                                        />
                                        <input
                                            type="date"
                                            value={localFilter.publishedTo ?? ''}
                                            onChange={(e) => {
                                                const newTo = e.target.value;
                                                setLocalFilter((f) => ({
                                                    ...f,
                                                    publishedTo: newTo,
                                                    publishedFrom: newTo && f.publishedFrom && newTo < f.publishedFrom ? newTo : f.publishedFrom,
                                                }));
                                            }}
                                            className={S.inputSm}
                                            aria-label="Published to"
                                            min={localFilter.publishedFrom || undefined}
                                        />
                                    </div>
                                    {localFilter.publishedFrom && localFilter.publishedTo && localFilter.publishedFrom > localFilter.publishedTo && (
                                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-xs text-[#FF2157]">
                                            End date cannot be earlier than start date
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className={S.label}>
                                        <HiMapPin className="h-3.5 w-3.5 text-[#FF2157]" />
                                        Destination
                                    </label>
                                    <input
                                        placeholder="City"
                                        value={localFilter.destinationCity ?? ''}
                                        onChange={(e) => setLocalFilter((f) => ({ ...f, destinationCity: e.target.value }))}
                                        className={S.inputSm}
                                        aria-label="Destination city"
                                    />
                                </div>
                            </div>

                            {/* Comments & Presets */}
                            <div className={`flex flex-wrap items-center gap-3 pt-4 ${S.divider}`}>
                                <div className="flex items-center gap-2">
                                    <HiChatBubbleLeftRight className="h-4 w-4 text-[#1E2938]/40" />
                                    <Select
                                        value={
                                            localFilter.allowComments === undefined ? 'any'
                                                : localFilter.allowComments ? 'true' : 'false'
                                        }
                                        onValueChange={(val) =>
                                            setLocalFilter((f) => ({
                                                ...f,
                                                allowComments: val === 'any' ? undefined : val === 'true',
                                            }))
                                        }
                                    >
                                        <SelectTrigger className={`${S.selectTrigger} w-48 h-9`} aria-label="Allow comments">
                                            <SelectValue placeholder="Comments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">All Articles</SelectItem>
                                            <SelectItem value="true">Comments Allowed</SelectItem>
                                            <SelectItem value="false">Comments Disabled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1" />

                                <div className="flex flex-wrap items-center gap-2">
                                    <motion.button
                                        className={S.btnGhost}
                                        onClick={() => setPresetOpen(true)}
                                        aria-label="Save current filter"
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <HiBookmark className="h-4 w-4" />
                                        Save Preset
                                    </motion.button>

                                    <motion.button
                                        className={S.btnDanger}
                                        onClick={() => setManagePresetsOpen(true)}
                                        aria-label="Manage presets"
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <HiTrash className="h-4 w-4" />
                                        Manage
                                    </motion.button>

                                    {presets.length > 0 && (
                                        <Select onValueChange={(id) => applyPreset(presets.find((p) => p.id === id))} aria-label="Apply preset">
                                            <SelectTrigger className={`${S.selectTrigger} w-52 h-9`}>
                                                <SelectValue placeholder="Load saved preset…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {presets.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        <div className="flex items-center gap-2">
                                                            <HiBookmark className="h-3 w-3" />{p.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Manage Presets Dialog ─────────────────────── */}
            <Dialog open={managePresetsOpen} onOpenChange={setManagePresetsOpen}>
                <DialogContent className="sm:max-w-md bg-[#E7E5E4] border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                    <DialogHeader>
                        <DialogTitle className={S.dialogTitle}>
                            <div className={`${S.dialogIconWell} bg-[#FF2157]/10 text-[#FF2157]`}>
                                <HiTrash className="h-5 w-5" />
                            </div>
                            Manage Filter Presets
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        {presets.length === 0 ? (
                            <div className="text-center py-8">
                                <HiBookmark className="h-10 w-10 text-[#1E2938]/20 mx-auto mb-3" />
                                <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                                    No presets saved yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {presets.map((preset) => (
                                    <motion.div
                                        key={preset.id}
                                        className={S.presetRow}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <HiBookmark className="h-4 w-4 text-[#006666]" />
                                                <span className="font-[family-name:var(--font-space-mono)] font-bold text-sm text-[#1E2938]">
                                                    {preset.name}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                {preset.filter.status?.[0] && (
                                                    <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#006666]/10 text-[#006666]">
                                                        {preset.filter.status[0]}
                                                    </span>
                                                )}
                                                {preset.filter.articleType?.[0] && (
                                                    <span className="font-[family-name:var(--font-space-mono)] text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FE9900]/10 text-[#FE9900]">
                                                        {preset.filter.articleType[0]}
                                                    </span>
                                                )}
                                                {preset.search.query && (
                                                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] px-1.5 py-0.5 rounded bg-[#1E2938]/5 text-[#1E2938]/50">
                                                        &quot;{preset.search.query.substring(0, 12)}…&quot;
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                className={`${S.presetActionBtn} text-[#006666] hover:bg-[#006666]/10`}
                                                onClick={() => applyPreset(preset)}
                                                aria-label="Apply preset"
                                            >
                                                <HiCheck className="h-4 w-4" />
                                            </button>
                                            <button
                                                className={`${S.presetActionBtn} text-[#FF2157] hover:bg-[#FF2157]/10`}
                                                onClick={() => deletePreset(preset.id)}
                                                aria-label="Delete preset"
                                            >
                                                <HiTrash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex items-center gap-2">
                        {presets.length > 0 && (
                            <button className={S.btnDanger} onClick={clearAllPresets} aria-label="Clear all presets">
                                <HiTrash className="h-4 w-4" />
                                Clear All
                            </button>
                        )}
                        <div className="flex-1" />
                        <button className={S.btnGhost} onClick={() => setManagePresetsOpen(false)} aria-label="Close">
                            Close
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Save Preset Dialog ────────────────────────── */}
            <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
                <DialogContent className="sm:max-w-md bg-[#E7E5E4] border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                    <DialogHeader>
                        <DialogTitle className={S.dialogTitle}>
                            <div className={`${S.dialogIconWell} bg-[#006666]/10 text-[#006666]`}>
                                <HiBookmark className="h-5 w-5" />
                            </div>
                            Save Filter Preset
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="preset-name" className={S.label}>Preset Name</label>
                            <input
                                id="preset-name"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                placeholder="Enter a name for this preset"
                                className={S.input}
                                aria-label="Preset name"
                                onKeyDown={(e) => { if (e.key === 'Enter') savePreset(); }}
                            />
                        </div>
                        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50">
                            Saves current filter, sort, and search settings.
                        </p>
                    </div>
                    <DialogFooter className="flex items-center gap-2">
                        <button className={S.btnGhost} onClick={() => setPresetOpen(false)} aria-label="Cancel">
                            Cancel
                        </button>
                        <button
                            className={S.btnPrimary}
                            onClick={savePreset}
                            disabled={!presetName.trim()}
                            aria-label="Save preset"
                        >
                            <HiBookmark className="h-4 w-4" />
                            Save Preset
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}