'use client';

// components/travelers/TravelerDetailsPagination.tsx
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function TravelerDetailsPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={cn(
                    'h-8 gap-1.5 px-3 rounded-lg text-xs font-medium',
                    'border-slate-200 bg-white text-slate-600 shadow-sm',
                    'hover:bg-slate-50 hover:text-slate-800',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'transition-all duration-150'
                )}
            >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
            </Button>

            <span className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-lg tabular-nums">
                {currentPage} / {totalPages}
            </span>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className={cn(
                    'h-8 gap-1.5 px-3 rounded-lg text-xs font-medium',
                    'border-slate-200 bg-white text-slate-600 shadow-sm',
                    'hover:bg-slate-50 hover:text-slate-800',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'transition-all duration-150'
                )}
            >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}