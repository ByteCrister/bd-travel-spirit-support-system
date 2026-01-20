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
} from '@/types/article.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
    HiCheck
} from 'react-icons/hi2';
import { FiRotateCcw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useArticleStore } from '@/store/article.store';
import { useRouter } from 'next/navigation';
import { ARTICLE_STATUS, ARTICLE_TYPE } from '@/constants/article.const';
import { TRAVEL_TYPE } from '@/constants/tour.const';

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
const CATEGORY_OPTIONS = Object.values(TRAVEL_TYPE);

const SORT_FIELDS: ArticleSortField[] = [
    'updatedAt',
    'publishedAt',
    'createdAt',
    'title',
    'viewCount',
    'likeCount',
    'shareCount',
    'readingTime',
    'wordCount',
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

    // Local working state
    const [localFilter, setLocalFilter] = React.useState<ArticleFilter>(currentFilter);
    const [localSearch, setLocalSearch] = React.useState<ArticleSearch>(currentSearch);
    const [localSort, setLocalSort] = React.useState<ArticleSort>(currentSort);
    const [isResetting, setIsResetting] = React.useState(false);

    // Token inputs
    const [tagsInput, setTagsInput] = React.useState('');
    const [authorsInput, setAuthorsInput] = React.useState('');

    // Presets
    const [presetName, setPresetName] = React.useState('');
    const [presets, setPresets] = React.useState<Preset[]>(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(PRESET_STORAGE_KEY) : null;
            return raw ? (JSON.parse(raw) as Preset[]) : [];
        } catch {
            return [];
        }
    });
    const [presetOpen, setPresetOpen] = React.useState(false);
    const [showAdvanced, setShowAdvanced] = React.useState(false);

    // Keep local in sync with store
    React.useEffect(() => {
        setLocalFilter(currentFilter);
        setLocalSearch(currentSearch);
        setLocalSort(currentSort);
    }, [currentFilter, currentSearch, currentSort]);

    // Commit local changes to store and refetch
    const commitChanges = async () => {
        setFilter(localFilter);
        setSearch(localSearch);
        setSort(localSort);
        await fetchArticleList();
    };

    // Reset all filters
    const handleReset = async () => {
        setIsResetting(true);
        reset();
        await fetchArticleList();
        setIsResetting(false);
    };

    // Navigate to create article
    const handleCreateArticle = () => {
        router.push('/support/articles/create');
    };

    // Token management
    const addToken = (value: string, key: 'tags' | 'authorIds') => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setLocalFilter((f) => {
            const next = { ...f };
            const arr = Array.isArray(f[key]) ? ([...(f[key] as string[])] as string[]) : [];
            next[key] = [...arr, trimmed];
            return next;
        });
    };

    const removeToken = (value: string, key: 'tags' | 'authorIds') => {
        setLocalFilter((f) => ({
            ...f,
            [key]: (f[key] || []).filter((v) => v !== value),
        }));
    };

    // Preset management
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
        try {
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
        } catch {
            // ignore persist errors
        }
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

    const activeFiltersCount = [
        localFilter.status?.length,
        localFilter.articleType?.length,
        localFilter.categories?.length,
        localFilter.tags?.length,
        localFilter.authorIds?.length,
        localFilter.publishedFrom,
        localFilter.publishedTo,
        localFilter.destinationCity,
    ].filter(Boolean).length;

    return (
        <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border-2 border-blue-100 dark:border-slate-700">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 sm:flex-initial"
                >
                    <Button
                        onClick={handleCreateArticle}
                        className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                        aria-label="Create new article"
                    >
                        <HiPlus className="mr-2 h-5 w-5" />
                        Create Article
                    </Button>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={isResetting}
                        className="h-11 px-5 border-2 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all font-medium"
                        aria-label="Reset all filters"
                    >
                        <FiRotateCcw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                        Reset All
                    </Button>
                </motion.div>

                <div className="flex-1" />

                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="hidden sm:inline">Quick actions to manage your articles</span>
                </div>
            </div>
            {/* Search Bar & Quick Actions */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        value={localSearch.query ?? ''}
                        onChange={(e) => setLocalSearch({ query: e.target.value })}
                        placeholder="Search articles by title, summary, or tags..."
                        className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        aria-label="Search articles"
                    />
                </div>

                <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={commitChanges}
                            className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                            aria-label="Apply filters"
                        >
                            <HiCheck className="mr-2 h-4 w-4" />
                            Apply Filters
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="h-11 px-4 border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
                            aria-label="Toggle advanced filters"
                        >
                            <HiAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                            Advanced
                            {activeFiltersCount > 0 && (
                                <Badge className="ml-2 bg-blue-600 text-white">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Sort & Display Controls */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <HiArrowsUpDown className="h-4 w-4" />
                    Sort by:
                </div>

                <Select
                    value={localSort.field}
                    onValueChange={(val: ArticleSortField) => setLocalSort((s) => ({ ...s, field: val }))}
                >
                    <SelectTrigger className="w-44 h-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" aria-label="Sort field">
                        <SelectValue placeholder="Sort field" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_FIELDS.map((f) => (
                            <SelectItem key={f} value={f}>
                                {fieldLabels[f]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={localSort.order}
                    onValueChange={(val: SortOrder) => setLocalSort((s) => ({ ...s, order: val }))}
                >
                    <SelectTrigger className="w-32 h-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600" aria-label="Sort order">
                        <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="asc">
                            <div className="flex items-center gap-2">
                                <HiChevronDown className="rotate-180" /> Ascending
                            </div>
                        </SelectItem>
                        <SelectItem value="desc">
                            <div className="flex items-center gap-2">
                                <HiChevronDown /> Descending
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>

                <div className="flex-1" />

                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Show:</span>
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
                        <SelectTrigger className="w-28 h-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} items
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
                {showAdvanced && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-4 p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
                            {/* Status, Type, Category */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                                        Status
                                    </label>
                                    <Select
                                        value={(localFilter.status?.[0] as string) ?? ''}
                                        onValueChange={(val) =>
                                            setLocalFilter((f) => ({ ...f, status: val ? [val as ARTICLE_STATUS] : [] }))
                                        }
                                    >
                                        <SelectTrigger className="bg-white dark:bg-slate-900" aria-label="Status filter">
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                                        Type
                                    </label>
                                    <Select
                                        value={(localFilter.articleType?.[0] as string) ?? ''}
                                        onValueChange={(val) =>
                                            setLocalFilter((f) => ({ ...f, articleType: val ? [val as ARTICLE_TYPE] : [] }))
                                        }
                                    >
                                        <SelectTrigger className="bg-white dark:bg-slate-900" aria-label="Type filter">
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TYPE_OPTIONS.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
                                        Category
                                    </label>
                                    <Select
                                        value={(localFilter.categories?.[0] as string) ?? ''}
                                        onValueChange={(val) =>
                                            setLocalFilter((f) => ({ ...f, categories: val ? [val as TRAVEL_TYPE] : [] }))
                                        }
                                    >
                                        <SelectTrigger className="bg-white dark:bg-slate-900" aria-label="Category filter">
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORY_OPTIONS.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Tags & Authors */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <HiSparkles className="h-4 w-4 text-amber-500" />
                                        Tags
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={tagsInput}
                                            onChange={(e) => setTagsInput(e.target.value)}
                                            placeholder="Add tag..."
                                            className="bg-white dark:bg-slate-900"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addToken(tagsInput, 'tags');
                                                    setTagsInput('');
                                                }
                                            }}
                                            aria-label="Tags input"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                addToken(tagsInput, 'tags');
                                                setTagsInput('');
                                            }}
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                            aria-label="Add tag"
                                        >
                                            <HiPlus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(localFilter.tags ?? []).map((t) => (
                                            <motion.div
                                                key={t}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Badge
                                                    variant="outline"
                                                    className="cursor-pointer bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-300 dark:border-amber-700 hover:border-amber-500 transition-all"
                                                    onClick={() => removeToken(t, 'tags')}
                                                >
                                                    {t}
                                                    <HiXMark className="ml-1 h-3 w-3" />
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <HiSparkles className="h-4 w-4 text-blue-500" />
                                        Author IDs
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={authorsInput}
                                            onChange={(e) => setAuthorsInput(e.target.value)}
                                            placeholder="Add author ID..."
                                            className="bg-white dark:bg-slate-900"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addToken(authorsInput, 'authorIds');
                                                    setAuthorsInput('');
                                                }
                                            }}
                                            aria-label="Authors input"
                                        />
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                addToken(authorsInput, 'authorIds');
                                                setAuthorsInput('');
                                            }}
                                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                            aria-label="Add author"
                                        >
                                            <HiPlus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(localFilter.authorIds ?? []).map((a) => (
                                            <motion.div
                                                key={a as ID}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <Badge
                                                    variant="outline"
                                                    className="cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700 hover:border-blue-500 transition-all"
                                                    onClick={() => removeToken(a as string, 'authorIds')}
                                                >
                                                    {a}
                                                    <HiXMark className="ml-1 h-3 w-3" />
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Date Range & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <HiCalendarDays className="h-4 w-4 text-indigo-500" />
                                        Published Date Range
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="date"
                                            value={localFilter.publishedFrom ?? ''}
                                            onChange={(e) => setLocalFilter((f) => ({ ...f, publishedFrom: e.target.value }))}
                                            className="bg-white dark:bg-slate-900"
                                            aria-label="Published from"
                                        />
                                        <Input
                                            type="date"
                                            value={localFilter.publishedTo ?? ''}
                                            onChange={(e) => setLocalFilter((f) => ({ ...f, publishedTo: e.target.value }))}
                                            className="bg-white dark:bg-slate-900"
                                            aria-label="Published to"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <HiMapPin className="h-4 w-4 text-rose-500" />
                                        Destination
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="City"
                                            value={localFilter.destinationCity ?? ''}
                                            onChange={(e) => setLocalFilter((f) => ({ ...f, destinationCity: e.target.value }))}
                                            className="bg-white dark:bg-slate-900"
                                            aria-label="Destination city"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Comments & Presets */}
                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <HiChatBubbleLeftRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    <Select
                                        value={
                                            localFilter.allowComments === undefined
                                                ? 'any'
                                                : localFilter.allowComments
                                                    ? 'true'
                                                    : 'false'
                                        }
                                        onValueChange={(val) =>
                                            setLocalFilter((f) => ({
                                                ...f,
                                                allowComments: val === 'any' ? undefined : val === 'true',
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-48 bg-white dark:bg-slate-900" aria-label="Allow comments">
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

                                <Button
                                    variant="outline"
                                    onClick={() => setPresetOpen(true)}
                                    className="border-2 hover:border-purple-500 hover:text-purple-600 transition-all"
                                    aria-label="Save current filter"
                                >
                                    <HiBookmark className="mr-2 h-4 w-4" />
                                    Save Preset
                                </Button>

                                {presets.length > 0 && (
                                    <Select
                                        onValueChange={(id) => applyPreset(presets.find((p) => p.id === id))}
                                        aria-label="Apply preset"
                                    >
                                        <SelectTrigger className="w-56 bg-white dark:bg-slate-900">
                                            <SelectValue placeholder="Load saved preset..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {presets.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    <div className="flex items-center gap-2">
                                                        <HiBookmark className="h-3 w-3" />
                                                        {p.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preset Save Dialog */}
            <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                                <HiBookmark className="h-5 w-5 text-white" />
                            </div>
                            Save Filter Preset
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Preset Name
                            </label>
                            <Input
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                placeholder="e.g., Published Articles 2024"
                                className="bg-white dark:bg-slate-900"
                                aria-label="Preset name"
                            />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Save your current filters, sorting, and search settings for quick access later.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPresetOpen(false)}
                            aria-label="Cancel"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={savePreset}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            aria-label="Save preset"
                        >
                            <HiBookmark className="mr-2 h-4 w-4" />
                            Save Preset
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}