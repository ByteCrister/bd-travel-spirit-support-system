'use client';

// components/travelers/TravelerPagination.tsx
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TravelerPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function TravelerPagination({ currentPage, totalPages, onPageChange }: TravelerPaginationProps) {
    const getVisiblePages = () => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();
    const showStartEllipsis = visiblePages[0] > 1;
    const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

    const NavButton = ({
        onClick,
        disabled,
        icon: Icon,
        label,
    }: {
        onClick: () => void;
        disabled: boolean;
        icon: React.ElementType;
        label: string;
    }) => (
        <Button
            variant="outline"
            size="icon"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={cn(
                'h-8 w-8 rounded-lg border-slate-200 bg-white text-slate-500',
                'hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'transition-all duration-150 shadow-sm'
            )}
        >
            <Icon className="h-3.5 w-3.5" />
        </Button>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center justify-between gap-4"
        >
            {/* Page info */}
            <p className="text-xs text-slate-400 tabular-nums hidden sm:block">
                Page{' '}
                <span className="font-semibold text-slate-600">{currentPage}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-600">{totalPages}</span>
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1 mx-auto sm:mx-0">
                <NavButton onClick={() => onPageChange(1)} disabled={currentPage <= 1} icon={ChevronsLeft} label="First page" />
                <NavButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} icon={ChevronLeft} label="Previous page" />

                <div className="flex items-center gap-1 mx-1">
                    {showStartEllipsis && (
                        <>
                            <PageButton page={1} isActive={false} onClick={() => onPageChange(1)} />
                            <span className="w-6 text-center text-slate-400 text-xs select-none">···</span>
                        </>
                    )}

                    {visiblePages.map((page) => (
                        <PageButton
                            key={page}
                            page={page}
                            isActive={page === currentPage}
                            onClick={() => onPageChange(page)}
                        />
                    ))}

                    {showEndEllipsis && (
                        <>
                            <span className="w-6 text-center text-slate-400 text-xs select-none">···</span>
                            <PageButton page={totalPages} isActive={false} onClick={() => onPageChange(totalPages)} />
                        </>
                    )}
                </div>

                <NavButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} icon={ChevronRight} label="Next page" />
                <NavButton onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages} icon={ChevronsRight} label="Last page" />
            </div>

            <div className="hidden sm:block w-20" />
        </motion.div>
    );
}

function PageButton({ page, isActive, onClick }: { page: number; isActive: boolean; onClick: () => void }) {
    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.92 }}
            className={cn(
                'relative h-8 min-w-[2rem] px-2.5 rounded-lg text-xs font-medium',
                'transition-all duration-150 select-none',
                isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 bg-white shadow-sm'
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="activePage"
                    className="absolute inset-0 rounded-lg bg-blue-600"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
                />
            )}
            <span className="relative z-10">{page}</span>
        </motion.button>
    );
}