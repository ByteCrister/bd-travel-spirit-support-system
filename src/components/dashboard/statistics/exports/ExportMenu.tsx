// src/components/ExportMenu.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Database } from 'lucide-react';
import { formatDateRange } from '@/utils/helpers/format';
import { toCsv, toJson } from '@/utils/helpers/statistics.export';
import { buildCsvFromSection } from '@/utils/helpers/statistics.export';
import { useStatisticsStore } from '@/store/statistics.store';
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
} from '@/types/statistics.types';

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

        // Pass section so the exporter can apply per-section config (preferredColumns, dedupeKeys, normalizeRow)
        const sectionKey = (Object.values(SectionKeyEnum).includes(section as SectionKeyEnum)
            ? (section as SectionKeyEnum)
            : (String(section) as SectionKeyEnum)) as SectionKeyEnum;

        const { rows, columns } = buildCsvFromSection(data, { dedupeKeys: ['date', 'value'] }, sectionKey);
        if (rows.length === 0 || columns.length === 0) return;

        const filenameBase = getFilename('csv').replace(/\.csv$/, '');
        toCsv(rows, columns, filenameBase);
    };

    const handleJsonExport = () => {
        if (!data) return;

        // Build same rows/columns as for CSV so JSON matches CSV dataset
        const sectionKey = (Object.values(SectionKeyEnum).includes(section as SectionKeyEnum)
            ? (section as SectionKeyEnum)
            : (String(section) as SectionKeyEnum)) as SectionKeyEnum;
        const { rows, columns } = buildCsvFromSection(data, { dedupeKeys: ['date', 'value'] }, sectionKey);
        const filenameBase = getFilename('json').replace(/\.json$/, '');

        // Production JSON payload: meta + schema + data
        const payload = {
            meta: {
                section: String(section),
                generatedAt: new Date().toISOString(),
                filters,
            },
            schema: columns.map((c) => c.key),
            data: rows,
        };

        toJson(payload, filenameBase);
    };

    if (disabled || !data) {
        return (
            <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCsvExport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as CSV
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleJsonExport}>
                    <Database className="h-4 w-4 mr-2" />
                    Export as JSON
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ExportMenu;
