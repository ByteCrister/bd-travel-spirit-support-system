'use client';

import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Database } from 'lucide-react';
import { formatDateRange } from '@/utils/helpers/format';
import { toCsv, toJson, buildCsvFromSection } from '@/utils/helpers/statistics.export';
import { useStatisticsStore } from '@/store/dashboard/statistics.store';
import {
    ChatStats,
    EmployeesStats,
    ImagesStats,
    NotificationsStats,
    ReportsStats,
    ReviewsStats,
    ToursStats,
    UsersStats,
    SectionKeyEnum,
} from '@/types/dashboard/statistics.types';

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_BTN_GHOST =
    'inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E7E5E4] text-[#1E2938] text-sm ' +
    'font-[family-name:var(--font-space-mono)] ' +
    'shadow-[4px_4px_8px_#c8c6c5,-4px_-4px_8px_#ffffff] ' +
    'hover:shadow-[inset_3px_3px_6px_#c8c6c5,inset_-3px_-3px_6px_#ffffff] ' +
    'active:shadow-[inset_4px_4px_8px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40';
const NEU_DROPDOWN_CONTENT =
    'rounded-xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60 p-1 min-w-[160px]';
const NEU_DROPDOWN_ITEM =
    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#1E2938] ' +
    'font-[family-name:var(--font-jetbrains-mono)] cursor-pointer ' +
    'hover:bg-[#006666]/10 hover:text-[#006666] ' +
    'focus:bg-[#006666]/10 focus:text-[#006666] focus:outline-none ' +
    'transition-colors duration-150';

type Data =
    | UsersStats
    | ToursStats
    | ReviewsStats
    | ReportsStats
    | ImagesStats
    | NotificationsStats
    | ChatStats
    | EmployeesStats
    | null;

interface ExportMenuProps {
    data: Data;
    section: SectionKeyEnum | string;
    disabled?: boolean;
}

export function ExportMenu({ data, section, disabled }: ExportMenuProps) {
    const { filters } = useStatisticsStore();

    const getFilename = (type: 'csv' | 'json') => {
        const dateRange = formatDateRange(filters.dateRange.from, filters.dateRange.to);
        const sanitizedRange = dateRange.replace(/[^a-zA-Z0-9_\-]/g, '_') || 'all';
        const sanitizedSection = String(section).replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
        return `${sanitizedSection}_statistics_${sanitizedRange}.${type}`;
    };

    const handleCsvExport = () => {
        if (!data) return;
        const sectionKey = (Object.values(SectionKeyEnum).includes(section as SectionKeyEnum)
            ? (section as SectionKeyEnum)
            : (String(section) as SectionKeyEnum)) as SectionKeyEnum;
        const { rows, columns } = buildCsvFromSection(data, { dedupeKeys: ['date', 'value'] }, sectionKey);
        if (rows.length === 0 || columns.length === 0) return;
        toCsv(rows, columns, getFilename('csv').replace(/\.csv$/, ''));
    };

    const handleJsonExport = () => {
        if (!data) return;
        const sectionKey = (Object.values(SectionKeyEnum).includes(section as SectionKeyEnum)
            ? (section as SectionKeyEnum)
            : (String(section) as SectionKeyEnum)) as SectionKeyEnum;
        const { rows, columns } = buildCsvFromSection(data, { dedupeKeys: ['date', 'value'] }, sectionKey);
        const payload = {
            meta: { section: String(section), generatedAt: new Date().toISOString(), filters },
            schema: columns.map((c) => c.key),
            data: rows,
        };
        toJson(payload, getFilename('json').replace(/\.json$/, ''));
    };

    if (disabled || !data) {
        return (
            <button className={NEU_BTN_GHOST} disabled aria-disabled="true">
                <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                Export
            </button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={NEU_BTN_GHOST} aria-label="Export data">
                    <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Export
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className={NEU_DROPDOWN_CONTENT}
                style={{ border: 'none' }}
            >
                <DropdownMenuItem
                    onClick={handleCsvExport}
                    className={NEU_DROPDOWN_ITEM}
                >
                    <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Export as CSV
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleJsonExport}
                    className={NEU_DROPDOWN_ITEM}
                >
                    <Database className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ExportMenu;