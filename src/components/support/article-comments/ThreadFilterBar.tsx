// Create a new file: ThreadFilterBar.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CommentFiltersDTO } from '@/types/article-comment.types';
import { COMMENT_STATUS, CommentStatus } from '@/constants/articleComment.const';
import { HiFilter, HiX } from 'react-icons/hi';

interface ThreadFilterBarProps {
    articleId: string;
    parentId?: string | null;
    onFilterChange: (filters: CommentFiltersDTO) => void;
    currentFilters: CommentFiltersDTO;
}

export function ThreadFilterBar({
    onFilterChange,
    currentFilters
}: ThreadFilterBarProps) {
    const [showFilters, setShowFilters] = useState(false);

    const handleStatusChange = (status: string) => {
        onFilterChange({
            ...currentFilters,
            status: status === 'any' ? undefined : status as CommentStatus | 'any'
        });
    };

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({
            ...currentFilters,
            authorName: e.target.value || undefined
        });
    };

    const handleClearFilters = () => {
        onFilterChange({});
        setShowFilters(false);
    };

    return (
        <div className="space-y-3 mb-4">
            {/* Filter toggle button */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <HiFilter className="h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>

                {(currentFilters.status || currentFilters.authorName) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="gap-2"
                    >
                        <HiX className="h-4 w-4" />
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Filter controls */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/30">
                    {/* Status filter */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                            Status
                        </label>
                        <Select
                            value={currentFilters.status || 'any'}
                            onValueChange={handleStatusChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any Status</SelectItem>
                                <SelectItem value={COMMENT_STATUS.APPROVED}>Approved</SelectItem>
                                <SelectItem value={COMMENT_STATUS.PENDING}>Pending</SelectItem>
                                <SelectItem value={COMMENT_STATUS.REJECTED}>Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Author filter */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                            Author Name
                        </label>
                        <Input
                            placeholder="Search by author..."
                            value={currentFilters.authorName || ''}
                            onChange={handleAuthorChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}