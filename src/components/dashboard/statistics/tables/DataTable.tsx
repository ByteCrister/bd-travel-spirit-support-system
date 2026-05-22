'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
    'rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60';
const NEU_HEADING =
    'font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight';
const NEU_LABEL =
    'font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest';
const NEU_MONO =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]';
const NEU_MUTED =
    'font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50';
const NEU_TABLE_INSET =
    'overflow-hidden rounded-xl bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]';
const NEU_TABLE_HEADER =
    'bg-[#deded c] border-b border-[#c8c6c5]/50';
const NEU_BTN_ICON =
    'rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 ' +
    'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
    'hover:text-[#006666] hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40';
const NEU_BTN_PAGE_ACTIVE =
    'rounded-xl w-8 h-8 flex items-center justify-center bg-[#006666] text-white text-xs ' +
    'font-[family-name:var(--font-space-mono)] font-bold ' +
    'shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080]';
const NEU_BTN_PAGE =
    'rounded-xl w-8 h-8 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938] text-xs ' +
    'font-[family-name:var(--font-space-mono)] font-bold ' +
    'shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] ' +
    'hover:shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'transition-all duration-200 focus-visible:outline-none';

// Generic constraint that allows any record type
interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    formatter?: (value: T[keyof T], row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    title?: string;
    pageSize?: number;
    emptyMessage?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
    data,
    columns,
    title,
    pageSize = 10,
    emptyMessage = 'No data available',
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (aVal === bVal) return 0;
            let cmp = 0;
            if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
            else if (typeof aVal === 'string' && typeof bVal === 'string') cmp = aVal.localeCompare(bVal);
            else cmp = String(aVal).localeCompare(String(bVal));
            return sortDirection === 'asc' ? cmp : -cmp;
        });
    }, [data, sortColumn, sortDirection]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (column: keyof T) => {
        const col = columns.find((c) => c.key === column);
        if (!col?.sortable) return;
        if (sortColumn === column) {
            if (sortDirection === 'asc') setSortDirection('desc');
            else if (sortDirection === 'desc') { setSortDirection(null); setSortColumn(null); }
            else setSortDirection('asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (column: keyof T) => {
        if (sortColumn !== column) return <ChevronUp className="h-3 w-3 opacity-20" />;
        return sortDirection === 'asc'
            ? <ChevronUp className="h-3 w-3 text-[#006666]" />
            : <ChevronDown className="h-3 w-3 text-[#006666]" />;
    };

    const pageNumbers = useMemo(() => {
        const max = Math.min(5, totalPages);
        return Array.from({ length: max }, (_, i) => {
            if (totalPages <= 5) return i + 1;
            if (currentPage <= 3) return i + 1;
            if (currentPage >= totalPages - 2) return totalPages - 4 + i;
            return currentPage - 2 + i;
        });
    }, [currentPage, totalPages]);

    if (!data.length) {
        return (
            <div className={`p-10 text-center ${NEU_CARD}`}>
                <p className={NEU_MUTED}>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`space-y-4 p-4 ${NEU_CARD}`}
        >
            {title && <h3 className={`text-base ${NEU_HEADING}`}>{title}</h3>}

            <div className={NEU_TABLE_INSET}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className={NEU_TABLE_HEADER}>
                                {columns.map((col) => (
                                    <th
                                        key={String(col.key)}
                                        onClick={() => handleSort(col.key)}
                                        className={`px-5 py-3 text-left ${NEU_LABEL} ${col.sortable ? 'cursor-pointer select-none hover:text-[#006666] transition-colors' : ''
                                            } ${col.className ?? ''}`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span>{col.label}</span>
                                            {col.sortable && getSortIcon(col.key)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, idx) => (
                                <motion.tr
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.18, delay: idx * 0.04 }}
                                    className="border-b border-[#c8c6c5]/30 last:border-0 hover:bg-[#006666]/5 transition-colors duration-150"
                                >
                                    {columns.map((col) => {
                                        const val = row[col.key];
                                        return (
                                            <td
                                                key={String(col.key)}
                                                className={`px-5 py-3.5 whitespace-nowrap ${NEU_MONO} ${col.className ?? ''}`}
                                            >
                                                {col.formatter ? col.formatter(val, row) : String(val ?? '')}
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-[#c8c6c5]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className={`text-xs ${NEU_MUTED}`}>
                            Showing{' '}
                            <span className="font-bold text-[#1E2938]">
                                {(currentPage - 1) * pageSize + 1}
                            </span>
                            {' '}–{' '}
                            <span className="font-bold text-[#1E2938]">
                                {Math.min(currentPage * pageSize, sortedData.length)}
                            </span>
                            {' '}of{' '}
                            <span className="font-bold text-[#1E2938]">{sortedData.length}</span>
                        </p>

                        <nav className="flex items-center gap-1.5" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={NEU_BTN_ICON}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            {pageNumbers.map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setCurrentPage(n)}
                                    className={currentPage === n ? NEU_BTN_PAGE_ACTIVE : NEU_BTN_PAGE}
                                    aria-label={`Page ${n}`}
                                    aria-current={currentPage === n ? 'page' : undefined}
                                >
                                    {n}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={NEU_BTN_ICON}
                                aria-label="Next page"
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </motion.div>
    );
}